(function(){
  /* teoría guardada antes de que MathJax la procese, para la tarjeta flotante */
  const TEO={};
  document.querySelectorAll('.panel[id$="-teoria"] .box[id^="t-"]').forEach(b=>{
    const c=b.cloneNode(true); c.querySelectorAll('.box-link').forEach(x=>x.remove()); TEO[b.id]=c.innerHTML;
  });

  /* ---------------- gráficos SVG ---------------- */
  let uid=0;
  const NS='http://www.w3.org/2000/svg';
  function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}
  const col=c=>'var(--'+(c||'ink')+')';
  function fmt(v){return (Math.round(v*100)/100).toString().replace('-','−')}
  function plot(id,o){
    const host=document.getElementById(id); if(!host) return;
    const W=o.w||500, pad=30, padL=o.padL||46;
    const [x0,x1]=o.x,[y0,y1]=o.y;
    const iw=W-padL-pad;
    const H=o.h || (o.eq ? Math.round(2*pad+(y1-y0)/(x1-x0)*iw) : 340);
    const ih=H-2*pad;
    const sx=x=>padL+(x-x0)/(x1-x0)*iw, sy=y=>H-pad-(y-y0)/(y1-y0)*ih;
    const svg=el('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':o.alt||'Gráfico','font-family':'Archivo, Arial, sans-serif','font-size':'13'});
    const cid='clip'+(uid++);
    const defs=el('defs',{},svg); const cp=el('clipPath',{id:cid},defs);
    el('rect',{x:padL,y:pad,width:iw,height:ih},cp);
    const g=el('g',{},svg);
    const gx=o.gx||1, gy=o.gy||1;
    for(let x=Math.ceil(x0/gx)*gx;x<=x1+1e-9;x+=gx) el('line',{x1:sx(x),x2:sx(x),y1:pad,y2:H-pad,style:'stroke:var(--grid)','stroke-width':1},g);
    for(let y=Math.ceil(y0/gy)*gy;y<=y1+1e-9;y+=gy) el('line',{y1:sy(y),y2:sy(y),x1:padL,x2:W-pad,style:'stroke:var(--grid)','stroke-width':1},g);
    const ax=el('g',{style:'stroke:var(--muted)','stroke-width':1.3},svg);
    const ay0=(y0<=0&&y1>=0)?sy(0):sy(y0), ax0=(x0<=0&&x1>=0)?sx(0):sx(x0);
    el('line',{x1:padL-6,x2:W-pad+8,y1:ay0,y2:ay0},ax);
    el('line',{x1:ax0,x2:ax0,y1:H-pad+6,y2:pad-8},ax);
    el('path',{d:`M${W-pad+8},${ay0} l-7,-4 v8 z`,style:'fill:var(--muted);stroke:none'},ax);
    el('path',{d:`M${ax0},${pad-8} l-4,7 h8 z`,style:'fill:var(--muted);stroke:none'},ax);
    const t=(x,y,s,a)=>{const at=Object.assign({x,y,style:'fill:var(--muted)'},a||{});at.style+=';paint-order:stroke;stroke:var(--sheet);stroke-width:4px;stroke-linejoin:round';const e=el('text',at,svg);e.textContent=s;return e};
    t(W-pad+6,ay0-8,o.lx||'x',{'text-anchor':'end','font-style':'italic'});
    t(ax0+8,pad-6,o.ly||'y',{'font-style':'italic'});
    (o.tx||[]).forEach(e=>{const v=Array.isArray(e)?e[0]:e, lab=Array.isArray(e)?e[1]:fmt(e);el('line',{x1:sx(v),x2:sx(v),y1:ay0-3,y2:ay0+3,style:'stroke:var(--muted)'},svg);t(sx(v),ay0+16,lab,{'text-anchor':'middle','font-size':'11'})});
    (o.ty||[]).forEach(e=>{const v=Array.isArray(e)?e[0]:e, lab=Array.isArray(e)?e[1]:fmt(e);el('line',{x1:ax0-3,x2:ax0+3,y1:sy(v),y2:sy(v),style:'stroke:var(--muted)'},svg);t(ax0-6,sy(v)+4,lab,{'text-anchor':'end','font-size':'11'})});
    const body=el('g',{'clip-path':`url(#${cid})`},svg);
    (o.polys||[]).forEach(p=>{el('polygon',{points:p.pts.map(q=>sx(q[0])+','+sy(q[1])).join(' '),style:`fill:${col(p.c)};fill-opacity:${p.op||0.22};stroke:${col(p.c)};stroke-opacity:.6`,'stroke-width':1},body)});
    (o.circs||[]).forEach(c=>{el('ellipse',{cx:sx(c.h),cy:sy(c.k),rx:c.r*iw/(x1-x0),ry:c.r*ih/(y1-y0),style:`fill:none;stroke:${col(c.c)}`,'stroke-width':c.wd||2,'stroke-dasharray':c.dash||''},body)});
    (o.segs||[]).forEach(s=>{el('line',{x1:sx(s.a[0]),y1:sy(s.a[1]),x2:sx(s.b[0]),y2:sy(s.b[1]),style:`stroke:${col(s.c||'muted')}`,'stroke-width':s.wd||1.3,'stroke-dasharray':s.dash===false?'':'4 4'},body)});
    (o.fns||[]).forEach(f=>{
      const a=f.from??x0, b=f.to??x1, n=300, span=(y1-y0);
      let d='';
      for(let i=0;i<=n;i++){const x=a+(b-a)*i/n;let y=f.f(x);y=Math.max(y0-span,Math.min(y1+span,y));d+=(i?'L':'M')+sx(x).toFixed(2)+','+sy(y).toFixed(2)}
      el('path',{d,style:`fill:none;stroke:${col(f.c)}`,'stroke-width':f.wd||2.2,'stroke-dasharray':f.dash||''},body);
      if(f.t){const lx=f.tx??b, ly=f.ty??f.f(lx);t(sx(lx)+(f.dx||0),sy(ly)+(f.dy||-8),f.t,{style:`fill:${col(f.c)}`,'text-anchor':f.anchor||'end','font-weight':'700'})}
    });
    (o.pts||[]).forEach(p=>{
      el('circle',{cx:sx(p.x),cy:sy(p.y),r:p.r||4.5,style:`fill:${col(p.c)};stroke:var(--sheet)`,'stroke-width':1.5},svg);
      if(p.t){t(sx(p.x)+(p.dx??7),sy(p.y)+(p.dy??-7),p.t,{style:`fill:${col(p.c)}`,'text-anchor':p.anchor||'start','font-weight':'700'})}
    });
    host.appendChild(svg);
  }

  const S3=Math.sqrt(3), S10=Math.sqrt(10), PI=Math.PI;
  /* teoría */
  plot('g-tp1',{alt:'Parábola y=x²+6x+8',x:[-6.5,1.5],y:[-2,9.5],tx:[-3],ty:[8],
    fns:[{f:x=>x*x+6*x+8}],
    pts:[{x:-3,y:-1,c:'blue',t:'V(−3, −1)',dy:18,anchor:'middle',dx:0},{x:-4,y:0,c:'orange',t:'(−4, 0)',anchor:'end',dx:-8,dy:16},{x:-2,y:0,c:'orange',t:'(−2, 0)',dx:8,dy:16},{x:0,y:8,c:'orange',t:'(0, 8)'}]});
  plot('g-tc1',{alt:'Circunferencia de centro (−2,3) y radio 5',eq:true,x:[-8,4],y:[-3,9],tx:[-2],ty:[3],
    circs:[{h:-2,k:3,r:5}],segs:[{a:[-2,3],b:[2,6],c:'blue',dash:false,wd:1.6}],
    pts:[{x:-2,y:3,c:'blue',t:'C(−2, 3)',dy:16},{x:0.2,y:4.6,c:'blue',r:0.01,t:'r = 5',dx:-14,dy:-6}]});
  plot('g-tc2',{alt:'Recta tangente en (7,7)',eq:true,x:[-3,11],y:[-2,11],tx:[3,7],ty:[4,7],
    circs:[{h:3,k:4,r:5}],segs:[{a:[3,4],b:[7,7],c:'blue'}],
    fns:[{f:x=>7-4/3*(x-7),c:'orange',from:4.5,to:10.5,t:'y − 7 = −4/3 (x − 7)',tx:10.5,dy:18}],
    pts:[{x:3,y:4,c:'blue',t:'C(3, 4)',dy:16},{x:7,y:7,c:'magenta',t:'T(7, 7)'}]});
  plot('g-to1',{alt:'Oferta y demanda del ejemplo',x:[0,13],y:[0,64],gx:1,gy:5,lx:'q',ly:'p',tx:[2,5,40/7,10,12],ty:[20,220/7,50,60],
    polys:[{pts:[[0,60],[0,220/7],[40/7,220/7]],c:'orange',op:.3},{pts:[[0,20],[0,220/7],[40/7,220/7]],c:'blue',op:.25}],
    segs:[{a:[40/7,0],b:[40/7,220/7]}],
    fns:[{f:q=>2*q+20,c:'blue',t:'O: p = 2q + 20',tx:12.8,dy:16},{f:q=>-5*q+60,from:0,to:12,c:'orange',t:'D: p = −5q + 60',tx:11.9,dy:-10}],
    pts:[{x:40/7,y:220/7,c:'purple',t:'(40/7, 220/7)',dx:8,dy:-8},{x:5,y:30,c:'blue',r:3.5},{x:10,y:40,c:'blue',r:3.5},{x:2,y:50,c:'orange',r:3.5}]});
  /* parábolas */
  plot('g-p2',{alt:'Parábola y=x²−8x+15',x:[-1.5,7.5],y:[-2.5,16.5],gx:1,gy:2,tx:[4],ty:[15],
    fns:[{f:x=>x*x-8*x+15}],
    pts:[{x:4,y:-1,c:'blue',t:'V(4, −1)',dy:22,dx:0,anchor:'middle'},{x:3,y:0,c:'orange',t:'(3, 0)',anchor:'end',dx:-8,dy:16},{x:5,y:0,c:'orange',t:'(5, 0)',dx:8,dy:16},{x:0,y:15,c:'orange',t:'(0, 15)'}]});
  plot('g-p3',{alt:'Parábola y=x²−12x+32',x:[-1.5,11],y:[-6,35],gx:1,gy:4,tx:[6],ty:[32],
    fns:[{f:x=>x*x-12*x+32}],
    pts:[{x:6,y:-4,c:'blue',t:'V(6, −4)',dy:20,dx:0,anchor:'middle'},{x:4,y:0,c:'orange',t:'(4, 0)',anchor:'end',dx:-8,dy:16},{x:8,y:0,c:'orange',t:'(8, 0)',dx:8,dy:16},{x:0,y:32,c:'orange',t:'(0, 32)'}]});
  plot('g-p4',{alt:'Parábola, recta y triángulo',eq:true,x:[-3,4.5],y:[-1.5,6],tx:[-1,1,2],ty:[1,4],
    polys:[{pts:[[1,0],[2,1],[-1,4]],c:'green'}],
    fns:[{f:x=>(x-1)*(x-1)},{f:x=>-x+3,c:'orange',t:'y = −x + 3',tx:3.6,anchor:'end',dx:-10,dy:4}],
    pts:[{x:1,y:0,c:'blue',t:'V(1, 0)',dy:16},{x:2,y:1,c:'purple',t:'(2, 1)'},{x:-1,y:4,c:'purple',t:'(−1, 4)',anchor:'end',dx:-8,dy:18}]});
  plot('g-p5',{alt:'Tangente a y=x² en (1,1)',eq:true,x:[-2.2,3],y:[-2,5],tx:[1],ty:[1],
    fns:[{f:x=>x*x,t:'y = x²',tx:-1.9,anchor:'start',dx:10},{f:x=>2*x-1,c:'orange',t:'y = 2x − 1',tx:-0.2,anchor:'end',dx:-8,dy:4}],
    pts:[{x:1,y:1,c:'magenta',t:'(1, 1)',dx:-8,anchor:'end',dy:-6}]});
  plot('g-p8',{alt:'Cable del puente',x:[-235,235],y:[-8,125],gx:50,gy:20,h:300,tx:[-200,-150,-40,40,200],ty:[66.25,110],
    segs:[{a:[-200,0],b:[-200,110],c:'muted',wd:5,dash:false},{a:[200,0],b:[200,110],c:'muted',wd:5,dash:false},{a:[-150,0],b:[-150,66.25]},{a:[-40,0],b:[-40,14]},{a:[40,0],b:[40,14]}],
    fns:[{f:x=>x*x/400+10,from:-200,to:200}],
    pts:[{x:0,y:10,c:'blue',t:'V(0, 10)',dx:6,dy:15},{x:-150,y:66.25,c:'purple',t:'66.25 m'},{x:-40,y:14,c:'orange'},{x:40,y:14,c:'orange'}]});
  plot('g-p9',{alt:'Utilidad U=4x−x²',x:[-0.5,5],y:[-2,5],tx:[1,1.8,3,4],ty:[3,4],lx:'x (miles)',ly:'U',
    fns:[{f:x=>4*x-x*x,from:0,to:4.8}],
    segs:[{a:[1,3],b:[3,3]},{a:[1.8,0],b:[1.8,3.96]}],
    pts:[{x:2,y:4,c:'blue',t:'máx (2, 4)',dx:10,dy:-6},{x:1,y:3,c:'orange'},{x:3,y:3,c:'orange'},{x:1.8,y:3.96,c:'purple'},{x:4,y:0,c:'orange'}]});
  plot('g-p10',{alt:'Dos parábolas tangentes',x:[-4.5,5.5],y:[-1.5,8],gx:1,gy:1,tx:[-2,-1,1,4],ty:[],
    fns:[{f:x=>(8*x*x+32*x+44)/9,t:'P₁',tx:-3.7,anchor:'start',dx:-30,dy:4},{f:x=>(-4*x*x+8*x+32)/9,c:'green',t:'P₂',tx:4.6,anchor:'start',dx:6}],
    pts:[{x:-2,y:4/3,c:'blue',t:'V₁(−2, 4/3)',anchor:'end',dx:-6,dy:18},{x:1,y:4,c:'blue',t:'V₂(1, 4)',dy:-12,anchor:'middle',dx:6},{x:-1,y:20/9,c:'purple',t:'(−1, 20/9)',dx:10,dy:14},{x:4,y:0,c:'orange'},{x:-2,y:0,c:'orange'},{x:0,y:44/9,c:'orange',t:'44/9',dx:-6,anchor:'end'},{x:0,y:32/9,c:'orange',t:'32/9',dy:16}]});
  plot('g-p11',{alt:'Parábola y=−x²+4x+6 y triángulo',x:[-2.5,6.5],y:[-2,11.5],gx:1,gy:1,tx:[2],ty:[6,10],
    polys:[{pts:[[2-S10,0],[2+S10,0],[2,10]],c:'green'}],
    fns:[{f:x=>-x*x+4*x+6}],
    pts:[{x:2,y:10,c:'blue',t:'V(2, 10)'},{x:2-S10,y:0,c:'orange',t:'2 − √10',anchor:'end',dx:-6,dy:18},{x:2+S10,y:0,c:'orange',t:'2 + √10',dx:6,dy:18},{x:0,y:6,c:'orange'}]});
  plot('g-p12',{alt:'Tangencia de y=−x² con y=2x+1',eq:true,x:[-3.2,2.2],y:[-5,2.2],tx:[-1],ty:[-1],
    fns:[{f:x=>-x*x,t:'y = −x²',tx:1.9,anchor:'end',dy:20},{f:x=>2*x+1,c:'orange',t:'y = 2x + 1',tx:0.55,anchor:'start',dx:6,dy:4}],
    pts:[{x:-1,y:-1,c:'magenta',t:'(−1, −1)',anchor:'end',dx:-8}]});
  /* circunferencias */
  plot('g-c2',{alt:'Circunferencia tangente al eje x',eq:true,x:[-1,7.5],y:[-1,3],tx:[],ty:[1],
    circs:[{h:4,k:1,r:1}],pts:[{x:4,y:1,c:'blue',t:'(4, 1)'},{x:4,y:0,c:'purple',t:'(4, 0)',dy:16,dx:6}]});
  plot('g-c3',{alt:'Dos circunferencias tangentes a la recta en (4,1)',eq:true,x:[-5,13.5],y:[-9,11],gx:2,gy:2,tx:[1,4,7],ty:[-3,5],
    fns:[{f:x=>(16-3*x)/4,c:'orange',t:'3x + 4y − 16 = 0',tx:12.5,anchor:'end',dx:-14,dy:6}],
    segs:[{a:[1,-3],b:[7,5]}],
    circs:[{h:7,k:5,r:5},{h:1,k:-3,r:5}],
    pts:[{x:7,y:5,c:'blue',t:'(7, 5)'},{x:1,y:-3,c:'blue',t:'(1, −3)',anchor:'end',dx:-8,dy:4},{x:4,y:1,c:'magenta',t:'T(4, 1)',dx:10,dy:16}]});
  plot('g-c4',{alt:'Recta por el centro y P',eq:true,x:[-3,10.5],y:[-2,13],tx:[3,6,9],ty:[4,8,12],
    circs:[{h:3,k:4,r:5}],
    fns:[{f:x=>4*x/3,c:'orange'},{f:x=>4-0.75*(x-3),c:'muted',dash:'4 4',wd:1.3}],
    pts:[{x:3,y:4,c:'blue',t:'C(3, 4)',dx:10,dy:-2},{x:9,y:12,c:'magenta',t:'P(9, 12)',anchor:'end',dx:-8},{x:0,y:0,c:'purple',t:'(0, 0)',anchor:'end',dx:-6,dy:16},{x:6,y:8,c:'purple',t:'(6, 8)',dx:10,dy:6},{x:-1,y:7,c:'muted',t:'unidad',anchor:'end',dx:-6},{x:7,y:1,c:'muted',t:'unidad'}]});
  plot('g-c5',{alt:'Circunferencia de centro (7,0)',eq:true,x:[-1,15],y:[-7.5,7.5],gx:1,gy:1,tx:[7],ty:[],
    circs:[{h:7,k:0,r:Math.sqrt(45)}],
    pts:[{x:7,y:0,c:'blue',t:'(7, 0)',dy:-8},{x:1,y:3,c:'magenta',t:'A(1, 3)',dx:8,dy:4},{x:4,y:6,c:'magenta',t:'B(4, 6)',anchor:'end',dx:-8,dy:-6}]});
  plot('g-c6',{alt:'Dos tangentes desde (7,1)',eq:true,x:[-6.5,9.5],y:[-6.5,7],tx:[3,4,7],ty:[],
    circs:[{h:0,k:0,r:5}],
    fns:[{f:x=>-0.75*x+25/4,c:'orange'},{f:x=>4*x/3-25/3,c:'orange'}],
    segs:[{a:[0,0],b:[3,4],c:'blue'},{a:[0,0],b:[4,-3],c:'blue'}],
    pts:[{x:0,y:0,c:'blue',t:'O'},{x:7,y:1,c:'muted',t:'P(7, 1)',dx:-4,dy:-10,anchor:'end'},{x:3,y:4,c:'magenta',t:'(3, 4)'},{x:4,y:-3,c:'magenta',t:'(4, −3)',dy:16}]});
  plot('g-c7',{alt:'Circunferencia de centro (−12,−5) y radio 13',eq:true,x:[-27,3.5],y:[-19.5,10],gx:3,gy:3,tx:[-12],ty:[-5],
    circs:[{h:-12,k:-5,r:13}],segs:[{a:[-12,-5],b:[0,0],c:'blue'}],
    pts:[{x:-12,y:-5,c:'blue',t:'(−12, −5)',anchor:'middle',dx:0,dy:18},{x:0,y:0,c:'magenta',t:'O'}]});
  plot('g-c8',{alt:'Circunferencia y recta',eq:true,x:[-4,4.2],y:[-2,7],tx:[[PI,'π']],ty:[[2*PI,'2π']],
    circs:[{h:-1,k:1,r:2}],
    fns:[{f:x=>-2*x+2*PI,c:'green',t:'l',tx:2.4,dx:12}],
    pts:[{x:-1,y:1,c:'blue',t:'(−1, 1)'},{x:-1-S3,y:0,c:'orange',t:'−1 − √3',anchor:'end',dx:-4,dy:16},{x:S3-1,y:0,c:'orange',t:'−1 + √3',dx:4,dy:16},{x:0,y:1+S3,c:'orange',t:'1 + √3',dx:6,dy:-6},{x:0,y:1-S3,c:'orange',t:'1 − √3',dx:6,dy:16}]});
  plot('g-c9',{alt:'Circunferencia de centro (1,1) y radio 2',eq:true,x:[-2,4.2],y:[-1.8,4.2],tx:[],ty:[],
    circs:[{h:1,k:1,r:2}],
    pts:[{x:1,y:1,c:'blue',t:'(1, 1)'},{x:0,y:1+S3,c:'orange',t:'M',anchor:'end',dx:-6},{x:1-S3,y:0,c:'orange',t:'N',anchor:'end',dx:-6,dy:16},{x:0,y:1-S3,c:'orange',t:'P',anchor:'end',dx:-6,dy:16},{x:1+S3,y:0,c:'orange',t:'Q',dy:16}]});
  plot('g-c10',{alt:'Triángulo sombreado',eq:true,x:[-3,3.5],y:[-3,2.5],tx:[-1,2],ty:[1,-2],
    polys:[{pts:[[-1,1],[2,0],[0,-2]],c:'green'}],
    circs:[{h:-1,k:1,r:1,c:'muted',wd:1.4}],
    fns:[{f:x=>x-2,c:'ink',t:'y = x − 2',tx:3.3,dy:-6}],
    pts:[{x:-1,y:1,c:'blue',t:'(−1, 1)',dy:-10},{x:2,y:0,c:'orange',t:'(2, 0)',dy:-8,anchor:'end',dx:-4},{x:0,y:-2,c:'orange',t:'(0, −2)',anchor:'end',dx:-8,dy:4}]});
  plot('g-c11',{alt:'Trapecio entre dos circunferencias',eq:true,x:[-1,8],y:[-1,5],tx:[2,6],ty:[1,2],
    polys:[{pts:[[2,0],[2,2],[6,1],[6,0]],c:'green'}],
    circs:[{h:2,k:2,r:2},{h:6,k:1,r:1}],
    pts:[{x:2,y:2,c:'blue',t:'C₁(2, 2)',anchor:'end',dx:-6},{x:6,y:1,c:'blue',t:'C₂(6, 1)',anchor:'middle',dx:0,dy:-8},{x:2,y:0,c:'orange',t:'T₁',dy:16},{x:6,y:0,c:'orange',t:'T₂',dy:16}]});
  plot('g-c12',{alt:'Potencia del origen',eq:true,x:[-1,9],y:[-1,9],tx:[1,7],ty:[],
    circs:[{h:4,k:4,r:Math.sqrt(18)}],
    fns:[{f:x=>x,c:'green',t:'y = x',tx:8.3,anchor:'end',dx:-8,dy:2}],
    pts:[{x:4,y:4,c:'blue',t:'(4, 4)',dx:8,dy:14},{x:0,y:0,c:'magenta',t:'P',dx:6,dy:-8},{x:1,y:1,c:'purple',t:'A(1, 1)',dx:10,dy:6},{x:7,y:7,c:'purple',t:'B(7, 7)',dx:10,dy:6}]});
  /* oferta y demanda */
  plot('g-od1',{alt:'Oferta y demanda del ejercicio 1',x:[0,108],y:[0,19.5],gx:10,gy:2,lx:'q',ly:'p',tx:[28,52,100],ty:[8,50/3],
    polys:[{pts:[[0,50/3],[0,8],[52,8]],c:'orange',op:.3},{pts:[[0,0],[28,0],[52,8],[0,8]],c:'blue',op:.25}],
    fns:[{f:q=>-q/6+50/3,from:0,to:100,c:'orange',t:'D',tx:92,dy:-10},{f:q=>q/3-28/3,from:28,to:108,c:'blue',t:'O',tx:62,dx:-6}],
    pts:[{x:52,y:8,c:'purple',t:'(52, 8)',dx:8,dy:16},{x:31,y:1,c:'blue',r:3.5},{x:34,y:2,c:'blue',r:3.5}]});
  plot('g-od4-plan',{alt:'Planteamiento: oferta con pendiente 1 y triángulo del excedente del productor',x:[0,5.2],y:[0,6.3],lx:'q',ly:'p',tx:[[2,'a']],ty:[[1,'3 − a'],[3,'3']],padL:58,
    polys:[{pts:[[0,1],[0,3],[2,3]],c:'blue',op:.25}],
    segs:[{a:[0,3],b:[2,3],c:'blue'},{a:[2,0],b:[2,3]}],
    fns:[{f:q=>q+1,c:'blue',t:'oferta (pendiente 1)',tx:4.9,dy:16,dx:4}],
    pts:[{x:2,y:3,c:'purple',t:'(a, 3)',dx:8,dy:-6},{x:0.55,y:2.45,c:'blue',r:0.01,t:'EP = 2',dx:0,dy:4}]});
  plot('g-od8-plan',{alt:'Planteamiento: demanda del capitán con el excedente del consumidor',x:[0,22],y:[0,11],gx:2,gy:1,lx:'q',ly:'p',tx:[[5,'5'],[10,'a']],ty:[[7,'7'],[8,'8'],[9,'b₂']],
    polys:[{pts:[[0,9],[0,7],[10,7]],c:'orange',op:.3}],
    segs:[{a:[10,0],b:[10,7]},{a:[5,0],b:[5,8]},{a:[0,8],b:[5,8]}],
    fns:[{f:q=>-q/5+9,from:0,to:21,c:'orange',t:'demanda',tx:20,dy:-10}],
    pts:[{x:5,y:8,c:'orange',t:'(5, 8)',dx:8,dy:-8},{x:10,y:7,c:'purple',t:'(a, 7)',dx:8,dy:-8},{x:2.4,y:7.3,c:'ink',r:0.01,t:'EC = 10',dx:0,dy:4}]});
  plot('g-od4',{alt:'Oferta p=q+1',x:[0,5.2],y:[0,6.3],lx:'q',ly:'p',tx:[2],ty:[1,3],
    polys:[{pts:[[0,1],[0,3],[2,3]],c:'blue',op:.25}],
    segs:[{a:[0,3],b:[2,3],c:'blue'},{a:[2,0],b:[2,3]}],
    fns:[{f:q=>q+1,c:'blue',t:'O: p = q + 1',tx:4.9,dy:16,dx:4}],
    pts:[{x:2,y:3,c:'purple',t:'(2, 3)'}]});
  plot('g-od5',{alt:'Oferta y demanda del ejercicio 5',x:[0,13.5],y:[0,28],gx:1,gy:2,lx:'q',ly:'p',tx:[4],ty:[5,17,25],
    segs:[{a:[0,17],b:[4,17]},{a:[4,0],b:[4,17]}],
    fns:[{f:q=>3*q+5,c:'blue',t:'p = 3q + 5',tx:7.4,anchor:'start',dx:6,dy:4},{f:q=>25-2*q,from:0,to:12.5,c:'orange',t:'p = 25 − 2q',tx:12,dy:-12}],
    pts:[{x:4,y:17,c:'purple',t:'(4, 17)',dx:10,dy:16}]});
  plot('g-od6',{alt:'Mercado de San Juan',x:[0,58],y:[0,56],gx:5,gy:5,lx:'q',ly:'p',tx:[6,42,54],ty:[10,12,40,50],
    fns:[{f:q=>5*q/6+5,c:'blue',t:'O',tx:56,dx:-4},{f:q=>-q/3+12,from:0,to:36,c:'orange',t:'D',tx:34,dy:-8}],
    pts:[{x:6,y:10,c:'purple',t:'(6, 10)',dx:8,dy:-8},{x:42,y:40,c:'blue',r:3.5},{x:54,y:50,c:'blue',r:3.5},{x:3,y:11,c:'orange',r:3.5},{x:9,y:9,c:'orange',r:3.5}]});
  plot('g-od7',{alt:'Demandas de A y B y oferta',x:[0,23],y:[0,24],gx:2,gy:2,lx:'q',ly:'p',tx:[2,6,14,22],ty:[6,8,10,11,14],
    fns:[{f:q=>2*q+6,from:0,to:9,c:'blue',t:'O: p = 2q + 6',tx:8.6,anchor:'end',dx:-6},{f:q=>-q/2+11,from:0,to:22,c:'orange',t:'Bien A',tx:20,dy:-10},{f:q=>14-q,from:0,to:14,c:'green',t:'Bien B',tx:12.5,dy:-8,anchor:'start',dx:6}],
    pts:[{x:2,y:10,c:'purple',t:'(2, 10)',dx:8,dy:-6},{x:6,y:8,c:'purple',t:'(6, 8)',dx:4,dy:20}]});
  plot('g-od8',{alt:'Mercado del ron',x:[0,47],y:[0,15.5],gx:5,gy:1,lx:'q',ly:'p',tx:[5,10,20,24],ty:[2,5,7,9,12,14],
    polys:[{pts:[[0,9],[0,7],[10,7]],c:'orange',op:.3},{pts:[[0,2],[0,7],[10,7]],c:'blue',op:.25}],
    segs:[{a:[20,5],b:[20,12]},{a:[0,12],b:[20,12]},{a:[24,12],b:[24,14]}],
    fns:[{f:q=>-q/5+9,from:0,to:45,c:'orange',t:'D: p = −q/5 + 9',tx:44,dy:-8},{f:q=>q/2+2,from:0,to:27,c:'blue',t:'O: p = q/2 + 2',tx:26.5,anchor:'start',dx:6,dy:6}],
    pts:[{x:10,y:7,c:'purple',t:'(10, 7)',dx:6,dy:16},{x:5,y:8,c:'orange',t:'(5, 8)',dy:-8},{x:20,y:5,c:'orange',t:'(20, 5)',dy:16},{x:20,y:12,c:'blue',t:'(20, 12)',anchor:'end',dx:-6,dy:-8},{x:24,y:14,c:'blue',t:'+2',anchor:'end',dx:-8}]});

  /* ---------- ejemplos ---------- */
  plot('g-ex-p2',{alt:'Parábola y=x²−6x+8',x:[-1.5,6.5],y:[-2.5,9.5],tx:[3],ty:[8],fns:[{f:x=>x*x-6*x+8}],
    pts:[{x:3,y:-1,c:'blue',t:'V(3, −1)',dy:20,dx:0,anchor:'middle'},{x:2,y:0,c:'orange',t:'(2, 0)',anchor:'end',dx:-8,dy:16},{x:4,y:0,c:'orange',t:'(4, 0)',dx:8,dy:16},{x:0,y:8,c:'orange',t:'(0, 8)'}]});
  plot('g-ex-p3',{alt:'Parábola y=x²−10x+21',x:[-1.5,10.5],y:[-6,24],gx:1,gy:3,tx:[5],ty:[21],fns:[{f:x=>x*x-10*x+21}],
    pts:[{x:5,y:-4,c:'blue',t:'V(5, −4)',dy:20,dx:0,anchor:'middle'},{x:3,y:0,c:'orange',t:'(3, 0)',anchor:'end',dx:-8,dy:16},{x:7,y:0,c:'orange',t:'(7, 0)',dx:8,dy:16},{x:0,y:21,c:'orange',t:'(0, 21)'}]});
  plot('g-ex-p4',{alt:'Parábola, recta y=x y triángulo',eq:true,x:[-1,5.5],y:[-1,5.5],tx:[2],ty:[],
    polys:[{pts:[[2,0],[1,1],[4,4]],c:'green'}],fns:[{f:x=>(x-2)*(x-2)},{f:x=>x,c:'orange',t:'y = x',tx:5.3,anchor:'end',dx:-6,dy:18}],
    pts:[{x:2,y:0,c:'blue',t:'V(2, 0)',dx:8,dy:16},{x:1,y:1,c:'purple',t:'(1, 1)',anchor:'end',dx:-8,dy:-2},{x:4,y:4,c:'purple',t:'(4, 4)',anchor:'end',dx:-8,dy:-4}]});
  plot('g-ex-p5',{alt:'Tangente a y=x²−2x en (3,3)',x:[-1.5,5],y:[-2.5,10],tx:[3],ty:[3],
    fns:[{f:x=>x*x-2*x,t:'y = x² − 2x',tx:-1.2,anchor:'start',dx:10,dy:0},{f:x=>4*x-9,c:'orange',t:'y = 4x − 9',tx:4.4,anchor:'start',dx:8,dy:10}],
    pts:[{x:3,y:3,c:'magenta',t:'(3, 3)',anchor:'end',dx:-8,dy:-6}]});
  plot('g-ex-p6',{alt:'Parábolas y=x²+3 e y=−x²+4x+1 tangentes en (1,4)',x:[-2.5,4.5],y:[-1.5,9],tx:[1],ty:[4],
    fns:[{f:x=>x*x+3,t:'y = x² + 3',tx:-2.3,anchor:'start',dx:12,dy:4},{f:x=>-x*x+4*x+1,c:'green',t:'y = −x² + 4x + 1',tx:4.1,anchor:'end',dx:-8,dy:4}],
    pts:[{x:1,y:4,c:'purple',t:'(1, 4)',dx:8,dy:18}]});
  plot('g-ex-p8',{alt:'Cable del puente',x:[-115,115],y:[-5,70],gx:20,gy:10,h:300,tx:[-100,-80,-60,60,100],ty:[42,60],
    segs:[{a:[-100,0],b:[-100,60],c:'muted',wd:5,dash:false},{a:[100,0],b:[100,60],c:'muted',wd:5,dash:false},{a:[-80,0],b:[-80,42]},{a:[-60,0],b:[-60,28]},{a:[60,0],b:[60,28]}],
    fns:[{f:x=>x*x/200+10,from:-100,to:100}],
    pts:[{x:0,y:10,c:'blue',t:'V(0, 10)',dx:6,dy:15},{x:-80,y:42,c:'purple',t:'42 m',dx:8,dy:-6},{x:-60,y:28,c:'orange'},{x:60,y:28,c:'orange',t:'28 m',dx:8,dy:-6}]});
  plot('g-ex-p9',{alt:'Utilidad U=6x−x²',x:[-0.5,7],y:[-3,10.5],tx:[1,2,3,5,6],ty:[5,8,9],lx:'x (miles)',ly:'U',
    fns:[{f:x=>6*x-x*x,from:0,to:6.8}],segs:[{a:[1,5],b:[5,5]},{a:[2,0],b:[2,8]}],
    pts:[{x:3,y:9,c:'blue',t:'máx (3, 9)',dx:10,dy:-6},{x:1,y:5,c:'magenta'},{x:5,y:5,c:'magenta'},{x:2,y:8,c:'magenta'},{x:6,y:0,c:'orange'}]});
  plot('g-ex-p10',{alt:'Dos parábolas tangentes en (1,5)',x:[-3.5,7],y:[-1.5,10.5],tx:[-1,1,3,6],ty:[],
    fns:[{f:x=>x*x+2*x+2,t:'P₁',tx:-3.1,anchor:'start',dx:10,dy:4},{f:x=>-x*x+6*x,c:'green',t:'P₂',tx:6.25,anchor:'start',dx:8,dy:-2}],
    pts:[{x:-1,y:1,c:'blue',t:'V₁(−1, 1)',anchor:'end',dx:-8,dy:14},{x:3,y:9,c:'blue',t:'V₂(3, 9)',dy:-12,anchor:'middle',dx:0},{x:1,y:5,c:'purple',t:'(1, 5)',dx:10,dy:16},
      {x:0,y:2,c:'orange',t:'(0, 2)',anchor:'end',dx:-6,dy:-4},{x:0,y:0,c:'orange',t:'(0, 0)',dx:6,dy:16},{x:6,y:0,c:'orange',t:'(6, 0)',anchor:'end',dx:-6,dy:16}]});
  plot('g-ex-p11',{alt:'Parábola y=−x²+2x+8 y triángulo',x:[-3.5,5.5],y:[-2,10.5],tx:[1],ty:[8],
    polys:[{pts:[[-2,0],[4,0],[1,9]],c:'green'}],fns:[{f:x=>-x*x+2*x+8}],
    pts:[{x:1,y:9,c:'blue',t:'V(1, 9)',dx:10,dy:-4},{x:-2,y:0,c:'orange',t:'(−2, 0)',anchor:'end',dx:-6,dy:18},{x:4,y:0,c:'orange',t:'(4, 0)',dx:6,dy:18},{x:0,y:8,c:'orange'}]});
  plot('g-ex-p12',{alt:'Tangencia de y=−2x² con y=4x+2',eq:true,x:[-3.2,2.2],y:[-5,2.2],tx:[-1],ty:[-2],
    fns:[{f:x=>-2*x*x,t:'y = −2x²',tx:1.4,anchor:'start',dx:8,dy:4},{f:x=>4*x+2,c:'orange',t:'y = 4x + 2',tx:-0.25,anchor:'start',dx:8,dy:4}],
    pts:[{x:-1,y:-2,c:'magenta',t:'(−1, −2)',anchor:'end',dx:-8}]});
  plot('g-ex-c2',{alt:'Circunferencia tangente al eje y',eq:true,x:[-1.5,7.5],y:[-6,1.5],tx:[3],ty:[-2],
    circs:[{h:3,k:-2,r:3}],pts:[{x:3,y:-2,c:'blue',t:'(3, −2)'},{x:0,y:-2,c:'purple',t:'(0, −2)',anchor:'end',dx:-8}]});
  plot('g-ex-c3',{alt:'Dos circunferencias tangentes a la recta en (1,7)',eq:true,x:[-9,11.5],y:[-2,16],gx:2,gy:2,tx:[-3,1,5],ty:[4,7,10],
    fns:[{f:x=>(25-4*x)/3,c:'orange',t:'4x + 3y − 25 = 0',tx:9.5,anchor:'end',dx:-6,dy:-8}],
    segs:[{a:[-3,4],b:[5,10]}],circs:[{h:5,k:10,r:5},{h:-3,k:4,r:5}],
    pts:[{x:5,y:10,c:'blue',t:'(5, 10)'},{x:-3,y:4,c:'blue',t:'(−3, 4)',anchor:'end',dx:-8,dy:4},{x:1,y:7,c:'magenta',t:'T(1, 7)',dx:10,dy:18}]});
  plot('g-ex-c4',{alt:'Recta por el centro y P',eq:true,x:[-4.5,10],y:[-5,11],tx:[2,5,8],ty:[1,5,9],
    circs:[{h:2,k:1,r:5}],fns:[{f:x=>1+4/3*(x-2),c:'orange'}],
    pts:[{x:2,y:1,c:'blue',t:'C(2, 1)',dx:10,dy:-2},{x:8,y:9,c:'magenta',t:'P(8, 9)',anchor:'end',dx:-8},{x:5,y:5,c:'purple',t:'(5, 5)',dx:10,dy:6},{x:-1,y:-3,c:'purple',t:'(−1, −3)',anchor:'end',dx:-8,dy:4}]});
  plot('g-ex-c5',{alt:'Circunferencia de centro (5,0)',eq:true,x:[-1,11],y:[-5.5,5.5],tx:[5],ty:[],
    circs:[{h:5,k:0,r:Math.sqrt(20)}],pts:[{x:5,y:0,c:'blue',t:'(5, 0)',dy:-8},{x:1,y:2,c:'magenta',t:'A(1, 2)',dx:8,dy:4},{x:3,y:4,c:'magenta',t:'B(3, 4)',anchor:'end',dx:-8,dy:-6}]});
  plot('g-ex-c6',{alt:'Dos tangentes desde (3,1)',eq:true,x:[-3.5,5],y:[-3.5,4],tx:[1,2,3],ty:[],
    circs:[{h:0,k:0,r:Math.sqrt(5)}],fns:[{f:x=>2-0.5*(x-1),c:'orange'},{f:x=>-1+2*(x-2),c:'orange'}],
    segs:[{a:[0,0],b:[1,2],c:'blue'},{a:[0,0],b:[2,-1],c:'blue'}],
    pts:[{x:0,y:0,c:'blue',t:'O',anchor:'end',dx:-6,dy:4},{x:3,y:1,c:'ink',t:'P(3, 1)',dx:10,dy:4},{x:1,y:2,c:'magenta',t:'(1, 2)',anchor:'end',dx:-6,dy:-6},{x:2,y:-1,c:'magenta',t:'(2, −1)',anchor:'end',dx:-6,dy:16}]});
  plot('g-ex-c7',{alt:'Circunferencia de centro (−6,−8) y radio 10',eq:true,x:[-18,5],y:[-19,4],gx:2,gy:2,tx:[-6],ty:[-8],
    circs:[{h:-6,k:-8,r:10}],segs:[{a:[-6,-8],b:[0,0],c:'blue'}],pts:[{x:-6,y:-8,c:'blue',t:'(−6, −8)',anchor:'middle',dx:0,dy:18},{x:0,y:0,c:'magenta',t:'O',dx:8,dy:-6}]});
  plot('g-ex-c8',{alt:'Circunferencia de centro (3,4) y recta',eq:true,x:[-2.5,9],y:[-2,10],tx:[2,6],ty:[4],
    circs:[{h:3,k:4,r:5}],fns:[{f:x=>-2*(x-2),c:'green',t:'l',tx:-1.7,anchor:'end',dx:-8,dy:4}],
    pts:[{x:3,y:4,c:'blue',t:'(3, 4)',dx:8,dy:-4},{x:0,y:0,c:'orange',t:'(0, 0)',anchor:'end',dx:-6,dy:16},{x:6,y:0,c:'orange',t:'(6, 0)',dx:6,dy:16},{x:0,y:8,c:'orange',t:'(0, 8)',anchor:'end',dx:-6},{x:2,y:0,c:'magenta'},{x:0,y:4,c:'magenta'}]});
  plot('g-ex-c9',{alt:'Circunferencia de centro (1,1) y radio raíz de 10',eq:true,x:[-3.5,5.5],y:[-3.5,5.5],tx:[],ty:[],
    circs:[{h:1,k:1,r:Math.sqrt(10)}],
    pts:[{x:1,y:1,c:'blue',t:'(1, 1)'},{x:0,y:4,c:'orange',t:'M',anchor:'end',dx:-6},{x:0,y:-2,c:'orange',t:'P',anchor:'end',dx:-6,dy:16},{x:-2,y:0,c:'orange',t:'N',anchor:'end',dx:-6,dy:16},{x:4,y:0,c:'orange',t:'Q',dx:6,dy:16}]});
  plot('g-ex-c10',{alt:'Triángulo sombreado',eq:true,x:[-3,3.5],y:[-3,3.5],tx:[-1,2],ty:[2,-2],
    polys:[{pts:[[-1,2],[2,0],[0,-2]],c:'green'}],circs:[{h:-1,k:2,r:1,c:'muted',wd:1.4}],fns:[{f:x=>x-2,c:'ink',t:'y = x − 2',tx:3.3,dy:-6}],
    pts:[{x:-1,y:2,c:'blue',t:'(−1, 2)',anchor:'end',dx:-8,dy:-4},{x:2,y:0,c:'orange',t:'(2, 0)',dy:-8,anchor:'end',dx:-4},{x:0,y:-2,c:'orange',t:'(0, −2)',anchor:'end',dx:-8,dy:4}]});
  plot('g-ex-c11',{alt:'Trapecio entre dos circunferencias',eq:true,x:[-1,9.5],y:[-1,7],tx:[3,7],ty:[1,3],
    polys:[{pts:[[3,0],[3,3],[7,1],[7,0]],c:'green'}],circs:[{h:3,k:3,r:3},{h:7,k:1,r:1}],
    pts:[{x:3,y:3,c:'blue',t:'C₁(3, 3)',anchor:'end',dx:-6},{x:7,y:1,c:'blue',t:'C₂(7, 1)',anchor:'middle',dx:0,dy:-8},{x:3,y:0,c:'orange',t:'T₁',dx:8,dy:16},{x:7,y:0,c:'orange',t:'T₂',dx:8,dy:16}]});
  plot('g-ex-c12',{alt:'Potencia del origen',eq:true,x:[-1,7],y:[-1,7],tx:[1,5],ty:[],
    circs:[{h:3,k:3,r:Math.sqrt(8)}],fns:[{f:x=>x,c:'green',t:'y = x',tx:6.6,anchor:'end',dx:-8,dy:2}],
    pts:[{x:3,y:3,c:'blue',t:'(3, 3)',dx:8,dy:14},{x:0,y:0,c:'magenta',t:'P',dx:6,dy:-8},{x:1,y:1,c:'purple',t:'A(1, 1)',dx:10,dy:6},{x:5,y:5,c:'purple',t:'B(5, 5)',dx:10,dy:6}]});
  plot('g-ex-od1',{alt:'Oferta y demanda del ejemplo 1',x:[0,85],y:[0,23],gx:10,gy:2,lx:'q',ly:'p',tx:[24,80],ty:[2,14,20],
    polys:[{pts:[[0,20],[0,14],[24,14]],c:'orange',op:.3},{pts:[[0,2],[0,14],[24,14]],c:'blue',op:.25}],segs:[{a:[24,0],b:[24,14]}],
    fns:[{f:q=>-q/4+20,from:0,to:80,c:'orange',t:'D',tx:70,dy:-10},{f:q=>q/2+2,from:0,to:42,c:'blue',t:'O',tx:38,anchor:'end',dx:-8}],
    pts:[{x:24,y:14,c:'purple',t:'(24, 14)',dx:8,dy:-8},{x:10,y:7,c:'blue',r:3.5},{x:20,y:12,c:'blue',r:3.5}]});
  plot('g-ex-od2',{alt:'Oferta y demanda del ejemplo 2',x:[0,90],y:[0,22],gx:10,gy:2,lx:'q',ly:'p',tx:[20,40,80],ty:[5,10,15,20],
    polys:[{pts:[[0,20],[0,10],[40,10]],c:'orange',op:.3},{pts:[[0,5],[0,10],[40,10]],c:'blue',op:.25}],segs:[{a:[40,0],b:[40,10]}],
    fns:[{f:q=>-q/4+20,from:0,to:80,c:'orange',t:'D',tx:75,dy:-10},{f:q=>q/8+5,from:0,to:90,c:'blue',t:'O',tx:86,dy:-8}],
    pts:[{x:40,y:10,c:'purple',t:'(40, 10)',dx:8,dy:16},{x:20,y:15,c:'orange',r:3.5},{x:80,y:15,c:'blue',r:3.5}]});
  plot('g-ex-od3',{alt:'Oferta y demanda del ejemplo 3',x:[0,9],y:[0,26],gx:1,gy:2,lx:'q',ly:'p',tx:[4,8],ty:[4,12,24],
    polys:[{pts:[[0,24],[0,12],[4,12]],c:'orange',op:.3},{pts:[[0,4],[0,12],[4,12]],c:'blue',op:.25}],segs:[{a:[4,0],b:[4,12]}],
    fns:[{f:q=>2*q+4,c:'blue',t:'O: p = 2q + 4',tx:8.6,anchor:'end',dx:-8,dy:0},{f:q=>-3*q+24,from:0,to:8,c:'orange',t:'D: p = −3q + 24',tx:7,anchor:'start',dx:8,dy:0}],
    pts:[{x:4,y:12,c:'purple',t:'(4, 12)',dx:8,dy:-8}]});
  plot('g-ex-od4',{alt:'Oferta p=q/2+3',x:[0,10],y:[0,9.5],lx:'q',ly:'p',tx:[6],ty:[3,6],
    polys:[{pts:[[0,3],[0,6],[6,6]],c:'blue',op:.25}],segs:[{a:[0,6],b:[6,6],c:'blue'},{a:[6,0],b:[6,6]}],
    fns:[{f:q=>q/2+3,c:'blue',t:'O: p = q/2 + 3',tx:9.5,anchor:'end',dx:-6,dy:-10}],
    pts:[{x:6,y:6,c:'purple',t:'(6, 6)',anchor:'end',dx:-8,dy:-8},{x:1.6,y:5.15,c:'blue',r:0.01,t:'EP = 9',dx:0,dy:4}]});
  plot('g-ex-od5',{alt:'Oferta y demanda del ejemplo 5',x:[0,10.5],y:[0,30],gx:1,gy:2,lx:'q',ly:'p',tx:[4],ty:[8,16,28],
    segs:[{a:[0,16],b:[4,16]},{a:[4,0],b:[4,16]}],
    fns:[{f:q=>2*q+8,c:'blue',t:'p = 2q + 8',tx:9.5,anchor:'end',dx:-8,dy:0},{f:q=>28-3*q,from:0,to:28/3,c:'orange',t:'p = 28 − 3q',tx:7.5,anchor:'start',dx:8,dy:0}],
    pts:[{x:4,y:16,c:'purple',t:'(4, 16)',dx:10,dy:16}]});
  plot('g-ex-od6',{alt:'Mercado del ejemplo 6',x:[0,55],y:[0,33],gx:5,gy:3,lx:'q',ly:'p',tx:[10,30,50],ty:[10,15,20,30],
    fns:[{f:q=>q/2+5,c:'blue',t:'O',tx:53,dx:-4},{f:q=>-q/2+15,from:0,to:30,c:'orange',t:'D',tx:28,dy:-8}],
    pts:[{x:10,y:10,c:'purple',t:'(10, 10)',dx:8,dy:-8},{x:30,y:20,c:'blue',r:3.5},{x:50,y:30,c:'blue',r:3.5},{x:4,y:13,c:'orange',r:3.5},{x:8,y:11,c:'orange',r:3.5}]});
  plot('g-ex-od7',{alt:'Demandas de A y B y oferta',x:[0,16],y:[0,25],gx:2,gy:2,lx:'q',ly:'p',tx:[3,6,10.5,15],ty:[9,12,15,21],
    fns:[{f:q=>q+9,from:0,to:15,c:'blue',t:'O: p = q + 9',tx:14.5,anchor:'end',dx:-8,dy:0},{f:q=>-q+15,from:0,to:15,c:'orange',t:'Bien A',tx:13.5,dy:-8},{f:q=>21-2*q,from:0,to:10.5,c:'green',t:'Bien B',tx:9.5,anchor:'start',dx:8,dy:-4}],
    pts:[{x:3,y:12,c:'purple',t:'(3, 12)',dx:8,dy:-6},{x:6,y:9,c:'purple',t:'(6, 9)',dx:6,dy:18}]});
  plot('g-ex-od8',{alt:'Mercado del ron, ejemplo',x:[0,24],y:[0,12],gx:2,gy:1,lx:'q',ly:'p',tx:[4,8,16,20],ty:[4,6,8,10],
    polys:[{pts:[[0,10],[0,6],[8,6]],c:'orange',op:.3},{pts:[[0,4],[0,6],[8,6]],c:'blue',op:.25}],
    segs:[{a:[16,2],b:[16,8]},{a:[20,8],b:[20,9]}],
    fns:[{f:q=>-q/2+10,from:0,to:20,c:'orange',t:'D: p = −q/2 + 10',tx:18.3,anchor:'start',dx:10,dy:0},{f:q=>q/4+4,from:0,to:23,c:'blue',t:'O: p = q/4 + 4',tx:23,anchor:'end',dx:-6,dy:-10}],
    pts:[{x:8,y:6,c:'purple',t:'(8, 6)',dx:6,dy:18},{x:4,y:8,c:'orange',t:'(4, 8)',dx:8,dy:-8},{x:16,y:2,c:'orange',t:'(16, 2)',anchor:'end',dx:-8,dy:4},{x:16,y:8,c:'blue',t:'(16, 8)',anchor:'end',dx:-6,dy:-8},{x:20,y:9,c:'blue',t:'+1',anchor:'end',dx:-8}]});

  plot('g-ex-p2b',{alt:'Parábola y=−x²+2x+3',x:[-2.5,4.5],y:[-1.5,5],tx:[1],ty:[3],fns:[{f:x=>-x*x+2*x+3}],
    pts:[{x:1,y:4,c:'blue',t:'V(1, 4)',dy:-10,dx:0,anchor:'middle'},{x:-1,y:0,c:'orange',t:'(−1, 0)',anchor:'end',dx:-8,dy:16},{x:3,y:0,c:'orange',t:'(3, 0)',dx:8,dy:16},{x:0,y:3,c:'orange',t:'(0, 3)',anchor:'end',dx:-6,dy:-6}]});
  plot('g-ex-p3b',{alt:'Parábola y=x²+4x−5',x:[-6.5,2.5],y:[-10.5,8],gy:2,tx:[-2],ty:[-5],fns:[{f:x=>x*x+4*x-5}],
    pts:[{x:-2,y:-9,c:'blue',t:'V(−2, −9)',dy:20,dx:0,anchor:'middle'},{x:-5,y:0,c:'orange',t:'(−5, 0)',anchor:'end',dx:-8,dy:-6},{x:1,y:0,c:'orange',t:'(1, 0)',dx:8,dy:-6},{x:0,y:-5,c:'orange',t:'(0, −5)',dx:8,dy:4}]});
  plot('g-ex-p4b',{alt:'Parábola, recta y triángulo',x:[-2.5,5.5],y:[-5,7],tx:[1],ty:[],polys:[{pts:[[1,-4],[4,5],[-1,0]],c:'green'}],
    fns:[{f:x=>x*x-2*x-3},{f:x=>x+1,c:'orange',t:'y = x + 1',tx:5.3,anchor:'end',dx:-6,dy:18}],
    pts:[{x:1,y:-4,c:'blue',t:'V(1, −4)',dx:8,dy:14},{x:4,y:5,c:'purple',t:'(4, 5)',anchor:'end',dx:-8},{x:-1,y:0,c:'purple',t:'(−1, 0)',anchor:'end',dx:-8,dy:-6}]});
  plot('g-ex-p5b',{alt:'Tangente a y=−x²+4x en (1,3)',x:[-1,5],y:[-2,6],tx:[1],ty:[3],
    fns:[{f:x=>-x*x+4*x,t:'y = −x² + 4x',tx:3.6,anchor:'start',dx:8,dy:0},{f:x=>2*x+1,c:'orange',t:'y = 2x + 1',tx:2.4,anchor:'end',dx:-8,dy:4}],
    pts:[{x:1,y:3,c:'magenta',t:'(1, 3)',anchor:'end',dx:-8,dy:-6}]});
  plot('g-ex-p6b',{alt:'Las dos parábolas posibles tangentes a y=−x²+2x+3',x:[-3.5,3.5],y:[-4.5,10],tx:[],ty:[],
    fns:[{f:x=>-x*x+2*x+3,c:'green',t:'y = −x² + 2x + 3',tx:3.1,anchor:'end',dx:-8,dy:-6},{f:x=>x*x+6*x+5,t:'k = 6',tx:0.6,anchor:'end',dx:-6,dy:0},{f:x=>x*x-2*x+5,dash:'6 4',t:'k = −2',tx:3.2,anchor:'end',dx:-6,dy:0}],
    pts:[{x:-1,y:0,c:'purple',t:'(−1, 0)',anchor:'end',dx:-8,dy:16},{x:1,y:4,c:'purple',t:'(1, 4)',dx:8,dy:16}]});
  plot('g-ex-p8b',{alt:'Arco parabólico',x:[-35,35],y:[-2,22],gx:10,gy:2,h:280,tx:[-30,-20,-10,10,20,30],ty:[10,16,18],
    segs:[{a:[-10,0],b:[-10,16]},{a:[-20,0],b:[-20,10]},{a:[20,0],b:[20,10]}],fns:[{f:x=>-x*x/50+18,from:-30,to:30}],
    pts:[{x:0,y:18,c:'blue',t:'V(0, 18)',dy:-10,dx:0,anchor:'middle'},{x:-10,y:16,c:'purple',t:'16 m',anchor:'end',dx:-8,dy:-6},{x:-20,y:10,c:'orange'},{x:20,y:10,c:'orange',t:'10 m',dx:8,dy:-6},{x:-30,y:0,c:'magenta'},{x:30,y:0,c:'magenta'}]});
  plot('g-ex-p9b',{alt:'Utilidad U=−x²+8x−12',x:[-0.5,8],y:[-6,6],tx:[1,2,3,4,5,6],ty:[3,4,-5],lx:'x (miles)',ly:'U',
    fns:[{f:x=>-x*x+8*x-12,from:0.5,to:7.5}],segs:[{a:[3,3],b:[5,3]}],
    pts:[{x:4,y:4,c:'blue',t:'máx (4, 4)',dx:10,dy:-6},{x:2,y:0,c:'orange'},{x:6,y:0,c:'orange'},{x:1,y:-5,c:'magenta',t:'(1, −5)',dx:8},{x:3,y:3,c:'magenta'},{x:5,y:3,c:'magenta'}]});
  plot('g-ex-p10b',{alt:'Dos parábolas que se cortan en dos puntos',x:[-1.5,5.5],y:[-1,8],tx:[1,2,3,4],ty:[],
    fns:[{f:x=>x*x-4*x+6,t:'P₁',tx:4.35,anchor:'start',dx:6},{f:x=>-x*x+4*x,c:'green',t:'P₂',tx:4.2,anchor:'start',dx:6,dy:-4}],
    pts:[{x:2,y:2,c:'blue',t:'V₁(2, 2)',dy:20,dx:0,anchor:'middle'},{x:2,y:4,c:'blue',t:'V₂(2, 4)',dy:-10,dx:0,anchor:'middle'},{x:1,y:3,c:'purple',t:'(1, 3)',anchor:'end',dx:-8},{x:3,y:3,c:'purple',t:'(3, 3)',dx:8},
      {x:0,y:6,c:'orange',t:'(0, 6)',dx:8,dy:4},{x:0,y:0,c:'orange',t:'(0, 0)',anchor:'end',dx:-6,dy:16},{x:4,y:0,c:'orange',t:'(4, 0)',dx:6,dy:16}]});
  plot('g-ex-p11b',{alt:'Parábola y=x²−6x+5 y triángulo',x:[-1,7],y:[-5,6.5],tx:[3],ty:[5],polys:[{pts:[[1,0],[5,0],[3,-4]],c:'green'}],fns:[{f:x=>x*x-6*x+5}],
    pts:[{x:3,y:-4,c:'blue',t:'V(3, −4)',dy:18,dx:0,anchor:'middle'},{x:1,y:0,c:'orange',t:'(1, 0)',anchor:'end',dx:-6,dy:-8},{x:5,y:0,c:'orange',t:'(5, 0)',dx:6,dy:-8},{x:0,y:5,c:'orange',dx:8}]});
  plot('g-ex-p12b',{alt:'Tangencia de y=−x² con y=−2x+1',eq:true,x:[-2.5,3.2],y:[-4,2.5],tx:[1],ty:[-1],
    fns:[{f:x=>-x*x,t:'y = −x²',tx:-1.8,anchor:'end',dx:-6,dy:4},{f:x=>-2*x+1,c:'orange',t:'y = −2x + 1',tx:-0.6,anchor:'start',dx:8,dy:-4}],
    pts:[{x:1,y:-1,c:'magenta',t:'(1, −1)',dx:8,dy:4}]});
  plot('g-ex-c2b',{alt:'Circunferencias con k=4 y k=1',eq:true,x:[-5.5,1.5],y:[-1.5,3.5],tx:[],ty:[],
    circs:[{h:-2,k:1,r:1},{h:-2,k:1,r:2,dash:'6 4'}],
    pts:[{x:-2,y:1,c:'blue',t:'(−2, 1)',dx:8,dy:-4},{x:-2,y:0,c:'purple',t:'k = 4',dx:6,dy:16},{x:0,y:1,c:'purple',t:'k = 1',dx:8,dy:4}]});
  plot('g-ex-c3b',{alt:'Dos circunferencias tangentes a la recta en (1,2)',eq:true,x:[-4,6],y:[-4.5,8.5],tx:[1,2],ty:[-1,2,5],
    fns:[{f:x=>(x+5)/3,c:'orange',t:'x − 3y + 5 = 0',tx:5.5,anchor:'end',dx:-6,dy:18}],segs:[{a:[2,-1],b:[0,5]}],
    circs:[{h:2,k:-1,r:Math.sqrt(10)},{h:0,k:5,r:Math.sqrt(10)}],
    pts:[{x:2,y:-1,c:'blue',t:'(2, −1)',dx:8,dy:4},{x:0,y:5,c:'blue',t:'(0, 5)',dx:8,dy:-6},{x:1,y:2,c:'magenta',t:'T(1, 2)',dx:10,dy:16}]});
  plot('g-ex-c4b',{alt:'Recta por el centro y P',eq:true,x:[-7,7],y:[-5,11],tx:[-4,-1,2,5],ty:[-2,2,6,10],circs:[{h:-1,k:2,r:5}],fns:[{f:x=>2+4/3*(x+1),c:'orange'}],
    pts:[{x:-1,y:2,c:'blue',t:'C(−1, 2)',dx:10,dy:-2},{x:5,y:10,c:'magenta',t:'P(5, 10)',anchor:'end',dx:-8},{x:2,y:6,c:'purple',t:'(2, 6)',dx:10,dy:6},{x:-4,y:-2,c:'purple',t:'(−4, −2)',anchor:'end',dx:-8,dy:4}]});
  plot('g-ex-c5b',{alt:'Circunferencia de centro (0,5)',eq:true,x:[-5.5,6],y:[-0.5,10],tx:[2,4],ty:[5],circs:[{h:0,k:5,r:Math.sqrt(20)}],
    pts:[{x:0,y:5,c:'blue',t:'(0, 5)',dx:8,dy:-6},{x:2,y:1,c:'magenta',t:'A(2, 1)',dx:8,dy:4},{x:4,y:3,c:'magenta',t:'B(4, 3)',dx:8}]});
  plot('g-ex-c6b',{alt:'Tangentes desde (0,5)',eq:true,x:[-4,4],y:[-3,6],tx:[-2,2],ty:[1,5],circs:[{h:0,k:0,r:Math.sqrt(5)}],
    fns:[{f:x=>-2*(x-2)+1,c:'orange'},{f:x=>2*(x+2)+1,c:'orange'}],segs:[{a:[0,0],b:[2,1],c:'blue'},{a:[0,0],b:[-2,1],c:'blue'}],
    pts:[{x:0,y:0,c:'blue',t:'O',dx:6,dy:16},{x:0,y:5,c:'ink',t:'P(0, 5)',dx:8},{x:2,y:1,c:'magenta',t:'(2, 1)',dx:8,dy:4},{x:-2,y:1,c:'magenta',t:'(−2, 1)',anchor:'end',dx:-8,dy:4}]});
  plot('g-ex-c7b',{alt:'Circunferencia de centro (−4,3) y radio 5',eq:true,x:[-10,2.5],y:[-3,9],tx:[-4],ty:[3],circs:[{h:-4,k:3,r:5}],segs:[{a:[-4,3],b:[0,0],c:'blue'}],
    pts:[{x:-4,y:3,c:'blue',t:'(−4, 3)',dx:0,dy:-10,anchor:'middle'},{x:0,y:0,c:'magenta',t:'O',dx:8,dy:-6}]});
  plot('g-ex-c8b',{alt:'Circunferencia de centro (4,3) y recta',eq:true,x:[-2,10],y:[-2.5,9],tx:[6,8],ty:[3,6],circs:[{h:4,k:3,r:5}],
    fns:[{f:x=>-0.5*(x-6),c:'green',t:'l',tx:9.5,anchor:'start',dx:6,dy:4}],
    pts:[{x:4,y:3,c:'blue',t:'(4, 3)',dx:8,dy:-4},{x:0,y:0,c:'orange',t:'(0, 0)',anchor:'end',dx:-6,dy:16},{x:8,y:0,c:'orange',t:'(8, 0)',dx:6,dy:16},{x:0,y:6,c:'orange',t:'(0, 6)',anchor:'end',dx:-6},{x:6,y:0,c:'magenta'},{x:0,y:3,c:'magenta'}]});
  plot('g-ex-c9b',{alt:'Circunferencia de centro (2,2)',eq:true,x:[-2.5,6.5],y:[-2.5,6.5],tx:[],ty:[],circs:[{h:2,k:2,r:Math.sqrt(13)}],
    pts:[{x:2,y:2,c:'blue',t:'(2, 2)'},{x:0,y:5,c:'orange',t:'M',anchor:'end',dx:-6},{x:0,y:-1,c:'orange',t:'P',anchor:'end',dx:-6,dy:16},{x:-1,y:0,c:'orange',t:'N',anchor:'end',dx:-6,dy:16},{x:5,y:0,c:'orange',t:'Q',dx:6,dy:16}]});
  plot('g-ex-c10b',{alt:'Triángulo sombreado',eq:true,x:[-1,4],y:[-1,4.5],tx:[2],ty:[2,3],polys:[{pts:[[2,3],[2,0],[0,2]],c:'green'}],
    circs:[{h:2,k:3,r:1,c:'muted',wd:1.4}],fns:[{f:x=>-x+2,c:'ink',t:'y = −x + 2',tx:2.8,anchor:'start',dx:6,dy:0}],
    pts:[{x:2,y:3,c:'blue',t:'(2, 3)',dx:8,dy:-6},{x:2,y:0,c:'orange',t:'(2, 0)',dx:8,dy:16},{x:0,y:2,c:'orange',t:'(0, 2)',anchor:'end',dx:-8}]});
  plot('g-ex-c11b',{alt:'Trapecio junto al eje y',eq:true,x:[-1.5,5],y:[-0.5,9],tx:[1,2],ty:[],polys:[{pts:[[0,3],[2,3],[1,7],[0,7]],c:'green'}],
    circs:[{h:2,k:3,r:2},{h:1,k:7,r:1}],
    pts:[{x:2,y:3,c:'blue',t:'C₁(2, 3)',dx:8,dy:4},{x:1,y:7,c:'blue',t:'C₂(1, 7)',dx:8},{x:0,y:3,c:'orange',t:'T₁',anchor:'end',dx:-8},{x:0,y:7,c:'orange',t:'T₂',anchor:'end',dx:-8}]});
  plot('g-ex-c12b',{alt:'Potencia del origen',eq:true,x:[-1,5.5],y:[-1,7.5],tx:[1,3],ty:[],circs:[{h:2,k:4,r:Math.sqrt(5)}],
    fns:[{f:x=>2*x,c:'green',t:'y = 2x',tx:3.6,anchor:'end',dx:-8}],
    pts:[{x:2,y:4,c:'blue',t:'(2, 4)',dx:10,dy:14},{x:0,y:0,c:'magenta',t:'P',dx:6,dy:-8},{x:1,y:2,c:'purple',t:'A(1, 2)',dx:10,dy:6},{x:3,y:6,c:'purple',t:'B(3, 6)',dx:10,dy:6}]});
  plot('g-ex-od1b',{alt:'Oferta y demanda',x:[0,95],y:[0,33],gx:10,gy:3,lx:'q',ly:'p',tx:[36,90],ty:[6,18,30],
    polys:[{pts:[[0,30],[0,18],[36,18]],c:'orange',op:.3},{pts:[[0,6],[0,18],[36,18]],c:'blue',op:.25}],segs:[{a:[36,0],b:[36,18]}],
    fns:[{f:q=>30-q/3,from:0,to:90,c:'orange',t:'D',tx:80,dy:-10},{f:q=>q/3+6,from:0,to:75,c:'blue',t:'O',tx:70,anchor:'end',dx:-8}],
    pts:[{x:36,y:18,c:'purple',t:'(36, 18)',dx:8,dy:-8},{x:12,y:10,c:'blue',r:3.5},{x:24,y:14,c:'blue',r:3.5}]});
  plot('g-ex-od2b',{alt:'Oferta y demanda',x:[0,70],y:[0,25],gx:10,gy:2,lx:'q',ly:'p',tx:[30,66],ty:[7,12,22],
    polys:[{pts:[[0,22],[0,12],[30,12]],c:'orange',op:.3},{pts:[[0,7],[0,12],[30,12]],c:'blue',op:.25}],segs:[{a:[30,0],b:[30,12]}],
    fns:[{f:q=>-q/3+22,from:0,to:66,c:'orange',t:'D',tx:60,dy:-10},{f:q=>q/6+7,from:0,to:70,c:'blue',t:'O',tx:68,dy:-8}],
    pts:[{x:30,y:12,c:'purple',t:'(30, 12)',dx:8,dy:16}]});
  plot('g-ex-od3b',{alt:'Oferta y demanda',x:[0,7.5],y:[0,16],tx:[4,7],ty:[2,6,14],
    polys:[{pts:[[0,14],[0,6],[4,6]],c:'orange',op:.3},{pts:[[0,2],[0,6],[4,6]],c:'blue',op:.25}],segs:[{a:[4,0],b:[4,6]}],lx:'q',ly:'p',
    fns:[{f:q=>q+2,c:'blue',t:'O: p = q + 2',tx:7.3,anchor:'end',dx:-8},{f:q=>-2*q+14,from:0,to:7,c:'orange',t:'D: p = −2q + 14',tx:6,anchor:'start',dx:8}],
    pts:[{x:4,y:6,c:'purple',t:'(4, 6)',dx:8,dy:-8}]});
  plot('g-ex-od4b',{alt:'Demanda p=−q/3+7',x:[0,22],y:[0,8.5],gx:2,lx:'q',ly:'p',tx:[6,21],ty:[5,7],
    polys:[{pts:[[0,7],[0,5],[6,5]],c:'orange',op:.3}],segs:[{a:[0,5],b:[6,5],c:'orange'},{a:[6,0],b:[6,5]}],
    fns:[{f:q=>-q/3+7,from:0,to:21,c:'orange',t:'D: p = −q/3 + 7',tx:20,dy:-10}],
    pts:[{x:6,y:5,c:'purple',t:'(6, 5)',dx:8,dy:-8},{x:1.6,y:5.5,c:'ink',r:0.01,t:'EC = 6',dx:0,dy:4}]});
  plot('g-ex-od5b',{alt:'Oferta y demanda',x:[0,21],y:[0,22],gx:2,gy:2,lx:'q',ly:'p',tx:[6],ty:[2,14,20],segs:[{a:[0,14],b:[6,14]},{a:[6,0],b:[6,14]}],
    fns:[{f:q=>2*q+2,from:0,to:10,c:'blue',t:'p = 2q + 2',tx:9.5,anchor:'end',dx:-8},{f:q=>20-q,from:0,to:20,c:'orange',t:'p = 20 − q',tx:18,dy:-8}],
    pts:[{x:6,y:14,c:'purple',t:'(6, 14)',dx:10,dy:16}]});
  plot('g-ex-od6b',{alt:'Mercado',x:[0,65],y:[0,21],gx:5,gy:2,lx:'q',ly:'p',tx:[10,20,30,40],ty:[10,19],
    fns:[{f:q=>q/5+4,c:'blue',t:'O',tx:62,dx:-4},{f:q=>-3*q/10+19,from:0,to:63,c:'orange',t:'D',tx:55,dy:-8}],
    pts:[{x:30,y:10,c:'purple',t:'(30, 10)',dx:8,dy:-8},{x:20,y:8,c:'blue',r:3.5},{x:40,y:12,c:'blue',r:3.5},{x:10,y:16,c:'orange',r:3.5},{x:20,y:13,c:'orange',r:3.5}]});
  plot('g-ex-od7b',{alt:'Demandas de A y B y oferta',x:[0,18],y:[0,20],gx:2,gy:2,lx:'q',ly:'p',tx:[4,8,12,16],ty:[8,10,12,14,16],
    fns:[{f:q=>2*q-6,from:3,to:13,c:'blue',t:'O: p = 2q − 6',tx:12.8,anchor:'end',dx:-8},{f:q=>-q/2+14,from:0,to:18,c:'orange',t:'Bien A',tx:17,dy:-8},{f:q=>16-q,from:0,to:16,c:'green',t:'Bien B',tx:15,anchor:'start',dx:6,dy:-4}],
    pts:[{x:8,y:10,c:'purple',t:'(8, 10)',dx:8,dy:16},{x:4,y:12,c:'purple',t:'(4, 12)',dx:8,dy:-6},{x:12,y:8,c:'orange',r:3.5}]});
  plot('g-ex-od8b',{alt:'Mercado del ron',x:[0,13],y:[0,11],gx:1,gy:1,lx:'q',ly:'p',tx:[3,6,9],ty:[4,6,7,10],
    polys:[{pts:[[0,10],[0,4],[6,4]],c:'orange',op:.3},{pts:[[0,0],[0,4],[6,4]],c:'blue',op:.25}],segs:[{a:[9,1],b:[9,6]}],
    fns:[{f:q=>-q+10,from:0,to:10,c:'orange',t:'D: p = −q + 10',tx:9.6,anchor:'start',dx:8,dy:-2},{f:q=>2*q/3,from:0,to:13,c:'blue',t:'O: p = 2q/3',tx:12.5,anchor:'end',dx:-8,dy:-8}],
    pts:[{x:6,y:4,c:'purple',t:'(6, 4)',dx:8,dy:16},{x:3,y:7,c:'orange',t:'(3, 7)',dx:8,dy:-8},{x:9,y:1,c:'orange',t:'(9, 1)',anchor:'end',dx:-8,dy:4},{x:9,y:6,c:'blue',t:'(9, 6)',anchor:'end',dx:-8,dy:-8}]});

  /* ---------------- tema + pestañas ---------------- */
  const TOPICS=['parabolas','circunferencias','oferta-demanda'];
  let topic='parabolas', tab='teoria';
  const done=new Set(); let chain=Promise.resolve();
  /* evita que un signo (. , ; : ) quede solo al inicio de una línea después de una fórmula */
  function gluePunct(root){
    root.querySelectorAll('mjx-container:not([display="true"])').forEach(m=>{
      const n=m.nextSibling;
      if(!n||n.nodeType!==3) return;
      const k=n.textContent.match(/^[.,;:)]+/);
      if(!k) return;
      const w=document.createElement('span'); w.style.whiteSpace='nowrap';
      m.parentNode.insertBefore(w,m); w.appendChild(m);
      w.appendChild(document.createTextNode(k[0]));
      n.textContent=n.textContent.slice(k[0].length);
    });
  }
  function typeset(panel){
    if(!window.__mj||done.has(panel.id)) return;
    done.add(panel.id);
    chain=chain.then(()=>MathJax.typesetPromise([panel])).then(()=>gluePunct(panel)).catch(()=>{});
  }
  function render(){
    document.querySelectorAll('.topic').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.topic===topic)));
    document.querySelectorAll('.tab').forEach(b=>{const on=b.dataset.tab===tab;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1});
    document.querySelectorAll('.panel').forEach(p=>{p.hidden=p.id!=='pn-'+topic+'-'+tab});
    const n={parabolas:12,circunferencias:12,'oferta-demanda':8}[topic];
    document.getElementById('tab-ejercicios').textContent='Ejercicios resueltos ('+n+')';
    document.getElementById('tab-ejemplos').textContent='Ejemplos ('+2*n+')';
    document.getElementById('tab-ejemplos').setAttribute('aria-controls','pn-'+topic+'-ejemplos');
    const panel=document.getElementById('pn-'+topic+'-'+tab);
    document.getElementById('tab-teoria').setAttribute('aria-controls','pn-'+topic+'-teoria');
    document.getElementById('tab-ejercicios').setAttribute('aria-controls','pn-'+topic+'-ejercicios');
    typeset(panel);
  }
  const TABS=['ejercicios','ejemplos'];
  function fromHash(){
    const h=(location.hash||'').slice(1);
    let t=h, tb='teoria';
    for(const x of TABS){ if(h.endsWith('-'+x)){ t=h.slice(0,-(x.length+1)); tb=x; } }
    if(TOPICS.includes(t)){topic=t;tab=tb}
    render();
  }
  function go(){const h=topic+(tab==='teoria'?'':'-'+tab);if(location.hash.slice(1)!==h)location.hash=h;else render()}
  /* ir a un ejercicio o ejemplo concreto (botones «Ver ejemplo similar» y «Parecido al ejercicio…») */
  function goTo(id){
    const el=document.getElementById(id); if(!el) return;
    const mt=el.closest('.panel').id.match(/^pn-(.+)-(teoria|ejercicios|ejemplos)$/); if(!mt) return;
    topic=mt[1]; tab=mt[2];
    const h=topic+(tab==='teoria'?'':'-'+tab);
    if(location.hash.slice(1)!==h) history.replaceState(null,'','#'+h);
    render();
    const smooth=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const show=()=>{el.scrollIntoView({behavior:'auto',block:'start'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1600)};
    requestAnimationFrame(show);
    chain.then(()=>requestAnimationFrame(()=>el.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'})));
  }
  document.querySelectorAll('[data-goto]:not(.teo-go)').forEach(b=>b.addEventListener('click',()=>goTo(b.dataset.goto)));
  /* ---------- tarjeta flotante de teoría ---------- */
  const card=document.getElementById('teo-card'), cardBody=card.querySelector('.teo-body'), cardGo=card.querySelector('.teo-go');
  const cache={}; let curBtn=null, pinned=false, hideT=null;
  const canHover=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function place(){
    if(!curBtn||card.hidden) return;
    if(window.innerWidth<=560){card.style.left='';card.style.top='';return}
    const r=curBtn.getBoundingClientRect(), w=card.offsetWidth, h=card.offsetHeight, vw=window.innerWidth, vh=window.innerHeight;
    const left=Math.max(12,Math.min(r.right-w,vw-w-12));
    let top=r.bottom+8; if(top+h>vh-12) top=Math.max(12,r.top-h-8);
    card.style.left=left+'px'; card.style.top=top+'px';
  }
  function fill(keys){
    if(cache[keys]){cardBody.innerHTML=cache[keys];return Promise.resolve()}
    cardBody.innerHTML=keys.split(' ').filter(k=>TEO[k]).map(k=>'<section>'+TEO[k]+'</section>').join('');
    if(!window.__mj) return Promise.resolve();
    const done=MathJax.typesetPromise([cardBody]).then(()=>{gluePunct(cardBody);cache[keys]=cardBody.innerHTML});
    chain=chain.then(()=>done).catch(()=>{});
    return done;
  }
  function openCard(btn,pin){
    clearTimeout(hideT);
    if(curBtn&&curBtn!==btn) curBtn.setAttribute('aria-expanded','false');
    curBtn=btn; pinned=pin; btn.setAttribute('aria-expanded','true');
    cardGo.dataset.goto=btn.dataset.teo.split(' ')[0];
    card.hidden=false; card.scrollTop=0;
    fill(btn.dataset.teo).then(place); place();
  }
  function closeCard(){
    clearTimeout(hideT); card.hidden=true; pinned=false;
    if(curBtn){curBtn.setAttribute('aria-expanded','false'); curBtn=null}
  }
  function later(){ if(pinned) return; clearTimeout(hideT); hideT=setTimeout(closeCard,250) }
  document.querySelectorAll('.teo-btn').forEach(b=>{
    b.setAttribute('aria-controls','teo-card');
    if(canHover){ b.addEventListener('mouseenter',()=>{ if(!pinned||curBtn!==b) openCard(b,false) }); b.addEventListener('mouseleave',later); }
    b.addEventListener('click',e=>{ e.stopPropagation(); if(curBtn===b&&pinned) closeCard(); else openCard(b,true) });
  });
  card.addEventListener('mouseenter',()=>clearTimeout(hideT));
  card.addEventListener('mouseleave',later);
  card.addEventListener('click',e=>e.stopPropagation());
  card.querySelector('.teo-close').addEventListener('click',closeCard);
  cardGo.addEventListener('click',()=>{const id=cardGo.dataset.goto; closeCard(); goTo(id)});
  document.addEventListener('click',()=>{ if(!card.hidden) closeCard() });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!card.hidden){ const b=curBtn; closeCard(); b&&b.focus() } });
  window.addEventListener('resize',place); window.addEventListener('scroll',()=>{ if(pinned) place(); else if(!card.hidden) closeCard() },{passive:true});

  document.querySelectorAll('.topic').forEach(b=>b.addEventListener('click',()=>{topic=b.dataset.topic;tab='teoria';go()}));
  document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;go()}));
  document.querySelector('.tabs').addEventListener('keydown',e=>{
    if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
    const order=['teoria','ejercicios','ejemplos'];const i=order.indexOf(tab);
    tab=order[(i+(e.key==='ArrowRight'?1:2))%3];go();document.getElementById('tab-'+tab).focus();
  });
  document.querySelectorAll('.jump button').forEach(b=>b.addEventListener('click',()=>{
    const t=document.getElementById(b.dataset.go); if(!t)return;
    const smooth=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    t.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'});
  }));
  /* modo claro / oscuro */
  const root=document.documentElement, mq=window.matchMedia('(prefers-color-scheme: dark)');
  const isDark=()=>{const t=root.getAttribute('data-theme');return t?t==='dark':mq.matches};
  const themeBtn=document.getElementById('theme-btn'), themeTxt=document.getElementById('theme-txt');
  function paintBtn(){const d=isDark();themeTxt.textContent=d?'Modo claro':'Modo oscuro';themeBtn.setAttribute('aria-label',d?'Cambiar a modo claro':'Cambiar a modo oscuro')}
  themeBtn.addEventListener('click',()=>{const next=isDark()?'light':'dark';root.setAttribute('data-theme',next);try{localStorage.setItem('tema',next)}catch(e){}paintBtn()});
  mq.addEventListener&&mq.addEventListener('change',paintBtn);
  paintBtn();
  window.addEventListener('hashchange',fromHash);
  window.__onMJ=()=>{const p=document.getElementById('pn-'+topic+'-'+tab);typeset(p)};
  fromHash();
  if(window.__mj) window.__onMJ();
})();
