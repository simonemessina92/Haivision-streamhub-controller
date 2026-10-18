/* Shared endpoint rules for the panel and the extension worker. */
globalThis.StreamHubEndpoints=(()=>{
 function origin(value){const u=new URL(value);if(!['http:','https:'].includes(u.protocol)||!u.hostname||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error('Enter only a server address, optionally with a port, without a path or credentials.');return u;}
 function api(value,protocol){const text=String(value||'').trim();if(!text)throw Error('Enter a StreamHub IP address or hostname.');const explicit=/^https?:\/\//i.test(text),scheme=protocol||'http';if(!['http','https'].includes(scheme))throw Error('Choose HTTP or HTTPS.');const u=origin(explicit?text:scheme+'://'+text);if(!u.port)u.port=u.protocol==='https:'?'8896':'8893';return u.origin;}
 function web(base,mode='auto',custom=''){if(custom)return origin(custom).origin;const u=origin(base),scheme=mode==='auto'?u.protocol.slice(0,-1):mode;if(!['http','https'].includes(scheme))throw Error('Choose HTTP or HTTPS.');return origin(scheme+'://'+u.hostname+(scheme==='http'?':8888':'')).origin;}
 function changeWebProtocol(value,protocol){if(!value||protocol==='auto')return value;const u=origin(value),standard=!u.port||u.port==='8888';u.protocol=protocol+':';if(standard)u.port=protocol==='http'?'8888':'';return u.origin;}
 function changeProtocol(value,protocol){const text=String(value||'').trim();if(!/^https?:\/\//i.test(text))return text;const u=origin(text),standard=!u.port||['8893','8896'].includes(u.port);u.protocol=protocol+':';if(standard)u.port=protocol==='https'?'8896':'8893';return u.origin;}
 return {api,web,changeProtocol,changeWebProtocol};
})();
