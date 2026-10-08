const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../extension'),source=fs.readFileSync(path.join(root,'diagnostics.js'),'utf8'),ctx={};vm.createContext(ctx);vm.runInContext(source,ctx);
const get=(item,kind='input',native=null)=>ctx.streamHubDiagnostic(item,kind,native),fields=r=>ctx.terminalDiagnosticFields(r);
assert.equal(get({status:3,enabled:true,message:'DST_BAD_OR_CREDENTIAL'},'output').message,'Bad destination or credentials');
assert.equal(get({status:4,enabled:true,message:'TS_CBR_OUTPUT_DROP'},'output').severity,'warning');
assert.equal(get({status:3,enabled:false,message:'DST_BAD'},'output'),null);
assert.equal(get({status:2,enabled:true,message:'DST_BAD'},'output'),null);
assert.equal(get({status:null,enabled:true,message:'DST_BAD'},'output'),null);
assert.equal(get({status:3,message:'LOST_INPUT'}).message,'Lost input');
assert.equal(get({status:3,message:'CODEC_NOT_SUPPORTED'},'encoder').message,'Codec not supported');
assert.equal(get({status:3,message:'Server-specific new message'}).message,'Server-specific new message');
const r={liveStatus:-28,recordStatus:-30,liveStatusErrorParam:'1080p50;12000',message:'raw'};
assert.equal(fields(r).errorCode,-28);
assert.equal(get({status:3,...fields(r)}).message,'Too low video bitrate (min. 12000 kbps for 1080p50).');
assert.equal(get({status:3,...fields({...r,recordStatusErrorParam:'2160p50;25000'})}).message,'Too low video bitrate (min. 25000 kbps for 2160p50).');
assert.equal(get({status:3,...fields({liveStatus:-9999,message:'Unknown firmware detail'})}).message,'Unknown firmware detail');
assert.equal(get({status:3,message:'Old error'},'input',{status:2,message:''}),null,'native resolved state clears REST error');
// All three readers use identical device error precedence and parameter handling.
for(const file of ['background.js','native-features.js']){
 const code=fs.readFileSync(path.join(root,file),'utf8');const helper=code.slice(code.indexOf('function terminalDiagnosticFields('),code.indexOf('\n',code.indexOf('function terminalDiagnosticFields(')));
 const c={};vm.createContext(c);vm.runInContext(helper,c);assert.equal(JSON.stringify(c.terminalDiagnosticFields(r)),JSON.stringify(fields(r)));
}
// Exercise the actual REST snapshot, including duplicate SRT profile names/config keys.
(async()=>{
 const c={console,Number,Set,Map,Array,Object,String,Error,mojoDevices:new Set(),cameraSessions:new Map(),deviceIdentities:new Map(),sdiConnectors:new Map(),truth:v=>v===true,streamLinks:()=>[],servesStreamLinks:()=>false,serverIdentity:async()=>({nbOutput:0}),chrome:{storage:{local:{get:async()=>({})}}},request:async(_,p)=>p==='/inputs'?{inputs:[{identifier:'Unit',channelStatus:3,message:'LOST_INPUT',connectionStatus:1}]}:{output:[],NDIOutput:[],IPOutput:[{name:'SRT',configKey:2,status:3,message:'DST_BAD_OR_CREDENTIAL',enable:true,channelSourceIndex:0}]},config:async(_,root)=>root==='streamingOutput'?{2:{name:'SRT',mode:'SRT',channelIndex:0,outputOrder:1,enable:true}}:{}};
 vm.createContext(c);const bg=fs.readFileSync(path.join(root,'background.js'),'utf8');vm.runInContext(bg.slice(bg.indexOf('function terminalDiagnosticFields('),bg.indexOf('const mojoDevices=')),c);const snapshot=await c.snapshot({base:'https://fixture'});
 assert.equal(snapshot.outputs[0].message,'DST_BAD_OR_CREDENTIAL');assert.equal(snapshot.outputs[0].configIndex,'2');assert.equal(snapshot.inputs[0].message,'LOST_INPUT');
 console.log('PASS native diagnostics: REST message preservation, error/warning, off/resolved clearing, terminal code precedence and parameters, unknown-code fallback. Simulated responses.');
})().catch(e=>{console.error(e);process.exit(1)});
