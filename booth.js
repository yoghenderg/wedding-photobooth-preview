const el=id=>document.getElementById(id);
const video=document.querySelector('video');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let session=0,stream,facing='user',url;
function stopCamera(){stream?.getTracks().forEach(track=>track.stop());stream=null;video.srcObject=null}
function page(id){
 transitionScreen(()=>{
  document.body.classList.toggle('shooting',id==='camera');
  for(const section of document.querySelectorAll('section'))section.hidden=section.id!==id;
  window.scrollTo(0,0);
  if(id==='home')el('enter').focus({preventScroll:true});
  if(id==='result')el('download').focus({preventScroll:true});
 })
}
function reset(){nativeFrames=[];session++;stopCamera();if(url)URL.revokeObjectURL(url);url=null;el('print').removeAttribute('src');el('download').removeAttribute('href');selectLook('Original');el('count').textContent='';page('home');el('enter').focus()}
// Camera drivers can negotiate dimensions in sensor (landscape) coordinates.
// Compare the actual, orientation-correct video delivered to the HTML element.
async function fitCameraTrack(track,token){
 const capabilities=track.getCapabilities?.()||{};
 const zoom=capabilities.zoom;
 const wideZoom=Number.isFinite(zoom?.min)?zoom.min:null;
 const preferences=wideZoom===null?{}:{advanced:[{zoom:wideZoom}]};
 const original=track.getConstraints();
 const score=()=>{
  const aspect=video.videoWidth/video.videoHeight;
  return Math.min(aspect/.75,.75/aspect);
 };
 let best=original,bestScore=score();
 if(bestScore<.985 && matchMedia('(pointer:coarse)').matches){
  for(const [width,height] of [[1920,1440],[1440,1920]]){
   if(token!==session)return;
   const candidate={width:{ideal:width},height:{ideal:height},aspectRatio:{ideal:width/height},resizeMode:{ideal:'none'},...preferences};
   try{
    await track.applyConstraints(candidate);await wait(180);
    const current=score();
    if(current>bestScore){best=candidate;bestScore=current}
    if(bestScore>=.985)break;
   }catch{/* Try the other sensor orientation. */}
  }
 }
 if(token===session)try{await track.applyConstraints({...best,...preferences})}catch{/* Keep the working camera mode. */}
}
async function openCamera(){
 const token=++session;stopCamera();page('camera');el('shoot').disabled=true;el('nativePhoto').disabled=false;el('nativePhoto').textContent='Phone camera';el('filter').disabled=false;el('flip').disabled=true;el('status').textContent='Waiting for camera access…';
 try{
  const acquired=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:1920},height:{ideal:1440},resizeMode:{ideal:'none'}},audio:false});
  if(token!==session){acquired.getTracks().forEach(t=>t.stop());return}
  stream=acquired;video.srcObject=stream;await video.play();if(token!==session)return;
  await fitCameraTrack(stream.getVideoTracks()[0],token);if(token!==session)return;
  facing=stream.getVideoTracks()[0].getSettings().facingMode||facing;
  video.style.transform=facing==='user'?'scaleX(-1)':'none';el('shoot').disabled=false;
  el('status').textContent='Tap the shutter for four timed portraits.';
  const devices=await navigator.mediaDevices.enumerateDevices();if(token===session)el('flip').disabled=devices.filter(d=>d.kind==='videoinput').length<2;
 }catch(e){if(token!==session)return;stopCamera();el('status').textContent=e.name==='NotAllowedError'?'Allow camera access in your browser, then try again.':'Camera unavailable. Connect or enable a camera, then try again.';el('shoot').ariaLabel='Try camera again';el('shoot').disabled=false}
}
const looks={Original:'none',Mono:'grayscale(1)',Sepia:'sepia(.85)',Warm:'sepia(.28)'};
let selectedLook='Original';
function selectLook(name){
 selectedLook=name;video.style.filter=looks[name];
 for(const button of el('filter').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.textContent===name));
}
for(const name of ['Original','Warm','Sepia','Mono']){
 const button=document.createElement('button');button.type='button';button.textContent=name;
 button.style.setProperty('--look',looks[name]);button.onclick=()=>selectLook(name);el('filter').append(button)
}
selectLook('Original');
function takeFrame(source=video){
 const c=document.createElement('canvas');c.width=540;c.height=720;const ctx=c.getContext('2d');
 const w=source.videoWidth||source.naturalWidth,h=source.videoHeight||source.naturalHeight;if(!w||!h)throw Error('Camera disconnected');
 const scale=Math.max(c.width/w,c.height/h);
 const width=w*scale,height=h*scale;
 if(source===video && facing==='user'){ctx.translate(540,0);ctx.scale(-1,1)}
 ctx.drawImage(source,(c.width-width)/2,(c.height-height)/2,width,height);
 const look=selectedLook;
 if(look!=='Original'){
 const pixels=ctx.getImageData(0,0,540,720),a=pixels.data;
 for(let i=0;i<a.length;i+=4){const r=a[i],g=a[i+1],b=a[i+2],v=.2126*r+.7152*g+.0722*b;
 if(look==='Mono')a[i]=a[i+1]=a[i+2]=v;
 else{const t=look==='Warm'?.28:.85;a[i]=r*(1-t)+t*(.393*r+.769*g+.189*b);a[i+1]=g*(1-t)+t*(.349*r+.686*g+.168*b);a[i+2]=b*(1-t)+t*(.272*r+.534*g+.131*b)}}
 ctx.putImageData(pixels,0,0)}
 ctx.globalCompositeOperation="destination-over";ctx.fillStyle="#182c27";ctx.fillRect(0,0,c.width,c.height);return c
}
function compose(frames){
 const c=document.createElement('canvas');c.width=1080;c.height=1920;const g=c.getContext('2d');
 g.fillStyle='#f8f2e5';g.fillRect(0,0,1080,1920);
 g.fillStyle='#203931';g.fillRect(0,0,1080,152);g.fillRect(0,1680,1080,240);
 for(const y of [118,1680])g.drawImage(el('garden'),82,815,640,32,0,y,1080,34);
 g.strokeStyle='#b49a6a';g.lineWidth=2;g.strokeRect(20,168,1040,1496);
 frames.forEach((frame,i)=>{
  const x=36+(i%2)*516,y=235+Math.floor(i/2)*683;
  g.drawImage(frame,x,y,492,656);
 });
 g.textAlign='center';g.fillStyle='#f3dfaf';g.font='36px Georgia';g.fillText('Our wedding celebration',540,76);
 g.font='italic 84px Georgia';g.fillText('Yoghender & Shalini',540,1820);g.font='34px serif';g.fillText('திருமணம்',540,1880);
 return new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(Error('Export failed')),'image/jpeg',.94))
}
async function capture(){
 if(!stream){el('shoot').ariaLabel='Start four shots';return openCamera()}
 const token=session,frames=[];for(const id of ['shoot','flip','filter','nativePhoto'])el(id).disabled=true;
 try{for(let shot=1;shot<=4;shot++){
 el('status').textContent='Photo '+shot+' of 4';
 for(let n=3;n;n--){el('count').textContent=n;await wait(1000);if(token!==session)return}
 frames.push(takeFrame());el('progress').children[shot-1].classList.add('done');el('count').textContent='';video.animate([{opacity:.15},{opacity:1}],250);await wait(300);if(token!==session)return}
 await finishPhotos(frames,token);
 }catch{if(token!==session)return;stopCamera();page('camera');el('count').textContent='';el('status').textContent='The session was interrupted. Please try again.';el('shoot').ariaLabel='Try camera again';el('shoot').disabled=false}
}
el('enter').onclick=()=>{facing='user';el('shoot').ariaLabel='Start four shots';selectLook('Original');for(const dot of el('progress').children)dot.classList.remove('done');openCamera()};

