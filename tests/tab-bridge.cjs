const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'../extension'),extensionId='fixture-extension';
const contexts=new Map(),deliveries=[],packets=[],bus=[];let removeTab;
const flush=()=>new Promise(r=>setTimeout(r,25));
const files=names=>names.map(n=>fs.readFileSync(path.join(root,n),'utf8'));
let broker;
function provider(tabId,hardware,authenticated=true){
 const listeners=[],windowListeners={},elements=[],leaseCallbacks=new Map();let leaseSerial=0;let docHidden=true;
 const doc={get hidden(){return docHidden},documentElement:{append:e=>elements.push(e)},createElement:()=>({style:{},isConnected:true,hidden:false,setAttribute(){},remove(){this.isConnected=false;}}),addEventListener:(n,f)=>windowListeners[n]=f,removeEventListener(){}};
 const initial={enc:{1:{encoderProfileId:0,inputIndex:0,enable:false}},encoderProfile:{0:{name:'Return',videoReturnMode:true}},channelProfile:{1:{videoIFBSourceIdx:-1,videoIFBEncoderIdx:-1}}};
 class Socket{
  constructor(url){this.config=JSON.parse(JSON.stringify(initial));this.url=url;this.readyState=1;this.closed=false;setTimeout(()=>this.onmessage?.({data:'0{}'}),0);}
  send(packet){packets.push({tabId,packet});if(packet.startsWith('42[')){const a=JSON.parse(packet.slice(2));if(a[0]==='setProfileConfig'){Object.assign(this.config,JSON.parse(a[3]));setTimeout(()=>this.onmessage?.({data:'42'+JSON.stringify(['getConfig',{result:{config:JSON.stringify(this.config)}}])}),0);}}if(packet==='40')setTimeout(()=>{
   for(const e of [ ['getDeviceInfo',{result:{hardwareIdentifier:hardware,allowedIntercom:1,allowedEncoders:1}}],['getConfig',{result:{config:JSON.stringify(this.config)}}],['getChannelStatus',{result:{channel:[{product:'DMNG-APP',hardwareIdentifier:'phone',instanceId:1,connectionStatus:1,channelStatus:0,intercomStatus:1,videoIFBDecoderCapability:1}]}}] ])this.onmessage?.({data:'42'+JSON.stringify(e)});
  },0);}
  close(){this.closed=true;this.readyState=3;this.onclose?.();}
 }
 const ctx={console,Map,Set,JSON,Number,Error,URL,crypto:require('crypto').webcrypto,setTimeout:(fn,ms)=>ms===6500?(leaseCallbacks.set(--leaseSerial,fn),leaseSerial):setTimeout(fn,ms),clearTimeout:n=>n<0?leaseCallbacks.delete(n):clearTimeout(n),WebSocket:Socket,MutationObserver:class{observe(){}disconnect(){}},location:{hostname:tabId===2?'lan.example':'other.example',origin:tabId===2?'http://lan.example':'https://other.example',protocol:tabId===2?'http:':'https:'},sessionStorage:{getItem:()=>authenticated?JSON.stringify({token:'SECRET-'+tabId}):null},document:doc,window:{addEventListener:(n,f)=>windowListeners[n]=f,removeEventListener(){}},chrome:{runtime:{id:extensionId,getURL:()=>`chrome-extension://${extensionId}/`,onMessage:{addListener:f=>listeners.push(f)},sendMessage:async m=>{bus.push(m);return broker.bridgeHandle(m,{id:extensionId,frameId:0,tab:{id:tabId}});}}}};
 vm.createContext(ctx);contexts.set(tabId,{ctx,listeners,elements,Socket,windowListeners,leaseCallbacks});return ctx;
}
provider(1,'HW-A');provider(2,'HW-B');provider(3,null,false);
broker={console,URL,Map,Set,JSON,Date,crypto:require('crypto').webcrypto,chrome:{runtime:{id:extensionId,onMessage:{addListener(){}}},tabs:{query:async()=>[1,2,3,4].map(id=>({id,url:'https://tab-'+id+'.example/'})),onRemoved:{addListener:f=>removeTab=f},sendMessage:async(tabId,m)=>{
 bus.push(m);if(m.type==='sh-bridge-delivery'){deliveries.push({tabId,...m});return null;}
 const p=contexts.get(tabId);if(!p)throw Error('closed');let answer=null;for(const listener of p.listeners)listener(m,{id:extensionId},r=>{answer=r});return answer;
 }},scripting:{executeScript:async request=>{
 const p=contexts.get(request.target.tabId);if(!p)throw Error('permission denied');
 if(request.func)return [{result:vm.runInContext('('+request.func.toString()+')()',p.ctx)}];
 for(const source of files(request.files))vm.runInContext(source,p.ctx);return [{}];
 }}}};vm.createContext(broker);vm.runInContext(files(['native-broker.js'])[0],broker);
