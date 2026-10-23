'use strict';
const cv=document.getElementById('c'),g=cv.getContext('2d');let W,H,S,DPR;
function rs(){DPR=Math.min(devicePixelRatio||1,2);cv.width=innerWidth*DPR;cv.height=innerHeight*DPR;W=1024;H=768;S=Math.min(cv.width/W,cv.height/H);}
addEventListener('resize',rs);rs();
const rnd=(a,b)=>a+Math.random()*(b-a),cl=(v,a,b)=>v<a?a:v>b?b:v;
// ---------- AUDIO ----------
let AC=null,master,musOn=true,musT=0,musStep=0,musStyle=0;
function au(){if(AC)return;AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.5;master.connect(AC.destination);}
function tone(f,d,type='square',v=.15,sl=0,dl=0){if(!AC)return;const t=AC.currentTime+dl,o=AC.createOscillator(),a=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(20,sl),t+d);a.gain.setValueAtTime(v,t);a.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(a);a.connect(master);o.start(t);o.stop(t+d+.02);}
function noise(d,v=.2,hp=800){if(!AC)return;const b=AC.createBuffer(1,AC.sampleRate*d,AC.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*(1-i/x.length);const s=AC.createBufferSource(),f=AC.createBiquadFilter(),a=AC.createGain();f.type='highpass';f.frequency.value=hp;a.gain.value=v;s.buffer=b;s.connect(f);f.connect(a);a.connect(master);s.start();}
const SFX={shot:()=>tone(880,.08,'square',.06,440),hit:()=>{noise(.08,.12,2000)},boom:()=>{noise(.4,.3,200);tone(120,.3,'sine',.3,40)},coin:()=>{tone(988,.06,'square',.08);tone(1319,.12,'square',.08,0,.06)},click:()=>tone(660,.05,'triangle',.12),win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,.25,'square',.1,0,i*.12)),lose:()=>[392,330,262,196].forEach((f,i)=>tone(f,.3,'sawtooth',.08,0,i*.15)),slash:()=>{noise(.12,.15,3000);tone(300,.1,'sawtooth',.06,900)}};
const PROG=[[0,5,3,4],[0,3,4,6],[5,3,0,4]];const SC=[220,247,262,294,330,349,392,440];
function music(dt){if(!AC||!musOn)return;musT-=dt;if(musT>0)return;const bpm=128,st=60/bpm/4;musT+=st;const p=PROG[musStyle%3],ch=p[Math.floor(musStep/16)%4],s=musStep%16;
 if(s%4==0)tone(SC[ch]/4,.25,'sawtooth',.09);if(s%4==2)tone(SC[ch]/2,.12,'sawtooth',.05);
 if(s%4==0){tone(150,.15,'sine',.25,45)}if(s%8==4)noise(.15,.12,1500);if(s%2==1)noise(.03,.04,7000);
 if([0,3,6,10,12].includes(s))tone(SC[(ch+[0,2,4,2,7][[0,3,6,10,12].indexOf(s)])%8]*2,.18,'square',.035);musStep++;}
function buzz(ms){shake=Math.max(shake,ms/25);try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}
// ---------- FX ----------
let P=[],shake=0,FT=[];
function burst(x,y,c,n=14,sp=200){for(let i=0;i<n;i++){const a=rnd(0,6.28),v=rnd(.2,1)*sp;P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:rnd(.3,.8),m:.8,c,r:rnd(2,5)})}}
function ftext(x,y,t,c='#ffe066'){FT.push({x,y,t,c,l:1})}
function fx(dt){for(const p of P){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.l-=dt}P=P.filter(p=>p.l>0);for(const f of FT){f.y-=40*dt;f.l-=dt}FT=FT.filter(f=>f.l>0);
 g.globalCompositeOperation='lighter';for(const p of P){g.globalAlpha=cl(p.l/p.m,0,1);g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.r,0,6.28);g.fill()}g.globalCompositeOperation='source-over';g.globalAlpha=1;
 g.textAlign='center';for(const f of FT){g.globalAlpha=cl(f.l,0,1);txt(f.t,f.x,f.y,22,f.c)}g.globalAlpha=1;}
