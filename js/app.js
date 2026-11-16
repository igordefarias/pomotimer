(()=>{
const $=s=>document.querySelector(s),C=window.CONFIG,K='pomodoro:v1';
const ds=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10),td=()=>ds(new Date());
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MODES={focus:'foco',short:'pausa curta',long:'pausa longa'};
const GR=[{title:'Pêssego',bg:'linear-gradient(135deg,#ffd1dc,#ffb4a2 50%,#b5838d)',accent:'#ff8fab'},
{title:'Musgo',bg:'linear-gradient(135deg,#cfe8d5,#7fb89a 55%,#2f5d50)',accent:'#9be3b5'},
{title:'Noite',bg:'linear-gradient(135deg,#2b2d5b,#5b4b8a 55%,#e08fb0)',accent:'#c9a7ff'}];
const WALLS=[...C.wallpapers.map(w=>({...w,bg:`url("assets/wallpapers/${encodeURIComponent(w.file)}")`})),...GR];
const def=()=>({v:1,lists:[{id:'l1',name:'Geral'}],tasks:[],active:null,cur:'l1',cyc:0,log:{},amb:{},mv:.5,rv:.5,rs:0,rz:380,rp:null,tags:[],min:{},links:[],cnt:{focus:0,short:0,long:0},
 set:{focus:25,short:5,long:15,goal:8,auto:false,wall:0,lang:'pt',alarm:true,sound:'suave',vol:1,autoBreak:false,autoFocus:false,notif:false},t:{m:'focus',end:0,left:1500,run:false}});
function clean(d){const ids=new Set(d.lists.map(l=>l.id));if(!ids.size)d.lists=def().lists;
 d.tasks=d.tasks.filter(t=>ids.has(t.list)).map(t=>({prio:0,due:'',tags:[],...t,state:t.state||(t.done?'done':'todo')}));d.tags=d.tags||[];d.min=d.min||{};d.links=d.links||[];d.cnt={focus:0,short:0,long:0,...d.cnt};if(!d.tasks.some(t=>t.id===d.active))d.active=null;
 if(!ids.has(d.cur))d.cur=d.lists[0].id;const l={};Object.keys(d.log).sort().slice(-120).forEach(k=>l[k]=d.log[k]);d.log=l;return d}
function load(){try{const d=JSON.parse(localStorage.getItem(K));if(d&&d.v===1)return clean({...def(),...d,set:{...def().set,...d.set}})}catch(e){}return def()}
let S=load();const save=()=>localStorage.setItem(K,JSON.stringify(S));
const dur=m=>S.set[m]*60,left=()=>S.t.run?Math.max(0,Math.round((S.t.end-Date.now())/1e3)):S.t.left;
const mmss=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');

const SN={carrilhao:['sine',[880,1109,1319,1760],.3,1.2],sino:['sine',[660,660],.8,2],digital:['square',[1000,1000,1000],.2,.15],suave:['sine',[523,659,784],.35,.9],piano:['triangle',[523,659,784,1047],.2,1.3]},SNN={carrilhao:'Carrilhão',sino:'Sino',digital:'Digital',suave:'Suave',piano:'Piano'};
function beep(k){try{if(!S.set.alarm&&!k)return;const[ty,fs,gap,dec]=SN[k||S.set.sound]||SN.suave,a=new AudioContext(),v=(S.set.vol??1)*.35;fs.forEach((f,i)=>{const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+i*gap;o.type=ty;o.frequency.value=f;o.connect(g);g.connect(a.destination);g.gain.setValueAtTime(Math.max(v,.001),t);g.gain.exponentialRampToValueAtTime(.001,t+dec);o.start(t);o.stop(t+dec+.05)})}catch(e){}}
function finish(){beep();const m=S.t.m;S.cnt[m]=(S.cnt[m]||0)+1;
 if(m==='focus'){S.log[td()]=(S.log[td()]||0)+1;S.min[td()]=(S.min[td()]||0)+S.set.focus;const t=S.tasks.find(x=>x.id===S.active);if(t)t.n++;S.cyc++}
 const nx=m!=='focus'?'focus':S.cyc%4===0?'long':'short';
 if(S.set.notif&&'Notification'in window&&Notification.permission==='granted')new Notification(m==='focus'?'Foco concluído! 🌱':'Hora de focar!',{body:'Próximo: '+MODES[nx]});
 const au=m==='focus'?S.set.autoBreak:S.set.autoFocus;S.t={m:nx,left:dur(nx),run:au,end:au?Date.now()+dur(nx)*1e3:0};save();tasks();plant()}
function timer(){const l=left();$('#time').textContent=mmss(l);$('#arc').style.strokeDashoffset=339.3*(1-l/dur(S.t.m));
 $('#go').textContent=S.t.run?'pausar':'começar';document.body.classList.toggle('run',S.t.run);
 document.title=(S.t.run?mmss(l)+' · ':'')+MODES[S.t.m];
 $('#modes').innerHTML=Object.keys(MODES).map(m=>`<button class="chip ${m===S.t.m?'on':''}" data-a="mode" data-id="${m}">${MODES[m]} <small>${S.cnt[m]||0}</small></button>`).join('');
 const t=S.tasks.find(x=>x.id===S.active);$('#now').textContent=t?'🎯 '+t.name:'escolha uma task (🎯) para acompanhar';
 if(S.t.run&&l<=0)finish()}
function plant(){const n=S.log[td()]||0,g=S.set.goal,st=['🌰','🌱','🌿','🪴','🌷','🌸'];
 $('#plant').textContent=st[n>=g?5:Math.floor(n/g*5)];let s=0,d=new Date();if(!S.log[td()])d.setDate(d.getDate()-1);
 while(S.log[ds(d)]){s++;d.setDate(d.getDate()-1)}$('#sk').textContent=s;$('#goalTxt').textContent=`${n}/${g} hoje`+(s?` · 🔥 ${s} ${s>1?'dias':'dia'}`:'')}

const P=$('#panel');let F='',CM=0;
const RAW=`começar|start|empezar
pausar|pause|pausar
pausa curta|short break|descanso corto
pausa longa|long break|descanso largo
Seu foco|Your focus|Tu enfoque
Foco|Focus|Enfoque
foco|focus|enfoque
escolha uma task (🎯) para acompanhar|pick a task (🎯) to track|elige una tarea (🎯) para seguirla
hoje|today|hoy
Hoje|Today|Hoy
Amanhã|Tomorrow|Mañana
Limpar|Clear|Limpiar
Música|Music|Música
Tarefas|Tasks|Tareas
Estética|Appearance|Apariencia
Ajustes|Settings|Ajustes
Idioma|Language|Idioma
Duração das sessões|Session length|Duración de las sesiones
Descanso curto|Short break|Descanso corto
Descanso longo|Long break|Descanso largo
Meta diária|Daily goal|Meta diaria
Zerar contadores atuais|Reset current counters|Reiniciar contadores
Início automático: descansos|Auto-start: breaks|Inicio automático: descansos
Início automático: foco|Auto-start: focus|Inicio automático: enfoque
Início automático|Auto-start|Inicio automático
Alarme|Alarm|Alarma
Carrilhão|Chimes|Carillón
Sino|Bell|Campana
Suave|Soft|Suave
Volume|Volume|Volumen
Notificações na área de trabalho|Desktop notifications|Notificaciones de escritorio
exportar|export|exportar
importar|import|importar
Contadores zerados.|Counters reset.|Contadores reiniciados.
Nova tarefa…|New task…|Nueva tarea…
Detalhes (opcional)|Details (optional)|Detalles (opcional)
Adicionar mais|Add more|Añadir más
Adicionar foto|Add photo|Añadir foto
Adicionar|Add|Añadir
Prioridade alta|High priority|Prioridad alta
Prioridade|Priority|Prioridad
Data limite|Due date|Fecha límite
Gerenciar etiquetas|Manage tags|Gestionar etiquetas
Buscar etiquetas…|Search tags…|Buscar etiquetas…
Buscar tarefas|Search tasks|Buscar tareas
Nome da etiqueta…|Tag name…|Nombre de la etiqueta…
Ainda não há etiquetas.|No tags yet.|Aún no hay etiquetas.
Etiquetas|Tags|Etiquetas
Nenhuma|None|Ninguna
Alta|High|Alta
Média|Medium|Media
Baixa|Low|Baja
A fazer|To do|Por hacer
Em andamento|In progress|En curso
Concluída|Done|Hecha
Cancelada|Canceled|Cancelada
Todas as tarefas|All tasks|Todas las tareas
Filtros rápidos|Quick filters|Filtros rápidos
Apenas pendentes|Pending only|Solo pendientes
Atrasadas|Overdue|Atrasadas
Nada por aqui ✨|Nothing here ✨|Nada por aquí ✨
arquivar concluídas|archive completed|archivar completadas
ver arquivo|view archive|ver archivo
apagar lista|delete list|borrar lista
＋ lista|＋ list|＋ lista
Nenhuma tarefa concluída para arquivar.|No completed tasks to archive.|No hay tareas completadas para archivar.
Nada arquivado nesta lista ainda.|Nothing archived in this list yet.|Nada archivado en esta lista aún.
Arquivo|Archive|Archivo
Fundo|Background|Fondo
Destaque|Accent|Acento
Suas fotos|Your photos|Tus fotos
Seus links|Your links|Tus enlaces
Cole um link do YouTube…|Paste a YouTube link…|Pega un enlace de YouTube…
Link do YouTube inválido.|Invalid YouTube link.|Enlace de YouTube no válido.
Imagem muito grande (máx. 8 MB).|Image too large (max 8 MB).|Imagen demasiado grande (máx. 8 MB).
Rádio ao vivo|Live radio|Radio en vivo
Playlist offline|Offline playlist|Lista sin conexión
Ambiente|Ambient|Ambiente
no mês|this month|este mes
Sequência|Streak|Racha
Apagar de vez?|Delete permanently?|¿Borrar definitivamente?
Nome da lista (ex: Química)|List name (e.g. Chemistry)|Nombre de la lista (ej: Química)
Nome para este link?|Name for this link?|¿Nombre para este enlace?`;
const LX=RAW.split('\n').map(r=>r.split('|')).sort((a,b)=>b[0].length-a[0].length);
const LG=S.set.lang||'pt',LI={pt:0,en:1,es:2}[LG]||0,LC={pt:'pt-BR',en:'en-US',es:'es-ES'}[LG]||'pt-BR';
const T=s=>{if(LG==='pt'||typeof s!=='string')return s;for(const x of LX)if(s.includes(x[0]))s=s.split(x[0]).join(x[LI]||x[0]);return s};
['prompt','confirm','alert'].forEach(k=>{const f=window[k].bind(window);window[k]=(m,...a)=>f(T(m),...a)});
const wk=()=>[...Array(7)].map((_,i)=>`<small>${new Date(2024,0,1+i).toLocaleDateString(LC,{weekday:'short'})}</small>`).join('');
if(LG!=='pt'){const tr=r=>{const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n.parentElement.closest('[translate=no]'))continue;const v=T(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v}
 r.querySelectorAll('[placeholder],[title]').forEach(e=>['placeholder','title'].forEach(a=>e.hasAttribute(a)&&e.setAttribute(a,T(e.getAttribute(a)))))};
 const ob=new MutationObserver(()=>{tr(document.body);ob.takeRecords()});ob.observe(document.body,{childList:true,subtree:true,characterData:true});tr(document.body)}
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('pomo',1);r.onupgradeneeded=()=>r.result.createObjectStore('img',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const dbx=async(m,v)=>{const db=await idb();return new Promise((ok,no)=>{const s=db.transaction('img',m==='all'?'readonly':'readwrite').objectStore('img'),q=m==='all'?s.getAll():m==='put'?s.put(v):s.delete(v);q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)})};
let UP=[];async function loadUP(){try{UP=(await dbx('all')).map(r=>({id:r.id,title:'Foto',bg:`url("${URL.createObjectURL(r.blob)}")`}))}catch(e){}wall();if(!P.hidden&&P.dataset.id==='est')showPanel('est')}
function ytParse(u){try{const x=new URL(u.trim()),l=x.searchParams.get('list'),v=x.searchParams.get('v')||(x.hostname==='youtu.be'?x.pathname.slice(1):(x.pathname.match(/\/(?:live|embed|shorts)\/([\w-]{11})/)||[])[1]);if(v)return{video:v,list:l};if(l)return{list:l}}catch(e){}return null}
const linksHtml=()=>`<b>Seus links</b><div class="nt"><div class="chips"><input id="lk" placeholder="Cole um link do YouTube…" style="flex:1"><button class="chip" data-a="addLink">＋</button></div>${S.links.map((l,i)=>`<div class="chips"><span style="flex:1" translate="no">${esc(l.title)}</span><button class="ic" data-a="delLink" data-id="${i}">✕</button></div>`).join('')}</div>`;
const D={state:'todo',prio:0,due:'',tags:[],more:false,open:'',cm:0};let Q='',QO=0,FO=0;
const IC={backlog:'◌',todo:'○',doing:'◐',done:'✓',cancel:'✕'},PB=['—','▮▯▯','▮▮▯','▮▮▮'];
function draft(){const o=D.open,ch=(k,l)=>`<button class="chip ${o===k?'on':''}" data-a="dd" data-id="${k}">${l}</button>`;let p='';
 if(o==='state')p=Object.keys(ST).map(k=>`<button class="it ${D.state===k?'sel':''}" data-a="pv" data-k="state" data-v="${k}">${IC[k]} ${ST[k]}</button>`).join('');
 if(o==='prio')p=[0,3,2,1].map(k=>`<button class="it ${D.prio===k?'sel':''}" data-a="pv" data-k="prio" data-v="${k}">${PB[k]} ${k?PR[k]:'Nenhuma'}</button>`).join('');
 if(o==='tags')p=`<input data-q="tg" placeholder="Buscar etiquetas…">`+S.tags.map(g=>`<button class="it ${D.tags.includes(g)?'sel':''}" data-a="tg" data-n="${esc(g)}" translate="no">#${esc(g)}</button>`).join('')+`<button class="it" data-a="panel" data-id="tag">🏷 Gerenciar etiquetas</button>`;
 if(o==='date'){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()+D.cm);const y=d.getFullYear(),m=d.getMonth(),n=new Date(y,m+1,0).getDate(),tm=new Date();tm.setDate(tm.getDate()+1);let c='<i></i>'.repeat((d.getDay()+6)%7);
  for(let i=1;i<=n;i++){const k=ds(new Date(y,m,i));c+=`<button class="dd ${k===D.due?'sel':''} ${k===td()?'today':''}" data-a="pv" data-k="due" data-v="${k}">${i}</button>`}
  p=`<div class="chips"><button class="chip" data-a="pv" data-k="due" data-v="${td()}">Hoje</button><button class="chip" data-a="pv" data-k="due" data-v="${ds(tm)}">Amanhã</button><button class="chip" data-a="pv" data-k="due" data-v="">Limpar</button></div><div class="cal"><button class="ic" data-a="dcm" data-id="-1">‹</button><b>${d.toLocaleDateString(LC,{month:'long',year:'numeric'})}</b><button class="ic" data-a="dcm" data-id="1">›</button></div><div class="cg">${wk()}${c}</div>`}
 return `<div class="chips">${ch('state',IC[D.state]+' '+ST[D.state])}${ch('prio',PB[D.prio]+' '+(D.prio?PR[D.prio]:'Prioridade'))}${ch('date','📅 '+(D.due?D.due.split('-').reverse().slice(0,2).join('/'):'Data limite'))}${ch('tags','🏷 '+(D.tags.length?D.tags.map(g=>'#'+g).join(' '):'Etiquetas'))}</div>${p?`<div class="pp">${p}</div>`:''}`}
