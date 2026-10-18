# Literature-to-experiment map

Checked on 18 October 2026. VERIFIED means primary-source inspection or actual execution; INFERRED means the proposed interpretation is not established by the source; UNKNOWN means evidence is missing. This document reconstructs the design rationale from the real development record. It is not evidence that the student approved each choice before execution.

## Continuity with the previous review

The prior T23 review, *Format as Credibility* (25 September 2026), separates presentation, identity, accessibility, and claim support. Its Sections 3 and 6 discuss these boundaries and verification systems, including CheckIfExist, Badalova–Mayr, CiteAudit, and ALCE. This study selects the bibliographic-alert layer. It does not recycle the review as experimental evidence or claim to have tested its proposed human trust intervention.

## Five candidate gaps

| Candidate and review link | Original-source evidence | Status of proposed gap | Test and feasible evidence | Rank |
|---|---|---|---|---|
| Combining imperfect checker decisions; review technical-verification discussion | Badalova–Mayr release five flags per reference and discuss checker limitations | INFERRED question: whether voting improves alert trade-offs | Replay five baselines; test fixed k=3, sweep 1–5, source-held-out selection; real counts | 1 |
| Uncertainty and review workload; review layered workflow | Review distinguishes unresolved identity from verified invalidity; dataset standardizes suspicious/unresolved outputs into flags | INFERRED: agreement can define a useful deferral policy | Prespecified triage; coverage and residual errors; no invented human accuracy | 2 |
| Sensitivity to manual-label revisions | Authors' v1.1.0 update corrects two labels | VERIFIED correction; robustness analysis added after initial results, not a pre-freeze discovery | Audit IDs/flags/labels across releases and rerun unchanged methods | 3, added during final audit |
| Reproducing live metadata lookup; review CheckIfExist discussion | Official CheckIfExist source describes multi-source lookup and similarity | INFERRED: live API drift could change results | Version-pinned rerun with cached responses; not executed here | 4 |
| Citation appearance versus trust; review proposed controlled human experiment | Prior review distinguishes presentation from truth and identifies causal uncertainty | UNKNOWN effect in the intended student population | Recruit participants with an appropriate protocol; not feasible as an immediate CPU experiment | 5 |

The original minimum viable choice was voting plus workload analysis. The correction analysis was added only after discovering the October release. The ranking above is the final feasibility record; it is not a fabricated pre-experiment ranking of an update that had not yet been noticed.

## Three published method mappings

| Method from the review | Verified source and access | Mechanism and metric boundary | Smallest viable experiment | Resources / decision |
|---|---|---|---|---|
| CheckIfExist, Abbonato (2026) | https://arxiv.org/abs/2602.15871; https://github.com/zabbonat/References-Validation; MIT license observed, commit e4605651751f53579e57a0e14159c2f93b3f5e31 | Cascading bibliographic sources and string matching; identity validation, not claim entailment | A: reproduce live lookup with saved API responses | Network/API variability; not executed; recorded outputs used as comparator |
| CiteAudit, Shi et al. (2026) | https://arxiv.org/abs/2602.23452v3; https://github.com/shiiiikw/CiteAudit | Extraction, memory lookup, retrieval and judgment; code access verified, full redistribution license not established in inspected tree | C: modify one stage while preserving its original evaluation | External credentials and larger evaluation; not selected or claimed reproduced |
| ALCE, Gao et al. (2023) | https://aclanthology.org/2023.emnlp-main.398/ | Citation-supported generation; evaluates support rather than simply reference existence | B: compare support metrics on claim/passage data | Required input pairs absent from selected data; retained as scope boundary |

The executable bridge selected here is Badalova–Mayr's released decision matrix → reconstruction of recorded checker baselines → new voting and triage module → controlled comparative evaluation. The code does not masquerade as an implementation of the internals of the three published systems above.

## Novelty and feasibility

Search strings used: `"citation verification" ensemble "majority" false positives`; `"hallucinated" "references" "voting" verification ensemble`. Neighbor categories: multi-source metadata verification, agent-based checking, selective prediction, and hard-voting ensembles. This was a bounded search, not exhaustive evidence that no similar experiment exists. No new-algorithm novelty is claimed.

The primary dataset and its license were verified from Zenodo metadata. Fixed voting needs no fitting or models; 104 rows fit comfortably in memory. Five recorded tool baselines are available under a common row/label protocol. The current dataset correction is separately attributed. Live endpoint runtime, underlying checker versions, individual author-error causes, semantic duplicate identity, external validity, student understanding, and independent human adjudication remain UNKNOWN.

Go decision: conduct the controlled reanalysis and report unfavorable findings if they occur. Fallback: use the included pinned raw data offline if the source API becomes temporarily unavailable; fail explicitly on any hash or schema mismatch rather than silently substituting data.
