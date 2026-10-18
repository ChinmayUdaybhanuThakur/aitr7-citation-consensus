#!/usr/bin/env python3
"""Copy measured figures and render manuscript tables directly from CSV outputs."""
from pathlib import Path
import csv,shutil,json
ROOT=Path(__file__).resolve().parents[1]
P=ROOT/'paper'
(P/'images').mkdir(exist_ok=True);(P/'tables').mkdir(exist_ok=True)
names={'checkifexist':'CheckIfExist','hallucitechecker':'HalluCiteChecker','hallucinator':'Hallucinator','halref':'HalRef','refchecker':'RefChecker','vote_k3':'Majority (3/5)','vote_k4':'Strict (4/5)','lodo_selected':'Held-out selection'}
def rows(version):
 with (ROOT/'results'/version/'metrics.csv').open() as f:return {r['method']:r for r in csv.DictReader(f)}
a=rows('');b=rows('corrected')
def line(values):return ' & '.join(map(str,values))+r' \\'+'\n'
text=''
for k,n in names.items():
 r=b[k];text+=line([n,*[r[v] for v in ['tp','fp','tn','fn']],*[f"{float(r[v]):.3f}" for v in ['recall','false_positive_rate','balanced_accuracy']]])
(P/'tables/main_results.tex').write_text(r'\begin{tabular}{@{}lrrrrrrr@{}}\toprule'+'\n'+line(['Method','TP','FP','TN','FN','Recall','FPR','BA'])+r'\midrule'+'\n'+text+r'\bottomrule\end{tabular}'+'\n')
text=''
for k in ['refchecker','vote_k3','vote_k4','lodo_selected']:
 text+=line([names[k],*[f"{float(v[k][m]):.3f}" for v in [a,b] for m in ['recall','false_positive_rate','balanced_accuracy']]])
(P/'tables/version_results.tex').write_text(r'\begin{tabular}{@{}lrrrrrr@{}}\toprule'+'\n'+line(['',r'\multicolumn{3}{c}{v1.0.0}',r'\multicolumn{3}{c}{v1.1.0}'])+line(['Method','Recall','FPR','BA','Recall','FPR','BA'])+r'\midrule'+'\n'+text+r'\bottomrule\end{tabular}'+'\n')
text=''
for k in range(1,6):
 r=b['vote_k'+str(k)];text+=line([k,r['flags'],r['tp'],r['fp'],r['fn'],*[f"{float(r[v]):.3f}" for v in ['recall','false_positive_rate','balanced_accuracy']]])
(P/'tables/thresholds.tex').write_text(r'\begin{tabular}{@{}rrrrrrrr@{}}\toprule'+'\n'+line(['$k$','Flags','TP','FP','FN','Recall','FPR','BA'])+r'\midrule'+'\n'+text+r'\bottomrule\end{tabular}'+'\n')
text=''
for r in json.loads((ROOT/'results/corrected/lodo_folds.json').read_text()):
 m=r['test_metrics'];text+=line([r['held_out_document'],len(r['train_ids']),m['n'],r['threshold'],*[f"{m[v]:.3f}" for v in ['recall','false_positive_rate','balanced_accuracy']]])
(P/'tables/folds.tex').write_text(r'\begin{tabular}{@{}lrrrrrr@{}}\toprule'+'\n'+line(['Test source','Train $n$','Test $n$','Selected $k$','Recall','FPR','BA'])+r'\midrule'+'\n'+text+r'\bottomrule\end{tabular}'+'\n')
for f in (ROOT/'results/corrected/figures').glob('*.pdf'):shutil.copy2(f,P/'images'/f.name)
print('Manuscript tables and images generated from corrected results; version comparison includes historical results.')
