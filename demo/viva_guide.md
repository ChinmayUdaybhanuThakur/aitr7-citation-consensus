# Technical viva: quick preparation

1. **What did you build?** A strict loader and reusable voting/triage functions, plus evaluation, grouped threshold selection, ablations, uncertainty, plots, and reproducibility scripts. Inputs are five recorded flags per reference.
2. **What did you not build?** A new internet citation checker, new LLM, or semantic entailment system. The primary voting study uses recorded outputs. A separate 21 October supplement now executes pinned original CheckIfExist code: all 104 CrossRef-component cases have complete retrieval, while only 23 full-cascade cases do.
3. **What is positive?** A problematic reference; a positive prediction is a flag for review. Problematic includes metadata errors, not only fabricated work.
4. **Explain one prediction.** `[1,1,1,0,0]` has three flags. k=3 returns 1; k=4 returns 0; triage defers it because the count is 2–3.
5. **What was the target?** Majority must reduce RefChecker's FPR by at least .10 while recall remains ≥.80. It failed on both versions.
6. **What are the corrected main counts?** Majority TP31/FP36/TN33/FN4. RefChecker TP34/FP34/TN35/FN1. Thus majority BA=.682 versus .739.
7. **Why not use accuracy alone?** It weights the two label classes according to their sample frequencies and can hide missed positives. Recall, FPR, BA and raw counts expose the trade-off.
8. **Why is k=4 not the winning main result?** It was a sensitivity comparison; recall .714 violates the fixed target. Its pooled BA .792 is not independent threshold-selection evidence.
9. **Why leave a whole document out?** Rows from the same document can share extraction and source characteristics. Each held-out document's labels must not choose its own threshold.
10. **What thresholds transfer?** P1 and P2 use k=4 selected on the others; P3 uses k=2. Pooled corrected BA=.704, with weak performance on small sources.
11. **Why can ablations look good?** Removing a tool while keeping three required flags makes the fraction stricter. Membership and strictness both change. Two panels meet the numeric criterion on this corpus, but choosing them from these results needs further validation.
12. **What changed between data versions?** Two labels, P3:R12/R18, became problematic; all five flags stayed unchanged. Encoding also changed, and eight accent strings differ. Both files and audit are preserved.
13. **Was this preregistered?** The local protocol was hashed/committed before row-level outcomes, but published aggregate results were known. Corrected-release analysis was added later. No external preregistration is claimed.
14. **Why isn't triage recall 100% overall?** The automatic subset excludes ten deferred problems. Only25/35 problems are automatically flagged. There are53 deferrals and9 errors among51 automatic decisions.
15. **What do the bootstrap intervals mean?** Conditional paired row variability within three observed documents, not population-level uncertainty for unseen documents. No significance test is claimed.
16. **What was validated?** Published v1 RefChecker matrix, input hashes/counts/IDs,16 tests, real execution outputs, clean rerun, and plot/table consistency. Inherited labels and original tool internals were not independently validated.
17. **What did AI do?** Design, code, debugging, execution, analysis, plots and writing. The log records genuine human instructions and does not pretend personal review or manual corrections happened.
18. **What next?** Independently adjudicate disagreements; collect more document-diverse references; nest panel/threshold selection; separately pin and rerun live tools.

Before presenting, run the CLI and trace the `vote`, `metrics`, and `leave_one_document_out` functions yourself. Explain a changed row using `provenance/label_correction_audit.json`. This guide prepares you; it does not certify your understanding.