function txt(t,x,y,sz,c='#fff',al='center'){g.font=`900 ${sz}px system-ui,-apple-system,sans-serif`;g.textAlign=al;g.lineWidth=sz/6;g.strokeStyle='rgba(0,0,0,.7)';g.strokeText(t,x,y);g.fillStyle=c;g.fillText(t,x,y);}
function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function btn(x,y,w,h,label,c1,c2,sz=26){const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,c1);gr.addColorStop(1,c2);rr(x,y,w,h,h/3);g.fillStyle=gr;g.fill();g.save();g.clip();g.fillStyle='rgba(255,255,255,.35)';rr(x+6,y+4,w-12,h*.4,h/4);g.fill();g.restore();g.lineWidth=3;g.strokeStyle='rgba(255,255,255,.6)';rr(x,y,w,h,h/3);g.stroke();txt(label,x+w/2,y+h/2+sz*.35,sz);}
// ---------- HEROINE (glossy latex-look bodysuit, heroic) ----------
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,gg=n>>8&255,b=n&255;const f=v=>cl(Math.round(k>0?v+(255-v)*k:v*(1+k)),0,255);return `rgb(${f(r)},${f(gg)},${f(b)})`}
function gloss(x,y,w,h,col){const gr=g.createLinearGradient(x,y,x+w,y+h*.3);gr.addColorStop(0,shade(col,-.55));gr.addColorStop(.35,shade(col,.1));gr.addColorStop(.5,shade(col,.75));gr.addColorStop(.62,shade(col,0));gr.addColorStop(1,shade(col,-.7));return gr;}
function limb(x1,y1,x2,y2,w,col){g.strokeStyle=gloss(Math.min(x1,x2)-w,y1,Math.abs(x2-x1)+w*2,y2-y1,col);g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=w*.18;g.beginPath();g.moveTo(x1-w*.2,y1+2);g.lineTo(x2-w*.2,y2-2);g.stroke();}
// h: {col,hair,skin,weapon} ; st: 'idle'|'walk'|'attack'
// realistic sprite heroines with code animation; skins = selective hue shift (no ctx.filter, works on iPadOS 17)
const IMG=[0,1,2,3,4].map(i=>{const im=new Image();im.src='h'+i+'.webp';im.onload=()=>im.ok=1;return im});
const VC={};const BHUE=[355,225,275,-1,150];
function hx2hsl(hex){const n=parseInt(hex.slice(1),16);return rgb2hsl(n>>16,n>>8&255,n&255)}
function rgb2hsl(r,g2,b){r/=255;g2/=255;b/=255;const mx=Math.max(r,g2,b),mn=Math.min(r,g2,b),l=(mx+mn)/2;let h=0,s2=0;if(mx!=mn){const d=mx-mn;s2=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx==r?(g2-b)/d+(g2<b?6:0):mx==g2?(b-r)/d+2:(r-g2)/d+4;h*=60}return[h,s2,l]}
function hsl2rgb(h,s2,l){h=((h%360)+360)%360/360;if(!s2)return[l*255,l*255,l*255];const q=l<.5?l*(1+s2):l+s2-l*s2,p=2*l-q,f=t=>{t<0&&(t+=1);t>1&&(t-=1);return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p};return[f(h+1/3)*255,f(h)*255,f(h-1/3)*255]}
function variant(i,k,small){const key=i+'_'+k+(small?'s':'');if(VC[key])return VC[key];const im=IMG[i];if(!im.ok)return null;
 const hh=small?260:im.height,ww=Math.round(im.width*hh/im.height),c=document.createElement('canvas');c.width=ww;c.height=hh;const x=c.getContext('2d');x.drawImage(im,0,0,ww,hh);
 if(k>0){const d=x.getImageData(0,0,ww,hh),p=d.data,[th,ts,tl]=hx2hsl(SKC[i][k]),bh=BHUE[i];
  for(let j=0;j<p.length;j+=4){if(p[j+3]<10)continue;const[h,s2,l]=rgb2hsl(p[j],p[j+1],p[j+2]);let m=0;
   if(bh<0){if(s2<.3&&l<.4)m=1}else{let dh=Math.abs(h-bh);dh=Math.min(dh,360-dh);if(dh<(i==0?16:30)&&s2>(i==0?.45:.3))m=1}
   if(m){let r;if(bh<0)r=hsl2rgb(th,Math.max(ts,.6),l*.6+tl*.35);else r=ts<.15?hsl2rgb(0,0,cl(l*1.25+.1,0,1)):hsl2rgb(th,s2,cl(l*(.7+tl*.6),0,1));p[j]=r[0];p[j+1]=r[1];p[j+2]=r[2]}}
  x.putImageData(d,0,0)}
 return VC[key]=c}
function heroine(x,y,s,h,t,st='idle',face=1){const i=HER.indexOf(h),k=save.skins[i]||0,dh=135*s,small=dh<200,c=variant(i,k,small);if(!c)return;
 const dw=dh*c.width/c.height,br=Math.sin(t*2.2),wk=st=='walk'?Math.sin(t*9):0,at=st=='attack'?Math.max(0,Math.sin(t*10)):0;
 g.save();g.translate(x+face*at*10*s,y-Math.abs(wk)*4*s);g.scale(face,1);
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,Math.abs(wk)*4*s,dw*.32,6*s,0,0,6.28);g.fill();
 g.rotate(Math.sin(t*1.3)*.012+wk*.03+at*.08);g.scale(1+br*.006,1+br*.012);
 if(at>0){g.globalCompositeOperation='lighter';g.globalAlpha=at*.5;const gr=g.createRadialGradient(0,-dh*.5,0,0,-dh*.5,dh*.6);gr.addColorStop(0,h.col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(-dh*.6,-dh*1.1,dh*1.2,dh*1.2);g.globalAlpha=1;g.globalCompositeOperation='source-over'}
 g.drawImage(c,-dw/2,-dh,dw,dh);g.restore();}
const HER=[{name:'Рубина',col:'#e0153a',hair:'#1b0d1a',skin:'#f3c9a8',acc:'#ffd34d',weapon:'sword'},{name:'Сапфира',col:'#1d4fe0',hair:'#f2e1a0',skin:'#f6d4bb',acc:'#cfe8ff',weapon:'bow'},{name:'Аметиста',col:'#8a1fd6',hair:'#2b0f3f',skin:'#e8b996',acc:'#8ff',weapon:'staff'},{name:'Оникс',col:'#2a2a33',hair:'#c2185b',skin:'#d9a07c',acc:'#ff4fa3',weapon:'sword'},{name:'Изумруда',col:'#0fa564',hair:'#6b2e10',skin:'#f3c9a8',acc:'#ffe066',weapon:'bow'}];
// ---------- BACKGROUNDS ----------
const stars=Array.from({length:120},()=>({x:rnd(0,1024),y:rnd(0,420),r:rnd(.5,2),p:rnd(0,6)}));
function sky(t,c1,c2,c3){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,c1);gr.addColorStop(.6,c2);gr.addColorStop(1,c3);g.fillStyle=gr;g.fillRect(0,0,W,H);
 for(const s of stars){g.globalAlpha=.5+.5*Math.sin(t*2+s.p);g.fillStyle='#fff';g.fillRect(s.x,s.y,s.r,s.r)}g.globalAlpha=1;
 g.fillStyle='rgba(255,180,255,.12)';g.beginPath();g.arc(800,150,90,0,6.28);g.fill();g.fillStyle='rgba(255,220,255,.5)';g.beginPath();g.arc(800,150,50,0,6.28);g.fill();}