const rd=()=>{const e=$('#dc');if(e)e.innerHTML=draft()};

const ST={backlog:'Backlog',todo:'A fazer',doing:'Em andamento',done:'Concluída',cancel:'Cancelada'},PR=['Sem prioridade','Baixa','Média','Alta'];
const isOpen=t=>t.state!=='done'&&t.state!=='cancel',AC=['#7fb5ff','#a78bfa','#2dd4bf','#a3e635','#ff7a90','#f5c76b'];
const strk=()=>{let s=0,d=new Date();if(!S.log[td()])d.setDate(d.getDate()-1);while(S.log[ds(d)]){s++;d.setDate(d.getDate()-1)}return s};
const opts=(o,v)=>Object.keys(o).map(k=>`<option value="${k}" ${String(k)===String(v)?'selected':''}>${o[k]}</option>`).join('');
function flt(t){if(Q&&!(t.name+' '+(t.note||'')).toLowerCase().includes(Q.toLowerCase()))return false;if(!F)return true;const[k,v]=F.split(':');if(k==='q')return v==='pend'?isOpen(t):v==='late'?isOpen(t)&&t.due&&t.due<td():t.prio===3;if(k==='p')return t.prio===+v;if(k==='s')return t.state===v;return t.tags.includes(v)}
function taskList(){const n=td(),ts=S.tasks.filter(t=>t.list===S.cur&&!t.arch&&flt(t)).sort((a,b)=>isOpen(b)-isOpen(a)||b.prio-a.prio);
 $('#tl').innerHTML=ts.map(t=>{const m=[t.prio?'▲ '+PR[t.prio]:'',t.due?(t.due<n&&isOpen(t)?'⏰ ':'📅 ')+t.due.split('-').reverse().slice(0,2).join('/'):'',...t.tags.map(g=>'#'+esc(g))].filter(Boolean).join(' · ');
 return `<li class="${isOpen(t)?'':'dn'} ${S.active===t.id?'act':''}"><button class="ic" data-a="pick" data-id="${t.id}" title="Focar nesta">${S.active===t.id?'🎯':'○'}</button><div class="tx" translate="no"><b>${esc(t.name)}</b>${t.note?`<small>${esc(t.note)}</small>`:''}${m?`<small>${m}</small>`:''}</div><span class="cnt">🍅${t.n}/${t.est}</span><select data-st="${t.id}">${opts(ST,t.state)}</select><button class="ic" data-a="edit" data-id="${t.id}">✎</button><button class="ic" data-a="del" data-id="${t.id}">🗑</button></li>`}).join('')||'<li><span class="muted">Nada por aqui ✨</span></li>'}
