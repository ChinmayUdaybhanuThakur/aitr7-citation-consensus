import sys
from pathlib import Path
import tempfile
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.consensus import Record, decode_flag, load_records, metrics, normalized_reference, vote, triage, leave_one_document_out


class ValidationTests(unittest.TestCase):
    def test_utf8_bom_release(self):
        import csv
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'release.csv'
            path.write_text('document_id,reference_number,reference,manual_label,checkifexist,hallucitechecker,hallucinator,halref,refchecker\nP1,R1,Ramé,verified,not_flagged,flagged,not_flagged,flagged,not_flagged\n',encoding='utf-8-sig')
            record=load_records(path)[0]
            self.assertEqual(record.reference,'Ramé')
            self.assertEqual(record.flags,(0,1,0,1,0))

    def test_exact_majority_boundary(self):
        self.assertEqual(vote((1, 1, 1, 0, 0)), 1)
        self.assertEqual(vote((1, 1, 0, 0, 0)), 0)

    def test_missing_flag_is_not_acceptance(self):
        for value in ("", "unknown", "error", None, "not found"):
            with self.assertRaises(ValueError): decode_flag(value)

    def test_flag_whitespace(self):
        self.assertEqual(decode_flag(" FLAGGED "), 1)

    def test_illegal_vote(self):
        for flags, k in [((1, 0, None), 2), ((1, 2), 1), ((), 1), ((1, 0), 0), ((1, 0), 3)]:
            with self.assertRaises(ValueError): vote(flags, k)

    def test_hand_calculated_confusion(self):
        m = metrics([1, 1, 0, 0, 0], [1, 0, 1, 0, 0])
        self.assertEqual([m[k] for k in ("tp", "fn", "fp", "tn")], [1, 1, 1, 2])
        self.assertAlmostEqual(m["balanced_accuracy"], (0.5 + 2/3)/2)
        self.assertAlmostEqual(m["f1"], 0.5)
        self.assertAlmostEqual(m["mcc"], 1/6)

    def test_no_flags_zero_division(self):
        m = metrics([0, 1], [0, 0])
        self.assertEqual(m["precision"], 0)
        self.assertEqual(m["f1"], 0)
        self.assertEqual(m["mcc"], 0)

    def test_single_class_ba_is_undefined(self):
        self.assertIsNone(metrics([0, 0], [0, 1])["balanced_accuracy"])

    def test_alignment_rejected(self):
        with self.assertRaises(ValueError): metrics([0, 1], [1])

    def test_triage_boundaries(self):
        self.assertEqual(triage((1, 0, 0, 0, 0)), "auto_accept")
        self.assertEqual(triage((1, 1, 0, 0, 0)), "review")
        self.assertEqual(triage((1, 1, 1, 0, 0)), "review")
        self.assertEqual(triage((1, 1, 1, 1, 0)), "auto_flag")

    def test_reference_normalization(self):
        self.assertEqual(normalized_reference("A. Paper (2020)!"), normalized_reference("a paper 2020"))

    def test_threshold_monotonicity(self):
        flags = (1, 0, 1, 0, 1)
        values = [vote(flags, k) for k in range(1, 6)]
        self.assertEqual(values, sorted(values, reverse=True))

    def fixture(self):
        return [Record("A:1", "A", "common work", 1, (1,1,0,0,0)),
                Record("A:2", "A", "A genuine", 0, (0,0,0,0,0)),
                Record("B:1", "B", "COMMON WORK!", 1, (1,1,0,0,0)),
                Record("B:2", "B", "B problematic", 1, (1,1,1,0,0)),
                Record("B:3", "B", "B genuine", 0, (1,0,0,0,0)),
                Record("C:1", "C", "C problematic", 1, (1,1,1,1,0)),
                Record("C:2", "C", "C genuine", 0, (0,0,0,0,0))]

    def test_duplicate_excluded_from_training(self):
        predictions, folds = leave_one_document_out(self.fixture())
        fold = next(f for f in folds if f["held_out_document"] == "A")
        self.assertIn("B:1", fold["excluded_duplicate_train_ids"])
        self.assertEqual(len(predictions), len(self.fixture()))

    def test_test_labels_cannot_select_own_threshold(self):
        records = self.fixture()
        _, first = leave_one_document_out(records)
        changed = [Record(r.uid, r.document, r.reference, 1-r.label if r.document == "A" else r.label, r.flags) for r in records]
        _, second = leave_one_document_out(changed)
        a = next(f for f in first if f["held_out_document"] == "A")
        b = next(f for f in second if f["held_out_document"] == "A")
        self.assertEqual(a["threshold"], b["threshold"])
        self.assertEqual(a["training_scores"], b["training_scores"])

    def test_missing_columns_rejected(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d)/"bad.csv";p.write_text("document_id,manual_label\nA,verified\n")
            with self.assertRaises(ValueError): load_records(p)

    def test_cp850_reference_preserves_accents(self):
        with tempfile.TemporaryDirectory() as d:
            p = Path(d)/"fixture.csv"
            p.write_bytes(("document_id,reference_number,reference,manual_label,checkifexist,hallucitechecker,hallucinator,halref,refchecker\n"
                           "A,R1,Ramé Rivière,verified,not_flagged,not_flagged,not_flagged,not_flagged,not_flagged\n").encode("cp850"))
            self.assertEqual(load_records(p)[0].reference, "Ramé Rivière")


if __name__ == "__main__":
    unittest.main(verbosity=2)
