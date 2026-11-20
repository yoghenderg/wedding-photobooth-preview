let activeFade;
function transitionScreen(update){
 if(activeFade)activeFade.skipTransition();
 if(!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches){
  update();return;
 }
 const transition=document.startViewTransition(update);
 activeFade=transition;
 transition.finished.then(()=>{if(activeFade===transition)activeFade=null});
}
