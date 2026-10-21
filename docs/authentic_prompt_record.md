# Authentic prompt and version record

Reconstructed on 21 October 2026 from the actual local session. These are exact selected human task prompts, not invented per-stage research instructions. Research-specific choices were made autonomously by the assistant under P02/P03. The instruction PDF's 18 templates were used as a scaffold; the student did not individually type those templates.

## P01 — assignment input (18 October, 13:28:33 UTC)

> i have downloaded the pdf in a new folder indexed 7

## P02 — completion request (18 October, 13:34:03 UTC)

> the deadline might say 20 october
> but i want to complete the whole thing as soon as possible
> i have truckloads of work incoming
> so i want you to Blitzkrieg through this

## P03 — autonomous work (18 October, 13:35:29 UTC)

> im going out for a walk dont wait for me

## P04 — repair authorization (21 October, current conversation)

> then finish whatever's left on your end
> simple

P04 followed the assistant's concrete list: resolve the baseline gap, complete the AI-use log, prepare a code-execution demo, and handle submission if existing access works. It authorizes those actions; it is not evidence of student understanding.

## Tool and version boundary

The original session metadata records the model identifier `gpt-6-astra` and Codex desktop. An exact backend build identifier was not exposed. The earlier statement that no model/version information was recorded was too broad: the configured model name is recoverable. Per-stage tool-call timestamps and SHA-256 receipts are in `provenance/ai_traceability.json`; versioned changes are inspectable in Git. No model-generated private reasoning, system instructions, credentials or unrelated chat transcript is exported.

## Significant activity trace

| Activity | Actual prompt | AI proposal/change | Verification/output | Commit and file |
|---|---|---|---|---|
| Protocol | P02/P03; no separate stage prompt | Frozen primary rule, metrics, splits, seed and success criterion | `provenance/protocol_freeze.json` | `4edc0352e5fc` / `configs/protocol.json` |
| Implementation | P02/P03; no separate stage prompt | Voting, metrics, folds and export implementation | `results/validation.json` | `7def3ba2d6b2` / `scripts/run_study.py` |
| Import/debug repair | P02/P03; no separate stage prompt | Repair execution/import path after actual failure | `results/logs/experiment_import_failure.txt` | `7def3ba2d6b2` / `scripts/run_study.py` |
| Test and correctness audit | P02/P03; no separate stage prompt | Add validation and independent fixtures | `results/logs/unit_tests_final.txt` | `7def3ba2d6b2` / `tests/test_consensus.py` |
| Dataset correction | P02/P03; no separate stage prompt | Add separately labelled corrected dataset acquisition | `provenance/corrected_data_manifest.json` | `7def3ba2d6b2` / `scripts/fetch_data.py` |
| Encoding and version audit | P02/P03; no separate stage prompt | Check corrected labels, BOM and unchanged flags | `provenance/label_correction_audit.json` | `7def3ba2d6b2` / `scripts/audit_versions.py` |
| Paper generation | P02/P03; no separate stage prompt | Write manuscript from saved measurements; no invented improvement | `paper/main.pdf` | `0be65f5bc217` / `paper/main.tex` |
| Provenance and technical review | P02/P03; no separate stage prompt | Record actual choices, limitations and unresolved student ownership | `docs/technical_review.md` | `0be65f5bc217` / `ai_assistance_log.md` |
| Environment check | P02/P03; no separate stage prompt | Save environment/dependency evidence | `provenance/environment.json` | `0be65f5bc217` / `scripts/environment_check.py` |
| Fresh-environment reproduction | P02/P03; no separate stage prompt | Compare repeated numerical files | `results/logs/clean_reproduction.txt` | `0be65f5bc217` / `provenance/reproduction_check.json` |
| Brief and original demo | P02/P03; no separate stage prompt | Create brief and caption panels; no student presentation claimed | `docs/research_brief.pdf` | `0be65f5bc217` / `demo/five_minute_walkthrough.mp4` |

Every row has the same observed human decision: autonomous completion was requested; technical choices were not individually approved. The original commits and file contents show the changes. Use `git show <commit> -- <file>` to inspect an artifact; use `git log -p -- <file>` to trace changes. The call hashes identify the actual tool invocations without publishing the entire private transcript.

## Post-audit work under P04

- A3 adds the pinned original CheckIfExist algorithm and raw-citation execution, with cached public HTTP responses. A4 separately evaluates its original CrossRef stage after fallback services produced failures. Neither amendment replaces or backdates the original protocol. Configuration, source hashes, logs and measured outputs are preserved.
- The HTTP adapter records failed requests and response parsing failures separately from bibliographic judgments. A partial diagnostic run revealed that HTTP success can contain an HTML challenge instead of JSON; the adapter was corrected before the final validation. No CAPTCHA or login was attempted.
- The demonstration now records actual command execution/output and uses explicitly synthetic narration. It does not impersonate the student or establish personal viva readiness.
- Personal learning, independent student verification and reflection remain unobserved and must be supplied honestly by the student. No first-person account is filled in on their behalf.
