/* Runs in an isolated world on a signed-in StreamHub page, including background tabs. */
if (!globalThis.__shNativeProvider) {
  const sessions = new Map();
  const stop = key => { const row=sessions.get(key); if(row){clearTimeout(row.lease);row.dispose();row.host.remove();sessions.delete(key);} };
  const renew = row => {clearTimeout(row.lease);row.lease=setTimeout(()=>stop(row.consumer),6500);};
  chrome.runtime.onMessage.addListener((message, sender, reply) => {
    if(sender.id!==chrome.runtime.id || sender.tab || !message.type?.startsWith('sh-provider-'))return;
    const key=message.consumer;
    if(message.type==='sh-provider-start') {
      stop(key);
      const host=document.createElement('div');host.style.display='none';host.setAttribute('aria-hidden','true');document.documentElement.append(host);
      const row={consumer:key,nonce:message.nonce,host,dispose:null,lease:null};
      const frame={contentWindow:{postMessage:payload=>chrome.runtime.sendMessage({type:'sh-bridge-event',consumer:key,nonce:row.nonce,payload}).catch(()=>{})}};
      row.dispose=installNativePreview(host,frame,chrome.runtime.getURL('').slice(0,-1),{remote:true});
      sessions.set(key,row);renew(row);
      row.dispose.receive({...message.session,type:'sh-preview-session'});
      reply({ok:true});return;
    }
    const row=sessions.get(key);if(!row||row.nonce!==message.nonce){reply({ok:false});return;}
    if(message.type==='sh-provider-stop'){stop(key);reply({ok:true});return;}
    if(message.type==='sh-provider-renew'){renew(row);reply({ok:true});return;}
    if(message.type==='sh-provider-command'){row.dispose.receive(message.command);reply({ok:true});}
  });
  window.addEventListener('pagehide',()=>{for(const key of sessions.keys())stop(key);});
  globalThis.__shNativeProvider=true;
}
