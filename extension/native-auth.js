/* Web credentials are used only for POST /login. Only the scoped token is saved. */
globalThis.createNativeAuth=function({storage,fetchFn=fetch,connection,identity,randomId=()=>crypto.randomUUID()}){
 const types=new Set(['webLogin','webSession','webToken','webInvalidate','webPattern']);
 function originFor(base,value){return StreamHubEndpoints.web(base,'auto',value);}
 async function saved(c){const {nativeSession:n}=await storage.get('nativeSession');return n?.base===c.base?n:null;}
 async function publicState(c){const n=c?await saved(c):null;return {nativeConfigured:!!n,webOrigin:n?.origin||'',webUsername:n?.username||'',webLoginRequired:!!n&&!n.token};}
 async function login(c,expected,m){
  const username=String(m.webUsername||'').trim(),password=String(m.webPassword||''),origin=originFor(c.base,m.webOrigin);
  if(!username||!password)throw Error('Enter the StreamHub web username and password.');if(!expected?.hardwareIdentifier)throw Error('StreamHub did not report a server identity.');
  let response;try{response=await fetchFn(new URL('/login',origin).href,{method:'POST',redirect:'error',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password}),cache:'no-store',signal:AbortSignal.timeout(8000)});}catch(error){throw Error('Web login connection failed: '+(error.networkDetail?error.message:origin+'. '+error.message));}
  if(!response.ok)throw Error(response.status===401||response.status===403?'StreamHub rejected the web username or password.':'StreamHub web login HTTP '+response.status+'.');let body;try{body=await response.json();}catch{throw Error('StreamHub web login did not return JSON. Check the web port (HTTPS 443 / HTTP 8888).');}
  if(typeof body.token!=='string'||!body.token||body.token.length>16000)throw Error('StreamHub web login returned no valid session token.');
  return {id:randomId(),base:c.base,origin,username,token:body.token,identity:{hardwareIdentifier:expected.hardwareIdentifier,...(expected.dockerId?{dockerId:expected.dockerId}:{})}};
 }
 async function handle(m){const c=await connection();
  if(m.type==='webLogin'){const expected=await identity(c),n=await login(c,expected,m),current=await connection();if(current.base!==c.base||current.key!==c.key)throw Error('Connection changed during login.');await storage.set({nativeSession:n});return publicState(c);}
  const n=await saved(c);if(!n)throw Error('Add a StreamHub web login first.');
  if(m.type==='webSession')return n;
  if(m.sessionId!==n.id||m.base!==n.base)throw Error('Web session changed.');
  if(m.type==='webToken'){if(typeof m.token!=='string'||!m.token||m.token.length>16000)throw Error('Invalid renewed session token.');await storage.set({nativeSession:{...n,token:m.token}});return {};}
  if(m.type==='webInvalidate'){if(m.token===n.token)await storage.set({nativeSession:{...n,token:''}});return {};}
  if(m.type==='webPattern'){
   if(!n.token)throw Error('Web login expired.');if(!['SDI','NDI'].includes(m.kind)||!Number.isInteger(m.output)||m.output<1||m.output>32)throw Error('Invalid output pattern.');
   const url=new URL('/thumbnails/'+(m.kind==='SDI'?'output':'NDIOutput')+'/'+m.output+'/'+Date.now(),n.origin);let response;try{response=await fetchFn(url.href,{credentials:'include',redirect:'error',cache:'no-store',signal:AbortSignal.timeout(6000)});}catch{throw Error('Output pattern unavailable.');}
   const mime=response.headers.get('content-type')?.split(';')[0];if(!response.ok||!['image/jpeg','image/png','image/webp'].includes(mime))throw Error('Output pattern unavailable.');const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length>1000000)throw Error('Output pattern too large.');let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));const latest=await saved(await connection());if(latest?.id!==n.id)throw Error('Web session changed during pattern request.');return {thumbnail:'data:'+mime+';base64,'+btoa(text)};
  }
  throw Error('Unknown web operation.');
 }
 return {types,handle,login,publicState,originFor};
};
