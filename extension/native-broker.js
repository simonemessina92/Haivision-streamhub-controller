/* Service-worker broker: match server identity before enabling native commands. */
const nativeRoutes = new Map();
const bridgeTypes = new Set(['sh-bridge-session','sh-bridge-stop','sh-bridge-command','sh-bridge-event']);
const forwarded = new Set(['sh-native-preview','sh-native-output-preview','sh-native-network','sh-native-features','sh-native-command-result','sh-native-encoder-preview','sh-native-device-recording','sh-preview-status']);
const tell = (tabId,message) => chrome.tabs.sendMessage(tabId,message).catch(()=>null);
function deliver(route,payload){return tell(route.consumerTab,{type:'sh-bridge-delivery',consumer:route.consumer,payload});}
function current(route){return nativeRoutes.get(route.key)===route;}
async function detach(route){if(route.ready)deliver(route,{type:'sh-native-features',base:route.session.base,state:{ready:false,revision:0,inputs:[],encoders:[],encoderProfiles:[]}});if(route.provider!==null)await tell(route.provider,{type:'sh-provider-stop',consumer:route.consumer,nonce:route.nonce});route.provider=null;route.ready=false;}
async function candidates(route){
 const tabs=await chrome.tabs.query({});const result=[];
 // Prefer the overlay's own tab when it is a signed-in StreamHub GUI.
 tabs.sort((a,b)=>(b.id===route.consumerTab)-(a.id===route.consumerTab));
 for(const tab of tabs){
  if(!/^https?:\/\//.test(tab.url||''))continue;
  try{
   const [probe]=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>{
    try{const i=JSON.parse(sessionStorage.getItem('identity')||'null');return typeof i?.token==='string'&&i.token.length>0;}catch{return false;}
   }});
   if(probe?.result===true)result.push(tab.id);
  }catch{/* No site permission or a tab navigated during discovery. */}
 }
 return result;
}
async function attachNext(route){
 if(!current(route)||route.searching)return;route.searching=true;
 try{
  await detach(route);if(!current(route))return;
  if(!route.queue)route.queue=await candidates(route);
  while(current(route)&&route.queue.length){
   const provider=route.queue.shift();route.provider=provider;route.nonce=crypto.randomUUID();route.deadline=Date.now()+4500;
   try{
    await chrome.scripting.executeScript({target:{tabId:provider},files:['native-features.js','native-preview.js','native-provider.js']});
    if(!current(route)){await detach(route);return;}
    const ack=await tell(provider,{type:'sh-provider-start',consumer:route.consumer,nonce:route.nonce,session:route.session});
    if(ack?.ok)return;
   }catch{}
   await detach(route);
  }
  if(current(route)){
   route.retryAt=Date.now()+6000;route.queue=null;
   deliver(route,{type:'sh-preview-status',base:route.session.base,message:'Open a signed-in StreamHub tab for this server. Native features are waiting.'});
  }
 }finally{route.searching=false;}
}
async function stopRoute(key){const r=nativeRoutes.get(key);if(!r)return;nativeRoutes.delete(key);await detach(r);}
async function bridgeHandle(message,sender){
 if(sender.id!==chrome.runtime.id||!sender.tab||sender.frameId!==0)return;
 const tabId=sender.tab.id;
 if(typeof message.consumer!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(message.consumer))return;
 const key=tabId+':'+message.consumer;
 if(message.type==='sh-bridge-stop'){await stopRoute(key);return {ok:true};}
 if(message.type==='sh-bridge-session'){
  const s=message.session;let u;try{u=new URL(s?.base);}catch{return {ok:false};}
  if(!s.visible||!['http:','https:'].includes(u.protocol)||u.username||u.password||u.search||u.hash||u.pathname!=='/')return {ok:false};
  const identity=s.serverIdentity;
  if(!identity?.hardwareIdentifier||typeof identity.hardwareIdentifier!=='string')return {ok:false};
  const session={base:s.base,visible:true,serverIdentity:{hardwareIdentifier:identity.hardwareIdentifier,dockerId:typeof identity.dockerId==='string'?identity.dockerId:null}};
  let r=nativeRoutes.get(key);
  if(r&&JSON.stringify(r.session)!==JSON.stringify(session)){await stopRoute(key);r=null;}
  if(!r){r={key,consumer:message.consumer,consumerTab:tabId,session,provider:null,ready:false,nonce:null,queue:null,searching:false,retryAt:0};nativeRoutes.set(key,r);}
  if(r.provider!==null){
   const ack=await tell(r.provider,{type:'sh-provider-renew',consumer:r.consumer,nonce:r.nonce});
   if(!ack?.ok||!r.ready&&Date.now()>r.deadline)await attachNext(r);
  }else if(Date.now()>=r.retryAt)await attachNext(r);
  return {ok:true};
 }
 if(message.type==='sh-bridge-command'){
  const r=nativeRoutes.get(key),command=message.command;
  if(!r||command?.base!==r.session.base||typeof command.id!=='string')return {ok:false};
  if(!r.ready||r.provider===null){deliver(r,{type:'sh-native-command-result',base:r.session.base,id:command.id,ok:false,error:'No matching authenticated StreamHub tab is ready.'});return {ok:false};}
  const ack=await tell(r.provider,{type:'sh-provider-command',consumer:r.consumer,nonce:r.nonce,command});
  if(!ack?.ok)deliver(r,{type:'sh-native-command-result',base:r.session.base,id:command.id,ok:false,error:'StreamHub tab disconnected before dispatch.'});
  return {ok:!!ack?.ok};
 }
 if(message.type==='sh-bridge-event'){
  const r=[...nativeRoutes.values()].find(r=>r.consumer===message.consumer&&r.provider===tabId&&r.nonce===message.nonce);
  if(!r||message.payload?.base!==r.session.base)return {ok:false};
  const payload=message.payload;
  if(payload.type==='sh-bridge-ready'){r.ready=true;deliver(r,{type:'sh-preview-status',base:r.session.base,message:'Connected to the matching StreamHub tab.'});return {ok:true};}
  if(payload.type==='sh-preview-status'&&payload.message==='The open StreamHub page belongs to a different server.'){
   await attachNext(r);return {ok:true};
  }
  if(forwarded.has(payload.type))await deliver(r,payload);
  return {ok:true};
 }
}
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 if(!bridgeTypes.has(message?.type))return;
 bridgeHandle(message,sender).then(reply).catch(error=>reply({ok:false,error:error.message}));return true;
});
chrome.tabs.onRemoved.addListener(tabId=>{
 for(const r of [...nativeRoutes.values()])if(r.consumerTab===tabId)stopRoute(r.key);else if(r.provider===tabId){attachNext(r);}
});