function hills(t,col,y0,amp,sp){g.fillStyle=col;g.beginPath();g.moveTo(0,H);for(let x=0;x<=W;x+=16)g.lineTo(x,y0+Math.sin((x+t*sp)*.01)*amp+Math.sin((x+t*sp)*.023)*amp*.5);g.lineTo(W,H);g.fill();}
// ---------- INPUT ----------
let taps=[],ptr={x:0,y:0,down:false};
function toG(e){const r=cv.getBoundingClientRect(),ox=(cv.width-W*S)/2/DPR,oy=(cv.height-H*S)/2/DPR;return{x:((e.clientX-r.left)-ox)/(S/DPR),y:((e.clientY-r.top)-oy)/(S/DPR)}}
cv.addEventListener('pointerdown',e=>{au();if(AC.state=='suspended')AC.resume();const p=toG(e);ptr={...p,down:true};taps.push(p);e.preventDefault()});
cv.addEventListener('pointermove',e=>{const p=toG(e);ptr.x=p.x;ptr.y=p.y});cv.addEventListener('pointerup',()=>ptr.down=false);
const hit=(p,x,y,w,h)=>p.x>=x&&p.x<=x+w&&p.y>=y&&p.y<=y+h;
let save=Object.assign({gems:0,coins:0,best:{},daily:'',skins:{},owned:{},upg:{td:0,war:0,run:0}},JSON.parse(localStorage.getItem('lh')||'{}'));
const SKC=[['#e0153a','#ff7a00','#ffd23a'],['#1d4fe0','#00b4d8','#c0c8d8'],['#8a1fd6','#ff4fa3','#ffffff'],['#2a2a33','#5a0b2a','#0b3a5a'],['#0fa564','#7ac70f','#d4af37']];
const BASEC=HER.map(h=>h.col);function applySkins(){HER.forEach((h,i)=>{h.col=SKC[i][save.skins[i]||0]})}applySkins();const SV=()=>localStorage.setItem('lh',JSON.stringify(save));
// ---------- SCENES ----------
let scene='menu',T=0;const SCN={};
function go(s){scene=s;P=[];FT=[];SCN[s].init&&SCN[s].init();musStyle={menu:0,td:1,war:2,run:0,shop:1}[s]||0;SFX.click();}
SCN.menu={draw(dt){applySkins();sky(T,'#14002e','#5a0b5e','#ff6a88');hills(T,'#2d0a3a',560,30,10);hills(T,'#1a0524',620,25,25);
 txt('ЛАКОВЫЕ ГЕРОИНИ',W/2,110,64,'#ffd6f5');txt('Выбери битву',W/2,155,26,'#ffe066');
 HER.forEach((h,i)=>heroine(170+i*170,560+Math.sin(T+i)*3,1.9,h,T+i*.7,'idle',i<2?1:-1));
 const B=[['🏰 Башни','td','#ff4fa3','#8a0b52'],['⚔️ Воительницы','war','#4f8bff','#0b2a8a'],['🌙 Бег','run','#38e0a0','#0b6a4a'],['🛍️ Магазин','shop','#ffb84f','#8a4a0b']];
 B.forEach((b,i)=>{const x=37+i*245,y=200;btn(x,y,215,90,b[0],b[2],b[3],26);for(const p of taps)if(hit(p,x,y,215,90))go(b[1])});
 txt('💎 '+save.gems+'   🪙 '+save.coins,40,50,26,'#8ff','left');if(save.daily!=new Date().toDateString())txt('🎁 Подарок в магазине!',W/2,185,20,'#ffe066');btn(870,20,130,50,musOn?'🔊 Музыка':'🔇 Тихо','#666','#222',18);for(const p of taps)if(hit(p,870,20,130,50))musOn=!musOn;
 if(Math.random()<.3)P.push({x:rnd(0,W),y:H,vx:rnd(-10,10),vy:-rnd(60,140),l:3,m:3,c:'#ff9ee8',r:rnd(1,3)});}};
