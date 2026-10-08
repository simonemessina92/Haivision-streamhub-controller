/* Overlay transport. Tokens stay inside the authenticated StreamHub tab. */
globalThis.installTabBridge = function(host, frame, origin) {
  const consumer = crypto.randomUUID();
  let disposed = false, session = null, lastSignature = '', timer = null;
  const active = () => !disposed && host.isConnected && !host.hidden && !document.hidden && session?.visible && !!session?.base;
  function send(message) {
    return chrome.runtime.sendMessage({...message, consumer}).catch(() => {});
  }
  function sync() {
    const next = active() ? session : null;
    const signature = JSON.stringify(next);
    // Heartbeat both keeps the broker awake and renews the provider lease.
    if (next) {
      if(timer===null)timer=setInterval(sync,2000);
      send({type:'sh-bridge-session', session:next});
    } else {
      clearInterval(timer);timer=null;
      if(lastSignature !== 'null')send({type:'sh-bridge-stop'});
    }
    lastSignature = signature;
  }
  function receive(event) {
    if (event.source !== frame.contentWindow || event.origin !== origin) return;
    if (event.data?.type === 'sh-preview-session') { session = event.data; sync(); }
    else if (event.data?.type === 'sh-native-command' && active()) send({type:'sh-bridge-command', command:event.data});
  }
  function deliver(message, sender) {
    if (sender.id !== chrome.runtime.id || message.type !== 'sh-bridge-delivery' || message.consumer !== consumer || !active() || message.payload?.base !== session.base) return;
    frame.contentWindow.postMessage(message.payload, origin);
  }
  window.addEventListener('message', receive);
  document.addEventListener('visibilitychange', sync);
  chrome.runtime.onMessage.addListener(deliver);
  const observer = new MutationObserver(sync);
  observer.observe(host, {attributes:true, attributeFilter:['hidden','style']});
  return () => {
    disposed = true; clearInterval(timer); observer.disconnect();
    window.removeEventListener('message', receive);
    document.removeEventListener('visibilitychange', sync);
    chrome.runtime.onMessage.removeListener(deliver);
    send({type:'sh-bridge-stop'});
  };
};
