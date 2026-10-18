# Data access and attribution

Fidan Badalova and Philipp Mayr. Manual Reference Verification Dataset for Hallucinated and Suspicious Citation Detection Tools. Zenodo, 2026. Both releases are licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

- Historical v1.0.0: https://doi.org/10.5281/zenodo.21457492 (`raw/`).
- Author-corrected v1.1.0: https://doi.org/10.5281/zenodo.23236264 (`corrected/`).

Raw CSV/README bytes are preserved. The acquisition script saves each release's metadata, provider MD5 checksums, SHA-256 hashes, exact file URLs, retrieval time, and license. The accompanying source paper is https://doi.org/10.48550/arXiv.2607.22693.

There are 104 rows and five standardized checker outputs per row. The compound key is document_id + reference_number. Problematic is the positive label and includes wrong/mismatched bibliographic metadata, not only nonexistent works. Flagged means further verification is indicated. The study inherits the authors' adjudication.

Version 1.0.0 has 33 problematic and 71 verified labels; v1.1.0 has 35 and 69. P3:R12 and P3:R18 change from verified to problematic. The legacy file is decoded as CP850; the corrected file has a UTF-8 BOM. Eight decoded strings exhibit accent-encoding differences; these are preserved and listed in `provenance/label_correction_audit.json`. All IDs and 520 tool flags match. No text fields are classifier features. The normalized-reference duplicate audit finds zero groups separately on each release.

Results are new derived analyses, clearly separated in `results/` and `results/corrected/`. No new manual labels are asserted. This dataset is purposive and must not be used to estimate citation-hallucination prevalence in the scientific literature.