// ---- TOWER DEFENSE ----
const PATH=[[0,300],[220,300],[220,560],[480,560],[480,200],[760,200],[760,480],[1024,480]];
function pathPt(d){let acc=0;for(let i=0;i<PATH.length-1;i++){const[a,b]=[PATH[i],PATH[i+1]],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(acc+L>=d){const k=(d-acc)/L;return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,b[0]<a[0]?-1:1]}acc+=L}return null}
const SLOTS=[[120,220],[320,460],[320,640],[580,640],[580,300],[380,130],[660,120],[860,300],[660,400],[880,560],[120,400],[880,130]];
SCN.td={init(){this.g=150+100*save.upg.td;this.lv=20+5*save.upg.td;this.w=0;this.en=[];this.tw=[];this.bl=[];this.cd=2;this.left=0;this.sel=-1;this.over=0;},
 draw(dt){const s=this;sky(T,'#0c1a3a','#3a2a6a','#6a3a7a');
  g.fillStyle='#2b5a3a';g.fillRect(0,90,W,H);for(let i=0;i<40;i++){g.fillStyle='rgba(120,255,160,.08)';g.beginPath();g.arc((i*137)%W,100+(i*251)%680,30,0,6.28);g.fill()}
  g.lineCap='round';g.lineJoin='round';g.strokeStyle='#6b4a8a';g.lineWidth=70;g.beginPath();PATH.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();g.strokeStyle='#9b7ac0';g.lineWidth=54;g.stroke();
  if(!s.over){ if(s.left<=0&&s.en.length==0){s.cd-=dt;if(s.cd<=0){s.w++;s.left=6+s.w*2;s.cd=.7;ftext(W/2,380,'Волна '+s.w,'#ff9ee8');if(s.w>15){s.over=2;SFX.win();save.gems+=50;save.coins+=150;SV();}}}
   else if(s.left>0){s.cd-=dt;if(s.cd<=0){s.cd=Math.max(.35,1-s.w*.04);s.left--;const boss=s.left==0&&s.w%5==0,hp=(20+s.w*12)*(boss?8:1);s.en.push({d:0,hp,mx:hp,sp:boss?40:60+s.w*2,boss,ph:rnd(0,6)})}}}
  for(const e of s.en){if(!s.over)e.d+=e.sp*dt;const p=pathPt(e.d);if(!p){e.dead=1;s.lv-=e.boss?5:1;buzz(80);SFX.hit();if(s.lv<=0){s.lv=0;s.over=1;SFX.lose()}continue}e.x=p[0];e.y=p[1];
   const r=e.boss?34:18,bb=Math.sin(T*8+e.ph)*3;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(e.x,e.y+r*.8,r,r*.3,0,0,6.28);g.fill();
   const gr=g.createRadialGradient(e.x-r*.3,e.y-r*.4+bb,2,e.x,e.y+bb,r);gr.addColorStop(0,'#fff');gr.addColorStop(.3,e.boss?'#ff5a5a':'#7affc0');gr.addColorStop(1,e.boss?'#600':'#085');g.fillStyle=gr;g.beginPath();g.ellipse(e.x,e.y+bb,r,r*.85,0,0,6.28);g.fill();
   g.fillStyle='#000';g.beginPath();g.arc(e.x-r*.3+p[2]*3,e.y-r*.2+bb,r*.15,0,6.28);g.arc(e.x+r*.3+p[2]*3,e.y-r*.2+bb,r*.15,0,6.28);g.fill();
   g.fillStyle='#300';g.fillRect(e.x-r,e.y-r-10,r*2,5);g.fillStyle='#f44';g.fillRect(e.x-r,e.y-r-10,r*2*e.hp/e.mx,5);}
  SLOTS.forEach((sl,i)=>{if(!s.tw.find(t=>t.i==i)){g.strokeStyle=s.sel==i?'#ffe066':'rgba(255,255,255,.35)';g.lineWidth=3;g.setLineDash([6,6]);g.beginPath();g.arc(sl[0],sl[1],34,0,6.28);g.stroke();g.setLineDash([]);txt('+',sl[0],sl[1]+10,30,'rgba(255,255,255,.6)')}});
  for(const t of s.tw){const h=HER[t.h],rg=150+t.lvl*25;t.cd-=dt;let tg=null,bd=-1;for(const e of s.en)if(!e.dead&&Math.hypot(e.x-t.x,e.y-t.y)<rg&&e.d>bd){bd=e.d;tg=e}
   g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.arc(t.x,t.y+20,36,0,6.28);g.fill();g.fillStyle=gloss(t.x-30,t.y,60,30,'#b08cd8');rr(t.x-30,t.y+10,60,26,10);g.fill();
   if(tg&&t.cd<=0&&!s.over){t.cd=[.45,.3,.9,.6,.35][t.h]/(1+t.lvl*.25);t.at=.25;t.face=tg.x<t.x?-1:1;s.bl.push({x:t.x+t.face*20,y:t.y-60,tg,dmg:[14,9,30,18,10][t.h]*(1+t.lvl*.6),c:h.col,spl:t.h==2});SFX.shot()}
   t.at-=dt;heroine(t.x,t.y+20,.9,h,T+t.i,t.at>0?'attack':'idle',t.face||1);for(let k=0;k<t.lvl;k++)txt('★',t.x-12+k*12,t.y+50,14,'#ffe066');}
  for(const b of s.bl){const dx=b.tg.x-b.x,dy=b.tg.y-b.y,d=Math.hypot(dx,dy);if(d<12||b.tg.dead){b.dead=1;if(!b.tg.dead){if(b.spl){for(const e of s.en)if(Math.hypot(e.x-b.tg.x,e.y-b.tg.y)<70)e.hp-=b.dmg;burst(b.tg.x,b.tg.y,'#8ff',20,250);shake=4;SFX.boom()}else b.tg.hp-=b.dmg;burst(b.tg.x,b.tg.y,b.c,6,120)}continue}
   b.x+=dx/d*700*dt;b.y+=dy/d*700*dt;g.fillStyle='#fff';g.shadowColor=b.c;g.shadowBlur=14;g.beginPath();g.arc(b.x,b.y,b.spl?7:4,0,6.28);g.fill();g.shadowBlur=0;}
  for(const e of s.en)if(e.hp<=0&&!e.dead){e.dead=1;const gg=e.boss?60:5+Math.floor(s.w/2);s.g+=gg;ftext(e.x,e.y-20,'+'+gg);burst(e.x,e.y,e.boss?'#f66':'#7fc',e.boss?50:18,260);SFX.coin();if(e.boss)buzz(200)}
  s.en=s.en.filter(e=>!e.dead);s.bl=s.bl.filter(b=>!b.dead);
  // castle
  g.fillStyle=gloss(960,380,60,120,'#ff4fa3');rr(965,400,55,110,8);g.fill();txt('🏰',995,470,46);
  // HUD
  g.fillStyle='rgba(10,0,30,.75)';g.fillRect(0,0,W,80);txt('💰 '+s.g,20,52,30,'#ffe066','left');txt('❤️ '+s.lv,220,52,30,'#ff8aa8','left');txt('Волна '+s.w+'/15',400,52,30,'#cfe8ff','left');btn(880,14,124,52,'Меню','#888','#333',22);
  if(s.sel>=0){const sl=SLOTS[s.sel],ex=s.tw.find(t=>t.i==s.sel);g.fillStyle='rgba(10,0,30,.9)';rr(40,640,944,116,20);g.fill();
   if(ex){const cost=60*(ex.lvl+1);btn(80,662,400,72,ex.lvl<3?'Улучшить ★ ('+cost+'💰)':'Максимум',ex.lvl<3&&s.g>=cost?'#ffb84f':'#666','#7a4a0b',24);btn(540,662,400,72,'Продать (+'+(30+ex.lvl*30)+')','#ff6a6a','#7a0b0b',24);}
   else HER.forEach((h,i)=>{const c=[50,70,100,80,60][i];btn(56+i*186,660,176,80,'',s.g>=c?h.col:'#444',shade(h.col,-.6));heroine(90+i*186,735,.55,h,T,'idle');txt(h.name,170+i*186,692,18);txt(c+'💰',170+i*186,722,20,'#ffe066')});}
  for(const p of taps){if(hit(p,880,14,124,52)){go('menu');return}if(s.over){go('td');return}
   if(s.sel>=0&&p.y>640){const ex=s.tw.find(t=>t.i==s.sel);if(ex){if(p.x<500){const c=60*(ex.lvl+1);if(ex.lvl<3&&s.g>=c){s.g-=c;ex.lvl++;burst(ex.x,ex.y-40,'#ffe066',30);SFX.win()}}else{s.g+=30+ex.lvl*30;s.tw=s.tw.filter(t=>t!==ex);SFX.coin()}}
    else{const i=Math.floor((p.x-56)/186),c=[50,70,100,80,60][i];if(i>=0&&i<5&&s.g>=c){s.g-=c;const sl=SLOTS[s.sel];s.tw.push({i:s.sel,x:sl[0],y:sl[1],h:i,lvl:0,cd:0,at:0});burst(sl[0],sl[1],HER[i].col,30,200);SFX.coin();buzz(30)}}s.sel=-1;continue}
   s.sel=SLOTS.findIndex(sl=>Math.hypot(sl[0]-p.x,sl[1]-p.y)<42);}
  if(s.over){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H);if(s.over==1&&!s.paid){s.paid=1;save.coins+=s.w*10;SV()}txt(s.over==2?'ПОБЕДА! +50💎 +150🪙':'Замок пал... +'+s.w*10+'🪙',W/2,360,64,s.over==2?'#ffe066':'#ff6a88');txt('Нажми, чтобы сыграть снова',W/2,430,28);}}};
