(() => {
'use strict';
const {teams,teamKey,assignmentNumbers,assignments,gameFor,result}=PoolCore;
const config=window.POOL_CONFIG, key=`tim-pool-${config.season}-v1`;
const $=s=>document.querySelector(s);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cache={},pool='39',week=1;
try {const saved=JSON.parse(localStorage.getItem(key)||'{}');cache=saved.cache||{};pool=assignments[saved.pool]?saved.pool:'39';week=Number(saved.week)||1;}catch{}
week=Math.min(18,Math.max(1,week));
const pending=new Map(),errors=new Map();
function save(){try{localStorage.setItem(key,JSON.stringify({cache,pool,week}));}catch{}}
function game(w=week,p=pool){return gameFor(cache[w]?.data,assignments[p][w-1]);}
function time(date){const d=new Date(date);return Number.isNaN(d.getTime())?'Game time to be announced':d.toLocaleString(undefined,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});}
function render(){
document.querySelectorAll('[data-pool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pool===pool)));
$('#week').value=week;$('#prev').disabled=week===1;$('#next').disabled=week===18;
$('#refresh').disabled=pending.has(week);$('#refresh').textContent=pending.has(week)?'Refreshing…':'↻ Refresh';
const entry=cache[week],g=game(),r=result(pool,g),code=assignments[pool][week-1];
const age=entry?Date.now()-entry.at:Infinity;
const stale=age>120000 && g?.state==='in'||age>3600000;
const issue=errors.get(week)||(!navigator.onLine?'You are offline.':null);
$('#connection').classList.toggle('error',Boolean(issue||entry&&stale));
$('#connection').textContent=issue?`${issue} ${entry?'Showing saved scores from '+new Date(entry.at).toLocaleString()+'.':'Scores unavailable. Tap Refresh to retry.'}`:entry?`${stale?'Saved data ·':'Online ·'} Checked ${new Date(entry.at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit',second:'2-digit'})} · Auto-refresh 30s`:'Loading this week’s schedule…';
const score=g&&g.state!=='pre'?`${escape(g.score??'—')} <span>:</span> ${escape(g.opponentScore??'—')}`:'— <span>:</span> —';
const opponent=g?.other?.team;
const state=g?.status?.type?.detail||g?.status?.type?.description||'Schedule pending';
$('#game').innerHTML=`<article class="game-card ${r.hit?'hit':''}"><div class="card-top"><span>WEEK ${week} <span aria-hidden="true">/</span> ${pool==='39'?'39 EXACT':'50+ POINTS'}</span><span class="badge">${escape(state)}</span></div><div class="matchup"><div class="yours"><span class="team-code">${code}</span><div class="team-name">${teams[code]}</div><div class="pool-number">TEAM #${assignmentNumbers[pool][week-1]}</div><div class="team-label">YOUR TEAM${g?' · '+(g.me.homeAway==='home'?'HOME':'AWAY'):''}</div></div><div class="score" aria-label="Your team score followed by opponent score">${score}</div><div><span class="team-code">${escape(opponent?.abbreviation||'TBD')}</span><div class="team-name">${escape(opponent?.displayName||'Opponent pending')}</div><div class="team-label">OPPONENT</div></div></div><div class="game-time">${g?escape(time(g.date)):'Waiting for a confirmed game from ESPN'}</div><div class="result" role="status"><strong>${r.hit?'✦ ':''}${escape(r.title)}</strong><p>${escape(r.detail)}</p><div class="progress" aria-hidden="true"><i style="width:${Math.min(100,Math.max(0,(g?.state==='pre'?0:g?.score||0)/Number(pool)*100))}%"></i></div></div></article>`;
let wins=0,finals=0;
$('#history').innerHTML=assignments[pool].map((c,i)=>{const gg=game(i+1),rr=result(pool,gg);if(gg?.completed){finals++;if(rr.hit)wins++;}return `<button data-week="${i+1}" class="${week===i+1?'selected':''}" ${week===i+1?'aria-current="true"':''}><span class="wk">Week ${i+1}</span><span class="name">${teams[c]}<small class="history-number">Team #${assignmentNumbers[pool][i]}</small></span><span class="status ${rr.hit?'won':''}">${escape(cache[i+1]?rr.short:errors.has(i+1)?'Unavailable':'Loading…')}</span></button>`;}).join('');
$('#summary').textContent=`${wins} ${wins===1?'win':'wins'} · ${finals}/18 final`;
}
function valid(data,w){if(!Array.isArray(data.events))throw Error('Score feed format changed.');if(Number(data.season?.year)!==config.season||Number(data.season?.type)!==2||Number(data.week?.number)!==w)throw Error('Requested week is not available.');for(const e of data.events){if(e.season&&(Number(e.season.year)!==config.season||Number(e.season.type)!==2)||e.week&&Number(e.week.number)!==w)throw Error('Score feed returned another week.');}return data;}
async function fetchWeek(w,force=false){
if(pending.has(w))return pending.get(w);
const entry=cache[w];const active=['39','50'].some(p=>game(w,p)?.state==='in');
if(!force&&entry&&Date.now()-entry.at<(active?config.refreshMs:3600000))return;
const task=(async()=>{const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);try{const url=new URL(config.endpoint,location.href);url.searchParams.set('dates',config.season);url.searchParams.set('seasontype','2');url.searchParams.set('week',w);url.searchParams.set('limit','100');const response=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!response.ok)throw Error(`Score service unavailable (${response.status}).`);const data=valid(await response.json(),w);cache[w]={at:Date.now(),data};errors.delete(w);save();}catch(e){errors.set(w,e.name==='AbortError'?'Score request timed out.':e.message==='Failed to fetch'?'Could not connect to scores.':e.message);}finally{clearTimeout(timeout);pending.delete(w);render();}})();
pending.set(w,task);render();return task;
}
async function loadSeason(){let n=1;await Promise.all(Array.from({length:3},async()=>{while(n<=18){const w=n++;await fetchWeek(w);}}));}
function select(w,p=pool){week=Math.min(18,Math.max(1,w));pool=p;save();render();fetchWeek(week);}
$('#week').innerHTML=Array.from({length:18},(_,i)=>`<option value="${i+1}">Week ${i+1}</option>`).join('');
$('#week').addEventListener('change',e=>select(Number(e.target.value)));
$('#prev').onclick=()=>select(week-1);$('#next').onclick=()=>select(week+1);
document.querySelectorAll('[data-pool]').forEach(b=>b.onclick=()=>select(week,b.dataset.pool));
$('#history').onclick=e=>{const b=e.target.closest('[data-week]');if(b){select(Number(b.dataset.week));$('#week').focus();$('#game').scrollIntoView({block:'nearest'});}};
$('#refresh').onclick=()=>fetchWeek(week,true);
$('#show-key').onclick=()=>{const sheet=$('#number-sheet');sheet.open=true;sheet.scrollIntoView({block:'start'});sheet.querySelector('summary').focus();};
function refreshVisible(){if(document.hidden)return;fetchWeek(week,true);loadSeason();}
setInterval(refreshVisible,Math.max(15000,config.refreshMs));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshVisible();});
window.addEventListener('online',refreshVisible);window.addEventListener('offline',render);
$('#team-key').innerHTML=Object.entries(teamKey).map(([number,code])=>`<div><span>Team #${number}</span><strong>${teams[code]}</strong></div>`).join('');
$('#timezone').textContent=`Game times: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
let installPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#install').hidden=false;});
$('#install').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('#install').hidden=true;}};
if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();fetchWeek(week).then(loadSeason);
})();
