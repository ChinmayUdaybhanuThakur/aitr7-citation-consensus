# Technical audit and revision record

This is an assistant self-review, not an independent peer review or a claim that an external reviewer assessed the paper. Locations refer to manuscript sections, which remain stable if pagination changes.

| Priority / location | Concern | Why it matters | Revision / evidence |
|---|---|---|---|
| Major, Sections 1 and 4 | Recorded outputs could be mistaken for five live tool reruns | Misstates what was built and measured | Title/abstract/method/README explicitly describe reanalysis; CLI accepts flags only |
| Major, Sections 3 and 5 | Historical data had two corrected labels | Could leave current claims based only on outdated ground truth | Separate v1.1.0 acquisition and all-method rerun; A2 states post-outcome timing; both versions reported |
| Major, Section 5 | Pooled k=4 looks superior after inspection | Risks selection optimism and ignoring recall target | Keep k=3 primary; show complete sweep and recall floor; source-held-out selection separately reported |
| Major, Sections 4 and 5 | Random reference splitting could leak source-specific patterns | Inflates confidence in transfer | Leave-one-document-out selection, duplicate exclusion, test-label isolation test, saved memberships |
| Major, Section 5.4 | Favorable ablations might be omitted to preserve negative story | Incomplete result reporting | Report two panels meeting numeric criterion descriptively; explain changed vote proportion and unvalidated panel selection |
| Major, Section 5.5 | Conditional triage recall of 1.0 could be called overall recall | Ten problematic references are deferred | Report 25/35 overall automatically flagged; 53 deferred; 9/51 automatic errors |
| Major, Sections 4 and 6 | Bootstrap intervals could imply document-population inference | Only three source clusters | Label intervals conditional descriptive; no significance or deployment superiority claim |
| Minor, data/plots | Encoding changed and reference accents differed | Undocumented transformations and stale figure counts | Preserve both bytes, list eight text differences, derive figure counts from results |
| Minor, overlap figure | Jaccard overlap does not prove dependence | Overstates statistical evidence | Change title to observed error-set overlap; manuscript makes boundary explicit |
| Minor, typesetting | Generated row-only table inputs caused a LaTeX alignment error | Prevented deliverable compilation | Generate complete tabular environments from CSV; compile and visually inspect final PDF |
| Remaining, ownership | Student review and live viva cannot be automated honestly | Course requires understanding and accountability | Authentic disclosure, runnable demonstration, concise viva guide; do not mark student review complete |

No performance claim was added without a saved computation. No retrospective study was described as external preregistration. The paper's narrow contribution is a reproducible controlled investigation rather than a new verification algorithm.
