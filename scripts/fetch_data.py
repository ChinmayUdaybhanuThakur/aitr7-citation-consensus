#!/usr/bin/env python3
"""Acquire the pinned public dataset; validate provider checksums and save provenance."""
from pathlib import Path
import argparse
from datetime import datetime, timezone
import hashlib
import json
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
RECORD = "https://zenodo.org/api/records/21457492"


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "AITR-Citation-Consensus/1.0 (reproducible course research)"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--corrected', action='store_true', help='Fetch the author-corrected v1.1.0 release separately')
    args = parser.parse_args()
    record_id = '23236264' if args.corrected else '21457492'
    record_url = 'https://zenodo.org/api/records/' + record_id
    raw = ROOT / "data" / ("corrected" if args.corrected else "raw")
    raw.mkdir(parents=True, exist_ok=True)
    metadata_bytes = fetch(record_url)
    metadata = json.loads(metadata_bytes)
    assert str(metadata["id"]) == record_id
    assert metadata["metadata"]["license"]["id"] == "cc-by-4.0"
    (raw / "record_metadata.json").write_bytes(metadata_bytes)
    manifest = {"retrieved_at_utc": datetime.now(timezone.utc).isoformat(), "record_url": record_url,
                "doi": metadata["metadata"]["doi"], "version": metadata["metadata"]["version"],
                "license": "CC BY 4.0", "files": []}
    for item in metadata["files"]:
        name = item["key"]
        if name not in {"README.md", "manual_reference_verification_dataset.csv"}:
            continue
        body = fetch(item["links"]["self"])
        checksum = "md5:" + hashlib.md5(body).hexdigest()
        if checksum != item["checksum"]:
            raise ValueError("Provider checksum mismatch for " + name)
        filename = "DATASET_README.md" if name == "README.md" else name
        (raw / filename).write_bytes(body)
        manifest["files"].append({"name": filename, "source_name": name, "url": item["links"]["self"],
                                  "bytes": len(body), "provider_checksum": checksum,
                                  "sha256": hashlib.sha256(body).hexdigest()})
    (ROOT / "provenance" / ("corrected_data_manifest.json" if args.corrected else "data_manifest.json")).write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
