/* Engine.IO 4 / Socket.IO preview receiver with constrained native controls. */
globalThis.installNativePreview=function(host,frame,targetOrigin,options={}){
 let socket=null,retry=null,desired='',disposed=false,expected=null,verified=false,blocked=false,network={localIps:[],publicIp:null,hostname:null};
 const features=typeof globalThis.installNativeFeatures==='function'?globalThis.installNativeFeatures(frame,targetOrigin,()=>({socket,verified,allowed:!!allowed(),base:desired})):null;
 const allowed=()=>!disposed&&!blocked&&host.isConnected&&!host.hidden&&(options.remote||!document.hidden)&&desired;
 function close(){features?.reset();clearTimeout(retry);retry=null;if(socket){const old=socket;socket=null;old.onclose=null;old.onmessage=null;old.close();}}
 function connect(){if(!allowed()||socket)return;let base,identity;try{base=new URL(desired);identity=JSON.parse(sessionStorage.getItem('identity')||'null');}catch{return;}
 // Aliases are matched by the server hardware identifier, not the URL spelling.
 // Without metadata, retain the previous strict same-host behavior.
 if(!identity?.token||typeof identity.token!=='string'||base.hostname!==location.hostname&&!expected?.hardwareIdentifier)return;
 verified=!expected?.hardwareIdentifier&&base.hostname===location.hostname;
 const url=new URL('/socket.io/',location.origin);url.protocol=location.protocol==='https:'?'wss:':'ws:';url.searchParams.set('token',identity.token);url.searchParams.set('EIO','4');url.searchParams.set('transport','websocket');
 try{socket=new WebSocket(url);}catch{return;}const active=socket;
 active.onmessage=e=>{if(socket!==active||!allowed()||typeof e.data!=='string'||e.data.length>2000000)return;const packet=e.data;if(packet.startsWith('0')){active.send('40');return;}if(packet==='2'){active.send('3');return;}if(!packet.startsWith('42['))return;let event;try{event=JSON.parse(packet.slice(2));}catch{return;}features?.onEvent(event);if(['getDeviceInfo','abusProxyIsReady'].includes(event[0])){
 const metadata=event[0]==='getDeviceInfo'?event[1]?.result:event[1];
 if(!metadata||typeof metadata.hardwareIdentifier!=='string')return;
 if(expected?.hardwareIdentifier){const matches=metadata.hardwareIdentifier.trim()===expected.hardwareIdentifier&&(!expected.dockerId||!metadata.dockerId||expected.dockerId===metadata.dockerId);if(!matches){blocked=true;verified=false;frame.contentWindow.postMessage({type:'sh-preview-status',base:desired,message:'The open StreamHub page belongs to a different server.'},targetOrigin);close();return;}verified=true;}
 if(verified){frame.contentWindow.postMessage({type:'sh-native-network',base:desired,network},targetOrigin);features?.publish();frame.contentWindow.postMessage({type:'sh-bridge-ready',base:desired},targetOrigin);}return;
 }
 if(['ip_local','ip_public','getConfig'].includes(event[0])){
 const value=event[1];
 if(event[0]==='ip_local'&&Array.isArray(value))network.localIps=value.filter(x=>typeof x==='string').slice(0,16);
 else if(event[0]==='ip_public'&&typeof value==='string')network.publicIp=value;
 else if(event[0]==='getConfig')try{const config=typeof value?.result?.config==='string'?JSON.parse(value.result.config):value?.result?.config;if(typeof config?.hostname==='string')network.hostname=config.hostname;else return;}catch{return;}
 else return;
 if(verified)frame.contentWindow.postMessage({type:'sh-native-network',base:desired,network},targetOrigin);return;
 }
 if(!verified)return;
 if(event[0]==='getStatusDevicesChange'){const payload=event[1]?.result??event[1];if(!Array.isArray(payload?.device))return;const devices=payload.device.filter(d=>Number.isInteger(Number(d.channel))&&Number(d.channel)>=1&&Number(d.channel)<=32&&Number.isInteger(d.recordStatus)).map(d=>({id:Number(d.channel),recording:d.recordStatus===5}));frame.contentWindow.postMessage({type:'sh-native-device-recording',base:desired,devices},targetOrigin);return;}
 if(!['previewChange','inputPreviewChange','physicalPreviewChange','NDIPreviewChange'].includes(event[0]))return;const p=event[1]?.result??event[1],isOutput=['physicalPreviewChange','NDIPreviewChange'].includes(event[0]),rawId=isOutput?p?.outputId:p?.inputId??p?.channelId,id=Number(typeof rawId==='string'&&/^(sdi|ndi)_\d+$/i.test(rawId)?rawId.split('_')[1]:rawId),thumbnail=p?.thumbnail;if(!Number.isInteger(id)||id<1||id>32||typeof thumbnail!=='string'||!thumbnail.length||thumbnail.length>1500000||!/^\/?[A-Za-z0-9+/=\r\n]+$/.test(thumbnail))return;frame.contentWindow.postMessage({type:isOutput?'sh-native-output-preview':'sh-native-preview',kind:event[0]==='NDIPreviewChange'?'NDI':'SDI',base:desired,id,thumbnail:'data:image/jpeg;base64,'+thumbnail,audioLevels:Array.isArray(p.audioLevels)?p.audioLevels.slice(0,32):[]},targetOrigin);};
 active.onclose=()=>{if(socket===active){socket=null;features?.reset();}if(allowed())retry=setTimeout(connect,5000);};active.onerror=()=>{};
 }
 function message(e){if(e.source!==frame.contentWindow||e.origin!==targetOrigin||e.data?.type!=='sh-preview-session')return;const next=e.data.visible&&typeof e.data.base==='string'?e.data.base:'';const raw=e.data.serverIdentity,nextIdentity=typeof raw?.hardwareIdentifier==='string'&&raw.hardwareIdentifier.trim()?{hardwareIdentifier:raw.hardwareIdentifier.trim(),dockerId:typeof raw.dockerId==='string'?raw.dockerId:null}:null;if(desired!==next||JSON.stringify(expected)!==JSON.stringify(nextIdentity)){desired=next;expected=nextIdentity;verified=false;blocked=false;network={localIps:[],publicIp:null,hostname:null};close();}connect();}

 function visibility(){if(!allowed())close();else connect();}
 window.addEventListener('message',message);document.addEventListener('visibilitychange',visibility);
 const observer=new MutationObserver(visibility);observer.observe(host,{attributes:true,attributeFilter:['hidden','style']});
 const dispose=()=>{disposed=true;close();features?.dispose();observer.disconnect();window.removeEventListener('message',message);document.removeEventListener('visibilitychange',visibility);};
 dispose.receive=data=>{const e={source:frame.contentWindow,origin:targetOrigin,data};message(e);features?.receive(e);};return dispose;
};
