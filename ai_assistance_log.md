# AI assistance and research-integrity record

Date: 18 October 2026. Tool: Codex in the desktop app. Exact model build/version was not independently recorded; no build identifier is invented. This is a structured summary of the authentic session and saved artifacts, not a fabricated verbatim multi-tool prompt transcript. No Claude, Gemini, Copilot, or other model usage is claimed for this experiment.

## Human instructions actually observed

The student asked to reuse the previous six AITR assignments, clarified that Assignment 2 was the GitHub repository, identified the new instruction PDF in folder 7, and asked to complete the whole assignment as soon as possible. He explicitly said he was going for a walk and not to wait. Later he objected to an unnecessary GitHub login interruption, asked to use existing Chrome, opened GitHub, and requested that cursor control be released so he could do other work. These are the recorded human decisions. They are not evidence of approval of every research choice or of personal code execution.

## Significant assistance and verification

| Task | Assistant proposal/action | Human decision observed | Verification and result |
|---|---|---|---|
| Recover continuity | Read local assignments and repository rather than request reuploads | Reuse prior materials; Assignment 2 is the repo | Inventory links and actual prior review read |
| Select tractable study | Controlled reanalysis of public checker flags, with voting and triage | General authorization for fast completion; no specific algorithm approval observed | Primary papers and public dataset/license inspected; no new-algorithm claim |
| Freeze protocol | Majority k=3, FPR/recall criterion, threshold sweep, source-held-out selector, ablations, seed | No individual human approval observed | Hashed JSON and Git commit before CSV outcomes; published aggregate already known |
| Implement | Generate strict loader, pure voting/metrics, grouped threshold selection, CSV runner | Autonomous work requested | Real unit tests and data assertions; output logs saved |
| Debug legacy encoding | Replace failed UTF-8 decoding with documented CP850 interpretation | No manual fix claimed | Actual traceback, accented-name fixture, raw checksum unchanged |
| Interpret evidence | Retain negative majority result | No response on scientific interpretation observed | Actual confusion counts contradict benefit; no invented gain |
| Audit data version | Add separately labeled corrected-release run after discovering authors' update | No approval of amendment observed | Exact label changes checked, raw files preserved, no predictor/threshold changes |
| Debug corrected encoding | Detect UTF-8 BOM; preserve observed accent-string differences | No manual fix claimed | BOM fixture, strict ID/flag comparisons and per-version duplicate checks |
| Figure audit | Correct hardcoded P3 class count after label correction; soften unsupported independence wording | No manual correction claimed | Plot labels now derive from CSV; title reports overlap rather than proving dependence |
| Draft and review | Generate paper from measured outputs, self-audit methods/limits | Student review still pending | Tables generated from CSV; references verified; rendered PDF inspection |
| Publish/package | Prepare public-ready repository and delivery bundle | Existing Chrome use explicitly requested | Publishing status recorded separately; no Classroom submission claimed |

## Real examples of AI limitations and purposeful verification

1. **Encoding assumptions were wrong.** The initial loader assumed UTF-8; it failed before outcomes were computed. The corrected release later used a different encoding. The fixes used observed bytes, fixtures, and preserved raw hashes rather than guessing missing data.
2. **The first dataset selection was outdated.** The initial version pin overlooked a release already available on 8 October. Final metadata inspection found it after the first experiment. The amendment states that timing honestly and reports both releases.
3. **An attractive scientific expectation failed.** Majority voting did not lower the false-positive rate relative to RefChecker. The outcome was retained rather than replaced by a favorable threshold or ablation.
4. **A figure retained a stale label.** Visual inspection caught a hardcoded P3 positive count of 26 on the corrected plot. Labels now use the measured CSV counts (28). Error-set overlap was also not described as proof of statistical dependence.
5. **Browser workflow was inefficient.** A separate login session was attempted despite the user's absence; the user corrected this. That is a workflow error, not scientific evidence. No authentication success or publication is invented.

## Ownership and reflection

The supplied code, tests, outputs, and explanations allow the student to inspect the work. They do not prove that he understands it. No first-person learning experience, manual adjudication, independent rerun, oral defense, or human review is fabricated. Before submission he should trace one row through the predictor and metrics, explain label polarity and source-held-out selection, distinguish recorded decisions from live verification, and understand why the primary result is negative. `demo/viva_guide.md` supports that review.

The strongest verified lesson of this session is procedural: fluent code and plausible assumptions required checks against bytes, source versions, held-out data, and actual counts. Claims of the student's personal learning should be added only after his own review.
