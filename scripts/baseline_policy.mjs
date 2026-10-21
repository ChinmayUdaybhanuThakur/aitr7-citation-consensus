// The binary cut-off follows the pinned upstream Verified badge, not label tuning.
export function flagged(result) {
  if(typeof result.exists !== 'boolean' || !Number.isFinite(result.matchConfidence)) throw new Error('Malformed upstream result');
  return Number(!(result.exists && result.matchConfidence > 80));
}
export function incomplete(requests) {
  if(!requests.length) return true;
  return requests.some(r=>r.parse_error || r.status===0 || (r.status>=400 && r.status!==404));
}
