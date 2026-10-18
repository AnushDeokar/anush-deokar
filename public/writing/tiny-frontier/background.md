# Shrinking the frontier: rebuilding modern LLM tricks from scratch

> Modern LLMs use a handful of tricks to keep memory cheap. Papers make them sound obvious. I wanted to see them move, so I'm rebuilding them from scratch at tiny scale, for $0.

[Tiny Frontier](https://www.anushdeokar.xyz/writing) · Part 1 of 3 · by Anush Deokar · September 2026 · 11 min read  
Canonical: https://www.anushdeokar.xyz/writing/tiny-frontier/background  
More about the author: https://www.anushdeokar.xyz/llms.txt

Every model that handles long context has the same problem: the **KV cache**. To generate the next token, a transformer needs the keys and values of every token before it, and that cache grows with every token you add. Gemma 3, Mistral and gpt-oss all ship with tricks to keep it small: attention that only looks back a fixed number of tokens, a mix of cheap "local" and expensive "global" layers, and something called an attention sink.

I could explain each of these from the papers. What I couldn't do was predict what happens when you change one: how much quality you lose for how much memory, where the loss comes from, or when a trick quietly breaks. **Tiny Frontier** is my attempt to find out by building them myself, at a scale where I can run a careful experiment in an evening.

## The story in three sentences

1. **Windows cut memory.** A model that only attends to its last W tokens needs a much smaller KV cache (Part 2).
2. **Windows only break on long streams if the model relies on a sink,** a token it parks spare attention on (Part 3).
3. **Whether a sink forms depends on how the model was trained.** Mine formed one only when every training chunk started with the same token (Part 3).

## The constraints

One Apple M4 machine, PyTorch on Apple's GPU backend, no rented GPUs, and no run longer than about 45 minutes, so nothing has to run overnight. That rules out anything close to real model sizes. It also forces the question I actually care about: does the *direction* of each effect show up when everything else is held fixed?

To make the answer trustworthy, I set a few ground rules before writing any model code:

- **One control model.** Every experiment changes exactly one thing against it. Data, tokenizer, optimiser, width, depth, context, token budget and eval slice stay fixed.
- **Seeds where they matter.** The control gets three (1337, 1338, 1339) to measure the noise. A variant gets extra seeds when its gap to the control is ambiguous (0.01–0.03 nats). Single-seed results are labelled as single-seed.
- **Report the cost with every loss:** parameters, wall-clock, tokens per second, and KV-cache bytes.
- **Every run leaves a folder** with its config, git commit, seed, data hash, loss log, a sample and a summary.
- **Negative results are results.** If something doesn't work, it goes in the write-up.

## The setup

The data is [TinyStories](https://huggingface.co/datasets/roneneldan/TinyStories), a dataset of simple children's stories that small models can actually learn. I trained a byte-level BPE tokenizer with a vocabulary of 4,096, pre-tokenised the first 100M training tokens, and fixed a validation slice of 491,520 tokens that every run is scored on.

The control is a Llama-style decoder written from scratch: pre-norm RMSNorm, causal attention with RoPE, a SwiGLU feed-forward, tied embeddings and no biases.

|   | Control model |
| --- | --- |
| Layers / width / heads | 6 / 192 / 6 (head dim 32) |
| Parameters | 3,443,136 (2,656,704 non-embedding) |
| Context | 256 tokens |
| Optimiser | AdamW (0.9, 0.95), weight decay 0.1, clip 1.0 |
| Schedule | 200-step warmup, cosine to 10% of peak |
| Budget | 50M tokens (6,103 steps of 32 × 256) |
| Tests | RoPE, causality, KV-cache equivalence, GQA, regression, … |

### Tuning the learning rate first

An untuned baseline makes every comparison meaningless, so the first real experiment was a learning-rate sweep: five peak LRs, 10M tokens each.

![Validation loss against peak learning rate, U-shaped with a minimum near 6e-3](https://www.anushdeokar.xyz/writing/tiny-frontier/lr_sweep.png)

*Final validation loss after 10M tokens, one seed per learning rate.*

The curve is a U, and it's lopsided: halving the LR from 6e-3 cost 0.021 nats, doubling it cost 0.138. Too high hurts far more than too low. A parabola through the three best points puts the minimum near 4.7e-3, so I picked `5e-3`, rounding towards the safer side because the real runs are five times longer. The LR moved the loss by up to 0.18, about twenty times the seed noise below. Getting it wrong would have swamped every effect I was trying to measure.

### Three seeds, and the noise floor

![Validation loss curves for three seeds of the control model, nearly overlapping](https://www.anushdeokar.xyz/writing/tiny-frontier/control_seeds.png)

*The control model, three seeds, 50M tokens each (about 27 minutes per run).*

The three seeds finished at 1.8830, 1.8743 and 1.8821 nats per token: a mean of **1.8798** and a spread of **0.0087**. That spread is the most important number in the project. It's the noise floor: a difference under about 0.01 is indistinguishable from changing the seed, and anything above 0.02 that holds across seeds is a real effect.

The samples read like what you'd hope for:

> Once upon a time, there was a little boy named Tim. Tim loved to play with his toy cars. One day, he found a big tree. The tree was very tall and had many branches that he wanted to touch…

## Proving the code is right: Gemma 3 270M

A tiny model producing nice stories doesn't prove the implementation is correct. So before running any experiments, I loaded Google's real **Gemma 3 270M** weights into my own codebase and compared its outputs to Hugging Face's `transformers`.

Gemma 3 is the same kind of decoder with nine differences. I added each one as a config flag on the control model (not a forked model), guarded by a test that the trained control still gives exactly its recorded loss with every flag off.

![Gemma 3 270M architecture diagram, with the parts that differ from Llama outlined](https://www.anushdeokar.xyz/writing/tiny-frontier/gemma3_architecture.svg)

*Gemma 3 270M. Dashed outlines mark what differs from a Llama-style block: sandwich norms, GeGLU, QK-norm, multi-query attention, and a 5:1 local:global layer pattern.*

| Difference | Control | Gemma 3 270M |
| --- | --- | --- |
| RMSNorm scale | x̂ · w | x̂ · (1 + w) |
| Embeddings | unscaled | × √640 |
| QK-norm | none | RMSNorm per q/k head |
| Norms per block | 2 (pre) | 4 (pre + post) |
| MLP | SwiGLU | GeGLU (tanh GELU) |
| Heads | 6 Q / 6 KV, dim 32 | 4 Q / 1 KV, dim 256 |
| Layer pattern | all global | 5 local : 1 global |
| Window | — | 512 tokens |
| RoPE base | 10k | 10k local · 1M global |

The method was boring on purpose: read the reference source instead of trusting memory, check the parameter count (exactly 268,098,176, Google's published number), match each feature against Hugging Face's own module on random weights, then match a tiny random Gemma end to end, and only then load the real checkpoint.

- **1.8e-4**: max |logit diff| over 262,144 vocab entries
- **100%**: top-1 token agreement at every position
- **5 / 5**: prompts with identical greedy decoding
- **800**: token prompt to exercise the 512 window

> **Result:** Logits matched to about 1e-4 (the target was 1e-3), and greedy generation was token-for-token identical. It matched on the first run with real weights, because every piece had already been matched on random ones.

The remaining difference is fp32 rounding from doing operations in a different order across 18 layers. The 800-token prompt matters most: the short prompts never exceed the 512-token window, so they don't test the sliding window at all.

### The traps

These are the bugs this process was built to catch, and the ones I'd check first in anyone's port:

- **`(1 + w)` norms.** Gemma stores norm weights near zero. Read with the Llama convention, every activation gets scaled by roughly zero, silently.
- **Same name, different job.** `post_attention_layernorm` is the norm *before* the MLP in Llama and the norm on the attention *output* in Gemma 3. I mapped weights by function, not by name.
- **`head_dim` ≠ width / heads.** Attention runs in 4 × 256 = 1,024 dimensions while the residual stream is 640 wide.
- **The GELU variant.** Exact GELU differs from the tanh approximation by up to 1e-3, enough to break parity.
- **Random-weight tests must randomise the norms too.** At zero-init, `w` and `1 + w` are indistinguishable from a Llama norm.
- **Compare in fp32.** The checkpoint is bf16, whose ~3 significant digits would hide real bugs.

One fun fact from counting: 63% of the "270M" is the embedding table (262,144 × 640). The 18 transformer layers hold about 100M parameters.

## The number to beat

With a correct, tuned control in hand, here is what it costs. Every layer is global, so the KV cache grows linearly with context:

| Context | KV cache (fp32, one sequence) |
| --- | --- |
| 256 tokens | 2.25 MB |
| 4,096 tokens | 36.0 MB |

*2 (K and V) × 6 layers × T tokens × 6 KV heads × 32 dims × 4 bytes.*

That 36 MB is tiny in absolute terms, but it scales the same way it does in a real model. **Part 2** asks how small the attention windows can get before quality suffers, and how much of that 36 MB they save.

---

Caveats, stated once: one dataset, one model size, fp32 on one machine, and three seeds give a rough noise estimate rather than a confidence interval. These are toy versions of the real architectures, not reproductions. The code, configs and every result CSV are on [GitHub](https://github.com/AnushDeokar/tiny-frontier).
