import type { Metadata } from "next"

import { KeyResult, Stats } from "@/components/post/callout"
import { Figure } from "@/components/post/figure"
import { SeriesPostLayout } from "@/components/post/post-layout"
import { DataTable } from "@/components/post/table"

const IMG = "/writing/tiny-frontier"
const BOS = <code>{"<s>"}</code>

export const metadata: Metadata = {
  title: "Tiny Frontier, Part 3: Attention sinks and streaming",
  description:
    "Streaming a 256-token model for 4,096 tokens with a 64-token cache. StreamingLLM predicts a collapse; mine didn't collapse, and one controlled run showed why: attention sinks come from the training data format.",
}

export default function Page() {
  return (
    <SeriesPostLayout
      part={3}
      lede={
        <>
          A model trained on 256 tokens has to stream far past that with a small
          cache. StreamingLLM says evicting the first tokens breaks it. Mine
          didn&apos;t break, and finding out why was the most interesting result
          of the project.
        </>
      }
    >
      <KeyResult label="The headline">
        Attention sinks come from the training data, not from attention itself.
        My model formed none until every training chunk started with the same
        token. Then it formed one immediately, and evicting it from the cache
        cost{" "}
        <span className="text-accent">+0.035 nats in 32 of 32 buckets</span>.
      </KeyResult>

      <h2>The problem: streaming past the training length</h2>
      <p>
        Part 2 was about shrinking the KV cache inside the training length. This
        part is about generating <em>past</em> it. A chatbot or an agent keeps
        producing tokens long after 256, so something has to happen to the
        cache. There are two obvious options:
      </p>
      <ul>
        <li>
          <strong>Keep everything</strong> (a full cache). Memory grows with
          every token, and the model meets positions it never saw in training.
        </li>
        <li>
          <strong>Keep only the last W tokens</strong> (a rolling cache). Memory
          is fixed, and the kept tokens are renumbered 0 to W − 1, so positions
          never go out of range.
        </li>
      </ul>
      <p>
        The rolling cache sounds like the clear winner.{" "}
        <a
          href="https://arxiv.org/abs/2309.17453"
          target="_blank"
          rel="noopener noreferrer"
        >
          StreamingLLM
        </a>{" "}
        (Xiao et al., 2023) showed it isn&apos;t: once the first few tokens
        leave the cache, large models fall apart. Their explanation is the{" "}
        <strong>attention sink</strong>.
      </p>
      <p>
        Softmax forces every head&apos;s attention weights to sum to 1, even
        when nothing in the context is relevant. The model needs somewhere to
        put that spare attention, and the first token is a natural choice: every
        later token can see it. So models learn to park attention there. Evict
        it, and that attention gets spread over tokens that do matter, which
        scrambles everything downstream.
      </p>
      <p>Two fixes exist, and I built both:</p>
      <ul>
        <li>
          <strong>Keep the sink tokens</strong> (StreamingLLM): always keep the
          first 4 tokens, plus the last W.
        </li>
        <li>
          <strong>Train in a sink</strong> (gpt-oss): give each head one extra
          learned logit in the softmax with no value vector behind it. Weight
          that goes there goes nowhere, so a head can attend to
          &quot;nothing&quot;.
        </li>
      </ul>

      <h2>The experiment</h2>
      <p>
        I took 32 streams of 4,096 validation tokens, 16× the training length,
        and fed them through the model one token at a time, scoring the
        prediction at every position. The model and the text stay the same in
        every case; only the cache changes.
      </p>
      <DataTable
        head={["Case", "Model", "Cache"]}
        rows={[
          ["a", "control (3 seeds)", "full: keep every token"],
          ["b", "control (3 seeds)", "rolling: last 64 tokens"],
          ["c", "control (3 seeds)", "sink: first 4 + last 64"],
          ["d", "control + learned sink (1 seed)", "rolling: last 64"],
          ["e", "all-local W = 64 from Part 2 (3 seeds)", "rolling: last 64"],
        ]}
      />
      <p>
        The learned-sink model is the control with one change, trained the same
        way. It scored 1.8845 against 1.8830 for the matching control seed, so
        the sink costs nothing in quality.
      </p>
      <p>
        My predictions, written before running: (a) breaks past 256 tokens, (b)
        collapses once the first tokens are evicted, (c) and (d) fix it, and (e)
        does best, because it never learned to look further back than 64 tokens.
      </p>

      <h2>Result 1: only the full cache breaks</h2>
      <Figure
        src={`${IMG}/exp2_post_stream.png`}
        alt="Loss along a 4,096-token stream: all caches match up to 256 tokens, then the full cache climbs to about 4.7 while the rolling caches stay flat near 1.7"
        width={1350}
        height={690}
        caption="Loss at each position of the stream (32-token moving average). The full cache breaks right after the training length; the rolling caches stay flat to 4,096."
      />
      <p>
        Up to position 256 every case is the same. After that, the full cache
        climbs from about 1.6 to 4.7, which is worse than the 4.0 the model
        scores with no context at all. Memory isn&apos;t the problem here,
        positions are: past 256 the model meets rotary position angles it was
        never trained on. Every 64-token cache stays flat at about 1.74 out to
        4,096 tokens.
      </p>

      <h2>Result 2: the collapse didn&apos;t happen</h2>
      <DataTable
        head={["Case", "Mean loss, positions 256–4,095"]}
        numeric={[1]}
        highlight={[1]}
        rows={[
          ["a  full cache", "4.503"],
          ["b  rolling(64)", "1.738"],
          ["c  sink(4) + rolling(64)", "1.742"],
          ["d  learned sink, rolling(64)", "1.744"],
          ["e  trained with W = 64, rolling(64)", "1.718"],
        ]}
        caption="Lower is better. b, c and d are within 0.006 of each other, below the 0.01 noise floor."
      />
      <p>
        Case b didn&apos;t collapse. Keeping the first four tokens (c) made no
        difference, and neither did the learned sink (d). Prediction (b) was
        simply wrong for this model. So either my cache was broken, or the model
        never had a sink to lose.
      </p>
      <p>
        The cache isn&apos;t the issue: it&apos;s unit-tested, and the same
        harness caught case a breaking. So I measured where the attention
        actually goes.
      </p>

      <h2>Why: there was no sink to lose</h2>
      <p>
        For every layer and head, I measured how much attention token 0 gets,
        and divided it by what it would get if attention were spread evenly. 1×
        means token 0 is treated like any other token, above 1× means it&apos;s
        a sink, and below 1× means it&apos;s being ignored.
      </p>
      <Figure
        src={`${IMG}/exp2_post_attention.png`}
        alt="Three heatmaps over 6 layers and 6 heads: the control's attention on token 0 is all blue, below even; the BOS-trained model is deep red, up to 33 times even; the learned-sink model sends 20 to 91 percent of layer 0's attention to nothing"
        width={1516}
        height={579}
        wide
        caption="Left: the control. Middle: the same model trained with <s> first (next section). Right: how much attention the learned-sink model sends to 'nothing'. Queries at positions 16–255 of normal 256-token chunks."
      />
      <p>
        Look at the left panel first. Across all 108 heads (6 layers × 6 heads ×
        3 seeds), token 0 never gets more than an even share. Most layers give
        it a third of that or less. There is no sink, so evicting token 0 takes
        away nothing the model relies on.
      </p>
      <p>
        But the right panel shows the model <em>does</em> have spare attention
        to dump. Given a learned sink, layer 0 sends 20–91% of its attention to
        &quot;nothing&quot;, and later layers send 11–55%. The need for a sink
        is real. The control just never chose token 0 as the place to put it.
      </p>
      <p>
        My guess was the training data. I train on random 256-token slices of
        one long stream of stories, so a chunk starts mid-sentence and position
        0 holds a different token every time: &quot;the&quot;, a name, a full
        stop. Llama-style models instead put the same token, {BOS} (beginning of
        sequence), at position 0 of every training sequence. A sink needs to be
        the same thing every time, and only that setup gives the model one.
      </p>

      <h2>The test: one more training run</h2>
      <p>
        I trained the control again with exactly one change: {BOS} at the start
        of every training chunk. It reached 1.8835, the same as the control, so
        the change costs nothing on its own. Then I streamed it both ways:
        rolling(64), which evicts {BOS} at position 64, and sink(4) +
        rolling(64), which keeps it.
      </p>
      <p>
        <strong>A sink formed immediately.</strong> In the middle panel above,
        every layer-0 head puts 19–33× an even share on {BOS}, and later layers
        go up to 17.5×. Same model, same data, same budget: the only difference
        is a fixed token at position 0.
      </p>
      <p>
        <strong>And now evicting it hurts.</strong> Because the two streams use
        the same model and the same text, I can subtract them bucket by bucket.
        Seed noise and text noise cancel out, leaving only the cost of evicting
        the first tokens:
      </p>
      <Figure
        src={`${IMG}/exp2_post_eviction_cost.png`}
        alt="Extra loss from evicting the first tokens, per 128-token bucket: about zero for the control, about +0.035 in every bucket for the BOS-trained model"
        width={1350}
        height={660}
        caption="Loss with a rolling cache minus loss with the first 4 tokens kept, for the same model on the same 32 streams."
      />
      <Stats
        items={[
          {
            value: "33×",
            label: "an even share of attention on <s> (layer 0)",
          },
          {
            value: "+0.035",
            label: "nats from evicting it (vs −0.003 without <s>)",
          },
          { value: "32 / 32", label: "buckets where evicting it hurt" },
          { value: "64", label: "the exact position the gap starts" },
        ]}
      />
      <p>
        The timing is the cleanest evidence. The two runs are identical for
        positions 1–63 (1.974 each) and split at position 64, the moment {BOS}{" "}
        leaves the cache (1.630 against 1.605 over the next 64 tokens). Keeping
        it, StreamingLLM-style, puts the model level with the control again
        (1.733 against 1.742).
      </p>
      <KeyResult label="What this shows">
        In this setup, whether a model develops an attention sink depends on how
        it was trained. Without a fixed first token, a rolling cache is safe.
        With one, you have to keep it.
      </KeyResult>

      <h2>Why 0.035, not an explosion</h2>
      <p>
        StreamingLLM&apos;s models blow up to perplexities in the hundreds or
        thousands without their sink tokens. Mine lose about 3.5% perplexity. I
        have two plausible reasons, neither tested. First, my sink is moderate:{" "}
        {BOS} takes 22–38% of layer 0&apos;s attention and much less elsewhere.
        Second, the model is tiny (3.4M parameters) and trained briefly (50M
        tokens). Whether the dependence on the sink grows with model size is the
        next question I&apos;d test.
      </p>

      <h2>What about the learned sink?</h2>
      <p>
        At this scale it doesn&apos;t change the loss: d matches b and c, and
        its training loss matches the control. It does get used heavily, and it
        has one visible effect. In the first ~10 tokens of a stream its loss is
        clearly lower (3.5 against 3.75 at position 1). With almost no context,
        attending to nothing beats spreading weight over junk.
      </p>

      <h2>So which model streams best?</h2>
      <p>
        The all-local W = 64 model from Part 2 (e), by about 0.02 nats,
        consistently across seeds. It never learned to depend on tokens more
        than 64 back, so a 64-token cache removes nothing it uses. It also
        generated up to 2.3× faster in Part 2&apos;s benchmark, with a quarter
        of the cache. The model that was best inside the training length
        isn&apos;t the one you want for long streams.
      </p>

      <h2>Predictions vs outcome</h2>
      <DataTable
        head={["Prediction (before running)", "Outcome"]}
        rows={[
          ["(a) full cache breaks past 256", "✓, badly: 1.6 → 4.7"],
          [
            "(b) rolling cache collapses",
            <>
              ✗ for the control (no sink formed) · ✓ mildly once training
              started with {BOS}
            </>,
          ],
          [
            "(c) keeping 4 sink tokens fixes b",
            "Nothing to fix for the control · fully fixes the BOS model",
          ],
          ["(d) learned sink fixes b", "≈ b and c"],
          ["(e) trained-with-window model is best", "✓"],
        ]}
      />

      <h2>What not to conclude</h2>
      <p>
        This is one dataset and one model size. TinyStories stories are about
        200 tokens long, so a 4,096-token stream is about 20 stories in a row.
        That tests whether the model stays stable, not whether it uses
        long-range context. The BOS and learned-sink models are single-seed. The
        BOS result rests on a paired comparison that was positive in 32 of 32
        buckets, plus a 19–33× effect in the attention data, but a second seed
        would make it stronger. I also measured attention on normal 256-token
        chunks, not inside the streams. And &quot;sinks come from the data
        format&quot; is shown for a 3.4M-parameter model; StreamingLLM saw sinks
        in larger models trained without a dedicated sink token, so scale
        probably matters too.
      </p>

      <h2>Where this leaves the series</h2>
      <p>
        Across three parts: a from-scratch model that matches Gemma 3 to 1e-4; a
        5:1 local:global pattern that matches a 3-seed hybrid which beats full
        attention, at 5.8× less KV cache; and an attention sink I could switch
        on and off by changing one token in the training data. The open question
        is scale: at what model size does evicting a sink go from a 3.5% cost to
        a collapse? That&apos;s the experiment I&apos;d run next.
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
        . The streaming evaluator is <code>scripts/exp2_stream.py</code>.
      </p>
    </SeriesPostLayout>
  )
}
