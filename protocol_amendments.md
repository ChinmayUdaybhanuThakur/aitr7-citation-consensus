# Protocol amendments and implementation corrections

## A1 — CSV decoding correction, before any ensemble outcome was computed

The first execution stopped while reading the dataset header because the downloaded CSV was not valid UTF-8. Windows-1252 decoding also failed. The raw bytes at accented author names decode plausibly as CP850 (for example, Ramé and Rivière). The loader therefore uses explicit CP850 decoding for this pinned file. The original downloaded bytes and provider/hash checks remain unchanged. A round-trip accent fixture was added to the tests.

The provider documentation does not explicitly declare an encoding, so CP850 is an implementation interpretation, not an asserted provider specification. All evaluation labels, tool flags, IDs, and source-document labels are ASCII; classification metrics do not depend on surname spelling. The text-based duplicate screen uses the consistently decoded reference string and is only a conservative exact-normalization check.

This corrects input handling. It does not change the frozen hypotheses, thresholds, metrics, partitions, comparison set, or success rule. The failing run is preserved in `results/logs/experiment_import_failure.txt`.

## A2 — Author-corrected labels, added after the primary results were inspected

Recorded 2026-10-18T13:50:12.261934+00:00. A final version check found the authors' 8 October 2026 v1.1.0 release, DOI 10.5281/zenodo.23236264. Its update note corrects P3:R12 and P3:R18 from verified to problematic after reviewing author information; reported class totals become 35 problematic and 69 verified. This release already existed before the study began but was discovered only after running the initially pinned v1.0.0 experiment. This is a provenance limitation, not prospective preregistration.

Before loading the corrected CSV, the decision is to retrieve it into a separate directory, verify the documented row-level changes, rerun every method and analysis with unchanged algorithms/thresholds/seeds, and report both versions. v1.0.0 remains the historical baseline-reproduction experiment; v1.1.0 supplies the current-label robustness analysis. No method is selected or retuned from the corrected pooled outcomes. The frozen protocol file remains unchanged. The published v1 RefChecker confusion assertion applies only to v1.0.0; corrected-label results must instead reconcile exactly with the two changed labels.

A2 input-handling detail: the corrected file changes encoding to UTF-8 with a byte-order mark. The old decoder rejected the apparent missing document_id field. BOM detection and an accent/header fixture were added. All 104 IDs and tool vectors match exactly, and only the two documented labels change. Eight decoded reference strings also contain encoding differences in accented names; these are preserved and listed in provenance/label_correction_audit.json. They are not prediction inputs. The normalized-duplicate audit is rerun separately on each version.

## A3 — Executable upstream baseline added after the audit, 21 October 2026

The original primary study was correctly a decision-level reanalysis, but did not execute a citation-verification implementation. Under the user's explicit repair request, the MIT-licensed CheckIfExist source at commit `e4605651751f53579e57a0e14159c2f93b3f5e31` was preserved unchanged, bundled for Node, and executed on all 104 original citation strings. `configs/live_baseline_protocol.json` was saved before these new outputs. Only strings enter the predictor; inherited labels and recorded flags are used afterward for evaluation. The original five-column panel is never replaced.

The mapping follows the upstream card: Verified iff exists and confidence >80. A credentials-free adapter captures public responses with hashes and exposes them through standard fetch. Re-execution runs the algorithm on cached response bytes, not saved prediction columns. Failed HTTP requests, malformed JSON/Atom responses and missing responses invalidate complete retrieval coverage.

During validation an upstream behavior became relevant: speculative fallback requests can outlive the returned primary match. An initial adapter attached some late requests to the next reference. The adapter now captures the initiating row, awaits pending requests and sorts their records by URL. The corrected outputs and a second cache replay match byte-for-byte. Initial diagnostic logs are retained but are superseded by `live_baseline_validated.txt` and the final summary. This was an instrumentation correction, not a change to upstream decisions.

## A4 — Original CrossRef component under restricted service availability

A3 encountered HTTP429 rate limits, API400 responses and HTML challenge bodies. After seeing those availability failures, a separate configuration `configs/crossref_baseline_protocol.json` was saved before running the original `checkReference` function on the full raw citation strings. This is a component baseline, not the full multi-source cascade. It completed 104/104 cases; the cascade had complete retrieval for only 23/104 cases. The latter subset is nonrandom and cannot establish overall performance.

The CrossRef component yields TP33/FP49/TN20/FN2. This unfavorable result is retained. It does not establish algorithm change relative to the historical tool: code versions, input processing and API contents differ. A3/A4 are post-primary-study additions, not retrospective preregistration; the original protocol and outcomes remain unchanged. Both algorithms reproduce their saved output objects from the cached responses.