el('flip').onclick=()=>{facing=facing==='user'?'environment':'user';openCamera()};
el('shoot').onclick=capture;el('back').onclick=el('again').onclick=reset;window.addEventListener('pagehide',reset);

async function saveKeepsake(blob){
 const notice=el('saveStatus'),retry=el('retrySave');
 retry.hidden=true;retry.disabled=false;
 try{await window.hostedBooth.save(blob);notice.textContent='Saved to the wedding gallery.'}
 catch{notice.textContent='Gallery save failed. Your download is still available.';retry.hidden=false;retry.onclick=()=>{retry.disabled=true;saveKeepsake(blob)}}
}

async function finishPhotos(frames,token){
 stopCamera();page('processing');const [blob]=await Promise.all([compose(frames),wait(650)]);if(token!==session)return;
 await saveKeepsake(blob);if(token!==session)return;
 url=URL.createObjectURL(blob);el('print').src=url;el('download').href=url;page('result');el('download').focus()
}

let nativeFrames=[];
const nativeButton=el('nativePhoto'),nativeFile=el('nativeFile');
if(matchMedia('(pointer:coarse)').matches){
 nativeButton.hidden=false;document.querySelector('.mode').hidden=true;
}
nativeButton.onclick=()=>{
 stopCamera();el('shoot').disabled=true;el('flip').disabled=true;el('filter').disabled=true;
 nativeFile.setAttribute('capture',facing);nativeFile.value='';nativeFile.click();
};
function resumeAfterPicker(){
 if(nativeFrames.length){
  nativeButton.textContent='Next photo';el('status').textContent='Saved '+nativeFrames.length+' of 4. Tap Next photo to continue.';
 }else openCamera();
}
nativeFile.oncancel=resumeAfterPicker;
nativeFile.onchange=async()=>{
 const file=nativeFile.files[0];if(!file)return resumeAfterPicker();
 const token=session,src=URL.createObjectURL(file);nativeButton.disabled=true;
 try{
  const img=new Image();img.src=src;await img.decode();if(token!==session)return;
  nativeFrames.push(takeFrame(img));el('progress').children[nativeFrames.length-1].classList.add('done');
  if(nativeFrames.length===4){const frames=nativeFrames;nativeFrames=[];await finishPhotos(frames,token)}
  else resumeAfterPicker();
 }catch{if(token===session)el('status').textContent='Could not read that photo. Please take it again.'}
 finally{URL.revokeObjectURL(src);nativeButton.disabled=false}
};
