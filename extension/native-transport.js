/* Socket.IO/Engine.IO transport owned by the extension worker, scoped to a saved web session. */
globalThis.createNativeTransport=function({chromeApi=chrome,loadSession,fetchFn=fetch,WebSocketClass=WebSocket}){
 const sessions=new Map();
 const senderAllowed=s=>s?.id===chromeApi.runtime.id&&typeof s.url==='string'&&s.url.startsWith(chromeApi.runtime.getURL(''));
 chromeApi.runtime.onConnect.addListener(port=>{
  if(port.name!=='sh-native-transport'||!senderAllowed(port.sender)){port.disconnect();return;}
  let session=null,ws=null,polling=false,sid=null,closed=false,opening=false,queue=Promise.resolve(),attempt=0;const aborters=new Set();
  function post(message){if(!closed)try{port.postMessage(message);}catch{close();}}
  function url(transport){const u=new URL('/socket.io/',session.origin);u.searchParams.set('token',session.token);u.searchParams.set('EIO','4');u.searchParams.set('transport',transport);if(sid)u.searchParams.set('sid',sid);u.searchParams.set('t',String(Date.now()));return u;}
  async function scoped(){const next=await loadSession();if(closed)throw Error('Transport closed.');if(next.id!==session.id||next.base!==session.base||!next.token)throw Error('Web session changed.');session={...session,token:next.token};}
  async function request(method,body){await scoped();const controller=new AbortController();aborters.add(controller);const timer=setTimeout(()=>controller.abort(),28000);try{const r=await fetchFn(url('polling').href,{method,body,headers:method==='POST'?{'Content-Type':'text/plain;charset=UTF-8'}:undefined,credentials:'omit',cache:'no-store',redirect:'error',signal:controller.signal});if(!r.ok)throw Error('Native HTTP '+r.status+'.');const text=await r.text();if(text.length>8000000)throw Error('Native response too large.');return text;}finally{clearTimeout(timer);aborters.delete(controller);}}
  function close(reason,notify=false){if(closed)return;if(notify)post({type:'close',message:reason||'Native connection closed.'});closed=true;for(const a of aborters)a.abort();aborters.clear();if(ws){const old=ws;ws=null;old.onclose=old.onerror=old.onmessage=null;old.close();}if(polling&&sid&&session){const u=url('polling');void fetchFn(u.href,{method:'POST',body:'1',headers:{'Content-Type':'text/plain;charset=UTF-8'},credentials:'omit',redirect:'error',signal:AbortSignal.timeout(2000)}).catch(()=>{});}sessions.delete(port);try{port.disconnect();}catch{}}
  async function poll(){try{while(!closed&&polling){const body=await request('GET');for(const packet of body.split('\x1e')){if(closed)return;if(packet==='1'){close('StreamHub closed the native session.',true);return;}if(packet)post({type:'message',data:packet});}}}catch(error){if(!closed)close(error.name==='AbortError'?'Native HTTP request timed out.':error.message,true);}}
  async function fallback(){if(closed||polling)return;polling=true;attempt++;if(ws){const old=ws;ws=null;old.onclose=old.onerror=old.onmessage=null;old.close();}post({type:'status',message:'Connecting through native HTTP transport…'});try{const body=await request('GET'),parts=body.split('\x1e'),open=parts.find(p=>p.startsWith('0'));if(!open)throw Error('StreamHub did not return an Engine.IO handshake.');const handshake=JSON.parse(open.slice(1));if(typeof handshake.sid!=='string'||!handshake.sid||handshake.sid.length>256)throw Error('Invalid native session identifier.');sid=handshake.sid;post({type:'open',transport:'polling'});for(const packet of parts)if(packet)post({type:'message',data:packet});void poll();}catch(error){if(!closed)close(error.message,true);}}
  async function open(id){if(opening||session)return;opening=true;try{const n=await loadSession();if(closed)return;if(n.id!==id||!n.token)throw Error('Web login is missing or expired.');session=n;sessions.set(port,{close});const u=url('websocket');u.protocol=u.protocol==='https:'?'wss:':'ws:';u.searchParams.delete('t');const active=new WebSocketClass(u.href);ws=active;const v=++attempt;let connected=false;const timer=setTimeout(()=>{if(!closed&&ws===active&&v===attempt&&!connected)void fallback();},4000);
   active.onopen=()=>{if(ws===active&&!closed){connected=true;clearTimeout(timer);post({type:'open',transport:'websocket'});}};
   active.onmessage=e=>{if(ws===active&&!closed&&typeof e.data==='string'&&e.data.length<=2000000)post({type:'message',data:e.data});};
   active.onerror=()=>{clearTimeout(timer);if(ws===active&&!closed&&!connected)void fallback();};
   active.onclose=()=>{clearTimeout(timer);if(ws!==active||closed)return;if(!connected)void fallback();else close('Native socket disconnected.',true);};
  }catch(error){if(session&&!closed)void fallback();else close(error.message,true);}finally{opening=false;}}
  port.onMessage.addListener(m=>{
   if(closed)return;if(m?.type==='open'){void open(m.sessionId);return;}if(m?.type==='lease')return;if(m?.type==='close'){close();return;}
   if(m?.type==='send'&&typeof m.data==='string'&&m.data.length<=2000000&&(/^(40|41|3)$/.test(m.data)||m.data.startsWith('42['))){
    if(polling){queue=queue.then(()=>request('POST',m.data)).catch(e=>{if(!closed)close(e.message,true);});}
    else if(ws?.readyState===1)ws.send(m.data);
   }
  });port.onDisconnect.addListener(()=>close());
 });
 return {closeAll(){for(const s of sessions.values())s.close();}};
};
