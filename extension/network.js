/* Observe only this extension's requests. Never retain URLs containing keys or tokens. */
globalThis.createStreamHubNetwork=function({chromeApi=globalThis.chrome,fetchFn=fetch,now=Date.now}={}){
 const errors=new Map(),active=new Map(),own=chromeApi?.runtime?.getURL('')?.replace(/\/$/,'');
 function endpoint(value){const u=new URL(value);return u.origin+u.pathname;}
 function remember(d){const initiator=String(d.initiator||'').replace(/\/$/,'');if(!own||initiator!==own&&!d.documentUrl?.startsWith(own+'/')&&!((!initiator||initiator==='null')&&active.has(endpoint(d.url))))return;const code=String(d.error||'');if(!/^(net::)?ERR_[A-Z0-9_]+$/.test(code))return;errors.set(endpoint(d.url),{code:code.replace(/^net::/,''),time:now()});while(errors.size>64)errors.delete(errors.keys().next().value);}
 chromeApi?.webRequest?.onErrorOccurred?.addListener(remember,{urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']});
 function describe(error,url,since=0){const hit=errors.get(endpoint(url)),observed=hit&&hit.time>=since?hit.code:'',raw=String(error?.cause?.code||error?.code||observed||error?.name||''),code=/^(ERR_[A-Z0-9_]+|[A-Z_]+|TimeoutError|AbortError)$/.test(raw)?raw:'NETWORK_ERROR';let reason;
  if(/CERT|SELF_SIGNED|TLS|UNABLE_TO_VERIFY/.test(code))reason='Chrome rejected the HTTPS certificate. Use the hostname covered by a certificate trusted by Chrome.';
  else if(/SSL|WRONG_VERSION|PROTOCOL_ERROR/.test(code))reason='The selected port did not complete HTTPS. Check whether this endpoint serves HTTP or HTTPS.';
  else if(/NAME_NOT_RESOLVED|ENOTFOUND|EAI_AGAIN/.test(code))reason='The server hostname could not be resolved.';
  else if(/REFUSED/.test(code))reason='The server refused the connection on this port.';
  else if(/TIMED_OUT|ETIMEDOUT|Timeout|Abort/.test(code))reason='The server did not answer before the timeout.';
  else if(/BLOCKED|ACCESS_DENIED/.test(code))reason='Chrome or a network policy blocked this request. Check extension site access and browser policy.';
  else reason='The request could not reach the server. Check the selected address, protocol and port.';
  return endpoint(url)+' · '+code+'. '+reason;
 }
 async function request(url,options={}){const started=now(),key=endpoint(url);active.set(key,(active.get(key)||0)+1);try{return await fetchFn(url,options);}catch(error){await new Promise(r=>setTimeout(r,80));const e=Error(describe(error,url,started));e.networkDetail=true;throw e;}finally{const count=active.get(key)-1;if(count)active.set(key,count);else active.delete(key);}}
 return {fetch:request,describe};
};
