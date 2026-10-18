# Assignment 7 delivery map

## Submission items

| Required item | Prepared artifact | Boundary |
|---|---|---|
| A. Paper PDF, LaTeX, bibliography and figures | `paper/` | Review final text before submitting under your name |
| B. GitHub repository with code, notebook, dependencies, commands | Complete project root | Remote publication status is in the delivery note; do not infer publication from a local Git directory |
| C. Actual experiments, CSV, logs and controls | `results/`, `results/corrected/`, `configs/`, `provenance/` | Live base tools were not rerun |
| D. One-page brief, validation and AI log | `docs/research_brief.pdf`, `baseline_validation.md`, `ai_assistance_log.md` | Human decisions are not invented |
| E. Five-minute code/results walkthrough and viva readiness | `demo/`, executed notebook | Prepared walkthrough is not evidence that the student personally delivered it |

## Eighteen prompt stages

| Prompt | Saved output |
|---|---|
| 01 Accountable workspace | README, research_decisions.md, evidence ledger |
| 02 Five gaps and ranked choices | docs/literature_to_experiment.md |
| 03 Three published method bridges | docs/literature_to_experiment.md |
| 04 Feasibility and novelty check | Same map, explicit search strings and access status |
| 05 Questions and success rule | One-page brief, frozen protocol |
| 06 Dataset and comparators | data/README.md, baseline_validation.md |
| 07 Frozen blueprint | configs/protocol.json, freeze hash, Git commit, docs/experiment_blueprint.md |
| 08 Environment check | scripts/environment_check.py, provenance/environment.json, logs |
| 09 Executable modules and tests | src/consensus.py, tests/, notebook |
| 10 Baseline reproduction | validation JSON and baseline_validation.md |
| 11 Evidence-led debugging | Actual failure log, amendments, AI assistance log |
| 12 Defensible contribution | Decision log, unchanged baselines, sensitivity/ablation implementation |
| 13 Actual outputs only | metrics/predictions/plots for both releases |
| 14 Negative findings and limits | Paper Results/Discussion; complete comparison tables |
| 15 Manuscript | paper/main.tex, references.bib, generated tables/images and PDF |
| 16 Technical review | docs/technical_review.md, concerns and responses |
| 17 Reproduction documentation | README, pinned requirements, clean rerun record |
| 18 AI accountability | ai_assistance_log.md, actual human/assistant distinction |

The instruction sheet's example prompts were adapted as a workflow; their repeated requests to wait for student output were not treated as new user instructions, because the user expressly requested autonomous completion. All reported execution output was obtained from real local runs.

The remaining personal responsibilities are reading and understanding the work, confirming its submission under your name, and performing the live viva if requested. No Classroom submission or instructor gate approval has been carried out by this package.
