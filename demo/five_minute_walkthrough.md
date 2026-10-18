# Five-minute code-and-results walkthrough

Prepared demonstration script. The accompanying five-minute MP4 is a silent, captioned walkthrough of real files and outputs, prepared with AI. It is not a recording of the student presenting. The interactive HTML version supports play/pause and manual navigation. Use this script for your own live demonstration.

| Time | Show | Explain |
|---|---|---|
| 0:00–0:35 | README and research brief | Continuity from the T23 review: bibliographic identity is distinct from appearance and claim support. Test whether combining recorded checker flags reduces false alarms. |
| 0:35–1:15 | data/README.md, protocol JSON, label audit | 104 references, three documents, five flags; original33/71 and corrected35/69 labels. Two corrections, unchanged flags. Frozen primary target; corrected run is later amendment. |
| 1:15–2:05 | src/consensus.py and CLI | Sum five flags and compare with k. Show `[1,1,1,0,0]` at k3 and k4; triage defers. Missing/unknown values raise errors. Labels are evaluation inputs, not voting features. |
| 2:05–2:50 | tests and baseline validation | Run16 tests; identify hand-calculated metrics and held-out-label test. Historical RefChecker TP32/FP36/TN35/FN1 matches published result. Explain replay versus live checker reproduction. |
| 2:50–3:40 | corrected metrics and threshold plot | Majority36 false alarms/4misses versus RefChecker34/1. k4 improves BA but recall.714 fails target. Report the negative primary result honestly. |
| 3:40–4:25 | held-out folds and triage figure | Selected k4,k4,k2; BA.704. Triage defers53, including10problems;9automatic errors. Conditional recall is not overall recall. |
| 4:25–5:00 | reproduction commands and AI log | Rebuild with pinned data/packages, preserved hashes and seeded bootstrap. State three-document limitation, inherited labels, AI assistance and required personal review. |

## Commands for the live component

```bash
python scripts/check_reference.py --flags 1 1 1 0 0 --threshold 3
python scripts/check_reference.py --flags 1 1 1 0 0 --threshold 4
python -m unittest discover -s tests -v
python scripts/run_study.py --corrected --out results/demo_rerun
```

A presenter can open the executed notebook for the same flow. Rehearse using your own words; do not claim to have generated the original checker outputs.
