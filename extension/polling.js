const backgroundPolls=[];let overlayShown=true;
function pollingAllowed(){return overlayShown&&!document.hidden;}
function registerPoll(fn,ms){const row={fn,ms,timer:null};backgroundPolls.push(row);if(pollingAllowed())row.timer=setInterval(fn,ms);return row;}
function updatePolling(){for(const row of backgroundPolls){if(pollingAllowed()&&row.timer===null)row.timer=setInterval(row.fn,row.ms);else if(!pollingAllowed()&&row.timer!==null){clearInterval(row.timer);row.timer=null;}}}
window.addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='sh-visible'){overlayShown=e.data.visible===true;updatePolling();}});document.addEventListener('visibilitychange',updatePolling);