// ---- LANE BATTLER (We Are Warriors style) ----
const UN=[{n:'Мечница',h:0,c:20,hp:60,dmg:12,rg:30,sp:60,cd:.8},{n:'Лучница',h:1,c:30,hp:35,dmg:9,rg:220,sp:50,cd:1},{n:'Чародейка',h:2,c:55,hp:40,dmg:22,rg:160,sp:45,cd:1.6,spl:1},{n:'Страж',h:3,c:45,hp:180,dmg:8,rg:30,sp:40,cd:1},{n:'Охотница',h:4,c:35,hp:50,dmg:14,rg:120,sp:80,cd:.6}];
SCN.war={init(){this.m=60+60*save.upg.war;this.inc=8;this.age=1;this.xp=0;this.u=[];this.base=[1000+250*save.upg.war,1000];this.ec=3;this.ebudget=0;this.pr=[];this.over=0;this.ult=0;},
 draw(dt){const s=this;sky(T,'#2a0a14','#7a2a3a','#ffa060');hills(T*.2,'#4a1a2a',470,40,0);hills(T*.4,'#2a0a14',540,20,0);g.fillStyle='#3a2014';g.fillRect(0,600,W,H);g.fillStyle='#5a3424';g.fillRect(0,600,W,8);
  if(!s.over){s.m+=s.inc*dt*(1+s.age*.2);s.ult=Math.min(1,s.ult+dt/40);s.ebudget+=dt*(4+T*0+s.age*1.5+s.xp*.002);s.ec-=dt;
   if(s.ec<=0&&s.ebudget>25){s.ec=rnd(1.2,3);s.ebudget-=25;const k=Math.floor(rnd(0,4));s.u.push({...ENU(k,s),side:1,x:960,cd:0,ph:rnd(0,6)})}}
  // bases
  [[40,'#ff4fa3'],[984,'#5a5a6a']].forEach(([x,c],i)=>{g.fillStyle=gloss(x-40,440,80,160,c);rr(x-40,450,80,150,10);g.fill();g.fillStyle='#ffe066';g.fillRect(x-4,410,4,40);g.fillStyle=c;g.beginPath();g.moveTo(x,410);g.lineTo(x+(i?-30:30),420);g.lineTo(x,430);g.fill();
   g.fillStyle='#300';g.fillRect(x-50,425,100,10);g.fillStyle=i?'#aaa':'#ff4fa3';g.fillRect(x-50,425,100*s.base[i]/1000,10);});
  s.u.sort((a,b)=>a.y-b.y);
  for(const u of s.u){const dir=u.side?-1:1;let tg=null,td=1e9;for(const o of s.u)if(o.side!=u.side&&o.hp>0){const d=(o.x-u.x)*dir;if(d>-10&&d<td){td=d;tg=o}}
   const bd=(u.side?40:984)-u.x;const bdd=Math.abs(bd)-40;u.cd-=dt;let st='walk';
   if(tg&&td<=u.rg){st='idle';if(u.cd<=0&&!s.over){u.cd=u.cdm;u.at=.25;if(u.rg>60)s.pr.push({x:u.x,y:u.y-50,tx:tg,dmg:u.dmg,c:HER[u.h]?.col||'#f66',spl:u.spl,side:u.side});else{tg.hp-=u.dmg;burst(tg.x,tg.y-40,'#fff',5,100);SFX.slash()}}}
   else if(bdd<=u.rg){st='idle';if(u.cd<=0&&!s.over){u.cd=u.cdm;u.at=.25;s.base[u.side?0:1]-=u.dmg;burst(u.side?60:964,520,'#ffb84f',8,160);if(u.side){shake=3;buzz(30)}SFX.hit()}}
   else if(!s.over)u.x+=dir*u.sp*dt;
   u.at-=dt;if(u.at>0)st='attack';
   if(u.side)monster(u.x,u.y,u,st);else heroine(u.x,u.y,u.sc||1,HER[u.h],T+u.ph,st,1);
   g.fillStyle='#300';g.fillRect(u.x-18,u.y-(u.side?u.sz*2+20:140),36,4);g.fillStyle=u.side?'#f66':'#6f6';g.fillRect(u.x-18,u.y-(u.side?u.sz*2+20:140),36*cl(u.hp/u.mx,0,1),4);}
  for(const p of s.pr){const dx=p.tx.x-p.x,dy=p.tx.y-40-p.y,d=Math.hypot(dx,dy);if(d<10||p.tx.hp<=0){p.dead=1;if(p.tx.hp>0){if(p.spl){for(const o of s.u)if(o.side!=p.side&&Math.abs(o.x-p.tx.x)<60)o.hp-=p.dmg;burst(p.tx.x,p.tx.y-40,'#8ff',22,220);SFX.boom()}else p.tx.hp-=p.dmg}continue}
   p.x+=dx/d*600*dt;p.y+=dy/d*600*dt;g.fillStyle='#fff';g.shadowColor=p.c;g.shadowBlur=12;g.beginPath();g.arc(p.x,p.y,p.spl?7:3,0,6.28);g.fill();g.shadowBlur=0;}
  for(const u of s.u)if(u.hp<=0&&!u.dead){u.dead=1;burst(u.x,u.y-40,u.side?'#a6f':'#f9c',18,220);if(u.side){const r=8+s.age*2;s.m+=r;s.xp+=10;ftext(u.x,u.y-80,'+'+r);SFX.coin()}}
  s.u=s.u.filter(u=>!u.dead);s.pr=s.pr.filter(p=>!p.dead);
  if(!s.over&&s.base[1]<=0){s.over=2;SFX.win();save.gems+=40;save.coins+=120;SV();burst(984,500,'#ffe066',80,400);buzz(300)}if(!s.over&&s.base[0]<=0){s.over=1;SFX.lose();buzz(300)}
  // HUD
  g.fillStyle='rgba(20,0,10,.8)';g.fillRect(0,0,W,70);txt('🪙 '+Math.floor(s.m),20,47,30,'#ffe066','left');txt('Эра '+s.age,200,47,28,'#ffb84f','left');btn(880,10,124,50,'Меню','#888','#333',22);
  const up=150*s.age;btn(330,10,230,50,s.age<5?'Эра ↑ ('+up+'🪙)':'Макс эра',s.age<5&&s.m>=up?'#ffb84f':'#555','#5a2a0b',20);
  btn(600,10,250,50,s.ult>=1?'☄️ ЗВЁЗДНЫЙ ДОЖДЬ':'☄️ '+Math.floor(s.ult*100)+'%',s.ult>=1?'#ff4fa3':'#555','#5a0b3a',20);
  g.fillStyle='rgba(20,0,10,.85)';rr(20,640,984,116,20);g.fill();
  UN.forEach((u,i)=>{const x=36+i*194,c=u.c*s.age,ok=s.m>=c;btn(x,652,180,94,'',ok?HER[u.h].col:'#444',shade(HER[u.h].col,-.6));heroine(x+34,738,.5,HER[u.h],T+i,'idle');txt(u.n,x+110,688,18);txt(c+'🪙',x+110,722,22,'#ffe066')});
  for(const p of taps){if(hit(p,880,10,124,50)){go('menu');return}if(s.over){go('war');return}
   if(hit(p,330,10,230,50)&&s.age<5&&s.m>=up){s.m-=up;s.age++;burst(W/2,300,'#ffe066',60,400);SFX.win();ftext(W/2,300,'Новая эра!');s.u.forEach(u=>{if(!u.side){u.mx*=1.3;u.hp=u.mx}})}
   if(hit(p,600,10,250,50)&&s.ult>=1){s.ult=0;buzz(400);shake=14;SFX.boom();for(const u of s.u)if(u.side){u.hp-=120*s.age;burst(u.x,u.y-40,'#ff9ee8',30,300)}for(let i=0;i<40;i++)P.push({x:rnd(300,1000),y:rnd(-100,0),vx:-80,vy:900,l:.8,m:.8,c:'#ffd6f5',r:6})}
   if(p.y>640){const i=Math.floor((p.x-36)/194),u=UN[i];if(u&&s.m>=u.c*s.age){s.m-=u.c*s.age;const k=1+(s.age-1)*.35;s.u.push({h:u.h,hp:u.hp*k,mx:u.hp*k,dmg:u.dmg*k,rg:u.rg,sp:u.sp,cdm:u.cd,spl:u.spl,side:0,x:80,y:rnd(605,630),cd:0,ph:rnd(0,6),sc:.95+s.age*.03});SFX.click();buzz(15)}}}
  if(s.over){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H);txt(s.over==2?'ПОБЕДА! +40💎 +120🪙':'Крепость пала...',W/2,360,64,s.over==2?'#ffe066':'#ff6a88');txt('Нажми, чтобы сыграть снова',W/2,430,28);}}};
