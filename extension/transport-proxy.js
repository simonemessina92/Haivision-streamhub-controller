/* WebSocket-compatible facade; tokens and network requests remain in the worker. */
globalThis.createNativeSocketProxy=function({runtime,sessionId,onStatus}){
 return class NativeSocketProxy{
  constructor(){this.readyState=0;this.port=runtime.connect({name:'sh-native-transport'});this.closed=false;
   this.port.onMessage.addListener(m=>{if(this.closed)return;if(m.type==='open'){this.readyState=1;this.onopen?.();}else if(m.type==='message')this.onmessage?.({data:m.data});else if(m.type==='status')onStatus?.(m.message);else if(m.type==='close'){onStatus?.(m.message);this.finish(m.message);}});
   this.port.onDisconnect.addListener(()=>this.finish('Native worker disconnected.'));
   this.port.postMessage({type:'open',sessionId:sessionId()});this.lease=setInterval(()=>{if(!this.closed)try{this.port.postMessage({type:'lease'});}catch{this.finish();}},10000);
  }
  send(data){if(this.readyState!==1)throw Error('Native transport is not ready.');this.port.postMessage({type:'send',data});}
  finish(reason){if(this.closed)return;this.closed=true;this.readyState=3;clearInterval(this.lease);this.onclose?.({reason:reason||''});try{this.port.disconnect();}catch{}}
  close(){if(this.closed)return;try{this.port.postMessage({type:'close'});}catch{}this.finish();}
 };
};
