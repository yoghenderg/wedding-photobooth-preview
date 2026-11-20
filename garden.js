// Botanical block print drawn at print resolution.
const art = document.querySelector('#garden').getContext('2d');
const blue = '#c9ae76', pale = '#64765a', gold = '#a37d47';
function path(d,fill,stroke=blue,width=2){
  const p=new Path2D(d);
  if(fill){art.fillStyle=fill;art.fill(p)}
  if(stroke){art.strokeStyle=stroke;art.lineWidth=width;art.stroke(p)}
}
function lotus(x,y,size,angle=0){
  art.save();art.translate(x,y);art.rotate(angle);art.scale(size,size);
  for(const tilt of [-.99,.99,-.64,.64,-.31,.31,0]){
    art.save();art.rotate(tilt);
    path('M0 0 Q-24 -22 0 -62 Q23 -21 0 0Z','#b94e43');
    path('M0 -4 Q-6 -27 0 -52 M-3 -8 Q-13 -28 -4 -44',null,'#efaa70',1.3);art.restore()
  }
  path('M-19 -4 Q0 15 19 -4 Q0 0 -19 -4Z',blue);art.restore()
}
function sprig(x,y,angle,s){
  art.save();art.translate(x,y);art.rotate(angle);art.scale(s,s);
  path('M0 0 Q35 -54 0 -138',null,blue,3);
  for(let i=0;i<7;i++){
    art.save();art.translate(14*Math.sin(Math.PI*i/7),-15-i*17);art.scale(i%2?-1:1,1);
    path('M0 0 Q-28 0 -37 -30 Q-10 -34 0 0Z',pale);
    path('M0 0 L-33 -26 M-12 -10 L-22 -11 M-18 -14 L-19 -22',null,blue,1);art.restore()
  }art.restore()
}
const arch='M62 856 L62 355 Q62 295 133 277 Q117 193 219 179 Q255 112 329 119 Q371 95 400 56 Q429 95 471 119 Q545 112 581 179 Q683 193 667 277 Q738 295 738 355 L738 856Z';
path(arch,'#1f322f',blue,4);
art.save();art.clip(new Path2D(arch));
for(let y=100;y<880;y+=36)for(let x=45+(y%72?17:0);x<760;x+=36){path('M'+x+' '+y+'l2 -3 2 3 -2 3Z','#55614c',null)}
for(let side of [-1,1]){
 art.save();art.translate(400,0);art.scale(side,1);
 path('M-25 860 C180 749 170 552 89 460 S52 319 133 269',null,blue,5);
 sprig(82,765,-.75,1.35);sprig(136,691,.96,1.15);sprig(144,586,-.65,1);sprig(105,487,.55,.8);sprig(58,383,-.6,.7);
 lotus(132,269,.86,.38);lotus(216,579,.78,.52);lotus(19,656,.67,-.35);
 sprig(235,868,-.5,1.48);lotus(234,738,1.12,.1);art.restore()
}
path('M400 850 Q340 692 400 503',null,blue,4);lotus(400,504,1.34);
sprig(398,850,.52,1.1);art.restore();
art.save();art.translate(400,450);art.scale(1.035,1.032);art.translate(-400,-450);path(arch,null,gold,1.7);art.restore();

art.textAlign='center';art.fillStyle='#f2dda8';
art.font='italic 76px Georgia';art.fillText('Y & S',400,306);
for(let i=0;i<17;i++){
 const x=80+i*40;
 art.save();art.translate(x,832);
 path('M-18 0 Q-10 -16 0 -14 Q10 -16 18 0 Q8 12 0 10 Q-8 12 -18 0Z','#ac5946',gold,1);
 path('M-8 0 Q0 -10 8 0 Q0 8 -8 0Z','#ebcb86',null);art.restore()
}
