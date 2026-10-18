# Attention sinks and streaming

> A model trained on 256 tokens has to stream far past that with a small cache. StreamingLLM says evicting the first tokens breaks it. Mine didn't break, and finding out why was the most interesting result of the project.

[Tiny Frontier](https://www.anushdeokar.xyz/writing) · Part 3 of 3 · by Anush Deokar · October 2026 · 10 min read  
Canonical: https://www.anushdeokar.xyz/writing/tiny-frontier/attention-sinks  
More about the author: https://www.anushdeokar.xyz/llms.txt

> **The headline:** Attention sinks come from the training data, not from attention itself. My model formed none until every training chunk started with the same token. Then it formed one immediately, and evicting it from the cache cost +0.035 nats in 32 of 32 buckets.

## The problem: streaming past the training length

Part 2 was about shrinking the KV cache inside the training length. This part is about generating *past* it. A chatbot or an agent keeps producing tokens long after 256, so something has to happen to the cache. There are two obvious options:

- **Keep everything** (a full cache). Memory grows with every token, and the model meets positions it never saw in training.
- **Keep only the last W tokens** (a rolling cache). Memory is fixed, and the kept tokens are renumbered 0 to W − 1, so positions never go out of range.

The rolling cache sounds like the clear winner. [StreamingLLM](https://arxiv.org/abs/2309.17453) (Xiao et al., 2023) showed it isn't: once the first few tokens leave the cache, large models fall apart. Their explanation is the **attention sink**.

Softmax forces every head's attention weights to sum to 1, even when nothing in the context is relevant. The model needs somewhere to put that spare attention, and the first token is a natural choice: every later token can see it. So models learn to park attention there. Evict it, and that attention gets spread over tokens that do matter, which scrambles everything downstream.

Two fixes exist, and I built both:

- **Keep the sink tokens** (StreamingLLM): always keep the first 4 tokens, plus the last W.
- **Train in a sink** (gpt-oss): give each head one extra learned logit in the softmax with no value vector behind it. Weight that goes there goes nowhere, so a head can attend to "nothing".

## The experiment

I took 32 streams of 4,096 validation tokens, 16× the training length, and fed them through the model one token at a time, scoring the prediction at every position. The model and the text stay the same in every case; only the cache changes.

| Case | Model | Cache |
| --- | --- | --- |
| a | control (3 seeds) | full: keep every token |
| b | control (3 seeds) | rolling: last 64 tokens |
| c | control (3 seeds) | sink: first 4 + last 64 |
| d | control + learned sink (1 seed) | rolling: last 64 |
| e | all-local W = 64 from Part 2 (3 seeds) | rolling: last 64 |

The learned-sink model is the control with one change, trained the same way. It scored 1.8845 against 1.8830 for the matching control seed, so the sink costs nothing in quality.

My predictions, written before running: (a) breaks past 256 tokens, (b) collapses once the first tokens are evicted, (c) and (d) fix it, and (e) does best, because it never learned to look further back than 64 tokens.

## Result 1: only the full cache breaks

![Loss along a 4,096-token stream: all caches match up to 256 tokens, then the full cache climbs to about 4.7 while the rolling caches stay flat near 1.7](https://www.anushdeokar.xyz/writing/tiny-frontier/exp2_post_stream.png)

*Loss at each position of the stream (32-token moving average). The full cache breaks right after the training length; the rolling caches stay flat to 4,096.*

Up to position 256 every case is the same. After that, the full cache climbs from about 1.6 to 4.7, which is worse than the 4.0 the model scores with no context at all. Memory isn't the problem here, positions are: past 256 the model meets rotary position angles it was never trained on. Every 64-token cache stays flat at about 1.74 out to 4,096 tokens.

## Result 2: the collapse didn't happen

| Case | Mean loss, positions 256–4,095 |
| --- | --- |
| a full cache | 4.503 |
| b rolling(64) | 1.738 |
| c sink(4) + rolling(64) | 1.742 |
| d learned sink, rolling(64) | 1.744 |
| e trained with W = 64, rolling(64) | 1.718 |

*Lower is better. b, c and d are within 0.006 of each other, below the 0.01 noise floor.*

Case b didn't collapse. Keeping the first four tokens (c) made no difference, and neither did the learned sink (d). Prediction (b) was simply wrong for this model. So either my cache was broken, or the model never had a sink to lose.

The cache isn't the issue: it's unit-tested, and the same harness caught case a breaking. So I measured where the attention actually goes.

## Why: there was no sink to lose

For every layer and head, I measured how much attention token 0 gets, and divided it by what it would get if attention were spread evenly. 1× means token 0 is treated like any other token, above 1× means it's a sink, and below 1× means it's being ignored.

![Three heatmaps over 6 layers and 6 heads: the control's attention on token 0 is all blue, below even; the BOS-trained model is deep red, up to 33 times even; the learned-sink model sends 20 to 91 percent of layer 0's attention to nothing](https://www.anushdeokar.xyz/writing/tiny-frontier/exp2_post_attention.png)

*Left: the control. Middle: the same model trained with <s> first (next section). Right: how much attention the learned-sink model sends to 'nothing'. Queries at positions 16–255 of normal 256-token chunks.*

Look at the left panel first. Across all 108 heads (6 layers × 6 heads × 3 seeds), token 0 never gets more than an even share. Most layers give it a third of that or less. There is no sink, so evicting token 0 takes away nothing the model relies on.

But the right panel shows the model *does* have spare attention to dump. Given a learned sink, layer 0 sends 20–91% of its attention to "nothing", and later layers send 11–55%. The need for a sink is real. The control just never chose token 0 as the place to put it.

My guess was the training data. I train on random 256-token slices of one long stream of stories, so a chunk starts mid-sentence and position 0 holds a different token every time: "the", a name, a full stop. Llama-style models instead put the same token, `<s>` (beginning of sequence), at position 0 of every training sequence. A sink needs to be the same thing every time, and only that setup gives the model one.

## The test: one more training run

I trained the control again with exactly one change: `<s>` at the start of every training chunk. It reached 1.8835, the same as the control, so the change costs nothing on its own. Then I streamed it both ways: rolling(64), which evicts `<s>` at position 64, and sink(4) + rolling(64), which keeps it.

**A sink formed immediately.** In the middle panel above, every layer-0 head puts 19–33× an even share on `<s>`, and later layers go up to 17.5×. Same model, same data, same budget: the only difference is a fixed token at position 0.

**And now evicting it hurts.** Because the two streams use the same model and the same text, I can subtract them bucket by bucket. Seed noise and text noise cancel out, leaving only the cost of evicting the first tokens:

![Extra loss from evicting the first tokens, per 128-token bucket: about zero for the control, about +0.035 in every bucket for the BOS-trained model](https://www.anushdeokar.xyz/writing/tiny-frontier/exp2_post_eviction_cost.png)

*Loss with a rolling cache minus loss with the first 4 tokens kept, for the same model on the same 32 streams.*

- **33×**: an even share of attention on <s> (layer 0)
- **+0.035**: nats from evicting it (vs −0.003 without <s>)
- **32 / 32**: buckets where evicting it hurt
- **64**: the exact position the gap starts

The timing is the cleanest evidence. The two runs are identical for positions 1–63 (1.974 each) and split at position 64, the moment `<s>` leaves the cache (1.630 against 1.605 over the next 64 tokens). Keeping it, StreamingLLM-style, puts the model level with the control again (1.733 against 1.742).

> **What this shows:** In this setup, whether a model develops an attention sink depends on how it was trained. Without a fixed first token, a rolling cache is safe. With one, you have to keep it.

## Why 0.035, not an explosion

StreamingLLM's models blow up to perplexities in the hundreds or thousands without their sink tokens. Mine lose about 3.5% perplexity. I have two plausible reasons, neither tested. First, my sink is moderate: `<s>` takes 22–38% of layer 0's attention and much less elsewhere. Second, the model is tiny (3.4M parameters) and trained briefly (50M tokens). Whether the dependence on the sink grows with model size is the next question I'd test.

## What about the learned sink?

At this scale it doesn't change the loss: d matches b and c, and its training loss matches the control. It does get used heavily, and it has one visible effect. In the first ~10 tokens of a stream its loss is clearly lower (3.5 against 3.75 at position 1). With almost no context, attending to nothing beats spreading weight over junk.

## So which model streams best?

The all-local W = 64 model from Part 2 (e), by about 0.02 nats, consistently across seeds. It never learned to depend on tokens more than 64 back, so a 64-token cache removes nothing it uses. It also generated up to 2.3× faster in Part 2's benchmark, with a quarter of the cache. The model that was best inside the training length isn't the one you want for long streams.

## Predictions vs outcome

| Prediction (before running) | Outcome |
| --- | --- |
| (a) full cache breaks past 256 | ✓, badly: 1.6 → 4.7 |
| (b) rolling cache collapses | ✗ for the control (no sink formed) · ✓ mildly once training started with `<s>` |
| (c) keeping 4 sink tokens fixes b | Nothing to fix for the control · fully fixes the BOS model |
| (d) learned sink fixes b | ≈ b and c |
| (e) trained-with-window model is best | ✓ |

## What not to conclude

This is one dataset and one model size. TinyStories stories are about 200 tokens long, so a 4,096-token stream is about 20 stories in a row. That tests whether the model stays stable, not whether it uses long-range context. The BOS and learned-sink models are single-seed. The BOS result rests on a paired comparison that was positive in 32 of 32 buckets, plus a 19–33× effect in the attention data, but a second seed would make it stronger. I also measured attention on normal 256-token chunks, not inside the streams. And "sinks come from the data format" is shown for a 3.4M-parameter model; StreamingLLM saw sinks in larger models trained without a dedicated sink token, so scale probably matters too.

## Where this leaves the series

Across three parts: a from-scratch model that matches Gemma 3 to 1e-4; a 5:1 local:global pattern that matches a 3-seed hybrid which beats full attention, at 5.8× less KV cache; and an attention sink I could switch on and off by changing one token in the training data. The open question is scale: at what model size does evicting a sink go from a 3.5% cost to a collapse? That's the experiment I'd run next.

---

All numbers come from the run folders and result CSVs in the [repo](https://github.com/AnushDeokar/tiny-frontier). The streaming evaluator is `scripts/exp2_stream.py`.
