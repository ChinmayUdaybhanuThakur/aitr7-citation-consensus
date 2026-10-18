# Research decisions

## 18 October 2026 — initial scope, before downloading the reference-level CSV

- **VERIFIED:** Assignment 7 permits controlled comparisons, reproduction with an extension, and non-ML work. It requires actual code, baseline validation, real results, a deeper analysis, a manuscript, provenance, and a demonstration.
- **VERIFIED:** The previous T23 review separates presentation, bibliographic identity, access, and claim support. Sections 6.1 and 7 discuss verification false alarms; section 9.3 calls for evaluation beyond a single headline score. These are the continuity points for this study.
- **VERIFIED:** Badalova and Mayr provide a public CC BY 4.0 dataset, version 1.0.0, with 104 manually labelled references and standardized outputs from five tools. The dataset's metadata report 71 verified and 33 problematic references in three source documents.
- **INFERRED:** Agreement rules may reduce false positives while also suppressing detection of problems recognized by only a few tools. The direction and size of that trade-off must be measured.
- **Decision:** Implement reusable consensus/triage code and evaluate it on the released tool decisions. This is a controlled reanalysis with new post-processing experiments. The original tools will not be rerun, and their runtime, cost, or current performance will not be claimed.
- **Reason:** This directly addresses the review's false-alarm problem and fits an accelerated CPU-only workflow without paid model calls or human recruitment.
- **Decision:** Freeze majority voting at three of five flags as the primary rule. Report all five tools, all five thresholds, document-specific outcomes, a held-out-document selection experiment, leave-one-tool-out sensitivity, and abstaining triage. Report negative findings as measured.
- **Decision:** Source-document partitions, not a random row split, define adaptive evaluation. Remove exact normalized-reference overlap from training within each held-out fold. More subtle shared-work overlap remains a limitation.
- **UNKNOWN before execution:** Whether majority voting meets the declared success rule; which errors are shared; whether threshold selection transfers across documents; the amount of exact cross-document overlap.
- **Human instruction:** Complete the assignment quickly and continue while the student is away. The student has not yet reviewed the experimental choices, code, or findings.
- **Agent decisions:** The experimental design and implementation choices in this log were made by the AI assistant under that instruction. They must not be described as independently reviewed student decisions.

## Evidence locations

- Assignment 7 instructions: existing local AITR/7 instruction PDF (11 pages).
- Previous review: existing local AITR/6 `Format_as_Credibility__1_.pdf`, especially sections 6–9.
- Dataset: https://zenodo.org/records/21457492
- Original comparison paper: https://arxiv.org/html/2607.22693
- CheckIfExist method: https://arxiv.org/html/2602.15871
- CiteAudit method and implementation: https://arxiv.org/html/2602.23452 and https://github.com/shiiiikw/CiteAudit
- ALCE (support checking, a different target): https://aclanthology.org/2023.emnlp-main.398/

Later decisions and actual run identifiers will be appended after execution.

## Actual outcomes and later decisions

- VERIFIED: original majority target failed (37 false positives, 3 misses), so the negative result remains primary.
- VERIFIED: v1.1.0 was found after the first experiment. A2 records the timing; methods were rerun unchanged with35 problematic/69verified labels. Corrected majority has36 false positives/4misses; RefChecker34/1.
- VERIFIED: no full-panel fixed threshold meets both numerical conditions. Two four-tool ablations do on this corpus, but panel selection has not been independently validated. Both are reported.
- VERIFIED: corrected triage defers53 references including10problems, and makes9errors among51automatic decisions.
- INFERRED: observed agreement patterns motivate future evidence-aware checking; underlying causes were not independently diagnosed.
- UNKNOWN: student scientific review, independent rerun, and viva performance. The assistant prepared materials without inventing these human actions.
