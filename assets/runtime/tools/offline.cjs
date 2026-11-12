// Offline by default: no provider calls, npm downloads or remote asset fetches.
function check(u){let s=String(u?.url||u?.href||u||'');if(/^https?:/.test(s)&&!/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(s))throw Error('External network disabled in Caderno Engine');}
const fetch=global.fetch;if(fetch)global.fetch=(u,o)=>{check(u);return fetch(u,o)};
for(const n of ['http','https']){const m=require(n);for(const k of ['request','get']){const old=m[k];m[k]=function(u,...a){if(typeof u==='object'&&!u.href){const h=u.hostname||u.host;if(h&&!['localhost','127.0.0.1'].includes(h))throw Error('External host blocked')}else check(u);return old.call(this,u,...a)}}}
