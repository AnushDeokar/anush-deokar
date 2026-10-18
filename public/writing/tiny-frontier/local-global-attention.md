# How small can attention windows get?

> If each layer only looks at its last W tokens, the KV cache stops growing. How small can W get before the model notices, and what happens if you keep one layer that sees everything?

[Tiny Frontier](https://anushdeokar.xyz/writing) · Part 2 of 3 · by Anush Deokar · October 2026 · 10 min read  
Canonical: https://anushdeokar.xyz/writing/tiny-frontier/local-global-attention  
More about the author: https://anushdeokar.xyz/llms.txt

> **The headline:** A hybrid with two global layers and four 32-token sliding-window layers *beat* full attention by 0.02 nats across 3 seeds. Gemma 3's 5:1 pattern matched it with 5.8× less KV cache at 4,096 tokens (1 seed).

## The idea

In normal (global) attention, token i looks at every token before it. In **sliding-window** (local) attention it only looks at the last W: tokens i − W + 1 through i. A local layer never needs to cache more than W keys and values, however long the sequence gets.

*Diagram: global: sees everything*

*Diagram: local, W = 4: sees the last 4*

Gemma 3 mixes the two: five local layers with a 512-token window for every one global layer. Mistral 7B used windows everywhere. I wanted to know how much quality a window really costs, and how the *pattern* of local and global layers changes that.

## The experiment

Same control model as Part 1 (6 layers, 3.4M parameters, 256-token context, 50M tokens), with one change per variant: a layer pattern string and a window size. `G` is a global layer, `L` a local one, so the control is `GGGGGG`. Everything else, including the learning rate tuned for the control, stays identical. That setup slightly favours the control.

Before running anything I wrote down predictions: W = 64 and 128 would match the control, 16 and 32 would be clearly worse, and a hybrid with two global layers would recover most of the gap.

## Results

| Variant | Seeds | Val loss | vs control | KV @ 4,096 |
| --- | --- | --- | --- | --- |
| `GGGGGG` | 3 | 1.8798 | — | 36.0 MB |
| `LLLLLL W=128` | 1 | 1.8806 | +0.001 | 1.13 MB |
| `LLLLLL W=64` | 3 | 1.8951 | +0.015 | 0.56 MB |
| `LLLLLL W=32` | 1 | 1.9340 | +0.054 | 0.28 MB |
| `LLLLLL W=16` | 1 | 1.9969 | +0.117 | 0.14 MB |
| `LLGLLG W=32` | 3 | 1.8596 | −0.020 | 12.2 MB |
| `LLLLLG W=32` | 1 | 1.8613 | −0.019 | 6.2 MB |

*Lower is better. Seed noise on the control is 0.0087. KV is the fp32 cache for one sequence, measured during generation and equal to the formula to the byte.*

![Scatter of validation loss against KV cache size at 4,096 tokens; the hybrid models sit lower and further left than the control](https://anushdeokar.xyz/writing/tiny-frontier/exp1_memory_tradeoff.png)

*Memory against quality. Lower-left is better. The two hybrids sit below the control at a fraction of its memory.*

### 1. All-local: loss rises steadily as the window shrinks

W = 128 matches the control. W = 64 is slightly but consistently worse: all three seeds landed above all three control seeds. W = 32 and W = 16 are clearly worse, far outside the noise.

![Validation loss against window size for all-local models, falling towards the control band as the window grows; hybrids sit below the band](https://anushdeokar.xyz/writing/tiny-frontier/exp1_loss_vs_window.png)

*All-local models approach the control (grey band) as W grows. The hybrids at W = 32 sit below it.*

### 2. Hybrids beat full attention

This was the surprise. `LLGLLG` at W = 32 didn't just recover the gap, it beat the control: all three hybrid seeds landed below all three control seeds, the worst hybrid beating the best control by 0.011. That's −0.020 nats with 3× less KV memory at 4,096 tokens.

### 3. One global layer is enough

`LLLLLG`, Gemma 3's 5:1 ratio, landed within 0.002 of the two-global hybrid at half its long-context memory (single seed). Adding the first global layer to an all-local W = 32 model moved the loss by 0.073; the second added about 0.002.

- **−0.020**: nats vs full attention (LLGLLG, 3 seeds)
- **5.8×**: less KV cache at 4K tokens (LLLLLG)
- **0.073**: loss recovered by the first global layer
- **0.002**: recovered by the second

### 4. With a global layer, the window barely matters for memory

At 4,096 tokens the global layer's cache dominates. `LLLLLG` at W = 16 would need 6.1 MB against 6.2 MB at W = 32. The number of global layers sets the cost. I think this is why Gemma can afford a generous 512-token window: once there's a global layer, a bigger window is nearly free.

## Where windows help, and where they hurt

Averages hide the mechanism, so I split the validation loss by how much context each token had, and compared every variant to the control at each distance.

![Loss difference to the control by position: all-local models are better at short context and worse at long context; hybrids are better everywhere](https://anushdeokar.xyz/writing/tiny-frontier/exp1_loss_by_position.png)

*Loss minus control, by tokens of context. Below zero is better than the control.*

- **Local attention has two opposite effects.** Every all-local model is *better* than the control with little context and worse with a lot. Restricting attention to nearby tokens seems to make short-range patterns easier to learn, and it costs whatever lies out of reach.
- **The penalty starts after about 2W, not W.** Six stacked local layers can relay information backwards (a receptive field of 6 · (W − 1)), but relaying is lossy, so the penalty grows with distance.
- **The hybrids keep the short-range advantage everywhere.** The global layer covers what the local layers can't reach, so beyond the first few tokens they're about 0.02 better at every distance.

### Is the hybrid just learning faster?

A fair suspicion: maybe hybrids only learn faster, and the control would catch up with more training. Tracking the gap through training:

![Gap to the control over 50M training tokens; hybrids start far ahead, narrow, then hold steady near −0.02](https://anushdeokar.xyz/writing/tiny-frontier/exp1_gap_over_training.png)

*Loss minus control over training. The hybrids' lead narrows over the first ~20M tokens, then holds.*

Partly, yes. The hybrids lead by 0.06 at 2M tokens, and that shrinks over the first 20M. But for the last 30M tokens it holds steady at −0.020 to −0.021. All-local models start ahead too, then fall behind once the control learns to use long-range context, from about 4M tokens on. At this budget a stable gap remains. Whether it survives much longer training, I haven't tested.

## A detour: generation speed

I also measured tokens per second while generating with a rolling KV cache. All-local models generated about **2.3× faster**, and adding any global layer brought the speed back down to the control's.

| Variant | 256 tokens | 4,096 tokens |
| --- | --- | --- |
| `GGGGGG` | 301 tok/s | 310 tok/s |
| `LLGLLG W=32` | 302 tok/s | 291 tok/s |
| `LLLLLL W=64` | 528 tok/s | 700 tok/s |
| `LLLLLL W=16` | 623 tok/s | 719 tok/s |

*Greedy decoding on the M4 GPU, benchmarked control-last to rule out warm-up effects.*

But the control is as fast at 4,096 tokens as at 256, so the difference isn't attention arithmetic. My hypothesis (untested): a global layer's cache grows by one entry every step, so its tensors change shape every step, and Apple's GPU backend prepares work per tensor shape. A rolling local cache stops changing shape once it's full. Production systems avoid this with a pre-allocated, fixed-size cache. So at this scale the speed difference is an implementation effect. The architectural win here is memory.

## Predictions vs outcome

| Prediction (before running) | Outcome |
| --- | --- |
| W = 64 and 128 ≈ control | 128 ✓ · 64 slightly worse (+0.015) |
| W = 16 and 32 clearly worse | ✓ |
| LLGLLG W=32 recovers most of the gap | Exceeded: it beats the control |
| Risk: TinyStories too local to show anything | Didn't happen |

## What not to conclude

"Hybrids beat full attention" holds for one dataset, 256-token context, 3.4M parameters and 50M tokens, not in general. W = 16, 32, 128 and `LLLLLG` are single-seed; their gaps (except `LLLLLG`'s) are far outside the noise, and `LLLLLG` matches `LLGLLG` but isn't confirmed with extra seeds yet. Training speed isn't reported, because masked attention still computes the full matrix, so windows don't make training faster in this code.

## Next

Windows have a known failure mode. If you stream text past the training length and evict the oldest tokens from the cache, models can collapse, because they've been using the very first tokens as a place to dump spare attention. That's what the papers report. **Part 3** builds a streaming evaluator and tests the fixes: StreamingLLM's kept "sink" tokens, and gpt-oss's learned per-head sink. My model didn't behave the way the papers predict, and working out why turned out to be the interesting part.

---

All numbers come from the run folders and result CSVs in the [repo](https://github.com/AnushDeokar/tiny-frontier). Every run records its config, git commit and data hashes.