function tasks(){if(!P.hidden&&P.dataset.id==='tsk')showPanel('tsk')}
function showPanel(id){P.dataset.id=id;P.hidden=false;P.className='glass '+({tsk:'right',tag:'modal',arc:'right',mus:'bottom'}[id]||'left');
 const X='<button class="ic" data-a="panel">✕</button>';let h='';
 if(id==='mus')h=`<h3>Música ${X}</h3>`+radioHtml()+linksHtml()+'<b>🎵 Playlist offline</b>'+(mn?`<div class="row"><div><span id="mt">${esc(C.music[mi]?.title||'—')}</span><span><button class="ic" data-a="mprev">⏮</button><button class="ic" data-a="mplay">⏯</button><button class="ic" data-a="mnext">⏭</button></span></div><input type="range" min="0" max="1" step=".01" value="${S.mv}" data-r="mv"></div>`:'<p class="muted">Adicione músicas em js/config.js.</p>')+'<b>🌿 Ambiente</b>'+(C.ambient.length?C.ambient.map((a,i)=>`<div class="row"><div><span>${a.icon||'🎶'} ${esc(a.title)}</span><button class="ic" data-a="atog" data-id="${i}">${A[i]&&!A[i].paused?'⏸':'▶'}</button></div><input type="range" min="0" max="1" step=".01" value="${S.amb[i]||0}" data-r="${i}"></div>`).join(''):'<p class="muted">Adicione sons em js/config.js.</p>');
 if(id==='est')h=`<h3>Estética ${X}</h3><b>Fundo</b><div class="wg">${WALLS.map((w,i)=>`<button data-a="setWall" data-id="${i}" class="${i===S.set.wall?'on':''}" style='background-image:${w.bg}'>${esc(w.title)}</button>`).join('')}</div><b>Suas fotos</b><div class="wg">${UP.map(w=>`<div class="ph"><button data-a="setWall" data-id="p:${w.id}" class="${S.set.wall==='p:'+w.id?'on':''}" style='background-image:${w.bg}'></button><button class="x" data-a="delPhoto" data-id="${w.id}">✕</button></div>`).join('')}<button data-a="photo">＋ Adicionar foto</button></div><b>Destaque</b><div class="sw">${AC.map(c=>`<button data-a="acc" data-id="${c}" style="background:${c}" class="${S.set.ac===c?'on':''}"></button>`).join('')}<button class="chip" data-a="acc" data-id="">auto</button></div>`;
 if(id==='set'){const stp=(k,l)=>`<div class="sr"><span>${l}</span><div class="stp"><button class="ic" data-a="stp" data-k="${k}" data-d="-1">−</button><b>${S.set[k]}</b><button class="ic" data-a="stp" data-k="${k}" data-d="1">+</button></div></div>`,tg=(k,l)=>`<label class="sr"><span>${l}</span><input type="checkbox" class="sw2" ${S.set[k]?'checked':''} data-s="${k}"></label>`;
  h=`<h3>Ajustes ${X}</h3><label class="sr"><span>🌐 Idioma</span><select data-lang>${[['pt','Português'],['en','English'],['es','Español']].map(([c,n])=>`<option value="${c}" ${LG===c?'selected':''}>${n}</option>`).join('')}</select></label>
<b>Duração das sessões</b>${stp('focus','Foco')}${stp('short','Descanso curto')}${stp('long','Descanso longo')}${stp('goal','Meta diária 🍅')}<div class="chips"><button class="chip" data-a="zero">Zerar contadores atuais</button></div>
<b>Início automático</b>${tg('autoBreak','Início automático: descansos')}${tg('autoFocus','Início automático: foco')}
<b>🔔 Alarme</b>${tg('alarm','Alarme')}<div class="chips">${Object.keys(SNN).map(k=>`<button class="chip ${S.set.sound===k?'on':''}" data-a="snd" data-id="${k}">${SNN[k]}</button>`).join('')}</div><label class="sr"><span>Volume</span><input type="range" min="0" max="1" step=".05" value="${S.set.vol}" data-s="vol"></label>
${tg('notif','🖥 Notificações na área de trabalho')}<div class="foot"><button class="chip" data-a="exp">⬇ exportar</button><button class="chip" data-a="imp">⬆ importar</button></div>`}
 if(id==='foco'){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()+CM);const y=d.getFullYear(),m=d.getMonth(),n=new Date(y,m+1,0).getDate(),mn_=k=>S.min[k]??(S.log[k]||0)*S.set.focus;let c='<i></i>'.repeat((d.getDay()+6)%7),tot=0;
  for(let i=1;i<=n;i++){const k=ds(new Date(y,m,i)),v=mn_(k);tot+=v;c+=`<div class="dy ${k===td()?'today':''} ${v?'has':''}"><small>${i}</small><span>${v?v+'m':'–'}</span></div>`}
  h=`<h3>Seu foco ${X}</h3><div class="cal"><button class="ic" data-a="cm" data-id="-1">‹</button><b>${d.toLocaleDateString(LC,{month:'long',year:'numeric'})}</b><button class="ic" data-a="cm" data-id="1">›</button></div><p><b>${tot} min</b> no mês · 🔥 Sequência: ${strk()}</p><div class="cg">${wk()}${c}</div>`}
 if(id==='arc'){const a=S.tasks.filter(t=>t.list===S.cur&&t.arch).sort((x,y)=>y.at.localeCompare(x.at));h=`<h3>Arquivo ${X}</h3>`+(a.length?`<ul>${a.map(t=>`<li><div class="tx" translate="no"><b>${esc(t.name)}</b><small>${t.at} · 🍅 ${t.n}</small></div><button class="ic" data-a="restore" data-id="${t.id}" title="Restaurar">↩</button><button class="ic" data-a="del" data-id="${t.id}">🗑</button></li>`).join('')}</ul>`:'<p class="muted">Nada arquivado nesta lista ainda.</p>')}
 if(id==='tag')h=`<h3><span><button class="ic" data-a="panel" data-id="tsk">←</button> Etiquetas</span>${X}</h3><div class="nt"><input id="tgn" placeholder="Nome da etiqueta…" maxlength="20"><button class="big sm" data-a="addTag">Adicionar</button></div><div class="chips">${S.tags.length?S.tags.map(g=>`<button class="chip" data-a="delTag" data-id="${esc(g)}" title="Apagar">#${esc(g)} ✕</button>`).join(''):'<p class="muted">Ainda não há etiquetas.</p>'}</div>`;
 if(id==='tsk'){const L=S.lists.map(l=>`<button class="chip ${l.id===S.cur?'on':''}" data-a="list" data-id="${l.id}" translate="no">${esc(l.name)}</button>`).join('')+'<button class="chip" data-a="newList">＋ lista</button>',fo=(v,l)=>`<option value="${v}" ${F===v?'selected':''}>${l}</option>`;
  h=`<h3>Tarefas <span><button class="ic" data-a="sb" title="Buscar">🔍</button><button class="ic" data-a="fl" title="Filtros">☰</button><button class="ic" data-a="panel" data-id="tag" title="Etiquetas">🏷</button>${X}</span></h3>
<input id="sq" placeholder="Buscar tarefas" value="${esc(Q)}" ${QO?'':'hidden'}><div class="chips">${L}</div>
<div class="nt card"><input id="tn" placeholder="Nova tarefa…" maxlength="80"><input id="tt" placeholder="Detalhes (opcional)" maxlength="200"><div id="dc">${draft()}</div><div class="chips"><label class="est">🍅<input id="te" type="number" min="1" max="20" value="1"></label><label class="est"><input type="checkbox" data-more ${D.more?'checked':''}> Adicionar mais</label><button class="big sm" data-a="addTask">Adicionar</button></div></div>
<select id="flt" ${FO?'':'hidden'}>${fo('','Todas as tarefas')}<optgroup label="Filtros rápidos">${fo('q:pend','Apenas pendentes')}${fo('q:late','Atrasadas')}${fo('q:hi','Prioridade alta')}</optgroup><optgroup label="Prioridade">${fo('p:3','Alta')}${fo('p:2','Média')}${fo('p:1','Baixa')}</optgroup><optgroup label="Estado">${Object.keys(ST).map(k=>fo('s:'+k,ST[k])).join('')}</optgroup>${S.tags.length?`<optgroup label="Etiquetas">${S.tags.map(g=>fo('t:'+g,'#'+esc(g))).join('')}</optgroup>`:''}</select>
<ul id="tl"></ul><div class="foot"><button class="chip" data-a="archive">📦 arquivar concluídas</button><button class="chip" data-a="panel" data-id="arc">ver arquivo</button><button class="chip" data-a="delList">apagar lista</button></div>`}
 P.innerHTML=h;if(id==='tsk')taskList()}
