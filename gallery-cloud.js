const get=id=>document.getElementById(id),dialog=document.querySelector('dialog'),api=window.hostedBooth;
get('gate').hidden=true;get('album').hidden=false;get('logout').onclick=api.logout;
const seen=new Set();let refreshing=false,file,selected;
async function refresh(){
 if(refreshing||document.hidden)return;refreshing=true;
 try{
 const ids=await api.list();get('hint').textContent=ids.length?'Tap a keepsake to view and share it.':'Your first keepsake will appear here after a camera session.';
 for(const id of ids.slice().reverse()){if(seen.has(id))continue;const tile=document.createElement('button'),img=new Image();
 img.src=await api.url(id);img.loading='lazy';img.alt='Open wedding keepsake';img.onerror=async()=>{img.onerror=null;img.src=await api.url(id)};tile.append(img);tile.onclick=()=>openPhoto(id);get('grid').prepend(tile);seen.add(id)}
 }catch{get('hint').textContent='Could not load the gallery. Retrying…'}finally{refreshing=false}
}
async function openPhoto(id){
 selected=id;file=null;get('air').hidden=true;get('sharing').hidden=true;
 const src=await api.url(id);if(selected!==id)return;
 get('large').src=src;get('download').href=src;if(!dialog.open)dialog.showModal();
 const link=new URL(location.pathname,location.origin);link.searchParams.set('photo',id);
 get('qr').src=await api.qr(link.href);get('instructions').textContent='Scan and sign in to open this keepsake.';
 const blob=await (await fetch(src)).blob();if(selected!==id)return;
 file=new File([blob],'Wedding keepsake.jpg',{type:'image/jpeg'});get('air').hidden=!navigator.canShare?.({files:[file]})
}
get('air').onclick=()=>navigator.share({files:[file]}).catch(()=>{});
get('close').onclick=()=>dialog.close();get('share').onclick=()=>{get('sharing').hidden=false};
refresh();setInterval(refresh,5000);
const photo=new URLSearchParams(location.search).get('photo');if(/^\d{13}-[a-f0-9]{32}\.jpg$/.test(photo))openPhoto(photo).catch(()=>get('hint').textContent='This keepsake could not be opened.');
