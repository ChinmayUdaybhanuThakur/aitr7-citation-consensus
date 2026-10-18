# Evidence ledger

| Claim | Label | Evidence and practical boundary |
|---|---|---|
| Prior topic is citation integrity, including distinct formatting, identity, access, support layers | VERIFIED | Prior submitted review, 25 September 2026; no new human-trust evidence inferred |
| Five checkers have released decisions for 104 references | VERIFIED | Official Zenodo records and saved CSV; loader/count validation |
| The v1 labels reproduce the published RefChecker matrix | VERIFIED | `results/validation.json`: 32 TP, 36 FP, 35 TN, 1 FN |
| The authors corrected P3:R12 and P3:R18 | VERIFIED | v1.1.0 update note and `provenance/label_correction_audit.json` |
| The main majority target fails on both versions | VERIFIED | Both `primary_decision.json` files |
| Full-panel k=4 has the best pooled BA but misses the recall floor | VERIFIED | Complete threshold rows in both `metrics.csv` files |
| Two four-tool ablations meet the numerical criterion descriptively | VERIFIED | Corrected `metrics.csv`; neither is a separately validated chosen panel |
| Shared error mechanisms explain why tools agree incorrectly | INFERRED | Vote and error-overlap patterns are measured; retrieval/extraction causes not independently inspected |
| A zero-false-acceptance triage subset is safe on new documents | UNKNOWN | Only 17 automatically accepted references in this sample; no prospective test |
| The classifier detects semantic citation support or formatting-induced trust | UNKNOWN / out of scope | Inputs contain flags only; those outcomes were not measured |
| Student approved each technical choice, independently reran the study, or completed the viva | UNKNOWN | Human messages request rapid completion; no such actions observed |
| Corrected release was known before protocol freezing | FALSE | Late discovery disclosed in amendment A2; existed before study but overlooked initially |
| All original services were rerun | FALSE | Only their released decisions were replayed |