function panel(id){if(!id||(!P.hidden&&P.dataset.id===id)){P.hidden=true;return}showPanel(id)}
document.body.insertAdjacentHTML('beforeend','<div id="toast" class="glass" hidden></div>');
let tt;const toast=m=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,10000)};
const miss=f=>`Não achei ${f}. Confira o nome no config.js (maiúsculas contam) e se o arquivo foi enviado ao GitHub.`;
// áudio
const M=new Audio(),A={};let mi=0;const mn=C.music.length;
const mset=i=>{mi=(i+mn)%mn;M.src='assets/music/'+encodeURIComponent(C.music[mi].file)};
M.onended=()=>{mset(mi+1);M.play()};M.volume=S.mv;M.onerror=()=>M.getAttribute('src')&&toast(miss(decodeURIComponent(M.getAttribute('src'))));
function amb(i,v){const a=C.ambient[i];if(!a)return;const o=A[i]||(A[i]=Object.assign(new Audio('assets/ambient/'+encodeURIComponent(a.file)),{loop:true,onerror:()=>toast(miss('assets/ambient/'+a.file))}));o.volume=v;v>0?o.play().catch(()=>{}):o.pause()}

// rádio ao vivo (YouTube) — mini-player fica visível, como pedem os termos do YouTube
const R=C.radio||[{title:'Lofi Girl',channel:'UCSJ4gkVC6NrvII8umztf0Ow'}];let rOn=false;const ALL=()=>[...R,...S.links];
document.body.insertAdjacentHTML('beforeend','<div id="radio" class="glass" hidden><div class="rh"><span class="live">● AO VIVO</span><b id="rt"></b><span class="rs"><button data-a="rsize" data-id="260" title="Pequeno">P</button><button data-a="rsize" data-id="380" title="Médio">M</button><button data-a="rsize" data-id="520" title="Grande">G</button></span><button class="ic" data-a="radioOff" title="Parar rádio">✕</button></div><div class="rv"></div></div>');
function rfit(){const b=$('#radio');b.style.width=Math.min(S.rz,innerWidth-24)+'px';const w=b.offsetWidth,h=b.offsetHeight,p=S.rp||{x:innerWidth-w-16,y:innerHeight-h-16};
 p.x=Math.max(8,Math.min(innerWidth-w-8,p.x));p.y=Math.max(8,Math.min(innerHeight-h-8,p.y));b.style.left=p.x+'px';b.style.top=p.y+'px';
 b.querySelectorAll('[data-a=rsize]').forEach(x=>x.classList.toggle('on',+x.dataset.id===S.rz))}
{const h=$('#radio .rh');let dr=null;
 h.onpointerdown=e=>{if(e.target.closest('button'))return;const r=$('#radio').getBoundingClientRect();dr={x:e.clientX-r.left,y:e.clientY-r.top};h.setPointerCapture(e.pointerId);$('#radio').classList.add('drag')};
 h.onpointermove=e=>{if(dr){S.rp={x:e.clientX-dr.x,y:e.clientY-dr.y};rfit()}};
 h.onpointerup=()=>{if(dr){dr=null;$('#radio').classList.remove('drag');save()}};
 addEventListener('resize',()=>!$('#radio').hidden&&rfit())}
