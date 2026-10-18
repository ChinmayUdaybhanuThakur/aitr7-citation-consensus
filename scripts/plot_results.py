#!/usr/bin/env python3
"""Regenerate publication figures from measured result files, with no example data."""
import csv
import argparse
import json
import os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
os.environ.setdefault("MPLCONFIGDIR",str(ROOT/".plot-cache"))
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

parser=argparse.ArgumentParser()
parser.add_argument('--results',default='results',help='Measured results directory, relative to project root')
args=parser.parse_args()
RESULTS=ROOT/args.results
OUT=RESULTS/"figures";OUT.mkdir(parents=True,exist_ok=True)
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":9,"axes.titlesize":11,"axes.labelsize":9,
                    "figure.dpi":120,"savefig.dpi":220,"axes.spines.top":False,"axes.spines.right":False,
                    "pdf.fonttype":42,"ps.fonttype":42})
BLUE="#22577A";ORANGE="#C75B39";GREEN="#237A68";GRAY="#727B85"
names={"checkifexist":"CheckIfExist","hallucitechecker":"HalluCiteChecker","hallucinator":"Hallucinator",
       "halref":"HalRef","refchecker":"RefChecker","vote_k3":"Majority (3/5)","vote_k4":"Strict (4/5)",
       "lodo_selected":"Held-out selection"}


def read_csv(name):
    with (RESULTS/name).open(newline="") as f:return list(csv.DictReader(f))


def save(fig,name):
    fig.tight_layout()
    fig.savefig(OUT/(name+".pdf"),bbox_inches="tight")
    fig.savefig(OUT/(name+".png"),bbox_inches="tight")
    plt.close(fig)


m={r['method']:r for r in read_csv('metrics.csv')}
selected=list(names)
fig,axes=plt.subplots(1,2,figsize=(8,3.2),sharey=True)
y=np.arange(len(selected))
for ax,metric,title,color in [(axes[0],'recall','Problem detection (recall)',BLUE),(axes[1],'false_positive_rate','False alarms among verified references',ORANGE)]:
    values=[100*float(m[k][metric]) for k in selected]
    ax.barh(y,values,color=[color if k!='vote_k3' else GREEN for k in selected],height=.65)
    ax.set_xlim(0,112);ax.set_title(title);ax.set_xlabel('Percent')
    ax.set_yticks(y,labels=[names[k] for k in selected]);ax.invert_yaxis()
    for a,b in zip(y,values):ax.text(b+1,a,f'{b:.1f}',va='center',fontsize=8)
save(fig,'01_method_comparison')

fig,axes=plt.subplots(1,2,figsize=(8,3.1))
ks=list(range(1,6))
for metric,label,color in [('recall','Recall',BLUE),('false_positive_rate','False-positive rate',ORANGE),('balanced_accuracy','Balanced accuracy',GREEN)]:
    axes[0].plot(ks,[float(m[f'vote_k{k}'][metric]) for k in ks],marker='o',label=label,color=color)
axes[0].axvline(3,color=GRAY,ls=':',lw=1);axes[0].set(xlabel='Flags required (k of 5)',ylabel='Rate',xticks=ks,ylim=(0,1.06))
axes[0].legend(fontsize=7,loc='lower left');axes[0].set_title('Prespecified threshold sensitivity')
dist=read_csv('vote_distribution.csv');xs=np.arange(6)
axes[1].bar(xs-.18,[int(r['verified']) for r in dist],.36,label='Verified',color=BLUE)
axes[1].bar(xs+.18,[int(r['problematic']) for r in dist],.36,label='Problematic',color=ORANGE)
axes[1].set(xlabel='Number of tools flagging a reference',ylabel='References',xticks=xs)
axes[1].legend(fontsize=8);axes[1].set_title('Agreement can also concentrate false alarms')
save(fig,'02_thresholds_and_votes')

