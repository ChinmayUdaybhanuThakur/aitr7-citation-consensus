# Completion repair — 21 October 2026

## Completed assistant work

1. **Executable baseline:** pinned original MIT-licensed CheckIfExist code is included and executed on reference strings. Its CrossRef component completed all 104 references; the full cascade has only 23 complete-retrieval cases and 81 incomplete cases. Those failures are disclosed rather than converted into validated negative labels. The primary consensus experiment is unchanged.
2. **Validation:** 16 core tests and 8 baseline-harness tests pass; raw source hashes match the upstream commit; independent confusion recounts match. Both 104-row algorithm output files are byte-identical on cached replay. The new command recording also reruns the central experiment and a baseline.
3. **AI traceability:** four exact selected task prompts, recovered original model identifier, 11 historical activity receipts, real proposal/change/verification links and Git history are recorded. Exact backend builds and unobserved student decisions remain unknown. No invented personal reflection is supplied.
4. **Demonstration:** the replacement five-minute MP4 shows actual recorded command execution rendered as a terminal with synthetic narration. It includes data, code, 24 tests, an original-source baseline rerun, the central experiment, measured results and limitations. All 10 recorded commands exited zero. It is an assistant-produced demonstration, not a student impersonation or desktop screen capture.
5. **Paper and brief:** both were updated and visually checked. The paper is 11 pages including references; its primary conclusion is unchanged. The brief remains one page. All additions are dated; the original protocol is not backdated.

## Important boundaries

The full cascade's complete-case subset cannot estimate general accuracy. The CrossRef component is a real executable baseline but not the full multi-source system. The supplement does not reproduce the original benchmark's execution conditions or create a new five-tool benchmark. Student understanding, personal rerun and honest reflection remain personal responsibilities. No instructor gate approval or student presentation is fabricated.

## Reproduce the added implementation

```bash
node --test tests/test_baseline_policy.mjs
node scripts/run_live_baseline.mjs --crossref-only --out results/crossref_baseline_replay
node scripts/run_live_baseline.mjs --out results/live_baseline_replay
python scripts/demo_evidence.py baseline
```

The code re-executes the original algorithm on cached public response bytes without authentication. See `provenance/baseline_reproduction.json`, `docs/authentic_prompt_record.md` and `demo/execution_transcript.json`.

## Submission status boundary

At the 21 October live Classroom check, the page said **Assigned**, with no attachments and **Due Tomorrow, 11:59 PM**. Using the client date, this means 22 October at 11:59 PM. The older 20 October deadline was outdated. Upload/turn-in is recorded separately only after the interface confirms it; this document does not assert submission.