const yt=(f,...a)=>{const i=$('#rf');i&&i.contentWindow.postMessage(JSON.stringify({event:'command',func:f,args:a}),'*')};
function playRadio(i){const r=ALL()[i];if(!r)return;S.rs=i;save();M.pause();
 const q='autoplay=1&playsinline=1&enablejsapi=1&rel=0'+(location.protocol.startsWith('http')?'&origin='+encodeURIComponent(location.origin):'');
 const u=r.channel?`https://www.youtube.com/embed/live_stream?channel=${r.channel}&${q}`:r.video?`https://www.youtube.com/embed/${r.video}?${r.list?'list='+r.list+'&':''}${q}`:`https://www.youtube.com/embed/videoseries?list=${r.list}&${q}`;
 $('#radio').hidden=false;$('#radio .rv').innerHTML=`<iframe id="rf" src="${u}" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" title="${esc(r.title)}"></iframe>`;
 rOn=true;$('#rt').textContent=r.title;rfit();setTimeout(()=>yt('setVolume',S.rv*100),1500)}
function radioOff(){$('#radio').hidden=true;$('#radio .rv').innerHTML='';rOn=false}
M.onplay=()=>rOn&&radioOff();
const radioHtml=()=>`<b>📻 Rádio ao vivo</b><div class="row"><div class="chips">${ALL().map((r,i)=>`<button class="chip ${rOn&&i===S.rs?'on':''}" data-a="radio" data-id="${i}">${esc(r.title)}</button>`).join('')}</div><input type="range" min="0" max="1" step=".01" value="${S.rv}" data-r="rv"></div>${navigator.onLine?'':'<p class="muted">Sem internet: use a playlist offline.</p>'}`;

