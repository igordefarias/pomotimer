(()=>{
const $=s=>document.querySelector(s),C=window.CONFIG,K='pomodoro:v1';
const ds=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10),td=()=>ds(new Date());
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MODES={focus:'foco',short:'pausa curta',long:'pausa longa'};
const GR=[{title:'Pêssego',bg:'linear-gradient(135deg,#ffd1dc,#ffb4a2 50%,#b5838d)',accent:'#ff8fab'},
{title:'Musgo',bg:'linear-gradient(135deg,#cfe8d5,#7fb89a 55%,#2f5d50)',accent:'#9be3b5'},
{title:'Noite',bg:'linear-gradient(135deg,#2b2d5b,#5b4b8a 55%,#e08fb0)',accent:'#c9a7ff'}];
const WALLS=[...C.wallpapers.map(w=>({...w,bg:`url("assets/wallpapers/${encodeURIComponent(w.file)}")`})),...GR];
const def=()=>({v:1,lists:[{id:'l1',name:'Geral'}],tasks:[],active:null,cur:'l1',cyc:0,log:{},amb:{},mv:.5,rv:.5,rs:0,
 set:{focus:25,short:5,long:15,goal:8,auto:false,wall:0},t:{m:'focus',end:0,left:1500,run:false}});
function clean(d){const ids=new Set(d.lists.map(l=>l.id));if(!ids.size)d.lists=def().lists;
 d.tasks=d.tasks.filter(t=>ids.has(t.list));if(!d.tasks.some(t=>t.id===d.active))d.active=null;
 if(!ids.has(d.cur))d.cur=d.lists[0].id;const l={};Object.keys(d.log).sort().slice(-120).forEach(k=>l[k]=d.log[k]);d.log=l;return d}
function load(){try{const d=JSON.parse(localStorage.getItem(K));if(d&&d.v===1)return clean({...def(),...d,set:{...def().set,...d.set}})}catch(e){}return def()}
let S=load();const save=()=>localStorage.setItem(K,JSON.stringify(S));
const dur=m=>S.set[m]*60,left=()=>S.t.run?Math.max(0,Math.round((S.t.end-Date.now())/1e3)):S.t.left;
const mmss=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');

function beep(){try{const a=new AudioContext();[0,.3,.6].forEach(d=>{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+d;o.frequency.value=880;o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(.25,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.start(t);o.stop(t+.26)})}catch(e){}}
function finish(){beep();const m=S.t.m;
 if(m==='focus'){S.log[td()]=(S.log[td()]||0)+1;const t=S.tasks.find(x=>x.id===S.active);if(t)t.n++;S.cyc++}
 const nx=m!=='focus'?'focus':S.cyc%4===0?'long':'short';
 if('Notification'in window&&Notification.permission==='granted')new Notification(m==='focus'?'Foco concluído! 🌱':'Hora de focar!',{body:'Próximo: '+MODES[nx]});
 S.t={m:nx,left:dur(nx),run:S.set.auto,end:S.set.auto?Date.now()+dur(nx)*1e3:0};save();tasks();plant()}
function timer(){const l=left();$('#time').textContent=mmss(l);$('#arc').style.strokeDashoffset=339.3*(1-l/dur(S.t.m));
 $('#go').textContent=S.t.run?'pausar':'começar';document.body.classList.toggle('run',S.t.run);
 document.title=(S.t.run?mmss(l)+' · ':'')+MODES[S.t.m];
 $('#modes').innerHTML=Object.keys(MODES).map(m=>`<button class="chip ${m===S.t.m?'on':''}" data-a="mode" data-id="${m}">${MODES[m]}</button>`).join('');
 const t=S.tasks.find(x=>x.id===S.active);$('#now').textContent=t?'🎯 '+t.name:'escolha uma task (🎯) para acompanhar';
 if(S.t.run&&l<=0)finish()}
function plant(){const n=S.log[td()]||0,g=S.set.goal,st=['🌰','🌱','🌿','🪴','🌷','🌸'];
 $('#plant').textContent=st[n>=g?5:Math.floor(n/g*5)];let s=0,d=new Date();if(!S.log[td()])d.setDate(d.getDate()-1);
 while(S.log[ds(d)]){s++;d.setDate(d.getDate()-1)}$('#goalTxt').textContent=`${n}/${g} hoje`+(s?` · 🔥 ${s} ${s>1?'dias':'dia'}`:'')}
function tasks(){const ts=S.tasks.filter(t=>t.list===S.cur&&!t.arch);
 $('#lists').innerHTML=S.lists.map(l=>`<button class="chip ${l.id===S.cur?'on':''}" data-a="list" data-id="${l.id}">${esc(l.name)}</button>`).join('')+'<button class="chip" data-a="newList">＋ lista</button>';
 $('#tl').innerHTML=ts.map(t=>`<li class="${t.done?'dn':''} ${S.active===t.id?'act':''}"><button class="ic" data-a="pick" data-id="${t.id}">${S.active===t.id?'🎯':'○'}</button><div class="tx"><b>${esc(t.name)}</b>${t.note?`<small>${esc(t.note)}</small>`:''}</div><span class="cnt">🍅 ${t.n}/${t.est}</span><button class="ic" data-a="check" data-id="${t.id}" title="Concluir">${t.done?'↩':'✓'}</button><button class="ic" data-a="edit" data-id="${t.id}">✎</button><button class="ic" data-a="del" data-id="${t.id}">🗑</button></li>`).join('')||'<li><span class="muted">Sem tasks nesta lista. Adicione a primeira acima ✨</span></li>'}

// áudio
const M=new Audio(),A={};let mi=0;const mn=C.music.length;
const mset=i=>{mi=(i+mn)%mn;M.src='assets/music/'+encodeURIComponent(C.music[mi].file)};
M.onended=()=>{mset(mi+1);M.play()};M.volume=S.mv;
function amb(i,v){const a=C.ambient[i];if(!a)return;const o=A[i]||(A[i]=Object.assign(new Audio('assets/ambient/'+encodeURIComponent(a.file)),{loop:true}));o.volume=v;v>0?o.play().catch(()=>{}):o.pause()}

// rádio ao vivo (YouTube) — mini-player fica visível, como pedem os termos do YouTube
const R=C.radio||[{title:'Lofi Girl',channel:'UCSJ4gkVC6NrvII8umztf0Ow'}];let rOn=false;
document.body.insertAdjacentHTML('beforeend','<div id="radio" class="glass" hidden><div></div><button class="ic" data-a="radioOff" title="Parar rádio">✕</button></div>');
const yt=(f,...a)=>{const i=$('#rf');i&&i.contentWindow.postMessage(JSON.stringify({event:'command',func:f,args:a}),'*')};
function playRadio(i){const r=R[i];if(!r)return;S.rs=i;save();M.pause();
 const q='autoplay=1&playsinline=1&enablejsapi=1&rel=0'+(location.protocol.startsWith('http')?'&origin='+encodeURIComponent(location.origin):'');
 const u=r.channel?`https://www.youtube.com/embed/live_stream?channel=${r.channel}&${q}`:`https://www.youtube.com/embed/${r.video}?${q}`;
 $('#radio').hidden=false;$('#radio div').innerHTML=`<iframe id="rf" src="${u}" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" title="${esc(r.title)}"></iframe>`;
 rOn=true;setTimeout(()=>yt('setVolume',S.rv*100),1500)}
function radioOff(){$('#radio').hidden=true;$('#radio div').innerHTML='';rOn=false}
M.onplay=()=>rOn&&radioOff();
const radioHtml=()=>`<b>📻 Rádio ao vivo</b><div class="row"><div class="chips">${R.map((r,i)=>`<button class="chip ${rOn&&i===S.rs?'on':''}" data-a="radio" data-id="${i}">${esc(r.title)}</button>`).join('')}</div><input type="range" min="0" max="1" step=".01" value="${S.rv}" data-r="rv"></div>${navigator.onLine?'':'<p class="muted">Sem internet: use a playlist offline.</p>'}`;

function wall(){const w=WALLS[S.set.wall]||WALLS[WALLS.length-1];$('#bg').style.background=w.bg;$('#bg').style.backgroundSize='cover';$('#bg').style.backgroundPosition='center';document.documentElement.style.setProperty('--ac',w.accent||'#ff8fab')}
function panel(id){const p=$('#panel');if(!id||(!p.hidden&&p.dataset.id===id)){p.hidden=true;return}p.dataset.id=id;p.hidden=false;
 const x='<button class="ic" data-a="panel">✕</button>';let h='';
 if(id==='wall')h=`<h3>Fundos ${x}</h3><div class="wg">${WALLS.map((w,i)=>`<button data-a="setWall" data-id="${i}" class="${i===S.set.wall?'on':''}" style='background-image:${w.bg}'>${esc(w.title)}</button>`).join('')}</div>`;
 if(id==='aud')h=`<h3>Sons ${x}</h3>`+radioHtml()+`<b>🎵 Playlist offline</b>`+(mn?`<div class="row"><div><span id="mt">${esc(C.music[mi]?.title||'—')}</span><span><button class="ic" data-a="mprev">⏮</button><button class="ic" data-a="mplay">⏯</button><button class="ic" data-a="mnext">⏭</button></span></div><input type="range" min="0" max="1" step=".01" value="${S.mv}" data-r="mv"></div>`:'<p class="muted">Adicione músicas em js/config.js.</p>')
  +'<b>🌿 Ambiente</b>'+(C.ambient.length?C.ambient.map((a,i)=>`<div class="row"><div><span>${a.icon||'🎶'} ${esc(a.title)}</span></div><input type="range" min="0" max="1" step=".01" value="${S.amb[i]||0}" data-r="${i}"></div>`).join(''):'<p class="muted">Adicione sons em js/config.js.</p>');
 if(id==='set'){const n=(k,l)=>`<div><span>${l}</span><input type="number" min="1" max="999" value="${S.set[k]}" data-s="${k}"></div>`;
  h=`<h3>Ajustes ${x}</h3><div class="row">${n('focus','Foco (min)')}${n('short','Pausa curta (min)')}${n('long','Pausa longa (min)')}${n('goal','Meta diária 🍅')}<div><span>Iniciar próximo sozinho</span><input type="checkbox" ${S.set.auto?'checked':''} data-s="auto"></div></div><div class="foot"><button class="chip" data-a="notif">🔔 notificações</button><button class="chip" data-a="exp">⬇ exportar</button><button class="chip" data-a="imp">⬆ importar</button></div>`}
 if(id==='arc'){const a=S.tasks.filter(t=>t.list===S.cur&&t.arch).sort((a,b)=>b.at.localeCompare(a.at));
  h=`<h3>Arquivo ${x}</h3>`+(a.length?`<ul>${a.map(t=>`<li><div class="tx"><b>${esc(t.name)}</b><small>${t.at} · 🍅 ${t.n}</small></div><button class="ic" data-a="restore" data-id="${t.id}" title="Restaurar">↩</button><button class="ic" data-a="del" data-id="${t.id}">🗑</button></li>`).join('')}</ul>`:'<p class="muted">Nada arquivado nesta lista ainda.</p>')}
 p.innerHTML=h}

const act={
 go(){if(S.t.run){S.t.left=left();S.t.run=false}else{S.t.end=Date.now()+S.t.left*1e3;S.t.run=true}save();timer()},
 reset(){S.t={m:S.t.m,left:dur(S.t.m),run:false,end:0};save();timer()},
 skip(){S.t.left=0;S.t.run=true;S.t.end=Date.now();timer()},
 mode(d){S.t={m:d.id,left:dur(d.id),run:false,end:0};save();timer()},
 list(d){S.cur=d.id;save();tasks()},
 newList(){const n=prompt('Nome da lista (ex: Química)');if(n&&n.trim()){const id='l'+Date.now();S.lists.push({id,name:n.trim()});S.cur=id;save();tasks()}},
 delList(){if(S.lists.length<2)return alert('Mantenha ao menos uma lista.');const l=S.lists.find(x=>x.id===S.cur);if(confirm(`Apagar "${l.name}" e todas as tasks (inclusive arquivadas)?`)){S.lists=S.lists.filter(x=>x!==l);S=clean(S);save();tasks();timer()}},
 pick(d){S.active=S.active===d.id?null:d.id;save();tasks();timer()},
 check(d){const t=S.tasks.find(x=>x.id===d.id);t.done=!t.done;save();tasks()},
 edit(d){const t=S.tasks.find(x=>x.id===d.id),n=prompt('Nome',t.name);if(n===null)return;const e=parseInt(prompt('Quantidade de pomodoros',t.est));t.name=n.trim()||t.name;if(e>0)t.est=e;save();tasks()},
 del(d){if(confirm('Apagar de vez?')){S.tasks=S.tasks.filter(x=>x.id!==d.id);S=clean(S);save();tasks();timer();if(!$('#panel').hidden&&$('#panel').dataset.id==='arc')panel('arc')}},
 archive(){const c=S.tasks.filter(t=>t.list===S.cur&&t.done&&!t.arch);if(!c.length)return alert('Nenhuma task concluída para arquivar.');c.forEach(t=>{t.arch=1;t.at=td()});if(c.some(t=>t.id===S.active))S.active=null;save();tasks();timer()},
 restore(d){const t=S.tasks.find(x=>x.id===d.id);delete t.arch;t.done=false;save();tasks();panel('arc');panel('arc')},
 panel(d){panel(d.id)},setWall(d){S.set.wall=+d.id;save();wall();panel('wall');panel('wall')},
 mplay(){if(!mn)return;if(!M.src)mset(0);M.paused?M.play():M.pause()},mnext(){if(mn){mset(mi+1);M.play();$('#mt').textContent=C.music[mi].title}},mprev(){if(mn){mset(mi-1);M.play();$('#mt').textContent=C.music[mi].title}},
 radio(d){+d.id===S.rs&&rOn?radioOff():playRadio(+d.id);panel('aud');panel('aud')},radioOff(){radioOff();if(!$('#panel').hidden&&$('#panel').dataset.id==='aud'){panel('aud');panel('aud')}},
 notif(){Notification.requestPermission()},
 exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='pomo-backup-'+td()+'.json';a.click()},
 imp(){const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=async()=>{try{const d=JSON.parse(await i.files[0].text());if(d.v!==1)throw 0;S=clean({...def(),...d});save();location.reload()}catch(e){alert('Arquivo de backup inválido.')}};i.click()}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&act[b.dataset.a])act[b.dataset.a](b.dataset)});
document.addEventListener('input',e=>{const r=e.target.dataset.r,s=e.target.dataset.s;
 if(r==='rv'){S.rv=+e.target.value;yt('setVolume',S.rv*100);save()}else if(r==='mv'){S.mv=M.volume=+e.target.value;save()}else if(r!==undefined){S.amb[r]=+e.target.value;amb(r,S.amb[r]);save()}
 if(s){S.set[s]=e.target.type==='checkbox'?e.target.checked:Math.max(1,+e.target.value||1);if(!S.t.run&&s===S.t.m)S.t.left=dur(s);save();timer();plant()}});
$('#add').onsubmit=e=>{e.preventDefault();S.tasks.push({id:'t'+Date.now(),list:S.cur,name:$('#tn').value.trim(),note:$('#tt').value.trim(),est:Math.max(1,+$('#te').value||1),n:0,done:false});
 if(!S.active)S.active=S.tasks[S.tasks.length-1].id;$('#tn').value=$('#tt').value='';save();tasks();timer()};
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT|BUTTON/.test(e.target.tagName)){e.preventDefault();act.go()}});
wall();tasks();plant();timer();setInterval(timer,250);
})();