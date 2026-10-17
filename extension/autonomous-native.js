/* The socket lives in the extension frame, not in a StreamHub page or a service worker. */
globalThis.createAutonomousNativeSession=function({load,saveToken,invalidate,onPayload,onStatus,featureFactory=installNativeFeatures,WebSocketClass=WebSocket}){
 let desired=null,socket=null,features=null,session=null,verified=false,version=0,retry=null,deadline=null,loading=false,blocked=false;const frames=new Map();
 const origin='extension-native-session',frame={contentWindow:{postMessage(payload){if(desired&&verified)onPayload(payload);}}};
 const same=(a,b)=>a?.hardwareIdentifier&&a.hardwareIdentifier===b?.hardwareIdentifier&&(!a.dockerId||!b.dockerId||a.dockerId===b.dockerId);
 const clearState=()=>{if(desired)onPayload({type:'sh-native-features',base:desired.base,state:{ready:false,revision:0,inputs:[],encoders:[],encoderProfiles:[]}});};
 function close(){clearTimeout(retry);clearTimeout(deadline);retry=deadline=null;features?.dispose();features=null;verified=false;frames.clear();if(socket){const old=socket;socket=null;old.onclose=null;old.onmessage=null;old.close();}clearState();}
 function setActive(next){const signature=x=>x?JSON.stringify([x.base,x.identity]):'';if(signature(next)===signature(desired))return;close();desired=next;session=null;blocked=false;loading=false;version++;if(next)void start(version);}
 async function start(v){if(!desired||loading||blocked)return;loading=true;onStatus('Connecting directly to StreamHub…');try{const n=await load();if(v!==version||!desired)return;if(n.base!==desired.base||!same(n.identity,desired.identity))throw Error('Saved web login belongs to another StreamHub. Sign in again.');if(!n.token)throw Error('Web login expired. Use Web login to sign in again.');session=n;connect(v);}catch(error){if(v===version&&desired){blocked=true;onStatus(error.message);clearState();}}finally{if(v===version)loading=false;}}
 function connect(v){if(v!==version||!desired||blocked||socket||!session)return;let active,denied=false;
  try{const url=new URL('/socket.io/',session.origin);url.protocol=url.protocol==='https:'?'wss:':'ws:';url.searchParams.set('token',session.token);url.searchParams.set('EIO','4');url.searchParams.set('transport','websocket');active=new WebSocketClass(url.href);socket=active;}catch{onStatus('Direct native connection failed. Check web access and HTTPS certificate.');schedule(v);return;}
  const context=()=>({socket,base:desired?.base,verified,allowed:!!desired&&socket===active,webOrigin:session.origin,token:session.token,readPattern:(kind,output)=>loadPattern(kind,output)});
  features=featureFactory(frame,origin,context);
  deadline=setTimeout(()=>{if(socket===active&&!verified){onStatus('StreamHub native handshake timed out. Check web address and login.');active.close();}},10000);
  let renewed=null;
  active.onmessage=e=>{
   if(socket!==active||v!==version||!desired||typeof e.data!=='string'||e.data.length>2000000)return;const packet=e.data;
   if(packet.startsWith('0')){active.send('40');return;}if(packet==='2'){active.send('3');return;}
   if(packet.startsWith('44')){denied=blocked=true;invalidate({...session}).catch(()=>{});onStatus('Web login expired or rejected. Use Web login to sign in again.');active.close();return;}
   if(!packet.startsWith('42['))return;let event;try{event=JSON.parse(packet.slice(2));}catch{return;}const name=event[0],value=event[1]?.result??event[1];
   if(name==='newToken'&&typeof event[1]==='string'&&event[1].length<=16000){renewed=event[1];if(verified)persistToken(renewed);return;}
   if(['getDeviceInfo','abusProxyIsReady'].includes(name)){
    const found={hardwareIdentifier:typeof value?.hardwareIdentifier==='string'?value.hardwareIdentifier.trim():null,dockerId:value?.dockerId};
    if(!found.hardwareIdentifier)return;
    if(!same(desired.identity,found)){denied=blocked=true;onStatus('Web login reached a different StreamHub. Check the web address.');active.close();return;}
    verified=true;clearTimeout(deadline);deadline=null;features.onEvent(event);features.publish();if(renewed)persistToken(renewed);onPayload({type:'sh-native-network',base:desired.base,network});onStatus('Connected directly to StreamHub.');for(const payload of frames.values())onPayload(payload);frames.clear();return;
   }
   features.onEvent(event);
   if(name==='ip_local'&&Array.isArray(value))network.localIps=value.filter(x=>typeof x==='string').slice(0,16);
   else if(name==='ip_public'&&typeof value==='string')network.publicIp=value;
   else if(name==='getConfig')try{const c=typeof value?.config==='string'?JSON.parse(value.config):value?.config;if(typeof c?.hostname==='string')network.hostname=c.hostname;}catch{}
   if(verified&&['ip_local','ip_public','getConfig'].includes(name))onPayload({type:'sh-native-network',base:desired.base,network});
   if(verified&&name==='getStatusDevicesChange'&&Array.isArray(value?.device))onPayload({type:'sh-native-device-recording',base:desired.base,devices:value.device.filter(d=>Number.isInteger(Number(d.channel))&&Number.isInteger(d.recordStatus)).map(d=>({id:Number(d.channel),recording:d.recordStatus===5}))});
   const kind={previewChange:'input',inputPreviewChange:'input',physicalPreviewChange:'SDI',NDIPreviewChange:'NDI'}[name];if(!kind)return;
   const raw=kind==='input'?value?.inputId??value?.channelId:value?.outputId,id=Number(typeof raw==='string'&&/^(sdi|ndi)_\d+$/i.test(raw)?raw.split('_')[1]:raw),image=value?.thumbnail;
   if(!Number.isInteger(id)||id<1||id>32||typeof image!=='string'||!image.length||image.length>1500000||!/^\/?[A-Za-z0-9+/=\r\n]+$/.test(image))return;
   const payload={type:kind==='input'?'sh-native-preview':'sh-native-output-preview',kind,base:desired.base,id,thumbnail:'data:image/jpeg;base64,'+image,audioLevels:Array.isArray(value.audioLevels)?value.audioLevels.slice(0,32):[]};if(verified)onPayload(payload);else frames.set(kind+':'+id,payload);
  };
  const network={localIps:[],publicIp:null,hostname:null};
  active.onerror=()=>{if(socket===active)onStatus('Direct native connection failed. Check web access and HTTPS certificate.');};
  active.onclose=()=>{if(socket!==active)return;socket=null;clearTimeout(deadline);deadline=null;features?.dispose();features=null;verified=false;frames.clear();clearState();if(!denied&&v===version&&desired){onStatus('Native connection lost. Reconnecting…');schedule(v);}};
 }
 function schedule(v){clearTimeout(retry);if(desired&&!blocked&&v===version)retry=setTimeout(()=>connect(v),5000);}
 function persistToken(token){if(!session||!verified)return;session={...session,token};saveToken({...session}).catch(()=>{});}
 let patternReader=null;
 function loadPattern(kind,output){if(!patternReader||!session||!verified)return Promise.reject(Error('Web session unavailable.'));return patternReader({...session},kind,output);}
 function receive(command){if(!desired||!verified||!features||command.base!==desired.base){onPayload({type:'sh-native-command-result',base:command.base,id:command.id,ok:false,error:'Direct StreamHub session is not ready. Check Web login.'});return;}features.receive({source:frame.contentWindow,origin,data:command});}
 return {setActive,receive,setPatternReader(fn){patternReader=fn;},restart(){const next=desired;setActive(null);setActive(next);},dispose(){setActive(null);},get ready(){return verified;}};
};
