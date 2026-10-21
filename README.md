# Citation-verification consensus: AITR Assignment 7

**Chinmay Thakur · MDE2026011 · IIIT Allahabad · 18 October 2026**

A working, CPU-only controlled study of five citation checkers' **released decisions**. This project implements voting, source-held-out threshold selection, panel ablations, and review deferral. The primary comparison uses the five released decision columns. A separately dated supplement now executes the original CheckIfExist code on citation strings, with cached public responses; this is not a fresh five-service benchmark.

## Main measured result

On the corrected v1.1.0 labels (104 references, 35 problematic, 69 verified):

| Method | TP | FP | TN | FN | Recall | False-positive rate | Balanced accuracy |
|---|---:|---:|---:|---:|---:|---:|---:|
| RefChecker recorded baseline | 34 | 34 | 35 | 1 | .971 | .493 | .739 |
| Fixed majority, 3 of 5 | 31 | 36 | 33 | 4 | .886 | .522 | .682 |
| Fixed strict rule, 4 of 5 | 25 | 9 | 60 | 10 | .714 | .130 | .792 |
| Source-held-out selected threshold | 30 | 31 | 38 | 5 | .857 | .449 | .704 |

The primary majority rule **fails** the frozen requirement: reduce RefChecker's FPR by at least .10 absolute while keeping recall at least .80. Four votes give favorable pooled BA but miss the recall floor. Two four-tool ablations satisfy the numerical criterion descriptively, but selecting those panels after viewing this corpus is not independent validation. The paper reports those results too.

The historical v1.0.0 run reproduces the published RefChecker confusion matrix exactly (32 TP, 36 FP, 35 TN, 1 FN). The corrected release changes two labels; both versions and their audit trail are retained. The correction was discovered after the first experiment; see `protocol_amendments.md`.

## Reproduce