function ENU(k,s){const a=1+(s.age-1)*.3+T*0;const B=[{hp:50,dmg:10,rg:30,sp:55,cdm:.9,sz:22,col:'#7a3aff'},{hp:30,dmg:8,rg:180,sp:50,cdm:1.1,sz:18,col:'#3affb0'},{hp:160,dmg:16,rg:34,sp:35,cdm:1.3,sz:34,col:'#ff5a3a'},{hp:70,dmg:12,rg:30,sp:90,cdm:.6,sz:20,col:'#ffd23a'}][k];return{...B,hp:B.hp*a,mx:B.hp*a,dmg:B.dmg*a,y:rnd(605,630)}}
function monster(x,y,u,st){const r=u.sz,bb=Math.abs(Math.sin(T*8+u.ph))*6*(st=='walk'?1:.3);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y,r,r*.3,0,0,6.28);g.fill();
 const gr=g.createRadialGradient(x-r*.3,y-r-bb-r*.3,2,x,y-r-bb,r*1.2);gr.addColorStop(0,'#fff');gr.addColorStop(.3,u.col);gr.addColorStop(1,'#111');g.fillStyle=gr;g.beginPath();g.ellipse(x,y-r-bb,r,r*(st=='attack'?.7:.95),0,0,6.28);g.fill();
 g.fillStyle='#ff0';g.beginPath();g.arc(x-r*.35,y-r*1.2-bb,r*.18,0,6.28);g.arc(x+r*.1,y-r*1.2-bb,r*.18,0,6.28);g.fill();g.fillStyle='#000';g.fillRect(x-r*.4,y-r*1.25-bb,r*.08,r*.15);g.fillRect(x+r*.05,y-r*1.25-bb,r*.08,r*.15);
 g.fillStyle='#fff';g.beginPath();g.moveTo(x-r*.7,y-r*1.7-bb);g.lineTo(x-r*.5,y-r*2.2-bb);g.lineTo(x-r*.3,y-r*1.75-bb);g.moveTo(x+r*.2,y-r*1.75-bb);g.lineTo(x+r*.4,y-r*2.2-bb);g.lineTo(x+r*.6,y-r*1.7-bb);g.fill();}
