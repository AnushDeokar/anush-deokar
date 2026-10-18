import type { Metadata } from "next"

import { KeyResult, Stats } from "@/components/post/callout"
import { Figure } from "@/components/post/figure"
import { SeriesPostLayout } from "@/components/post/post-layout"
import { DataTable } from "@/components/post/table"

const IMG = "/writing/tiny-frontier"

export const metadata: Metadata = {
  title: "Tiny Frontier, Part 1: Shrinking the frontier",
  description:
    "The question, the rules for fair comparisons, a 3.4M-parameter control model, and matching Google's Gemma 3 270M to 1e-4 in my own code.",
}

export default function Page() {
  return (
    <SeriesPostLayout
      part={1}
      lede={
        <>
          Modern LLMs use a handful of tricks to keep memory cheap. Papers make
          them sound obvious. I wanted to see them move, so I&apos;m rebuilding
          them from scratch at tiny scale, for $0.
        </>
      }
    >
      <p>
        Every model that handles long context has the same problem: the{" "}
        <strong>KV cache</strong>. To generate the next token, a transformer
        needs the keys and values of every token before it, and that cache grows
        with every token you add. Gemma 3, Mistral and gpt-oss all ship with
        tricks to keep it small: attention that only looks back a fixed number
        of tokens, a mix of cheap &quot;local&quot; and expensive
        &quot;global&quot; layers, and something called an attention sink.
      </p>
      <p>
        I could explain each of these from the papers. What I couldn&apos;t do
        was predict what happens when you change one: how much quality you lose
        for how much memory, where the loss comes from, or when a trick quietly
        breaks. <strong>Tiny Frontier</strong> is my attempt to find out by
        building them myself, at a scale where I can run a careful experiment in
        an evening.
      </p>

      <h2>The story in three sentences</h2>
      <ol>
        <li>
          <strong>Windows cut memory.</strong> A model that only attends to its
          last W tokens needs a much smaller KV cache (Part 2).
        </li>
        <li>
          <strong>
            Windows only break on long streams if the model relies on a sink,
          </strong>{" "}
          a token it parks spare attention on (Part 3).
        </li>
        <li>
          <strong>
            Whether a sink forms depends on how the model was trained.
          </strong>{" "}
          Mine formed one only when every training chunk started with the same
          token (Part 3).
        </li>
      </ol>

      <h2>The constraints</h2>
      <p>
        One Apple M4 machine, PyTorch on Apple&apos;s GPU backend, no rented
        GPUs, and no run longer than about 45 minutes, so nothing has to run
        overnight. That rules out anything close to real model sizes. It also
        forces the question I actually care about: does the <em>direction</em>{" "}
        of each effect show up when everything else is held fixed?
      </p>
      <p>
        To make the answer trustworthy, I set a few ground rules before writing
        any model code:
      </p>
      <ul>
        <li>
          <strong>One control model.</strong> Every experiment changes exactly
          one thing against it. Data, tokenizer, optimiser, width, depth,
          context, token budget and eval slice stay fixed.
        </li>
        <li>
          <strong>Seeds where they matter.</strong> The control gets three
          (1337, 1338, 1339) to measure the noise. A variant gets extra seeds
          when its gap to the control is ambiguous (0.01–0.03 nats). Single-seed
          results are labelled as single-seed.
        </li>
        <li>
          <strong>Report the cost with every loss:</strong> parameters,
          wall-clock, tokens per second, and KV-cache bytes.
        </li>
        <li>
          <strong>Every run leaves a folder</strong> with its config, git
          commit, seed, data hash, loss log, a sample and a summary.
        </li>
        <li>
          <strong>Negative results are results.</strong> If something
          doesn&apos;t work, it goes in the write-up.
        </li>
      </ul>

      <h2>The setup</h2>
      <p>
        The data is{" "}
        <a
          href="https://huggingface.co/datasets/roneneldan/TinyStories"
          target="_blank"
          rel="noopener noreferrer"
        >
          TinyStories
        </a>
        , a dataset of simple children&apos;s stories that small models can
        actually learn. I trained a byte-level BPE tokenizer with a vocabulary
        of 4,096, pre-tokenised the first 100M training tokens, and fixed a
        validation slice of 491,520 tokens that every run is scored on.
      </p>
      <p>
        The control is a Llama-style decoder written from scratch: pre-norm
        RMSNorm, causal attention with RoPE, a SwiGLU feed-forward, tied
        embeddings and no biases.
      </p>
      <DataTable
        head={["", "Control model"]}
        rows={[
          ["Layers / width / heads", "6 / 192 / 6 (head dim 32)"],
          ["Parameters", "3,443,136 (2,656,704 non-embedding)"],
          ["Context", "256 tokens"],
          ["Optimiser", "AdamW (0.9, 0.95), weight decay 0.1, clip 1.0"],
          ["Schedule", "200-step warmup, cosine to 10% of peak"],
          ["Budget", "50M tokens (6,103 steps of 32 × 256)"],
          [
            "Tests",
            "RoPE, causality, KV-cache equivalence, GQA, regression, …",
          ],
        ]}
      />

      <h3>Tuning the learning rate first</h3>
      <p>
        An untuned baseline makes every comparison meaningless, so the first
        real experiment was a learning-rate sweep: five peak LRs, 10M tokens
        each.
      </p>
      <Figure
        src={`${IMG}/lr_sweep.png`}
        alt="Validation loss against peak learning rate, U-shaped with a minimum near 6e-3"
        width={720}
        height={480}
        caption="Final validation loss after 10M tokens, one seed per learning rate."
      />
      <p>
        The curve is a U, and it&apos;s lopsided: halving the LR from 6e-3 cost
        0.021 nats, doubling it cost 0.138. Too high hurts far more than too
        low. A parabola through the three best points puts the minimum near
        4.7e-3, so I picked <code>5e-3</code>, rounding towards the safer side
        because the real runs are five times longer. The LR moved the loss by up
        to 0.18, about twenty times the seed noise below. Getting it wrong would
        have swamped every effect I was trying to measure.
      </p>

      <h3>Three seeds, and the noise floor</h3>
      <Figure
        src={`${IMG}/control_seeds.png`}
        alt="Validation loss curves for three seeds of the control model, nearly overlapping"
        width={840}
        height={480}
        caption="The control model, three seeds, 50M tokens each (about 27 minutes per run)."
      />
      <p>
        The three seeds finished at 1.8830, 1.8743 and 1.8821 nats per token: a
        mean of <strong>1.8798</strong> and a spread of <strong>0.0087</strong>.
        That spread is the most important number in the project. It&apos;s the
        noise floor: a difference under about 0.01 is indistinguishable from
        changing the seed, and anything above 0.02 that holds across seeds is a
        real effect.
      </p>
      <p>The samples read like what you&apos;d hope for:</p>
      <blockquote>
        Once upon a time, there was a little boy named Tim. Tim loved to play
        with his toy cars. One day, he found a big tree. The tree was very tall
        and had many branches that he wanted to touch…
      </blockquote>

      <h2>Proving the code is right: Gemma 3 270M</h2>
      <p>
        A tiny model producing nice stories doesn&apos;t prove the
        implementation is correct. So before running any experiments, I loaded
        Google&apos;s real <strong>Gemma 3 270M</strong> weights into my own
        codebase and compared its outputs to Hugging Face&apos;s{" "}
        <code>transformers</code>.
      </p>
      <p>
        Gemma 3 is the same kind of decoder with nine differences. I added each
        one as a config flag on the control model (not a forked model), guarded
        by a test that the trained control still gives exactly its recorded loss
        with every flag off.
      </p>
      <Figure
        src={`${IMG}/gemma3_architecture.svg`}
        alt="Gemma 3 270M architecture diagram, with the parts that differ from Llama outlined"
        width={1000}
        height={1185}
        unoptimized
        imageClassName="mx-auto h-auto w-full max-w-[640px]"
        frameClassName="px-2 py-4 sm:px-4 sm:py-4"
        caption="Gemma 3 270M. Dashed outlines mark what differs from a Llama-style block: sandwich norms, GeGLU, QK-norm, multi-query attention, and a 5:1 local:global layer pattern."
      />
      <DataTable
        head={["Difference", "Control", "Gemma 3 270M"]}
        rows={[
          ["RMSNorm scale", "x̂ · w", "x̂ · (1 + w)"],
          ["Embeddings", "unscaled", "× √640"],
          ["QK-norm", "none", "RMSNorm per q/k head"],
          ["Norms per block", "2 (pre)", "4 (pre + post)"],
          ["MLP", "SwiGLU", "GeGLU (tanh GELU)"],
          ["Heads", "6 Q / 6 KV, dim 32", "4 Q / 1 KV, dim 256"],
          ["Layer pattern", "all global", "5 local : 1 global"],
          ["Window", "—", "512 tokens"],
          ["RoPE base", "10k", "10k local · 1M global"],
        ]}
      />
      <p>
        The method was boring on purpose: read the reference source instead of
        trusting memory, check the parameter count (exactly 268,098,176,
        Google&apos;s published number), match each feature against Hugging
        Face&apos;s own module on random weights, then match a tiny random Gemma
        end to end, and only then load the real checkpoint.
      </p>
      <Stats
        items={[
          {
            value: "1.8e-4",
            label: "max |logit diff| over 262,144 vocab entries",
          },
          { value: "100%", label: "top-1 token agreement at every position" },
          { value: "5 / 5", label: "prompts with identical greedy decoding" },
          { value: "800", label: "token prompt to exercise the 512 window" },
        ]}
      />
      <KeyResult label="Result">
        Logits matched to about 1e-4 (the target was 1e-3), and greedy
        generation was token-for-token identical. It matched on the first run
        with real weights, because every piece had already been matched on
        random ones.
      </KeyResult>
      <p>
        The remaining difference is fp32 rounding from doing operations in a
        different order across 18 layers. The 800-token prompt matters most: the
        short prompts never exceed the 512-token window, so they don&apos;t test
        the sliding window at all.
      </p>

      <h3>The traps</h3>
      <p>
        These are the bugs this process was built to catch, and the ones
        I&apos;d check first in anyone&apos;s port:
      </p>
      <ul>
        <li>
          <strong>
            <code>(1 + w)</code> norms.
          </strong>{" "}
          Gemma stores norm weights near zero. Read with the Llama convention,
          every activation gets scaled by roughly zero, silently.
        </li>
        <li>
          <strong>Same name, different job.</strong>{" "}
          <code>post_attention_layernorm</code> is the norm <em>before</em> the
          MLP in Llama and the norm on the attention <em>output</em> in Gemma 3.
          I mapped weights by function, not by name.
        </li>
        <li>
          <strong>
            <code>head_dim</code> ≠ width / heads.
          </strong>{" "}
          Attention runs in 4 × 256 = 1,024 dimensions while the residual stream
          is 640 wide.
        </li>
        <li>
          <strong>The GELU variant.</strong> Exact GELU differs from the tanh
          approximation by up to 1e-3, enough to break parity.
        </li>
        <li>
          <strong>Random-weight tests must randomise the norms too.</strong> At
          zero-init, <code>w</code> and <code>1 + w</code> are indistinguishable
          from a Llama norm.
        </li>
        <li>
          <strong>Compare in fp32.</strong> The checkpoint is bf16, whose ~3
          significant digits would hide real bugs.
        </li>
      </ul>
      <p>
        One fun fact from counting: 63% of the &quot;270M&quot; is the embedding
        table (262,144 × 640). The 18 transformer layers hold about 100M
        parameters.
      </p>

      <h2>The number to beat</h2>
      <p>
        With a correct, tuned control in hand, here is what it costs. Every
        layer is global, so the KV cache grows linearly with context:
      </p>
      <DataTable
        head={["Context", "KV cache (fp32, one sequence)"]}
        numeric={[1]}
        rows={[
          ["256 tokens", "2.25 MB"],
          ["4,096 tokens", "36.0 MB"],
        ]}
        caption="2 (K and V) × 6 layers × T tokens × 6 KV heads × 32 dims × 4 bytes."
      />
      <p>
        That 36 MB is tiny in absolute terms, but it scales the same way it does
        in a real model. <strong>Part 2</strong> asks how small the attention
        windows can get before quality suffers, and how much of that 36 MB they
        save.
      </p>
      <hr />
      <p className="text-[15px] text-muted">
        Caveats, stated once: one dataset, one model size, fp32 on one machine,
        and three seeds give a rough noise estimate rather than a confidence
        interval. These are toy versions of the real architectures, not
        reproductions. The code, configs and every result CSV are on{" "}
        <a
          href="https://github.com/AnushDeokar/tiny-frontier"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </p>
    </SeriesPostLayout>
  )
}
