(function(){
const D=window.VDATA, RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const bee=s=>esc(s).replace(/@B/g,'<span class="bee">@B</span>');
const mmss=t=>{t=Math.max(0,Math.floor(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const SC={};D.scenes.forEach(s=>SC[s.id]=s);
const CHC={meet:'exp',open:'exp',why:'exp',morning:'exp',work:'exp',build:'exe',ship:'exe','break':'bad',watch:'tel',know:'kno',teach:'ctl',teams:'ok',control:'ctl',close:'exp'};
const CV={exp:'#0071E3',exe:'#0E8F86',bad:'#D7372C',tel:'#C23B83',kno:'#B86E00',ctl:'#7C4DDB',ok:'#1F8A4C'};
const CHN={};D.chapters.forEach(c=>CHN[c.id]=c.name);
const deckId=id=>id==='title'?'cover':id;

window.mountStages();

/* reveal */
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}}),{rootMargin:'0px 0px -10% 0px'});
document.querySelectorAll('.rv,#say,#fan').forEach(el=>rio.observe(el));

/* nav + progress */
const navA=[...document.querySelectorAll('.bar nav a')];const prog=$('.progress');
const nio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){navA.forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-45% 0px -50% 0px'});
document.querySelectorAll('main section[id]').forEach(s=>nio.observe(s));
addEventListener('scroll',()=>{const h=document.documentElement;prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'},{passive:true});

/* hops toggle */
const hopsEl=$('#hops');
hopsEl.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>{hopsEl.dataset.mode=b.dataset.mode;
  hopsEl.querySelectorAll('.seg button').forEach(x=>x.setAttribute('aria-pressed',x===b));hopsEl._restart&&hopsEl._restart()}));

/* camera */
class Cam{
  constructor(el){this.el=el;this.layer=el.querySelector('.layer');this.imgs=[...this.layer.querySelectorAll('img')];this.front=0;
    this.spot=el.querySelector('.spot');this.lab=el.querySelector('.label');this.shot=null;this.box=null;this.tok=0;
    new ResizeObserver(()=>this.apply(this.box,true)).observe(el)}
  apply(box,instant){const W=this.el.clientWidth,H=this.el.clientHeight;let s=1,tx=0,ty=0;
    if(box){const[x0,y0,x1,y1]=box;const bw=(x1-x0)/100,bh=(y1-y0)/100;s=Math.max(1,Math.min(1/(bw*1.28),1/(bh*1.5),3.2));
      const cx=(x0+x1)/200*W,cy=(y0+y1)/200*H;tx=Math.min(0,Math.max(W-W*s,W/2-cx*s));ty=Math.min(0,Math.max(H-H*s,H/2-cy*s));
      Object.assign(this.spot.style,{left:x0+'%',top:y0+'%',width:(x1-x0)+'%',height:(y1-y0)+'%'})}
    if(instant){this.layer.style.transition='none';this.spot.style.transition='none'}
    this.layer.style.transform=`translate(${tx}px,${ty}px) scale(${s})`;this.layer.style.setProperty('--inv',(1/s).toFixed(4));
    this.spot.style.boxShadow=`0 0 0 ${2/s}px #1D1D1F,0 0 0 4000px rgba(29,29,31,.42)`;
    this.el.classList.toggle('focus',!!box);
    if(instant){this.layer.offsetWidth;this.layer.style.transition='';this.spot.style.transition=''}}
  async go(shot,box,n,label){const tok=++this.tok;
    if(shot!==this.shot){
      if(this.shot&&this.box){this.box=null;this.apply(null);await wait(RM?0:650);if(tok!==this.tok)return}
      const next=this.imgs[1-this.front];next.src='shots/'+shot+'.webp';
      try{await next.decode()}catch(e){}
      if(tok!==this.tok)return;
      next.style.opacity=1;this.imgs[this.front].style.opacity=0;this.front=1-this.front;this.shot=shot;
      if(box)await wait(RM?0:420);if(tok!==this.tok)return}
    this.box=box;this.apply(box);
    if(this.lab){this.lab.querySelector('.n').textContent=n?String(n).padStart(2,'0'):'';this.lab.querySelector('.t').textContent=label||''}
  }
}
document.querySelectorAll('.cam img').forEach((im,i)=>im.style.opacity=i%2?0:1);

/* film control, used everywhere */
const video=$('#video');let filmOK=true;
function playFilm(t,sceneId){if(!filmOK){$('#film').scrollIntoView({behavior:RM?'auto':'smooth'});return}
  $('#film').scrollIntoView({behavior:RM?'auto':'smooth'});try{video.currentTime=t;video.play().catch(()=>{})}catch(e){}}
window.playFilm=playFilm;
function filmBtn(t,id){return `<button type="button" class="lk" data-t="${t}" data-sid="${id}"><span class="tri"></span>Film ${mmss(t)}</button>`}
function slideLink(id){return `<a class="lk" href="deck.html#${deckId(id)}" target="_blank" rel="noopener">Slide</a>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b){playFilm(+b.dataset.t,b.dataset.sid)}});

/* 03 story */
const MOM=[['Thu','home',3],['Thu','ticket',1],['Thu','codex',3],['Thu','jenkins',2],['Thu','rafay',3],['Thu','logs',2],['Thu','failed',1],['Thu','health',1],['Thu','skills',1],
  ['Fri','teams1',2],['Fri','teams1',4],['Fri','promote',3],['Fri','teams2',3],['Fri','audit',3]];
const DAY={Thu:['Thursday','RCS-118 goes from ticket to working in dev, with proof for every criterion.'],Fri:['Friday','A sit failure is explained, fixed, approved and healthy in forty minutes, all in Teams.']};
const steps=$('#steps');let lastDay='';const moments=[];
MOM.forEach(([d,id,li],i)=>{const s=SC[id],l=s.lines[li];const clock=(s.clock||'').replace(/^(Thursday|Friday) · /,'');
  if(d!==lastDay){lastDay=d;const m=document.createElement('li');m.className='daymark';m.innerHTML=`<div>${DAY[d][0]}<small>${bee(DAY[d][1])}</small></div>`;steps.append(m)}
  const c=CV[CHC[s.ch]];
  const li2=document.createElement('li');li2.className='step';li2.style.setProperty('--sc',c);li2.dataset.i=i;
  li2.innerHTML=`<div class="card"><time>${esc(clock)} · ${esc(CHN[s.ch])}</time><h3>${bee(s.title)}</h3><p>${bee(l.cap)}</p><div class="act">${filmBtn(l.t,id)}${slideLink(id)}</div></div>`;
  steps.append(li2);moments.push({d,s,l,clock,c,el:li2})});
const scam=new Cam($('#storyCam'));const clockT=$('#clockT'),clockD=$('#clockD'),chip=$('#storyChip'),scap=$('#storyCap');
let cur=-1,prevClock='';
function setClock(str){const old=prevClock;prevClock=str;clockT.innerHTML='';[...str].forEach((ch,i)=>{const sp=document.createElement('span');sp.className='dg';sp.textContent=ch;clockT.append(sp);
  if(!RM&&old[i]!==ch&&old)sp.animate([{transform:'translateY(100%)'},{transform:'none'}],{duration:600,delay:i*60,easing:'cubic-bezier(.65,0,.35,1)',fill:'backwards'})})}
function activate(i){if(i===cur)return;cur=i;const m=moments[i];
  moments.forEach((x,j)=>x.el.classList.toggle('on',j===i));
  setClock(m.clock);clockD.textContent=DAY[m.d][0];chip.textContent=CHN[m.s.ch];chip.style.background=m.c;
  scap.innerHTML=bee(m.l.cap);scam.go(m.s.shot,m.l.box,m.l.n,m.l.label)}
const sio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)activate(+e.target.dataset.i)}),{rootMargin:'-48% 0px -48% 0px'});
moments.forEach(m=>sio.observe(m.el));
activate(0);

/* 04 explorer */
const EXCH=D.chapters.filter(c=>D.scenes.some(s=>s.ch===c.id&&s.shot));
const tabs=$('#chtabs'),strip=$('#strip'),vcam=new Cam($('#vCam')),pins=$('#vCam .pins'),parts=$('#vParts');
let ex={ch:null,id:null,p:-1,play:false,timer:0};
EXCH.forEach((c,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.className='c-'+CHC[c.id];b.dataset.ch=c.id;
  b.innerHTML=`<i></i>${String(D.chapters.indexOf(c)).padStart(2,'0')} ${bee(c.name)}`;b.onclick=()=>{stopPlay();pickCh(c.id)};tabs.append(b)});
function pickCh(ch,id){ex.ch=ch;tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-selected',b.dataset.ch===ch));
  const list=D.scenes.filter(s=>s.ch===ch&&s.shot);strip.innerHTML='';
  list.forEach(s=>{const b=document.createElement('button');b.type='button';b.dataset.id=s.id;b.innerHTML=`<img src="thumbs/${s.shot}.webp" alt="" loading="lazy"><span>${esc(s.clock)}<br>${bee(s.title)}</span>`;
    b.onclick=()=>{stopPlay();pickScreen(s.id)};strip.append(b)});
  pickScreen(id||list[0].id)}
function pickScreen(id){const s=SC[id];ex.id=id;ex.p=-1;
  document.querySelector('.explore').style.setProperty('--c',CV[CHC[s.ch]]);
  strip.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===id));
  const sb=strip.querySelector(`[data-id="${id}"]`);if(sb)strip.scrollTo({left:sb.offsetLeft-strip.offsetLeft-8,behavior:RM?'auto':'smooth'});
  $('#vClock').textContent=s.clock;$('#vTitle').innerHTML=bee(s.title);
  const P=s.lines.filter(l=>l.n);pins.innerHTML='';parts.innerHTML='';
  P.forEach((l,j)=>{const[x0,y0,x1,y1]=l.box;const p=document.createElement('button');p.type='button';p.className='pin';p.textContent=l.n;p.style.left=(x0+x1)/2+'%';p.style.top=(y0+y1)/2+'%';
    p.setAttribute('aria-label',l.label);p.onclick=()=>{stopPlay();part(j)};pins.append(p);
    const li=document.createElement('li');li.innerHTML=`<button type="button"><span class="n">${l.n}</span><span><b>${bee(l.label)}</b><small>${bee(l.cap)}</small></span></button>`;
    li.firstChild.onclick=()=>{stopPlay();part(j)};parts.append(li)});
  $('#vLinks').innerHTML=filmBtn(s.start,id)+slideLink(id);
  if(ex.ready){try{history.replaceState(null,'','#s-'+id)}catch(e){}}
  part(-1)}
function part(j){const s=SC[ex.id],P=s.lines.filter(l=>l.n);ex.p=j;
  parts.querySelectorAll('button').forEach((b,k)=>b.classList.toggle('on',k===j));pins.querySelectorAll('.pin').forEach((b,k)=>b.classList.toggle('on',k===j));
  if(j<0){vcam.go(s.shot,null);$('#vCap').innerHTML=bee(s.lines[0].cap)}else{const l=P[j];vcam.go(s.shot,l.box,l.n,l.label);$('#vCap').innerHTML=bee(l.cap)}}
function step(dir){const s=SC[ex.id],P=s.lines.filter(l=>l.n);let j=ex.p+dir;
  if(j>=P.length||j<-1){const all=D.scenes.filter(x=>x.shot);let k=all.findIndex(x=>x.id===ex.id)+(dir>0?1:-1);if(k<0||k>=all.length)return false;const n=all[k];
    if(n.ch!==ex.ch)pickCh(n.ch,n.id);else pickScreen(n.id);if(dir<0){part(n.lines.filter(l=>l.n).length-1)}return true}
  part(j);return true}
const bar=$('#vBar');
function tick(){clearTimeout(ex.timer);if(!ex.play)return;const ms=ex.p<0?3000:4600;
  bar.style.transition='none';bar.style.width='0';bar.offsetWidth;bar.style.transition=`width ${ms}ms linear`;bar.style.width='100%';
  ex.timer=setTimeout(()=>{if(!ex.play)return;if(step(1))tick();else stopPlay()},ms)}
function stopPlay(){ex.play=false;clearTimeout(ex.timer);$('#vPlay').setAttribute('aria-pressed','false');$('#vPlay').textContent='Play';bar.style.transition='none';bar.style.width='0'}
$('#vPlay').onclick=()=>{if(ex.play){stopPlay();return}ex.play=true;$('#vPlay').setAttribute('aria-pressed','true');$('#vPlay').textContent='Pause';tick()};
$('#vNext').onclick=()=>{stopPlay();step(1)};$('#vPrev').onclick=()=>{stopPlay();step(-1)};$('#vAll').onclick=()=>{stopPlay();part(-1)};
$('#vCam').addEventListener('click',e=>{if(!e.target.closest('.pin')&&ex.p>=0){stopPlay();part(-1)}});
const hs=(location.hash||'').match(/^#s-([\w-]+)/);
if(hs&&SC[hs[1]]&&SC[hs[1]].shot){pickCh(SC[hs[1]].ch,hs[1]);setTimeout(()=>$('#explore').scrollIntoView(),50)}else pickCh(EXCH[0].id);
ex.ready=true;

/* 05 film */
const chaps=$('#chaps');
D.chapters.forEach((c,i)=>{const li=document.createElement('li');const first=D.scenes.find(s=>s.ch===c.id);
  li.innerHTML=`<button type="button" data-t="${c.start}" data-sid="${first.id}"><span class="k">${String(i).padStart(2,'0')}</span><b>${bee(c.name)}</b><time>${mmss(c.start)}</time></button>`;chaps.append(li)});
const cbtn=[...chaps.querySelectorAll('button')];
function fail(){const e=video.error;if(e&&e.code===1)return;$('#fallback').hidden=false;$('#fErr').textContent=e?' (code '+e.code+')':''}
[...video.querySelectorAll('source')].pop().addEventListener('error',()=>setTimeout(()=>{if(video.networkState===3)fail()},0));video.addEventListener('error',fail);
video.addEventListener('playing',()=>{$('#fallback').hidden=true});
$('#fRetry').onclick=()=>{$('#fallback').hidden=true;video.load();video.play().catch(()=>{})};
video.addEventListener('timeupdate',()=>{const t=video.currentTime;let k=0;D.chapters.forEach((c,i)=>{if(t>=c.start-.05)k=i});
  cbtn.forEach((b,i)=>b.classList.toggle('on',i===k));$('#fNow').innerHTML=bee(D.chapters[k].name);$('#fTime').textContent=mmss(t)+' / '+mmss(D.total)});
cbtn[0].classList.add('on');

/* 06 deck chips */
const dc=$('#deckch');D.chapters.forEach((c,i)=>{if(c.id==='meet')return;const first=D.scenes.find(s=>s.ch===c.id);const a=document.createElement('a');a.className='tag';a.href='deck.html#'+deckId(first.id);a.target='_blank';a.rel='noopener';
  a.innerHTML=`<i style="color:${CV[CHC[c.id]]}"></i>${String(i).padStart(2,'0')} ${bee(c.name)}`;dc.append(a)});

/* 07 counters */
const st=$('#stats');new IntersectionObserver((es,o)=>{if(!es[0].isIntersecting)return;o.disconnect();if(RM)return;
  st.querySelectorAll('b[data-n]').forEach(b=>{const n=+b.dataset.n,t0=performance.now();(function f(){const k=Math.min(1,(performance.now()-t0)/1400);b.textContent=Math.round(n*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)})()})},{threshold:.4}).observe(st);
})();