// ---- RUNNER ----
SCN.run={init(){this.y=0;this.vy=0;this.d=0;this.sp=380;this.ob=[];this.gm=[];this.nx=1;this.jumps=0;this.over=0;this.sc=0;this.h=Math.floor(rnd(0,5));this.lives=save.upg.run;this.inv=0},
 draw(dt){const s=this;if(!s.over){s.sp+=dt*6;s.d+=s.sp*dt;}const off=s.over?0:s.sp*dt;
  sky(T,'#020b2a','#1a2a6a','#a04aa0');hills(s.d*.1,'#1a1040',500,40,1);hills(s.d*.3,'#0f0828',560,30,1);g.fillStyle='#1c0f3a';g.fillRect(0,620,W,H);
  for(let x=-(s.d%80);x<W;x+=80){g.fillStyle='#ff4fa3';g.fillRect(x,620,40,6)}
  if(!s.over){s.vy+=2400*dt;s.y=Math.min(0,s.y+s.vy*dt);if(s.y==0)s.jumps=0;s.nx-=dt;if(s.nx<=0){s.nx=rnd(.8,1.6)*420/s.sp*1.4;const tall=Math.random()<.35;s.ob.push({x:W+40,w:40,h:tall?110:60,fly:Math.random()<.25});for(let i=0;i<5;i++)s.gm.push({x:W+200+i*50,y:470-Math.sin(i/4*3.14)*80})}
   s.sc+=dt*10;}
  for(const o of s.ob){o.x-=off;const oy=o.fly?480:620-o.h;g.fillStyle=gloss(o.x,oy,o.w,o.h,o.fly?'#3affb0':'#7a3aff');rr(o.x,oy,o.w,o.fly?40:o.h,8);g.fill();
   const px=200,py=620+s.y;if(!s.over&&s.inv<=0&&px+14>o.x&&px-14<o.x+o.w&&py-120<oy+(o.fly?40:o.h)&&py>oy){if(s.lives>0){s.lives--;s.inv=1.5;o.x=-999;shake=8;buzz(100);SFX.boom();ftext(px,py-140,'❤️ Спасена!','#ff8aa8');continue}s.over=1;SFX.lose();buzz(300);shake=16;burst(px,py-60,HER[s.h].col,60,400);const b=save.best.run||0;if(s.sc>b)save.best.run=Math.floor(s.sc);save.gems+=Math.floor(s.sc/50);save.coins+=Math.floor(s.sc/5);SV()}}
  for(const m of s.gm){m.x-=off;if(m.got)continue;g.fillStyle='#8ff';g.shadowColor='#8ff';g.shadowBlur=12;g.beginPath();g.moveTo(m.x,m.y-12);g.lineTo(m.x+9,m.y);g.lineTo(m.x,m.y+12);g.lineTo(m.x-9,m.y);g.fill();g.shadowBlur=0;
   if(Math.hypot(m.x-200,m.y-(620+s.y-60))<50){m.got=1;s.sc+=10;burst(m.x,m.y,'#8ff',8,120);SFX.coin()}}
  s.ob=s.ob.filter(o=>o.x>-60);s.gm=s.gm.filter(m=>m.x>-20);
  if(!s.over){s.inv-=dt;g.globalAlpha=s.inv>0&&(T*10%2<1)?.35:1;heroine(200,620+s.y,1.15,HER[s.h],T*1.6,s.y<0?'attack':'walk');g.globalAlpha=1;if(Math.random()<.5)P.push({x:180,y:615+s.y,vx:-200,vy:rnd(-30,0),l:.4,m:.4,c:HER[s.h].col,r:3})}
  txt('Очки: '+Math.floor(s.sc),20,50,30,'#8ff','left');txt('Рекорд: '+(save.best.run||0)+'   ❤️ x'+s.lives,20,88,22,'#ffe066','left');btn(880,14,124,52,'Меню','#888','#333',22);
  txt(s.over?'':'Тап — прыжок (двойной тоже!)',W/2,720,22,'rgba(255,255,255,.6)');
  for(const p of taps){if(hit(p,880,14,124,52)){go('menu');return}if(s.over){go('run');return}if(s.jumps<2){s.vy=-900;s.jumps++;SFX.shot();burst(200,620+s.y,'#fff',8,100)}}
  if(s.over){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(0,0,W,H);txt('Очки: '+Math.floor(s.sc),W/2,360,64,'#ffe066');txt('Нажми, чтобы снова',W/2,430,28);}}};