Python 3.13.3 was used. The core module and tests use the standard library; experiments require NumPy, and figures require Matplotlib. No GPU, model weights, paid API, or account is needed.

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/environment_check.py
python -m unittest discover -s tests -v
python scripts/run_study.py
python scripts/run_study.py --corrected
python scripts/plot_results.py
python scripts/plot_results.py --results results/corrected
python scripts/build_paper_assets.py
python scripts/check_reference.py --flags 1 1 1 0 0 --threshold 3
```

All study, plot, table, CLI, and test commands have been executed. A fresh virtual environment was installed from these requirements, and 24 numerical output files matched byte for byte. The complete reproduction record is `provenance/reproduction_check.json`. A full dependency snapshot is `requirements-lock.txt`; the two directly required libraries are pinned in `requirements.txt`.

The openly licensed raw data are included. To reacquire the exact releases from their official source (requires internet):

```bash
python scripts/fetch_data.py
python scripts/fetch_data.py --corrected
```

Both acquisition commands were executed. Fetching updates retrieval timestamps but checks provider MD5 and saves SHA-256 manifests. Study execution verifies the hashes and class counts. Do not edit the frozen `configs/protocol.json`; record justified changes in `protocol_amendments.md`.

To run the executed notebook, install `requirements-notebook.txt` into a Jupyter environment and open `notebooks/study_walkthrough.ipynb`; run it from the project root or notebooks directory. The included notebook has seven executed code cells and no error outputs. Optional notebook dependency versions were recorded from that execution environment.

To reproduce without replacing the included outputs:

```bash
python scripts/run_study.py --out results/reproduction
python scripts/run_study.py --corrected --out results/reproduction_corrected
```

Exact numerical results are deterministic; timestamps, platform strings, timing measurements, and PDF metadata can differ. Benchmark timings refer only to counting stored flags, not the original checkers' processing costs.

## Read the deliverables

- `paper/main.pdf`: ACM-style implementation paper.
- `paper/main.tex`, `paper/references.bib`, `paper/images/`, `paper/tables/`: editable, self-contained LaTeX project. Upload the contents of `paper/` to Overleaf, select `main.tex`, and use XeLaTeX. Local compilation used Tectonic 0.17.0; Overleaf itself has not been run in this session.
- `docs/research_brief.pdf`: one-page gap and decision brief.
- `docs/literature_to_experiment.md`: five candidate gaps, three method mappings, source and feasibility checks.
- `baseline_validation.md`: validation evidence and boundaries.
- `notebooks/study_walkthrough.ipynb`: executed notebook with actual outputs.
- `results/`: historical experiment; `results/corrected/`: author-corrected labels.
- `provenance/`: protocol freeze, download hashes, label audit, environment and reproduction evidence.
- `ai_assistance_log.md`: authentic AI work, actual failures, and unverified human actions.
- `demo/five_minute_walkthrough.mp4`: five minutes of genuine recorded command execution rendered as a terminal, with clearly labelled synthetic narration. `demo/execution_transcript.json` contains measured events/exit codes. This is not a recording of the student or a desktop screen capture. The script and viva guide are alongside it.
- `docs/technical_review.md`: assistant technical audit and revision responses.
- `docs/assignment_checklist.md`: mapping to the assignment's 18 prompt stages and submission items.

## Algorithm and boundaries

For each row, sum five flags. Output `flagged` when the count reaches k; the primary k is 3. The input order is CheckIfExist, HalluCiteChecker, Hallucinator, HalRef, RefChecker. Missing/unknown flags are rejected. The CLI consumes flags already obtained elsewhere; it is not a citation-existence detector.

For source-held-out selection, choose k using the mean balanced accuracy of the other documents, with ties favoring smaller k. A test document's labels never choose its own threshold. Normalized-reference duplicates are excluded from training; none were found. The normalization is not semantic entity resolution.

Triage accepts 0–1 flags, defers 2–3, and flags 4–5. It defers 53 of 104 references. The automatic subset has 51 references and nine errors; ten corrected-label problems are deferred. Deferral is not counted as success, and conditional recall is not overall recall.

This purposive three-document sample cannot estimate prevalence or deployment performance. Ground truth and base-tool outputs are inherited. The bootstrap is conditional on these sources. No human trust, formatting intervention, participant experiment, complete semantic citation audit, or current five-checker benchmark is claimed. The separate CheckIfExist supplement is bounded by its documented source version and retrieval failures.

## Credits and license

Data: Fidan Badalova and Philipp Mayr, *Manual Reference Verification Dataset for Hallucinated and Suspicious Citation Detection Tools*, Zenodo [v1.0.0](https://doi.org/10.5281/zenodo.21457492) and [v1.1.0](https://doi.org/10.5281/zenodo.23236264), CC BY 4.0. See `data/README.md`. The dataset authors and tool developers are not authors or endorsers of this reanalysis.

Original project code is MIT licensed (`LICENSE`); dataset terms remain CC BY 4.0. The pinned CheckIfExist code is redistributed under its original MIT license in `third_party/checkifexist/`; the original notices are retained. HTTP metadata retain their source terms and are not relabelled as original project code. See the verified bibliography for source papers. Codex assisted with design, code, execution, analysis, and writing. The student must review and understand the work before submission; prepared materials are not evidence of a completed student demonstration.

## Executable original-source baseline (21 October supplement)

Requires Node 18+ and Python 3; validation used the versions in `results/*baseline*/run_manifest.json`. The prebuilt module has no npm runtime dependencies. The following commands were executed, including two byte-identical algorithm replays:

```bash
node --test tests/test_baseline_policy.mjs
node scripts/run_live_baseline.mjs --crossref-only --out results/crossref_baseline_replay
node scripts/run_live_baseline.mjs --out results/live_baseline_replay
python scripts/demo_evidence.py baseline
```

These commands use the included response cache and make no network requests. If Python is not named `python3`, set `AITR_PYTHON` to its executable. Optional `--live` permits missing cache entries to be acquired from public endpoints without credentials; an existing cached response is not overwritten. `AITR_HTTP_PROXY` is an optional environment proxy, not a credential. The actual online acquisition was executed, but future service availability is not promised.

The original CrossRef stage completed 104/104 cases (TP33 FP49 TN20 FN2); the full cascade completed retrieval for only 23/104 cases. Do not compare a small complete-case subset with the full corpus as if it were representative. See A3/A4, `baseline_validation.md` and `docs/completion_repair.md`.

`provenance/ai_traceability.json` and `docs/authentic_prompt_record.md` now link the actual task prompts, model identifier, tool-call receipts, Git changes and verification artifacts. Unavailable backend-build details and unobserved student actions remain explicitly unknown.

To rebuild the vendored module, use esbuild 0.25.11 (used and recorded for this build):

```bash
npx --yes esbuild@0.25.11 scripts/upstream_entry.ts --bundle --platform=node --format=esm --outfile=scripts/vendor_checkifexist.mjs
```

The equivalent build was executed with the locally installed, pinned esbuild binary. Rebuilding is unnecessary for ordinary reproduction. The original sources and bundle are included.