const sender=tab=>({id:extensionId,frameId:0,tab:{id:tab}}),session={base:'https://public.example:8896',visible:true,serverIdentity:{hardwareIdentifier:'HW-B',dockerId:null}},consumer='consumer-one';
(async()=>{
 await broker.bridgeHandle({type:'sh-bridge-session',consumer,session},sender(3));await flush();await flush();
 let route=vm.runInContext("[...nativeRoutes.values()][0]",broker);
 assert(route.ready&&route.provider===2,'find matching StreamHub in a background tab, after rejecting another server');
 assert.equal(contexts.get(2).ctx.document.hidden,true);
 assert(deliveries.some(d=>d.payload.type==='sh-native-features'&&d.payload.state.ready));
 // Wrong server must never receive a terminal command.
 const command={type:'sh-native-command',base:session.base,id:'cmd-1',action:'intercom',input:1,enabled:true};
 await broker.bridgeHandle({type:'sh-bridge-command',consumer,command},sender(3));await flush();
 assert(packets.some(p=>p.tabId===2&&p.packet==='42["unitCommand","startIntercom",1]'));
 assert(!packets.some(p=>p.tabId===1&&p.packet.includes('unitCommand')));
 assert(deliveries.some(d=>d.payload.type==='sh-native-command-result'&&d.payload.id==='cmd-1'&&d.payload.ok));
 await broker.bridgeHandle({type:'sh-bridge-command',consumer,command:{...command,id:'cmd-return',action:'return',kind:'encoder',encoder:1}},sender(3));await flush();
 const routePacket=packets.filter(p=>p.tabId===2&&p.packet.startsWith('42["setProfileConfig"')).at(-1);const patch=JSON.parse(JSON.parse(routePacket.packet.slice(2))[3]);assert.equal(patch.channelProfile[1].videoIFBEncoderIdx,0);assert.equal(patch.channelProfile[1].videoIFBSourceIdx,-1);
 assert(deliveries.some(d=>d.payload.id==='cmd-return'&&d.payload.ok),'return routing waits for actual configuration readback through broker');
 await broker.bridgeHandle({type:'sh-bridge-command',consumer,command:{...command,id:'cmd-encoder',action:'encoderPower',encoder:1,enabled:true}},sender(3));await flush();
 assert(deliveries.some(d=>d.payload.id==='cmd-encoder'&&d.payload.ok));
 
 const count=deliveries.length;
 await broker.bridgeHandle({type:'sh-bridge-event',consumer,nonce:'forged',payload:{type:'sh-native-preview',base:session.base,id:1,thumbnail:'data:image/jpeg;base64,/9j/'}},sender(1));assert.equal(deliveries.length,count);
 assert(!JSON.stringify(bus).includes('SECRET-'),'tokens stay inside source tab');
 await broker.bridgeHandle({type:'sh-bridge-stop',consumer},sender(3));assert.equal(vm.runInContext('nativeRoutes.size',broker),0);
 assert(!contexts.get(2).elements.some(e=>e.isConnected),'hide cleans up provider');
 // Abandoned overlays cannot leave a provider socket running indefinitely.
 await broker.bridgeHandle({type:'sh-bridge-session',consumer:'abandoned',session},sender(3));await flush();await flush();
 for(const fn of [...contexts.get(2).leaseCallbacks.values()])fn();
 assert(!contexts.get(2).elements.some(e=>e.isConnected),'provider lease expiry closes abandoned connection');
 await broker.bridgeHandle({type:'sh-bridge-stop',consumer:'abandoned'},sender(3));
 // No authenticated tab: deterministic REST-only fallback, no native writes.
 for(const p of contexts.values())p.ctx.sessionStorage.getItem=()=>null;
 await broker.bridgeHandle({type:'sh-bridge-session',consumer:'consumer-two',session},sender(3));await flush();
 assert(deliveries.some(d=>d.consumer==='consumer-two'&&d.payload.type==='sh-preview-status'));
 const before=packets.length;await broker.bridgeHandle({type:'sh-bridge-command',consumer:'consumer-two',command:{...command,id:'cmd-2'}},sender(3));assert.equal(packets.length,before);
 assert(deliveries.some(d=>d.payload.id==='cmd-2'&&!d.payload.ok));
 removeTab(3);await flush();assert.equal(vm.runInContext('nativeRoutes.size',broker),0);
 console.log('PASS cross-tab broker + real native factories (simulated Chrome/socket): background source tab, alias identity, wrong-server rejection, exact intercom command, token isolation, forged nonce rejection, hide cleanup, missing-session fallback, tab-close cleanup.');
})().catch(e=>{console.error(e);process.exit(1)});
