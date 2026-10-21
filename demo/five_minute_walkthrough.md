# Five-minute execution walkthrough

Synthetic narration; actual recorded command output. No student voice or personal presentation is claimed.

## 1. The question and the actual data

This is an AI-narrated walkthrough of actual command execution for the citation consensus study. The research question is whether combining five recorded checker decisions reduces false alarms. The corrected public dataset contains one hundred and four references, including thirty-five labelled problematic. This command reads the real data and traces one reference. The study concerns bibliographic alerts, not whether a citation supports a claim.

## 2. Trace the prediction code

Here is the actual prediction code loaded from the project. The voting function validates five binary flags, sums them, and compares the sum with a threshold. It never receives the manual truth label. Three flags trigger majority voting. Four votes produce a stricter rule. The separate triage function accepts zero or one vote, defers two or three, and flags four or five.

## 3. Execute the core correctness tests

These are real unit tests executing now. They check hand-calculated metrics, invalid input, encoding, voting boundaries and held-out isolation. The held-out test matters because labels from the test document must not choose its own threshold. Sixteen core tests pass. Tests establish specified behavior on these cases; they do not establish that the dataset labels are universally correct or that the system will generalize.

## 4. Execute the new baseline-harness tests

The additional tests check the original tool interface mapping and failure accounting. An existing match with confidence strictly above eighty receives the verified label. A missing response, rate limit or malformed payload cannot count as complete evidence. Eight tests pass. This distinction prevents a network problem from silently becoming a claim that a bibliographic reference is invalid.

## 5. Run the original source algorithm offline

This command re-executes the pinned original CheckIfExist CrossRef algorithm on every citation string. It reads saved HTTP response bytes, not saved predictions. The live acquisition completed all one hundred and four component cases. Cached execution makes the same code path reproducible without accounts or service availability. This is the CrossRef component; it is not a claim that the complete multi-source cascade was fully available.

## 6. Rerun the central voting experiment

The central experiment now runs on the corrected labels. It computes fixed thresholds, document-held-out selection, ablations, errors and bootstrap summaries using the frozen configuration. The original protocol is unchanged. The new baseline execution is a dated supplement, added after the original outcomes were known. It does not overwrite the historical checker columns or turn an exploratory addition into a preregistered experiment.

## 7. Read the measured result

The majority rule produces thirty-six false alarms and four misses. The recorded RefChecker baseline produces thirty-four false alarms and one miss. Majority therefore fails the planned improvement criterion. Four votes reduce false alarms to nine but miss ten problematic references, falling below the recall floor. The negative finding is retained. A higher balanced accuracy does not by itself satisfy the original research objective.

## 8. Check baseline coverage and reproduction

The CrossRef component gives thirty-three true positives, forty-nine false positives, twenty true negatives and two misses. Its full-corpus execution is verified. The complete fallback cascade has only twenty-three cases with complete retrieval evidence; eighty-one encountered failures. Its subset is not representative. Both algorithm runs reproduce their saved output objects exactly from the response cache. This validates execution, not superiority or agreement with every inherited label.

## 9. Explain the deeper analysis and limits

The selected thresholds are four, four and two when each source document is held out. Threshold selection uses the other documents only. There are just three source documents, so broad generalization would be unjustified. Triage defers fifty-three references instead of pretending they are correctly classified. The study preserves negative results, favorable ablations and their limitations together rather than selecting only an attractive score.

## 10. Find the evidence and reproduce it

The repository contains the paper, validation report, exact selected task prompts, versioned code changes, raw results and frozen configurations. The assistant prepared and narrated this recording; it does not impersonate the student or prove personal understanding. The student must explain the choices, rerun a component and provide an honest reflection. The saved command transcripts and reproduction instructions make that review concrete and inspectable.