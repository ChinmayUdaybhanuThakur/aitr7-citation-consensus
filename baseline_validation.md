# Baseline validation report

## VERIFIED

- The pinned v1.0.0 data contain 104 rows, 33 problematic and 71 verified; corrected v1.1.0 contains 35 and 69. All required checker flags are present.
- Historical RefChecker reconstruction is **TP 32, FP 36, TN 35, FN 1**, exactly matching the source paper's reported matrix. The executable assertion is in `scripts/run_study.py` and the output in `results/validation.json`.
- Corrected RefChecker results are **TP 34, FP 34, TN 35, FN 1**. The two author-corrected references were flagged by RefChecker, explaining both transitions from FP to TP.
- All 104 IDs and 520 tool flags match across releases. Exactly two manual labels change. Eight decoded reference strings also differ at accented characters; preserved in the version audit.
- Prediction functions receive binary flags only. Held-out source labels do not select their own threshold, checked by a perturbation test.
- Sixteen tests pass. They include a hand-calculated confusion matrix/BA/F1/MCC, zero-denominator behavior, majority and triage boundaries, invalid inputs, UTF-8 BOM and legacy accents, normalized duplicate exclusion, and held-out isolation.
- No normalized reference duplicates are found in either release. Fold IDs and the zero exclusion lists are saved.
- Outputs, plots, tables, data hashes, protocol hash, and source hashes are saved. The fresh-environment numerical comparison is recorded in `provenance/reproduction_check.json`.

## ACCEPTABLE ADAPTATIONS

This is a reproduction of **evaluation on released baseline decisions**, not reimplementation or live execution of the original five tools. It preserves the supplied standardized flag meaning and manual labels within each version. The new executable algorithms operate on the common decision matrix. This makes the decision-combination comparison fair at that layer, while excluding retrieval/extraction behavior and service drift.

Legacy CP850 and corrected UTF-8 BOM input handling are documented implementation corrections. Hash checks preserve raw files; decoding does not alter ASCII labels/flags. The corrected release is a post-freeze robustness analysis and is never silently substituted into the historical run.

## UNCERTAIN / NOT ESTABLISHED

Manual labels were not independently re-adjudicated; normalized text matching cannot rule out semantic duplicates; five binary columns do not reveal why tools flagged a row; original checker service versions and costs were not reproduced; only three source clusters exist. No clinical, legal, misconduct, or trust judgment follows from these flags.

## CORRECTED DURING DEVELOPMENT

The initial UTF-8 assumption failed on the legacy CSV. The later legacy decoder failed on the corrected release's BOM. A strict version audit then revealed eight accent-encoding differences in reference text despite the release note's description of unchanged reference strings. Both raw versions are preserved, prediction inputs confirmed unchanged, and each duplicate audit rerun. The original favorable assumption about majority voting was contradicted by actual counts and was not written as a performance gain.