function wall(){const w=UP.find(x=>'p:'+x.id===S.set.wall)||WALLS[S.set.wall]||WALLS[WALLS.length-1];if(w.file){const im=new Image();im.onerror=()=>toast(miss('assets/wallpapers/'+w.file));im.src='assets/wallpapers/'+encodeURIComponent(w.file)}$('#bg').style.background=w.bg;$('#bg').style.backgroundSize='cover';$('#bg').style.backgroundPosition='center';document.documentElement.style.setProperty('--ac',S.set.ac||w.accent||'#ff8fab')}
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
 panel(d){panel(d.id)},setWall(d){S.set.wall=d.id.startsWith('p:')?d.id:+d.id;save();wall();panel('wall');panel('wall')},
 mplay(){if(!mn)return;if(!M.src)mset(0);M.paused?M.play():M.pause()},mnext(){if(mn){mset(mi+1);M.play();$('#mt').textContent=C.music[mi].title}},mprev(){if(mn){mset(mi-1);M.play();$('#mt').textContent=C.music[mi].title}},
 rsize(d){S.rz=+d.id;save();rfit()},
 radio(d){+d.id===S.rs&&rOn?radioOff():playRadio(+d.id);showPanel('mus')},radioOff(){radioOff();if(!$('#panel').hidden&&$('#panel').dataset.id==='mus'){showPanel('mus')}},
 notif(){Notification.requestPermission()},
 exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='pomo-backup-'+td()+'.json';a.click()},
 imp(){const i=document.createElement('input');i.type='file';i.accept='.json';i.onchange=async()=>{try{const d=JSON.parse(await i.files[0].text());if(d.v!==1)throw 0;S=clean({...def(),...d});save();location.reload()}catch(e){alert('Arquivo de backup inválido.')}};i.click()}};

