#!/usr/bin/env python3
"""GET a public bibliographic endpoint, saving bytes for deterministic replay.

No account, keychain, browser or credentials are used. HTTP failures are data,
not fabricated empty successful responses. The Node runner classifies coverage.
"""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import time
import urllib.error
import urllib.parse
import urllib.request

ALLOWED = {'api.crossref.org', 'api.semanticscholar.org', 'api.openalex.org',
           'dblp.org', 'export.arxiv.org'}

def normalized_url(url):
    for prefix in ('https://api.codetabs.com/v1/proxy?quest=',
                   'https://api.allorigins.win/raw?url=', 'https://corsproxy.io/?'):
        if url.startswith(prefix):
            url = urllib.parse.unquote(url[len(prefix):])
            break
    parts = urllib.parse.urlsplit(url)
    if parts.scheme != 'https' or parts.hostname not in ALLOWED or parts.username or parts.password:
        raise ValueError('Only allowlisted public HTTPS bibliographic endpoints are permitted')
    return url

def read_response(url, cache, live=False):
    url = normalized_url(url)
    path = Path(cache) / (hashlib.sha256(url.encode()).hexdigest() + '.json')
    if path.exists():
        saved = json.loads(path.read_text())
        assert saved['url'] == url
        body = base64.b64decode(saved['body_base64'])
        assert hashlib.sha256(body).hexdigest() == saved['body_sha256'], path
        return saved
    if not live:
        raise FileNotFoundError('Response absent from cache: ' + url)
    started = time.time()
    proxy = os.environ.get('AITR_HTTP_PROXY')
    handler = urllib.request.ProxyHandler({'http':proxy,'https':proxy} if proxy else {})
    client = urllib.request.build_opener(handler)
    request = urllib.request.Request(url, headers={'User-Agent':'AITR7-academic-reproducibility/1.0','Accept':'application/json,application/atom+xml,text/xml'})
    try:
        with client.open(request, timeout=15) as response:
            status, body = response.status, response.read()
            content_type = response.headers.get('Content-Type','')
        error = None
    except urllib.error.HTTPError as exc:
        status, body = exc.code, exc.read()
        content_type, error = exc.headers.get('Content-Type',''), str(exc)
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        status, body, content_type, error = 0, b'', '', str(exc)
    saved = dict(url=url, status=status, body_base64=base64.b64encode(body).decode(),
                 body_sha256=hashlib.sha256(body).hexdigest(), content_type=content_type,
                 error=error, retrieved_unix=started, elapsed_seconds=time.time()-started)
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(saved,indent=2)+'\n')
    return saved

if __name__ == '__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--url',required=True); p.add_argument('--cache',required=True)
    p.add_argument('--live',action='store_true')
    args=p.parse_args()
    print(json.dumps(read_response(args.url,args.cache,args.live)))
