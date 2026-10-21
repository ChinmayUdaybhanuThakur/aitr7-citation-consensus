#!/usr/bin/env node
// Execute the original pinned CheckIfExist code on citation strings.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {checkWithFallback, checkReference} from './vendor_checkifexist.mjs';
import {flagged, incomplete} from './baseline_policy.mjs';
const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const live = process.argv.includes('--live');
const crossrefOnly = process.argv.includes('--crossref-only');
const outputArg = process.argv.indexOf('--out');
const out = outputArg >= 0 ? path.resolve(process.argv[outputArg+1]) : path.join(root,crossrefOnly?'results/crossref_baseline':'results/live_baseline');
const cache = path.join(root,'data/checkifexist_http_cache');
const python = process.env.AITR_PYTHON || 'python3';
const protocolPath=path.join(root,crossrefOnly?'configs/crossref_baseline_protocol.json':'configs/live_baseline_protocol.json');
const protocol = JSON.parse(fs.readFileSync(protocolPath));
const dataFile = path.join(root,'data/corrected/manual_reference_verification_dataset.csv');
const dataHash = crypto.createHash('sha256').update(fs.readFileSync(dataFile)).digest('hex');
if (dataHash !== protocol.data_sha256) throw new Error('Dataset changed');
// CSV parsing and label extraction take place outside the prediction function.
const {stdout} = await exec(python,['-c',`import csv,json,sys; print(json.dumps(list(csv.DictReader(open(sys.argv[1],encoding='utf-8-sig',newline='')))))`,dataFile]);
const rows = JSON.parse(stdout);
if(rows.length !== 104) throw new Error('Unexpected corpus size');
fs.mkdirSync(out,{recursive:true});
let requests = [];
let pending = [];
let missingCache = false;
globalThis.fetch = (input, init={}) => {
 const rowRequests=requests;
 const operation=(async()=>{
  if(init.method && init.method !== 'GET') throw new Error('Only public GET is permitted');
  const url = typeof input === 'string' ? input : input.url || input.href;
  let response;
  try {
    const args=[path.join(root,'scripts/public_http.py'),'--url',url,'--cache',cache];
    if(live) args.push('--live');
    const got = await exec(python,args,{maxBuffer:20*1024*1024});
    response=JSON.parse(got.stdout);
  } catch(error) {
    missingCache = !live;
    rowRequests.push({url,status:0,error:String(error)});
    throw error;
  }
  const requestRecord={url:response.url,status:response.status,body_sha256:response.body_sha256,error:response.error};
  rowRequests.push(requestRecord);
  if(response.status===0) throw new Error(response.error || 'Network failure');
  const decoded=Buffer.from(response.body_base64,'base64');
  const result=new Response(decoded,{status:response.status,headers:{'content-type':response.content_type}});
  const originalJson=result.json.bind(result);
  result.json=async()=>{try{return await originalJson();}catch(error){requestRecord.parse_error=String(error);throw error;}};
  if(response.url.includes('export.arxiv.org/') && response.status===200 && !decoded.toString().includes('<feed')) requestRecord.parse_error='Expected Atom feed missing';
  return result;
 })();
 pending.push(operation);
 return operation;
};
const rawlog=console.log;
console.log=(...args)=>console.error('[upstream]',...args);
const outputs=[];
const start = Date.now();
for (const row of rows) {
  requests=[];
  pending=[];
  const rowStart=Date.now();
  // Deliberately do not pass manual_label or any released checker output.
  const result=await (crossrefOnly?checkReference:checkWithFallback)(row.reference.trim());
  // Upstream may return before speculative arXiv/DBLP lookups finish. Await
  // their transport records and keep them attached to the initiating row.
  await Promise.allSettled(pending);
  await new Promise(resolve=>setImmediate(resolve));
  requests.sort((a,b)=>a.url.localeCompare(b.url));
  if(missingCache) throw new Error('Replay cache is incomplete; do not interpret fallback NotFound');
  const transportIncomplete=incomplete(requests);
  const item={id:row.document_id+':'+row.reference_number,reference:row.reference.trim(),
    true_problematic:Number(row.manual_label==='problematic'),historical_checkifexist:Number(row.checkifexist==='flagged'),
    prediction:flagged(result),
    transport_incomplete:transportIncomplete,requests,result};
  outputs.push(item);
  fs.writeFileSync(path.join(out,'predictions.json'),JSON.stringify(outputs,null,2)+'\n');
  rawlog(`${outputs.length}/104 ${item.id}: ${transportIncomplete?'transport-incomplete':item.prediction?'flagged':'verified'}; source=${result.source}; confidence=${result.matchConfidence}; requests=${requests.length}`);
  if(live && outputs.length<rows.length) await new Promise(r=>setTimeout(r,Math.max(0,1200-(Date.now()-rowStart))));
}
const countMetrics = items => {
  let tp=0,fp=0,tn=0,fn=0;
  for(const r of items){if(r.true_problematic) r.prediction?tp++:fn++; else r.prediction?fp++:tn++;}
  const recall=tp+fn?tp/(tp+fn):null, fpr=fp+tn?fp/(fp+tn):null;
  return {n:items.length,tp,fp,tn,fn,recall,false_positive_rate:fpr,balanced_accuracy:recall===null||fpr===null?null:(recall+1-fpr)/2};
};
const complete=outputs.filter(r=>!r.transport_incomplete);
const summary={total_rows:outputs.length,complete_rows:complete.length,incomplete_rows:outputs.length-complete.length,
  complete_row_metrics:countMetrics(complete),historical_on_same_complete_rows:countMetrics(complete.map(r=>({...r,prediction:r.historical_checkifexist}))),
  agreement_on_complete_rows:complete.length?complete.filter(r=>r.prediction===r.historical_checkifexist).length/complete.length:null,
  all_raw_output_metrics_including_network_failures_not_validated:countMetrics(outputs),
  method:crossrefOnly?'Pinned CheckIfExist CrossRef stage':'Pinned CheckIfExist full fallback cascade',
  protocol_sha256:crypto.createHash('sha256').update(fs.readFileSync(protocolPath)).digest('hex'),
  upstream_commit:protocol.upstream_commit};
fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(path.join(out,'run_manifest.json'),JSON.stringify({mode:live?'live_with_cache':'offline_cached_execution',started_utc:new Date(start).toISOString(),elapsed_seconds:(Date.now()-start)/1000,node:process.version,dataset_sha256:dataHash},null,2)+'\n');
rawlog(JSON.stringify(summary,null,2));
