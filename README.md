# Citation-verification consensus: AITR Assignment 7

**Chinmay Thakur · MDE2026011 · IIIT Allahabad · 18 October 2026**

A working, CPU-only controlled study of five citation checkers' **released decisions**. This project implements voting, source-held-out threshold selection, panel ablations, and review deferral. It does not rerun the five services or check arbitrary citation strings against the internet.

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

All study, plot, table, CLI, and test commands have been executed. The complete clean-environment reproduction record is `provenance/reproduction_check.json`. A full dependency snapshot is `requirements-lock.txt`; the two directly required libraries are pinned in `requirements.txt`.

The openly licensed raw data are included. To reacquire the exact releases from their official source (requires internet):

```bash
python scripts/fetch_data.py
python scripts/fetch_data.py --corrected
```

Both acquisition commands were executed. Fetching updates retrieval timestamps but checks provider MD5 and saves SHA-256 manifests. Study execution verifies the hashes and class counts. Do not edit the frozen `configs/protocol.json`; record justified changes in `protocol_amendments.md`.

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
- `demo/`: five-minute walkthrough materials and technical viva preparation.
- `docs/technical_review.md`: assistant technical audit and revision responses.
- `docs/assignment_checklist.md`: mapping to the assignment's 18 prompt stages and submission items.

## Algorithm and boundaries

For each row, sum five flags. Output `flagged` when the count reaches k; the primary k is 3. The input order is CheckIfExist, HalluCiteChecker, Hallucinator, HalRef, RefChecker. Missing/unknown flags are rejected. The CLI consumes flags already obtained elsewhere; it is not a citation-existence detector.

For source-held-out selection, choose k using the mean balanced accuracy of the other documents, with ties favoring smaller k. A test document's labels never choose its own threshold. Normalized-reference duplicates are excluded from training; none were found. The normalization is not semantic entity resolution.

Triage accepts 0–1 flags, defers 2–3, and flags 4–5. It defers 53 of 104 references. The automatic subset has 51 references and nine errors; ten corrected-label problems are deferred. Deferral is not counted as success, and conditional recall is not overall recall.

This purposive three-document sample cannot estimate prevalence or deployment performance. Ground truth and base-tool outputs are inherited. The bootstrap is conditional on these sources. No human trust, formatting intervention, live checker rerun, participant experiment, or complete semantic citation audit is claimed.

## Credits and license

Data: Fidan Badalova and Philipp Mayr, *Manual Reference Verification Dataset for Hallucinated and Suspicious Citation Detection Tools*, Zenodo [v1.0.0](https://doi.org/10.5281/zenodo.21457492) and [v1.1.0](https://doi.org/10.5281/zenodo.23236264), CC BY 4.0. See `data/README.md`. The dataset authors and tool developers are not authors or endorsers of this reanalysis.

Original project code is MIT licensed (`LICENSE`); dataset terms remain CC BY 4.0. No third-party checker code is copied into the implementation. See the verified bibliography for source papers. Codex assisted with design, code, execution, analysis, and writing. The student must review and understand the work before submission; prepared materials are not evidence of a completed student demonstration.
