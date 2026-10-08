(()=>{
 const scene=document.querySelector('main'),grid=document.querySelector('#grid'),camera=document.querySelector('#camera');
 let scheduled=false;
 function fit(){
  scheduled=false;
  const devices=camera.hidden;
  scene.classList.toggle('devices-layout',devices);
  if(devices){
   scene.style.transform='none';
   const available=Math.max(1,innerWidth-24);
   const columns=available>=900?4:available>=690?3:2;
   let previousGroup='';for(const card of grid.children){const group=card.dataset?.outputGroup||'';card.style.gridColumn=group&&group!==previousGroup?'1':'';previousGroup=group;}
   grid.style.gridTemplateColumns=`repeat(${columns},minmax(0,1fr))`;
   // Width drives the composition; the overlay follows the height of two cards.
   const tileWidth=(available-(columns-1)*8)/columns;
   const rowHeight=(tileWidth-2)*9/16+134;
   grid.style.width=available+'px';
   grid.style.gridAutoRows=rowHeight+'px';
   const chromeHeight=innerHeight-grid.clientHeight;
   parent.postMessage({type:'sh-panel-layout',devices:true,height:Math.ceil(chromeHeight+rowHeight*2+8)},'*');
  }else{
   parent.postMessage({type:'sh-panel-layout',devices:false},'*');
   const height=Math.max(680,scene.offsetHeight,scene.scrollHeight),scale=Math.min(innerWidth/800,innerHeight/height);
   scene.style.transform=`translate(${Math.max(0,(innerWidth-800*scale)/2)}px,${Math.max(0,(innerHeight-height*scale)/2)}px) scale(${scale})`;
  }
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(fit);}}
 window.addEventListener('resize',schedule);
 const observer=new ResizeObserver(schedule);observer.observe(document.documentElement);observer.observe(scene);observer.observe(grid);
 new MutationObserver(schedule).observe(camera,{attributes:true,attributeFilter:['hidden']});
 new MutationObserver(schedule).observe(grid,{childList:true});fit();
})();