rows=read_csv('by_document.csv'); lookup={(r['document'],r['method']):r for r in rows}
methods=['refchecker','vote_k3','vote_k4','lodo_selected'];docs=['P1','P2','P3']
fig,ax=plt.subplots(figsize=(7.2,3.2));x=np.arange(3);w=.19
for j,method in enumerate(methods):
    ax.bar(x+(j-1.5)*w,[float(lookup[(d,method)]['balanced_accuracy']) for d in docs],w,label=names[method],color=[GRAY,BLUE,GREEN,ORANGE][j])
ax.axhline(.5,color='#bbbbbb',ls='--',lw=.8)
ax.set(xticks=x,xticklabels=[f"{d} ({lookup[(d,'refchecker')]['n']} refs; {lookup[(d,'refchecker')]['positives']} problems)" for d in docs],
       ylim=(0,1.06),ylabel='Balanced accuracy',title='Performance varies by source document')
ax.legend(ncol=2,fontsize=8,loc='upper left')
save(fig,'03_document_heterogeneity')

tools=['checkifexist','hallucitechecker','hallucinator','halref','refchecker']
fig,ax=plt.subplots(figsize=(7.2,3.1))
values=[float(m['without_'+t]['balanced_accuracy']) for t in tools]
ax.barh(range(5),values,color=BLUE)
ax.axvline(float(m['vote_k3']['balanced_accuracy']),color=ORANGE,ls='--',label='Full 3-of-5 panel')
ax.set_yticks(range(5),labels=['Remove '+names[t] for t in tools]);ax.invert_yaxis()
ax.set(xlim=(0,1),xlabel='Balanced accuracy',title='Panel sensitivity: strict majority (3 of 4) after removal')
for i,v in enumerate(values):ax.text(v+.01,i,f'{v:.3f}',va='center',fontsize=8)
ax.legend(fontsize=8,loc='lower right')
save(fig,'04_tool_ablation')

rows=read_csv('error_overlap.csv');lookup={(r['tool_a'],r['tool_b']):float(r['error_jaccard']) for r in rows}
a=np.array([[lookup[(t,u)] for u in tools] for t in tools]);fig,ax=plt.subplots(figsize=(6,4))
im=ax.imshow(a,cmap='Blues',vmin=0,vmax=1)
short=['CheckIfExist','HalluCite','Hallucinator','HalRef','RefChecker']
ax.set_xticks(range(5),labels=short,rotation=30,ha='right');ax.set_yticks(range(5),labels=short)
for i in range(5):
    for j in range(5):ax.text(j,i,f'{a[i,j]:.2f}',ha='center',va='center',color='white' if a[i,j]>.6 else '#172b4d',fontsize=9)
fig.colorbar(im,ax=ax,label='Jaccard overlap of error sets',shrink=.8)
ax.set_title('Overlap between checker error sets')
save(fig,'05_error_overlap')

triage=json.loads((RESULTS/'triage.json').read_text());groups=triage['groups']
fig,ax=plt.subplots(figsize=(6.5,2.8));x=np.arange(3)
good=[r['verified'] for r in groups];bad=[r['problematic'] for r in groups]
ax.bar(x,good,color=BLUE,label='Verified');ax.bar(x,bad,bottom=good,color=ORANGE,label='Problematic')
for i,(g,b) in enumerate(zip(good,bad)):
    if g:ax.text(i,g/2,str(g),ha='center',va='center',color='white')
    if b:ax.text(i,g+b/2,str(b),ha='center',va='center',color='white')
ax.set(xticks=x,xticklabels=['Auto-accept\n0–1 flags','Manual review\n2–3 flags','Auto-flag\n4–5 flags'],ylabel='References',title='Triage defers 53 of 104 references; deferrals are not successes')
ax.legend(fontsize=8,loc='upper left')
save(fig,'06_triage')
print('Generated six measured-data figures as PDF and PNG:',OUT)