Object.assign(act,{
 dd(d){D.open=D.open===d.id?'':d.id;rd()},pv(d){D[d.k]=d.k==='prio'?+d.v:d.v;D.open='';rd()},tg(d){const i=D.tags.indexOf(d.n);i<0?D.tags.push(d.n):D.tags.splice(i,1);rd()},dcm(d){D.cm+=+d.id;rd()},
 sb(){QO=!QO;$('#sq').hidden=!QO;QO&&$('#sq').focus()},fl(){FO=!FO;$('#flt').hidden=!FO},
 stp(d){const k=d.k;S.set[k]=Math.max(1,Math.min(k==='goal'?50:180,S.set[k]+ +d.d));if(!S.t.run&&k===S.t.m)S.t.left=dur(k);save();timer();plant();showPanel('set')},
 zero(){S.cnt={focus:0,short:0,long:0};save();timer();toast('Contadores zerados.')},snd(d){S.set.sound=d.id;save();beep(d.id);showPanel('set')},
 photo(){const i=document.createElement('input');i.type='file';i.accept='image/*';i.onchange=async()=>{const f=i.files[0];if(!f)return;if(f.size>8e6)return toast('Imagem muito grande (máx. 8 MB).');await dbx('put',{id:'i'+Date.now(),blob:f});loadUP()};i.click()},
 async delPhoto(d){await dbx('del',d.id);if(S.set.wall==='p:'+d.id){S.set.wall=0;save()}loadUP()},
 addLink(){const l=ytParse($('#lk').value);if(!l)return toast('Link do YouTube inválido.');const t=prompt('Nome para este link?','Meu link');if(t===null)return;S.links.push({title:t.trim()||'Meu link',...l});save();showPanel('mus')},
 delLink(d){S.links.splice(+d.id,1);if(S.rs>=R.length+S.links.length)S.rs=0;save();showPanel('mus')},
 setWall(d){S.set.wall=d.id.startsWith('p:')?d.id:+d.id;save();wall();showPanel('est')},acc(d){S.set.ac=d.id||null;save();wall();showPanel('est')},cm(d){CM+=+d.id;showPanel('foco')},
 atog(d){const i=+d.id,o=A[i];if(o&&!o.paused)o.pause();else{if(!S.amb[i])S.amb[i]=.5;amb(i,S.amb[i]);save()}showPanel('mus')},
 dtag(d,b){b.classList.toggle('on');const i=D.tags.indexOf(d.id);i<0?D.tags.push(d.id):D.tags.splice(i,1)},
 addTask(){const n=$('#tn').value.trim();if(!n)return $('#tn').focus();const t={id:'t'+Date.now(),list:S.cur,name:n,note:$('#tt').value.trim(),est:Math.max(1,+$('#te').value||1),n:0,state:D.state,prio:D.prio,due:D.due,tags:[...D.tags]};S.tasks.push(t);if(!S.active&&isOpen(t))S.active=t.id;if(!D.more)Object.assign(D,{state:'todo',prio:0,due:'',tags:[]});D.open='';save();showPanel('tsk');timer();$('#tn').focus()},
 addTag(){const n=$('#tgn').value.trim().replace(/\s+/g,'-');if(n&&!S.tags.includes(n))S.tags.push(n);save();showPanel('tag')},
 delTag(d){S.tags=S.tags.filter(x=>x!==d.id);S.tasks.forEach(t=>t.tags=t.tags.filter(x=>x!==d.id));if(F==='t:'+d.id)F='';save();showPanel('tag')},
 edit(d){const t=S.tasks.find(x=>x.id===d.id),n=prompt('Nome',t.name);if(n===null)return;const e=parseInt(prompt('Pomodoros previstos',t.est)),p=prompt('Prioridade (0 nenhuma, 1 baixa, 2 média, 3 alta)',t.prio);t.name=n.trim()||t.name;if(e>0)t.est=e;if(['0','1','2','3'].includes(p))t.prio=+p;save();tasks()},
 archive(){const c=S.tasks.filter(t=>t.list===S.cur&&t.state==='done'&&!t.arch);if(!c.length)return toast('Nenhuma tarefa concluída para arquivar.');c.forEach(t=>{t.arch=1;t.at=td()});if(c.some(t=>t.id===S.active))S.active=null;save();tasks();timer()},
 restore(d){const t=S.tasks.find(x=>x.id===d.id);delete t.arch;t.state='todo';save();showPanel('arc')},
 del(d){if(confirm('Apagar de vez?')){S.tasks=S.tasks.filter(x=>x.id!==d.id);S=clean(S);save();timer();P.dataset.id==='arc'?showPanel('arc'):tasks()}}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&act[b.dataset.a])act[b.dataset.a](b.dataset,b)});
