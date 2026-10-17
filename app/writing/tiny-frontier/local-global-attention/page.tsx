import type { Metadata } from "next"

import { AttentionMark } from "@/components/attention-mark"
import { KeyResult, Stats } from "@/components/post/callout"
import { Figure } from "@/components/post/figure"
import { SeriesPostLayout } from "@/components/post/post-layout"
import { DataTable } from "@/components/post/table"

const IMG = "/writing/tiny-frontier"

export const metadata: Metadata = {
  title: "Tiny Frontier, Part 2: How small can attention windows get?",
  description:
    "Sliding-window attention and local:global layer patterns in a 3.4M-parameter model: what windows cost in loss, what they save in KV cache, and why one global layer is enough.",
}

export default function Page() {
  return (
    <SeriesPostLayout
      part={2}
      lede={
        <>
          If each layer only looks at its last W tokens, the KV cache stops
          growing. How small can W get before the model notices, and what
          happens if you keep one layer that sees everything?
        </>
      }
    >
      <KeyResult label="The headline">
        Five 32-token sliding-window layers plus one global layer (Gemma
        3&apos;s 5:1 pattern) <em>beat</em> full attention by 0.02 nats, with{" "}
        <span className="text-accent">5.8× less KV cache</span> at 4,096 tokens.
      </KeyResult>

      <h2>The idea</h2>
      <p>
        In normal (global) attention, token i looks at every token before it. In{" "}
        <strong>sliding-window</strong> (local) attention it only looks at the
        last W: tokens i − W + 1 through i. A local layer never needs to cache
        more than W keys and values, however long the sequence gets.
      </p>
      <div className="!my-10 flex flex-wrap items-end justify-center gap-10 text-foreground sm:gap-16">
        <figure className="flex flex-col items-center gap-3">
          <AttentionMark n={12} window={12} cell={11} className="text-muted" />
          <figcaption className="font-mono text-[11.5px] text-faint">
            global: sees everything
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-3">
          <AttentionMark n={12} window={4} cell={11} className="text-accent" />
          <figcaption className="font-mono text-[11.5px] text-faint">
            local, W = 4: sees the last 4
          </figcaption>
        </figure>
      </div>
      <p>
        Gemma 3 mixes the two: five local layers with a 512-token window for
        every one global layer. Mistral 7B used windows everywhere. I wanted to
        know how much quality a window really costs, and how the{" "}
        <em>pattern</em> of local and global layers changes that.
      </p>

      <h2>The experiment</h2>
      <p>
        Same control model as Part 1 (6 layers, 3.4M parameters, 256-token
        context, 50M tokens), with one change per variant: a layer pattern
        string and a window size. <code>G</code> is a global layer,{" "}
        <code>L</code> a local one, so the control is <code>GGGGGG</code>.
        Everything else, including the learning rate tuned for the control,
        stays identical. That setup slightly favours the control.
      </p>
      <p>
        Before running anything I wrote down predictions: W = 64 and 128 would
        match the control, 16 and 32 would be clearly worse, and a hybrid with
        two global layers would recover most of the gap.
      </p>

      <h2>Results</h2>
      <DataTable
        head={["Variant", "Seeds", "Val loss", "vs control", "KV @ 4,096"]}
        numeric={[1, 2, 3, 4]}
        highlight={[5, 6]}
        rows={[
          [<code key="c">GGGGGG</code>, "3", "1.8798", "—", "36.0 MB"],
          [
            <code key="a">LLLLLL W=128</code>,
            "1",
            "1.8806",
            "+0.001",
            "1.13 MB",
          ],
          [
            <code key="b">LLLLLL W=64</code>,
            "3",
            "1.8951",
            "+0.015",
            "0.56 MB",
          ],
          [
            <code key="d">LLLLLL W=32</code>,
            "1",
            "1.9340",
            "+0.054",
            "0.28 MB",
          ],
          [
            <code key="e">LLLLLL W=16</code>,
            "1",
            "1.9969",
            "+0.117",
            "0.14 MB",
          ],
          [
            <code key="f">LLGLLG W=32</code>,
            "3",
            "1.8596",
            "−0.020",
            "12.2 MB",
          ],
          [<code key="g">LLLLLG W=32</code>, "1", "1.8613", "−0.019", "6.2 MB"],
        ]}
        caption="Lower is better. Seed noise on the control is 0.0087. KV is the fp32 cache for one sequence, measured during generation and equal to the formula to the byte."
      />
      <Figure
        src={`${IMG}/exp1_memory_tradeoff.png`}
        alt="Scatter of validation loss against KV cache size at 4,096 tokens; the hybrid models sit lower and further left than the control"
        width={1050}
        height={660}
        caption="Memory against quality. Lower-left is better. The two hybrids sit below the control at a fraction of its memory."
      />

      <h3>1. All-local: loss rises steadily as the window shrinks</h3>
      <p>
        W = 128 matches the control. W = 64 is slightly but consistently worse:
        all three seeds landed above all three control seeds. W = 32 and W = 16
        are clearly worse, far outside the noise.
      </p>
      <Figure
        src={`${IMG}/exp1_loss_vs_window.png`}
        alt="Validation loss against window size for all-local models, falling towards the control band as the window grows; hybrids sit below the band"
        width={1050}
        height={630}
        caption="All-local models approach the control (grey band) as W grows. The hybrids at W = 32 sit below it."
      />

      <h3>2. Hybrids beat full attention</h3>
      <p>
        This was the surprise. <code>LLGLLG</code> at W = 32 didn&apos;t just
        recover the gap, it beat the control: all three hybrid seeds landed
        below all three control seeds, the worst hybrid beating the best control
        by 0.011. That&apos;s −0.020 nats with 3× less KV memory at 4,096
        tokens.
      </p>

      <h3>3. One global layer is enough</h3>
      <p>
        <code>LLLLLG</code>, Gemma 3&apos;s 5:1 ratio, landed within 0.002 of
        the two-global hybrid at half its long-context memory (single seed).
        Adding the first global layer to an all-local W = 32 model moved the
        loss by 0.073; the second added about 0.002.
      </p>
      <Stats
        items={[
          {
            value: "−0.020",
            label: "nats vs full attention (LLGLLG, 3 seeds)",
          },
          { value: "5.8×", label: "less KV cache at 4K tokens (LLLLLG)" },
          { value: "0.073", label: "loss recovered by the first global layer" },
          { value: "0.002", label: "recovered by the second" },
        ]}
      />

      <h3>4. With a global layer, the window barely matters for memory</h3>
      <p>
        At 4,096 tokens the global layer&apos;s cache dominates.{" "}
        <code>LLLLLG</code> at W = 16 would need 6.1 MB against 6.2 MB at W =
        32. The number of global layers sets the cost. I think this is why Gemma
        can afford a generous 512-token window: once there&apos;s a global
        layer, a bigger window is nearly free.
      </p>

      <h2>Where windows help, and where they hurt</h2>
      <p>
        Averages hide the mechanism, so I split the validation loss by how much
        context each token had, and compared every variant to the control at
        each distance.
      </p>
      <Figure
        src={`${IMG}/exp1_loss_by_position.png`}
        alt="Loss difference to the control by position: all-local models are better at short context and worse at long context; hybrids are better everywhere"
        width={1350}
        height={630}
        wide
        caption="Loss minus control, by tokens of context. Below zero is better than the control."
      />
      <ul>
        <li>
          <strong>Local attention has two opposite effects.</strong> Every
          all-local model is <em>better</em> than the control with little
          context and worse with a lot. Restricting attention to nearby tokens
          seems to make short-range patterns easier to learn, and it costs
          whatever lies out of reach.
        </li>
        <li>
          <strong>The penalty starts after about 2W, not W.</strong> Six stacked
          local layers can relay information backwards (a receptive field of 6 ·
          (W − 1)), but relaying is lossy, so the penalty grows with distance.
        </li>
        <li>
          <strong>
            The hybrids keep the short-range advantage everywhere.
          </strong>{" "}
          The global layer covers what the local layers can&apos;t reach, so
          they&apos;re about 0.02 better at every distance.
        </li>
      </ul>

      <h3>Is the hybrid just learning faster?</h3>
      <p>
        A fair suspicion: maybe hybrids only learn faster, and the control would
        catch up with more training. Tracking the gap through training:
      </p>
      <Figure
        src={`${IMG}/exp1_gap_over_training.png`}
        alt="Gap to the control over 50M training tokens; hybrids start far ahead, narrow, then hold steady near −0.02"
        width={1350}
        height={630}
        wide
        caption="Loss minus control over training. The hybrids' lead narrows over the first ~20M tokens, then holds."
      />
      <p>
        Partly, yes. The hybrids lead by 0.06 at 2M tokens, and that shrinks
        over the first 20M. But for the last 30M tokens it holds steady at
        −0.020 to −0.021. All-local models start ahead too, then fall behind
        once the control learns to use long-range context, from about 4M tokens
        on. At this budget a stable gap remains. Whether it survives much longer
        training, I haven&apos;t tested.
      </p>

      <h2>A detour: generation speed</h2>
      <p>
        I also measured tokens per second while generating with a rolling KV
        cache. All-local models generated about <strong>2.3× faster</strong>,
        and adding any global layer brought the speed back down to the
        control&apos;s.
      </p>
      <DataTable
        head={["Variant", "256 tokens", "4,096 tokens"]}
        numeric={[1, 2]}
        rows={[
          [<code key="a">GGGGGG</code>, "301 tok/s", "310 tok/s"],
          [<code key="b">LLGLLG W=32</code>, "302 tok/s", "291 tok/s"],
          [<code key="c">LLLLLL W=64</code>, "528 tok/s", "700 tok/s"],
          [<code key="d">LLLLLL W=16</code>, "623 tok/s", "719 tok/s"],
        ]}
        caption="Greedy decoding on the M4 GPU, benchmarked control-last to rule out warm-up effects."
      />
      <p>
        But the control is as fast at 4,096 tokens as at 256, so the difference
        isn&apos;t attention arithmetic. My hypothesis (untested): a global
        layer&apos;s cache grows by one entry every step, so its tensors change
        shape every step, and Apple&apos;s GPU backend prepares work per tensor
        shape. A rolling local cache stops changing shape once it&apos;s full.
        Production systems avoid this with a pre-allocated, fixed-size cache. So
        at this scale the speed difference is an implementation effect. The
        architectural win here is memory.
      </p>

      <h2>Predictions vs outcome</h2>
      <DataTable
        head={["Prediction (before running)", "Outcome"]}
        rows={[
          ["W = 64 and 128 ≈ control", "128 ✓ · 64 slightly worse (+0.015)"],
          ["W = 16 and 32 clearly worse", "✓"],
          [
            "LLGLLG W=32 recovers most of the gap",
            "Exceeded: it beats the control",
          ],
          ["Risk: TinyStories too local to show anything", "Didn't happen"],
        ]}
      />

      <h2>What not to conclude</h2>
      <p>
        &quot;Hybrids beat full attention&quot; holds for one dataset, 256-token
        context, 3.4M parameters and 50M tokens, not in general. W = 16, 32, 128
        and <code>LLLLLG</code> are single-seed; their gaps (except{" "}
        <code>LLLLLG</code>&apos;s) are far outside the noise, and{" "}
        <code>LLLLLG</code> matches <code>LLGLLG</code> but isn&apos;t confirmed
        with extra seeds yet. Training speed isn&apos;t reported, because masked
        attention still computes the full matrix, so windows don&apos;t make
        training faster in this code.
      </p>

      <h2>Next</h2>
      <p>
        Windows have a known failure mode. If you stream text past the training
        length and evict the oldest tokens from the cache, models can collapse,
        because they&apos;ve been using the very first tokens as a place to dump
        spare attention. <strong>Part 3</strong> builds a streaming evaluator
        and tests the fixes: StreamingLLM&apos;s kept &quot;sink&quot; tokens,
        and gpt-oss&apos;s learned per-head sink.
      </p>
      <hr />
      <p className="text-[15px] text-muted">
        All numbers come from the run folders and result CSVs in the{" "}
        <a
          href="https://github.com/AnushDeokar/tiny-frontier"
          target="_blank"
          rel="noopener noreferrer"
        >
          repo
        </a>
        . Every run records its config, git commit and data hashes.
      </p>
    </SeriesPostLayout>
  )
}
