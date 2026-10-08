const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert');
const root=path.resolve(__dirname,'..'),extension=path.join(root,'extension');
for(const file of fs.readdirSync(extension).filter(n=>n.endsWith('.js')))cp.execFileSync(process.execPath,['--check',path.join(extension,file)],{stdio:'inherit'});
const manifest=JSON.parse(fs.readFileSync(path.join(extension,'manifest.json')));
for(const group of manifest.web_accessible_resources)for(const resource of group.resources)assert(fs.existsSync(path.join(extension,resource)),resource);
assert.equal(manifest.manifest_version,3);
if(fs.existsSync(path.join(root,'tests')))for(const file of fs.readdirSync(path.join(root,'tests')).filter(n=>n.endsWith('.cjs')))cp.execFileSync(process.execPath,[path.join(root,'tests',file)],{stdio:'inherit'});
console.log('PASS syntax, manifest resources and available regression checks.');