document.addEventListener('input',e=>{const r=e.target.dataset.r,s=e.target.dataset.s;if(e.target.id==='sq'){Q=e.target.value;taskList()}if(e.target.dataset.q==='tg'){const v=e.target.value.toLowerCase();document.querySelectorAll('#dc .it[data-n]').forEach(x=>x.hidden=!x.dataset.n.toLowerCase().includes(v))}
 if(r==='rv'){S.rv=+e.target.value;yt('setVolume',S.rv*100);save()}else if(r==='mv'){S.mv=M.volume=+e.target.value;save()}else if(r!==undefined){S.amb[r]=+e.target.value;amb(r,S.amb[r]);save()}
 if(s){S.set[s]=e.target.type==='checkbox'?e.target.checked:e.target.type==='range'?+e.target.value:Math.max(1,+e.target.value||1);if(s==='notif'&&S.set.notif&&'Notification'in window)Notification.requestPermission();if(!S.t.run&&s===S.t.m)S.t.left=dur(s);save();timer();plant()}});
document.addEventListener('change',e=>{const t=e.target,k=t.dataset.st;
 if(k){const x=S.tasks.find(y=>y.id===k);x.state=t.value;if(!isOpen(x)&&S.active===k)S.active=null;save();taskList();timer()}
 if(t.id==='flt'){F=t.value;taskList()}
 if(t.dataset.more!==undefined)D.more=t.checked;if(t.dataset.lang!==undefined){S.set.lang=t.value;save();location.reload()}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='tn')act.addTask();if(e.key==='Enter'&&e.target.id==='tgn')act.addTag();if(e.key==='Enter'&&e.target.id==='lk')act.addLink();
 if(e.code==='Space'&&!/INPUT|BUTTON|SELECT|TEXTAREA/.test(e.target.tagName)){e.preventDefault();act.go()}});
wall();plant();timer();setInterval(timer,250);loadUP();
})();