# Protocol amendments and implementation corrections

## A1 — CSV decoding correction, before any ensemble outcome was computed

The first execution stopped while reading the dataset header because the downloaded CSV was not valid UTF-8. Windows-1252 decoding also failed. The raw bytes at accented author names decode plausibly as CP850 (for example, Ramé and Rivière). The loader therefore uses explicit CP850 decoding for this pinned file. The original downloaded bytes and provider/hash checks remain unchanged. A round-trip accent fixture was added to the tests.

The provider documentation does not explicitly declare an encoding, so CP850 is an implementation interpretation, not an asserted provider specification. All evaluation labels, tool flags, IDs, and source-document labels are ASCII; classification metrics do not depend on surname spelling. The text-based duplicate screen uses the consistently decoded reference string and is only a conservative exact-normalization check.

This corrects input handling. It does not change the frozen hypotheses, thresholds, metrics, partitions, comparison set, or success rule. The failing run is preserved in `results/logs/experiment_import_failure.txt`.

## A2 — Author-corrected labels, added after the primary results were inspected

Recorded 2026-10-18T13:50:12.261934+00:00. A final version check found the authors' 8 October 2026 v1.1.0 release, DOI 10.5281/zenodo.23236264. Its update note corrects P3:R12 and P3:R18 from verified to problematic after reviewing author information; reported class totals become 35 problematic and 69 verified. This release already existed before the study began but was discovered only after running the initially pinned v1.0.0 experiment. This is a provenance limitation, not prospective preregistration.

Before loading the corrected CSV, the decision is to retrieve it into a separate directory, verify the documented row-level changes, rerun every method and analysis with unchanged algorithms/thresholds/seeds, and report both versions. v1.0.0 remains the historical baseline-reproduction experiment; v1.1.0 supplies the current-label robustness analysis. No method is selected or retuned from the corrected pooled outcomes. The frozen protocol file remains unchanged. The published v1 RefChecker confusion assertion applies only to v1.0.0; corrected-label results must instead reconcile exactly with the two changed labels.

A2 input-handling detail: the corrected file changes encoding to UTF-8 with a byte-order mark. The old decoder rejected the apparent missing document_id field. BOM detection and an accent/header fixture were added. All 104 IDs and tool vectors match exactly, and only the two documented labels change. Eight decoded reference strings also contain encoding differences in accented names; these are preserved and listed in provenance/label_correction_audit.json. They are not prediction inputs. The normalized-duplicate audit is rerun separately on each version.
