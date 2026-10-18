# Research brief | AITR 7

Chinmay Thakur · MDE2026011 · 18 October 2026

## Review and sources
T23: citation integrity, with presentation, identity, access and claim support separated. Verified original sources: Abbonato (2026), Badalova & Mayr (2026), Shi et al. (2026), and Gao et al. (2023).

## Research gap
The released checker decisions permit testing whether simple agreement reduces false alarms. This is a tractable inferred question, not a claim of a new voting algorithm or a systematic novelty result.

## Primary question
Does a fixed three-of-five majority reduce RefChecker's false-positive rate by at least 0.10 absolute while retaining recall of at least 0.80 on the same corpus?

## Supporting questions
How do thresholds, panel removals and source-held-out selection change the trade-off? What review workload and residual errors follow from fixed disagreement deferral?

## Pathway / build
Controlled comparative reanalysis. Implement a strict data loader, pure voting/triage functions, grouped threshold selection, metrics, tests and reproducible evidence exports. Original services are not rerun.

## Data and versions
104 references from three source documents, five checker flags each. Zenodo v1.0.0: 33 problematic / 71 verified. Author-corrected v1.1.0: 35 / 69. Both CC BY 4.0; raw bytes, metadata and hashes retained.

## Comparators / controls
All five released checkers; k=1..5 thresholds; leave-one-document-out selection; five strict 3-of-4 removals. Same rows and labels within a release. Labels never enter fixed predictors; held-out labels never choose their own threshold.

## Measures / depth
Primary recall, false-positive rate and balanced accuracy, with confusion counts. Threshold and panel sensitivity, per-document analysis, triage coverage, error patterns, and conditional paired bootstrap (5,000; seed 20261018).

## Feasibility / risks
CPU-only tabular processing, no models or paid APIs. Small purposive corpus, inherited labels, heterogeneous sources, conservative duplicate screen, no human-trust or semantic-support measurements.

## Verified checkpoint
Historical RefChecker matrix reproduced: TP32 / FP36 / TN35 / FN1. Sixteen tests pass; 24 numerical output files match a clean-environment rerun. Corrected majority has 36 false alarms and 4 misses: the primary target fails.

## Provenance
Protocol frozen before reference-level outcomes; published aggregates already known. Corrected release discovered after the first run and analyzed under amendment A2. Student review and live demonstration remain personal responsibilities.
