/* Animated drawings. Each stage is a pure function of time t, drawn in its own virtual size and scaled to fit. */
(function(){
const C={paper:'#F2F3F6',sheet:'#FCFCFD',card:'#FFFFFF',ink:'#1D1D1F',ink2:'#4D525E',ink3:'#7E8491',hair:'#D4D8DF',grid:'#E3E6EB',
  exp:'#0071E3',ctl:'#7C4DDB',exe:'#0E8F86',kno:'#B86E00',tel:'#C23B83',ok:'#1F8A4C',bad:'#D7372C',bee:'#FFD60A'};
const FM='"IBM Plex Mono", Consolas, monospace', FD='"Big Shoulders Display", Impact, sans-serif', FB='Newsreader, Georgia, serif';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const io=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const eo=x=>1-Math.pow(1-x,3);
const back=x=>{const c1=1.7,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const lerp=(a,b,k)=>a+(b-a)*k;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

function path(g,x,y,w,h,r){g.beginPath();if(w<0){x+=w;w=-w}if(h<0){y+=h;h=-h}r=Math.max(0,Math.min(r,w/2,h/2));g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function box(g,x,y,w,h,r,fill,stroke,lw){path(g,x,y,w,h,r);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw||1;g.stroke()}}
function tx(g,s,x,y,o){o=o||{};g.font=(o.w||500)+' '+(o.s||12)+'px '+(o.f||FM);g.fillStyle=o.c||C.ink;g.textAlign=o.a||'left';g.textBaseline=o.b||'middle';
  if('letterSpacing' in g)g.letterSpacing=(o.ls||0)+'px';g.fillText(s,x,y);if('letterSpacing' in g)g.letterSpacing='0px'}
function line(g,x1,y1,x2,y2,c,lw,dash){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokeStyle=c;g.lineWidth=lw||1;g.setLineDash(dash||[]);g.stroke();g.setLineDash([])}
function dot(g,x,y,r,c){g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=c;g.fill()}
function bee(g,x,y,s,a){s=s||1;g.save();g.globalAlpha*=a==null?1:a;box(g,x,y,30*s,18*s,4*s,C.bee);tx(g,'@B',x+15*s,y+9.5*s,{s:11*s,w:600,a:'center'});g.restore()}
function cursor(g,x,y,press){g.save();g.translate(x,y);if(press)g.scale(.86,.86);g.beginPath();g.moveTo(0,0);g.lineTo(0,17);g.lineTo(4.5,13);g.lineTo(8,20);g.lineTo(10.5,19);g.lineTo(7,12);g.lineTo(12.5,12);g.closePath();g.fillStyle=C.ink;g.fill();g.strokeStyle='#fff';g.lineWidth=1.4;g.stroke();g.restore()}

const TOOLS=[{n:'Jira',k:'ticket',c:C.exp,f:'AC-2 unmet'},{n:'Bitbucket',k:'code',c:C.exe,f:'diff +14 −3'},{n:'Jenkins',k:'build',c:C.exe,f:'stage: contract'},
  {n:'Rafay',k:'deploy',c:C.exe,f:'pod restarted'},{n:'Grafana',k:'chart',c:C.tel,f:'p95 spike 10:01'},{n:'Confluence',k:'docs',c:C.kno,f:'runbook §4'},{n:'Teams',k:'chat',c:C.ctl,f:'"who owns this?"'}];

/* small window contents */
function glyph(g,k,x,y,w,h,c,t){
  g.save();path(g,x,y,w,h,0);g.clip();
  if(k==='ticket'){for(let i=0;i<4;i++){const yy=y+8+i*((h-12)/4);box(g,x+8,yy,8,8,2,i===1?C.bad:i<1?C.ok:C.hair);box(g,x+22,yy+2,(w-34)*(i%2?.62:.82),4,2,C.grid)}}
  else if(k==='code'){const ws=[.5,.72,.36,.8,.6,.44];for(let i=0;i<6;i++){const yy=y+6+i*((h-8)/6);if(i===2||i===3)box(g,x+4,yy-1,w-8,7,1,i===2?'#E5F4EA':'#FBE7E5');box(g,x+10+(i%3)*6,yy+1,(w-30)*ws[i],3.5,2,i===2?C.ok:i===3?C.bad:'#C9CED6')}}
  else if(k==='build'){const n=5,bw=(w-16-(n-1)*4)/n;for(let i=0;i<n;i++){const col=i<3?C.ok:i===3?C.bad:C.hair;box(g,x+8+i*(bw+4),y+h/2-10,bw,20,3,col);}}
  else if(k==='deploy'){for(let i=0;i<3;i++){const bx=x+8+i*((w-16)/3);box(g,bx,y+8,(w-16)/3-5,h-16,4,C.sheet,C.hair);for(let j=0;j<3;j++)dot(g,bx+8+j*8,y+18,2.5,i===1&&j===2?C.bad:C.ok)}}
  else if(k==='chart'){g.beginPath();for(let i=0;i<=20;i++){const xx=x+6+i*(w-12)/20,v=Math.sin(i*.7+(t||0)*2)*.18+(i===14?.42:0)+(i===15?.2:0);g.lineTo(xx,y+h*.7-v*h)}g.strokeStyle=c;g.lineWidth=1.6;g.stroke();line(g,x+6,y+h*.82,x+w-6,y+h*.82,C.hair,1)}
  else if(k==='docs'){box(g,x+8,y+7,w*.5,6,2,C.ink3);for(let i=0;i<4;i++)box(g,x+8,y+19+i*8,(w-16)*(i===3?.5:.9),3.5,2,C.grid)}
  else if(k==='chat'){box(g,x+8,y+7,w*.55,12,6,C.grid);box(g,x+w*.38,y+23,w*.54,12,6,'#E9E3FA');box(g,x+8,y+39,w*.42,12,6,C.grid)}
  g.restore();
}
function win(g,x,y,w,h,tool,o){o=o||{};g.save();g.globalAlpha*=o.a==null?1:o.a;
  box(g,x+2,y+4,w,h,7,'rgba(29,29,31,.06)');
  box(g,x,y,w,h,7,C.card,o.hot?C.ink:C.hair,o.hot?1.6:1);
  path(g,x,y,w,20,7);g.save();g.clip();g.fillStyle=C.sheet;g.fillRect(x,y,w,20);g.restore();line(g,x,y+20,x+w,y+20,C.hair,1);
  box(g,x+8,y+6.5,7,7,2,tool.c);tx(g,tool.n,x+20,y+10.5,{s:10,w:600,c:C.ink2});
  if(o.ca!==0){g.globalAlpha*=o.ca==null?1:o.ca;glyph(g,tool.k,x+2,y+22,w-4,h-24,tool.c,o.t)}
  g.restore()}

/* ---------- HERO: seven tools fold into one window ---------- */
const hero={w:960,h:600,loop:14,still:9.6,draw(g,t,el){
  const A=Math.min(seg(t,0,.5),1-seg(t,13.2,14));g.globalAlpha=A;
  const cx=480,cy=318,rx=330,ry=200,ww=150,wh=96;
  const sc=TOOLS.map((tl,i)=>{const a=-Math.PI*.92+i*(Math.PI*1.84/6);return{x:cx+Math.cos(a)*rx-ww/2,y:cy+Math.sin(a)*ry*.95-wh/2+ (i%2?18:-6)}});
  // phase A: hops
  const hopT=i=>.6+i*.62;
  let hops=0;for(let i=0;i<7;i++)if(t>=hopT(i))hops=i+1;
  const fold=seg(t,4.9,6.3);
  const pathA=1-seg(t,4.7,5.2);
  if(pathA>0){g.save();g.globalAlpha*=pathA;g.setLineDash([4,5]);g.strokeStyle=C.ink3;g.lineWidth=1.2;g.beginPath();
    for(let i=0;i<hops;i++){const p=sc[i];i?g.lineTo(p.x+ww/2,p.y+wh/2):g.moveTo(p.x+ww/2,p.y+wh/2)}
    if(hops>0&&hops<7){const k=io(seg(t,hopT(hops-1)+.1,hopT(hops)));const a=sc[hops-1],b=sc[hops];g.lineTo(lerp(a.x,b.x,k)+ww/2,lerp(a.y,b.y,k)+wh/2)}
    g.stroke();g.restore()}
  // vector window
  const vx=170,vy=74,vw=620,vh=440;
  const fk=io(seg(t,4.7,5.7));
  if(fk>0){g.save();g.globalAlpha*=fk;const s=lerp(.94,1,fk);g.translate(cx,vy+vh/2);g.scale(s,s);g.translate(-cx,-(vy+vh/2));
    box(g,vx+3,vy+8,vw,vh,12,'rgba(29,29,31,.08)');box(g,vx,vy,vw,vh,12,C.card,C.ink,1.4);
    path(g,vx,vy,vw,34,12);g.save();g.clip();g.fillStyle=C.sheet;g.fillRect(vx,vy,vw,34);g.restore();line(g,vx,vy+34,vx+vw,vy+34,C.hair);
    box(g,vx+12,vy+9,16,16,4,C.ink);tx(g,'V',vx+20,vy+17.5,{f:FD,w:800,s:13,c:'#fff',a:'center'});tx(g,'VECTOR',vx+36,vy+17.5,{f:FD,w:800,s:15});
    box(g,vx+104,vy+8,74,18,9,'#E7F0FC',C.exp);dot(g,vx+116,vy+17,3.5,C.exp);tx(g,'dev',vx+126,vy+17.5,{s:10.5,w:600,c:C.exp});
    tx(g,'LPA-118',vx+vw-16,vy+17.5,{s:10.5,c:C.ink3,a:'right'});
    line(g,vx+160,vy+34,vx+160,vy+vh,C.hair);
    g.restore()}
  // tools: scatter -> rail
  TOOLS.forEach((tool,i)=>{
    const k=io(seg(t,4.95+i*.07,6.15+i*.07));
    const bob=(1-k)*Math.sin(t*1.3+i)*4;
    const rxp=vx+12,ryp=vy+50+i*50;
    const x=lerp(sc[i].x,rxp,k),y=lerp(sc[i].y,ryp,k)+bob,w=lerp(ww,136,k),h=lerp(wh,38,k);
    const hot=(hops===i+1&&t<4.8)||(lit(i,t)>0);
    if(k<.98) win(g,x,y,w,h,tool,{hot:hot&&k<.5,ca:1-k*1.6,t});
    if(k>0){g.save();g.globalAlpha*=seg(k,.55,1);const L=lit(i,t);
      box(g,rxp,ryp,136,38,7,L>0?'#FFFBE0':C.card,L>0?C.ink:C.hair,L>0?1.4:1);box(g,rxp+10,ryp+15,8,8,2,tool.c);tx(g,tool.n,rxp+26,ryp+19.5,{s:11,w:600,c:C.ink2});g.restore()}
  });
  // cursor
  if(t<4.9){let p;if(hops===0)p={x:cx,y:cy+40};else if(hops<7){const k=io(seg(t,hopT(hops-1)+.1,hopT(hops)));const a=sc[hops-1],b=sc[hops];p={x:lerp(a.x,b.x,k)+ww/2,y:lerp(a.y,b.y,k)+wh/2}}else p={x:sc[6].x+ww/2,y:sc[6].y+wh/2};
    g.save();g.globalAlpha*=1-seg(t,4.5,4.9);cursor(g,p.x,p.y,(t-hopT(Math.max(0,hops-1)))<.12);g.restore()}
  // counter
  const tabs=t<5.6?hops:1;
  if(el){const ce=el.querySelector('.corner');if(ce){const s=t<5.6?('tabs open · '+tabs):'tabs open · 1';if(ce.textContent!==s)ce.textContent=s}}
  if(t<4.9&&hops){g.save();g.globalAlpha*=1-seg(t,4.4,4.9);box(g,cx-120,cy-24,240,48,8,C.ink);tx(g,'Why did LPA-118 fail in sit?',cx,cy+1,{s:12.5,w:500,c:'#fff',a:'center'});g.restore()}
  // phase C: @B answers
  const cxL=vx+180,cw=vw-200;
  const pk=eo(seg(t,6.3,6.9));
  if(pk>0){g.save();g.globalAlpha*=pk;
    tx(g,'Good morning.',cxL,vy+66,{f:FD,w:800,s:24});
    box(g,cxL,vy+86,cw,48,10,C.sheet,C.ink,1.2);bee(g,cxL+12,vy+101);
    const q='Why did LPA-118 fail in sit?';const n=Math.floor(clamp((t-6.9)/1.1)*q.length);tx(g,q.slice(0,n)+((t*2|0)%2&&t<8.4?'|':''),cxL+52,vy+111,{s:13,c:C.ink});
    g.restore()}
  const ak=eo(seg(t,8.3,8.9));
  if(ak>0){g.save();g.globalAlpha*=ak;const ay=vy+150+(1-ak)*10;
    box(g,cxL,ay,cw,212,10,C.card,C.hair);bee(g,cxL+14,ay+14,.9);tx(g,'Contract test failed at stage 4.',cxL+50,ay+23,{s:12.5,w:600});
    const lw=[.92,.78,.86,.5];lw.forEach((v,i)=>{const k=eo(seg(t,8.6+i*.18,9.2+i*.18));box(g,cxL+16,ay+50+i*16,(cw-32)*v*k,6,3,C.grid)});
    tx(g,'SOURCES',cxL+16,ay+128,{s:9.5,w:600,c:C.ink3,ls:1.2});
    const src=[[2,'Jenkins console'],[1,'Bitbucket diff'],[4,'Grafana p95'],[5,'Runbook §4']];let sx=cxL+16;
    src.forEach(([ti,lab],j)=>{const k=eo(seg(t,9.3+j*.35,9.7+j*.35));g.font='500 10.5px '+FM;const w=g.measureText(lab).width+30;
      g.save();g.globalAlpha*=k;box(g,sx,ay+140,w,24,12,C.sheet,TOOLS[ti].c,1.2);box(g,sx+9,ay+148.5,7,7,2,TOOLS[ti].c);tx(g,lab,sx+21,ay+152.5,{s:10.5,c:C.ink2});g.restore();sx+=w+8});
    const bk=back(seg(t,10.9,11.5));if(bk>0){g.save();g.globalAlpha*=clamp(bk);const bx=cxL+16,by=ay+176;box(g,bx,by,190,26,6,C.ink);tx(g,'Open the fix in CodeX  →',bx+95,by+13.5,{s:11,w:600,c:'#fff',a:'center'});g.restore()}
    g.restore()}
  function lit(i,t){const m={2:9.3,1:9.65,4:10,5:10.35};return m[i]!=null&&t>m[i]&&t<12.6?1:0}
}};

/* ---------- 01: count the hops ---------- */
const hops={w:760,h:520,loop:10,still:8,draw(g,t,el){
  const mode=el?el.dataset.mode:'today';
  const A=Math.min(seg(t,0,.4),1-seg(t,9.5,10));g.globalAlpha=A;
  tx(g,'QUESTION',40,62,{s:10,w:600,c:C.ink3,ls:1.2});
  box(g,40,74,360,40,8,C.ink);tx(g,'Why did LPA-118 fail in sit?',58,94.5,{s:13,c:'#fff'});
  if(mode==='today'){
    const pos=[];const ww=150,wh=92;
    for(let i=0;i<7;i++){const r=i<4?0:1,c=i<4?i:i-4;pos.push({x:40+c*172+(r?86:0),y:144+r*122})}
    const hT=i=>.5+i*.8;let h=0;for(let i=0;i<7;i++)if(t>=hT(i))h=i+1;
    g.save();g.setLineDash([4,5]);g.strokeStyle=C.ink3;g.lineWidth=1.2;g.beginPath();
    for(let i=0;i<h;i++){const p=pos[i];i?g.lineTo(p.x+ww/2,p.y+wh/2):g.moveTo(p.x+ww/2,p.y+wh/2)}g.stroke();g.restore();
    TOOLS.forEach((tl,i)=>{win(g,pos[i].x,pos[i].y,ww,wh,tl,{hot:i<h,t});if(i<h){dot(g,pos[i].x+ww-10,pos[i].y+10,9,C.ink);tx(g,String(i+1),pos[i].x+ww-10,pos[i].y+10.5,{s:10,w:600,c:'#fff',a:'center'})}});
    // fragments fly to tray
    const ty=410;box(g,40,ty,680,78,10,C.sheet,C.ink3,1.2);g.save();g.setLineDash([5,4]);path(g,40,ty,680,78,10);g.strokeStyle=C.ink3;g.stroke();g.restore();
    tx(g,'YOU, STITCHING IT TOGETHER',56,ty+16,{s:9.5,w:600,c:C.ink3,ls:1.2});
    let fx=56;TOOLS.forEach((tl,i)=>{const k=io(seg(t,hT(i)+.2,hT(i)+.75));g.font='500 10.5px '+FM;const w=g.measureText(tl.f).width+18;
      if(k>0){const sx=pos[i].x+20,sy=pos[i].y+wh-10;const x=lerp(sx,fx,k),y=lerp(sy,ty+46,k)-Math.sin(k*Math.PI)*30;box(g,x,y-11,w,22,11,C.card,tl.c,1.2);tx(g,tl.f,x+9,y+.5,{s:10.5,c:C.ink2})}
      fx+=w+6});
    stat(g,'SWITCHES',Math.max(0,h-1)+'',560,'TABS',h+'');
  }else{
    const vx=40,vy=136,vw=680,vh=352;
    box(g,vx,vy,vw,vh,12,C.card,C.ink,1.4);path(g,vx,vy,vw,30,12);g.save();g.clip();g.fillStyle=C.sheet;g.fillRect(vx,vy,vw,30);g.restore();line(g,vx,vy+30,vx+vw,vy+30,C.hair);
    box(g,vx+12,vy+8,14,14,3,C.ink);tx(g,'VECTOR',vx+34,vy+15.5,{f:FD,w:800,s:14});box(g,vx+100,vy+6,64,18,9,'#E7F0FC',C.exp);tx(g,'sit',vx+132,vy+15.5,{s:10.5,w:600,c:C.exp,a:'center'});
    const gx=vx+16,gy=vy+46,cw=(vw-32-6*8)/7;
    TOOLS.forEach((tl,i)=>{const k=eo(seg(t,.5+i*.16,.9+i*.16));const x=gx+i*(cw+8);g.save();g.globalAlpha*=.35+.65*k;
      box(g,x,gy,cw,70,7,k>.5?'#FFFBE0':C.sheet,k>.5?tl.c:C.hair,1.2);box(g,x+8,gy+10,7,7,2,tl.c);tx(g,tl.n,x+8,gy+32,{s:9.5,w:600,c:C.ink2});glyph(g,tl.k,x+4,gy+40,cw-8,26,tl.c,t);g.restore()});
    const ay=gy+90;const ak=eo(seg(t,2,2.6));g.save();g.globalAlpha*=ak;
    box(g,gx,ay,vw-32,196,10,C.card,C.hair);bee(g,gx+14,ay+14,.9);tx(g,'The contract test failed at stage 4. Here is why.',gx+50,ay+23,{s:12.5,w:600});
    let fx=gx+16,fy=ay+56;TOOLS.forEach((tl,i)=>{const k=io(seg(t,2.6+i*.2,3.2+i*.2));g.font='500 10.5px '+FM;const w=g.measureText(tl.f).width+18;if(fx+w>gx+vw-48){fx=gx+16;fy+=32}
      const sx=gx+i*(cw+8)+10,sy=gy+60;if(k>0){const x=lerp(sx,fx,k),y=lerp(sy,fy,k);box(g,x,y-11,w,22,11,C.card,tl.c,1.2);tx(g,tl.f,x+9,y+.5,{s:10.5,c:C.ink2})}fx+=w+6});
    const bk=back(seg(t,4.6,5.2));if(bk>0){g.globalAlpha*=clamp(bk);box(g,gx+16,ay+150,200,28,6,C.ink);tx(g,'Open the fix in CodeX  →',gx+116,ay+164.5,{s:11,w:600,c:'#fff',a:'center'})}
    g.restore();
    stat(g,'SWITCHES','0',560,'TABS','1');
  }
  function stat(g,a,av,x,b,bv){tx(g,a,x,62,{s:10,w:600,c:C.ink3,ls:1.2});tx(g,av,x,96,{f:FD,w:800,s:44});tx(g,b,x+90,62,{s:10,w:600,c:C.ink3,ls:1.2});tx(g,bv,x+90,96,{f:FD,w:800,s:44})}
}};

/* ---------- rules ---------- */
const ENVS=[['dev',C.exp],['sit',C.exe],['uat',C.kno],['perf',C.tel],['cte',C.ctl],['prod',C.bad]];
const r1={w:400,h:250,loop:9,still:2,draw(g,t){
  const step=1.5,i=Math.floor(t/step)%6,f=t%step,prev=(i+5)%6;
  const px=i=>24+i*60,py=44;
  ENVS.forEach(([n],j)=>{box(g,px(j),py,52,24,12,C.card,C.hair);tx(g,n,px(j)+26,py+12.5,{s:11,w:500,c:C.ink3,a:'center'})});
  const k=io(clamp(f/.5));const hx=lerp(px(prev),px(i),i===0?1:k);
  box(g,hx,py,52,24,12,ENVS[i][1]);tx(g,ENVS[i][0],hx+26,py+12.5,{s:11,w:600,c:'#fff',a:'center'});
  ['CodeX','Jenkins','Logs'].forEach((n,j)=>{const x=24+j*122,y=96,w=110,h=124;const d=.25+j*.14;const kk=clamp((f-d)/.35);const cur=kk>=.5?i:prev;const sy=Math.abs(1-2*kk);
    box(g,x,y,w,h,8,C.card,C.hair);tx(g,n,x+10,y+16,{s:10,w:600,c:C.ink2});
    g.save();g.translate(x+34,y+38);g.scale(1,i===0&&f<d?1:(kk>0&&kk<1?Math.max(.05,sy):1));box(g,-22,-9,48,18,9,ENVS[cur][1]);tx(g,ENVS[cur][0],2,.5,{s:10,w:600,c:'#fff',a:'center'});g.restore();
    for(let r=0;r<3;r++)box(g,x+10,y+60+r*16,(w-20)*[.8,.6,.9][r],6,3,C.grid);
    line(g,x,y+h-2,x+w,y+h-2,ENVS[cur][1],3)});
}};
const r2={w:400,h:250,loop:7,still:2.6,draw(g,t){
  box(g,20,44,160,180,10,C.card,C.hair);tx(g,'Vector · CodeX',32,62,{s:10,w:600,c:C.ink2});line(g,20,76,180,76,C.hair);
  for(let r=0;r<5;r++)box(g,32,92+r*16,[100,80,120,70,96][r],5,3,C.grid);
  box(g,220,44,160,180,10,C.card,C.hair);box(g,232,56,8,8,2,C.ctl);tx(g,'Teams · #lpa-squad',246,62,{s:10,w:600,c:C.ink2});line(g,220,76,380,76,C.hair);
  const go=io(seg(t,.8,2.2)),ret=io(seg(t,4.2,5.6));const k=go-ret;
  const sx=110,sy=180,ex=300,ey=110;const x=lerp(sx,ex,k),y=lerp(sy,ey,k)-Math.sin(k*Math.PI)*70;
  g.save();g.setLineDash([2,5]);g.strokeStyle=C.kno;g.lineWidth=1.4;g.beginPath();g.moveTo(sx+15,sy+9);g.quadraticCurveTo((sx+ex)/2+15,Math.min(sy,ey)-80,ex+15,ey+9);g.stroke();g.restore();
  const b1=eo(seg(t,2.3,2.7)),b2=eo(seg(t,2.9,3.3));
  if(b1>0){g.save();g.globalAlpha*=b1;box(g,232,92,136,22,11,C.grid);tx(g,'why did sit fail?',242,103.5,{s:10,c:C.ink2});g.restore()}
  if(b2>0){g.save();g.globalAlpha*=b2;box(g,232,136,140,44,8,'#FFFBE0',C.bee,1.2);tx(g,'Contract test, stage 4.',241,150,{s:9.5,c:C.ink});tx(g,'Same thread as CodeX.',241,166,{s:9.5,c:C.ink3});g.restore()}
  box(g,32,196,136,18,9,'#FFFBE0');tx(g,'thread · LPA-118',100,205.5,{s:9.5,w:600,c:C.kno,a:'center'});
  bee(g,x,y,1.1);
}};
const r3={w:400,h:250,loop:5,still:2.4,draw(g,t){
  const S=[['Ticket',C.exp],['@B answer',C.kno],['Alert',C.tel]],T=[['CodeX',C.exe],['Build',C.exe],['Deploy',C.exe]];
  const map=[[0,0],[1,0],[1,1],[2,2]];
  S.forEach(([n,c],i)=>{const y=52+i*64;box(g,20,y,110,34,8,C.card,C.hair);box(g,32,y+13,8,8,2,c);tx(g,n,46,y+17.5,{s:11,w:600,c:C.ink2})});
  map.forEach(([a,b],j)=>{const y1=69+a*64,y2=69+b*64;g.save();g.setLineDash([5,5]);g.lineDashOffset=-t*20;g.strokeStyle=C.ink3;g.lineWidth=1.2;g.beginPath();g.moveTo(130,y1);g.bezierCurveTo(200,y1,200,y2,270,y2);g.stroke();g.restore();
    const k=((t*.5+j*.27)%1);const bz=(p0,p1,p2,p3,k)=>Math.pow(1-k,3)*p0+3*Math.pow(1-k,2)*k*p1+3*(1-k)*k*k*p2+k*k*k*p3;dot(g,bz(130,200,200,270,k),bz(y1,y1,y2,y2,k),4,C.exe)});
  T.forEach(([n],i)=>{const y=52+i*64;const glow=.5+.5*Math.sin(t*4+i);box(g,270,y,110,34,8,C.ink);tx(g,n,325,y+17.5,{f:FD,w:800,s:16,c:'#fff',a:'center'});g.save();g.globalAlpha=.25*glow;box(g,266,y-4,118,42,10,null,C.exe,2);g.restore()});
}};
const r4={w:400,h:250,loop:10,still:1.2,draw(g,t){
  const looks=['VS Code','Jenkins','Rafay','Grafana'];const i=Math.floor(t/2.5)%4,f=t%2.5;const a=f<.3?f/.3:1;
  const x=24,y=36,w=352,h=172;
  draw(i,a);if(f<.3)draw((i+3)%4,1-a);
  box(g,x,y,w,h,8,null,C.hair);
  box(g,140,220,120,22,11,C.ink);tx(g,'looks like '+looks[i],200,231.5,{s:10,w:600,c:'#fff',a:'center'});
  function draw(i,al){g.save();g.globalAlpha*=al;path(g,x,y,w,h,8);g.clip();
    if(i===0){g.fillStyle='#1F1F1F';g.fillRect(x,y,w,h);g.fillStyle='#181818';g.fillRect(x,y,34,h);g.fillStyle='#252526';g.fillRect(x+34,y,90,h);
      for(let r=0;r<6;r++)box(g,x+42,y+14+r*14,[60,44,70,52,38,64][r],4,2,'#3C3C3C');
      const cs=['#569CD6','#CE9178','#DCDCAA','#9CDCFE','#C586C0','#6A9955','#4EC9B0','#D4D4D4'];for(let r=0;r<9;r++){box(g,x+136+(r%3)*10,y+14+r*16,[90,120,70,150,100,60,130,80,110][r],5,2,cs[r%8])}
      g.fillStyle='#007ACC';g.fillRect(x,y+h-12,w,12)}
    else if(i===1){g.fillStyle='#fff';g.fillRect(x,y,w,h);g.fillStyle='#F2F2F2';g.fillRect(x,y,w,24);tx(g,'Jenkins',x+12,y+12.5,{s:10,w:600,c:'#333'});
      for(let r=0;r<3;r++)for(let c=0;c<5;c++){const col=r===0&&c===3?'#F5B7B1':(c>3&&r===0?'#EEE':'#C8E6C9');box(g,x+16+c*66,y+42+r*40,60,32,2,col)}}
    else if(i===2){g.fillStyle='#F7F8FA';g.fillRect(x,y,w,h);for(let c=0;c<3;c++){box(g,x+14+c*112,y+16,102,140,8,'#fff','#E2E5EA');tx(g,['dev-east','dev-west','sit-east'][c],x+24+c*112,y+32,{s:9.5,w:600,c:'#333'});for(let j=0;j<6;j++)dot(g,x+30+c*112+(j%3)*18,y+60+Math.floor(j/3)*18,5,c===2&&j===4?C.kno:'#34A853')}}
    else{g.fillStyle='#111217';g.fillRect(x,y,w,h);for(let c=0;c<2;c++){box(g,x+10+c*170,y+10,162,150,4,'#181B1F','#2A2D33');g.beginPath();for(let j=0;j<=30;j++){const xx=x+18+c*170+j*5,v=Math.sin(j*.5+t*1.5+c)*14+(c===0&&j>20?-24:0);g.lineTo(xx,y+100+v)}g.strokeStyle=c?'#73BF69':'#F2CC0C';g.lineWidth=1.6;g.stroke()}}
    g.restore()}
}};
const r5={w:400,h:250,loop:8,still:3,draw(g,t){
  box(g,24,30,352,112,10,C.card,C.ink,1.2);bee(g,38,44);tx(g,'Restart pod lpa-api-7f9 in sit?',78,53.5,{s:12,w:600});
  tx(g,'Uses your access. Logged to the audit trail.',38,80,{s:10,c:C.ink3});
  const click=2.3,done=t>click+.2;
  if(!done){box(g,38,98,92,30,6,C.ink);tx(g,'Approve',84,113.5,{s:11,w:600,c:'#fff',a:'center'});box(g,138,98,86,30,6,C.card,C.hair);tx(g,'Not now',181,113.5,{s:11,c:C.ink2,a:'center'})}
  else{const k=back(seg(t,click+.2,click+.7));g.save();g.globalAlpha*=clamp(k);box(g,38,98,250,30,6,'#E8F5EC',C.ok,1.2);
    g.beginPath();g.moveTo(52,113);g.lineTo(58,119);g.lineTo(70,106);g.strokeStyle=C.ok;g.lineWidth=2.4;g.stroke();tx(g,'Approved by you · on the record',80,113.5,{s:10.5,w:600,c:C.ok});g.restore()}
  const ck=io(seg(t,.8,2.1));const cx=lerp(360,80,ck),cy=lerp(232,112,ck);
  if(t>click&&t<click+.45){const r=(t-click)/.45;g.save();g.globalAlpha=1-r;g.beginPath();g.arc(84,113,8+r*26,0,7);g.strokeStyle=C.ink;g.lineWidth=2;g.stroke();g.restore()}
  const lk=eo(seg(t,3.6,4.2));g.save();g.globalAlpha*=lk;box(g,24,158+(1-lk)*10,352,58,10,C.sheet,C.hair);
  const lx=44,ly=176+(1-lk)*10;box(g,lx-6,ly+2,16,13,3,C.ctl);g.beginPath();g.arc(lx+2,ly+2,5,Math.PI,0);g.strokeStyle=C.ctl;g.lineWidth=2;g.stroke();
  tx(g,'Promote to prod',70,ly+4,{s:12,w:600});tx(g,'Waits for the product owner and tech lead.',70,ly+22,{s:10,c:C.ink3});g.restore();
  if(t<click+1.2)cursor(g,cx,cy,t>click&&t<click+.15);
}};

const STAGES={hero,hops,r1,r2,r3,r4,r5};
function mount(el){
  const S=STAGES[el.dataset.stage];if(!S)return;
  const cv=document.createElement('canvas');el.prepend(cv);const g=cv.getContext('2d');
  let W=0,H=0,dpr=1,vis=false,raf=0,t0=performance.now();
  function paint(){const t=RM?S.still:(performance.now()-t0)/1000;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
    const k=Math.min(W/S.w,H/S.h);g.translate((W-S.w*k)/2,(H-S.h*k)/2);g.scale(k,k);g.globalAlpha=1;S.draw(g,S.loop?t%S.loop:t,el)}
  function size(){const r=el.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);paint()}
  function loop(){raf=0;if(!vis)return;paint();if(!RM)raf=requestAnimationFrame(loop)}
  new ResizeObserver(size).observe(el);
  new IntersectionObserver(e=>{vis=e[e.length-1].isIntersecting;if(vis&&!raf)loop()},{rootMargin:'80px'}).observe(el);
  el._restart=()=>{t0=performance.now();paint()};
  document.fonts&&document.fonts.ready.then(paint);
}
window.mountStages=()=>document.querySelectorAll('[data-stage]').forEach(mount);
})();