// ---- SHOP (free, no real money) ----
let shopMsg='',shopMsgT=0,freeCd=0;
function reward(c,gm,x,y){save.coins+=c;save.gems+=gm;SV();SFX.win();buzz(60);burst(x,y,'#ffe066',40,350);burst(x,y,'#8ff',30,300);for(let i=0;i<12;i++)ftext(x+rnd(-80,80),y+rnd(-40,20),gm?'💎':'🪙');shopMsg=(c?'+'+c+'🪙 ':'')+(gm?'+'+gm+'💎':'');shopMsgT=2}
function buy(cur,cost,fn,x,y){if(save[cur]<cost){shopMsg='Не хватает '+(cur=='gems'?'💎':'🪙')+' — возьми бесплатно сверху!';shopMsgT=2;SFX.hit();return}save[cur]-=cost;fn();SV();SFX.coin();burst(x,y,'#ff9ee8',30,250);shopMsg='Куплено!';shopMsgT=1.5}
SCN.shop={draw(dt){applySkins();sky(T,'#1a0a2e','#4a1a5e','#a04a8a');const today=new Date().toDateString();freeCd-=dt;
 g.fillStyle='rgba(10,0,30,.8)';g.fillRect(0,0,W,70);txt('🛍️ МАГАЗИН (всё бесплатно)',W/2,47,30,'#ffd6f5');txt('🪙 '+save.coins,20,47,26,'#ffe066','left');txt('💎 '+save.gems,200,47,26,'#8ff','left');btn(880,10,124,50,'Меню','#888','#333',22);
 const dOk=save.daily!=today,fOk=true;
 const top=[[dOk?'🎁 Ежедневный подарок':'🎁 Завтра ещё!',dOk,()=>{save.daily=today;reward(500,30,150,130)}],[fOk?'🪙 Взять 200 монет':'⏳ '+Math.ceil(freeCd)+' с',fOk,()=>reward(200,0,512,130)],[fOk?'💎 Взять 15 кристаллов':'⏳ '+Math.ceil(freeCd)+' с',fOk,()=>reward(0,15,860,130)]];
 top.forEach((b,i)=>{const x=30+i*330,y=90,pul=b[1]?1+Math.sin(T*5)*.03:1;g.save();g.translate(x+150,y+40);g.scale(pul,pul);btn(-150,-40,300,80,b[0],b[1]?['#ff4fa3','#ffb84f','#38e0a0'][i]:'#555',b[1]?'#5a0b3a':'#222',22);g.restore();for(const p of taps)if(hit(p,x,y,300,80)&&b[1])b[2]()});
 txt('Наряды героинь (💎 25)',W/2,212,24,'#ffe066');
 HER.forEach((h,i)=>{const x=40+i*195;g.fillStyle='rgba(255,255,255,.08)';rr(x,222,180,250,16);g.fill();heroine(x+90,400,1.2,h,T+i,'idle');txt(h.name,x+90,425,18);
  SKC[i].forEach((c,k)=>{const cx=x+40+k*50,cy=452,own=k==0||save.owned['s'+i+k],sel=(save.skins[i]||0)==k;g.fillStyle=c;g.beginPath();g.arc(cx,cy,16,0,6.28);g.fill();g.lineWidth=sel?4:2;g.strokeStyle=sel?'#ffe066':'#fff';g.stroke();if(!own)txt('🔒',cx,cy+6,14);
   for(const p of taps)if(Math.hypot(p.x-cx,p.y-cy)<20){if(own){save.skins[i]=k;SV();SFX.click();burst(x+90,330,c,20,200)}else buy('gems',25,()=>{save.owned['s'+i+k]=1;save.skins[i]=k},cx,cy)}})});
 txt('Улучшения (🪙)',W/2,505,24,'#ffe066');
 const U=[['td','🏰 Башни: +100💰 старт, +5❤️',300],['war','⚔️ Воительницы: +60🪙 старт, крепость +25%',300],['run','🌙 Бег: +1 запасная жизнь',400]];
 U.forEach(([k,n,c],i)=>{const lv=save.upg[k],cost=c*(lv+1),y=520+i*78,mx=lv>=3;g.fillStyle='rgba(255,255,255,.08)';rr(40,y,944,68,14);g.fill();txt(n,60,y+43,22,'#fff','left');for(let j=0;j<3;j++)txt(j<lv?'★':'☆',640+j*26,y+44,24,'#ffe066');
  btn(740,y+8,230,52,mx?'Максимум':cost+'🪙',mx?'#555':save.coins>=cost?'#38e0a0':'#777','#0b4a2a',22);for(const p of taps)if(!mx&&hit(p,740,y+8,230,52))buy('coins',cost,()=>save.upg[k]++,850,y+30)});
 if(shopMsgT>0){shopMsgT-=dt;g.globalAlpha=cl(shopMsgT,0,1);txt(shopMsg,W/2,H/2,40,'#fff');g.globalAlpha=1}
 for(const p of taps)if(hit(p,880,10,124,50)){go('menu');return}
 if(Math.random()<.4)P.push({x:rnd(0,W),y:-5,vx:0,vy:rnd(40,90),l:4,m:4,c:Math.random()<.5?'#ffe066':'#8ff',r:rnd(1,3)});}};
// ---------- LOOP ----------
let last=performance.now(),fps=60,rot=false;
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;fps=fps*.95+(1/Math.max(dt,.001))*.05;window.__fps=fps;music(dt);
 g.setTransform(1,0,0,1,0,0);g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);
 const sx=shake>0?rnd(-shake,shake):0,sy=shake>0?rnd(-shake,shake):0;shake=Math.max(0,shake-dt*30);
 g.setTransform(S,0,0,S,(cv.width-W*S)/2+sx*S,(cv.height-H*S)/2+sy*S);g.save();g.beginPath();g.rect(0,0,W,H);g.clip();
 if(innerHeight>innerWidth){sky(T,'#14002e','#5a0b5e','#ff6a88');txt('Поверни iPad горизонтально ↻',W/2,H/2,40);}else{SCN[scene].draw(dt);fx(dt);}
 g.restore();taps=[];requestAnimationFrame(loop);}
SCN.td.init();SCN.war.init();SCN.run.init();requestAnimationFrame(loop);
if('serviceWorker' in navigator&&(location.protocol=='https:'||location.hostname=='localhost'))navigator.serviceWorker.register('sw.js');
