/* Standalone encrypted static guide. No cloud database, analytics, or Floot calls. */
'use strict';
const CACHE = 'kansai-gh-20260928-v1';
const ASSETS = ['index.html','app.js','guide.enc.json','manifest.webmanifest','icon-512.png'];
const $ = s => document.querySelector(s);
let decrypted = false, toastTimer;
const bin = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
function notify(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>{$('#toast').hidden=true;},7000);}
$('#showPass').addEventListener('click',()=>{const p=$('#passphrase');const show=p.type==='password';p.type=show?'text':'password';$('#showPass').textContent=show?'隱藏':'顯示';$('#showPass').setAttribute('aria-pressed',String(show));});
$('#unlockForm').addEventListener('submit', async e => {
  e.preventDefault();const button=$('#unlock'), field=$('#passphrase');
  if(!crypto.subtle||!isSecureContext){$('#error').textContent='請用 Safari 或 Chrome 開啟 HTTPS 正式網址，不能從檔案預覽使用本加密版。';return;}
  let phrase=field.value.trim();if(!phrase)return;
  button.disabled=true;button.textContent='正在解鎖…';$('#error').textContent='';
  try{
    let response;
    try { response=await fetch('./guide.enc.json',{credentials:'omit',cache:'no-cache'}); }
    catch (_){ throw new Error('無法下載加密行程。請先連網，解鎖後按「離線準備」。'); }
    if(!response.ok)throw new Error('加密行程載入失敗，請確認整個ZIP已上傳並重新整理。');
    const p=await response.json();
    if(p.format!=='kansai-static-guide-v1'||p.kdf!=='PBKDF2-SHA256'||p.iterations!==600000)throw new Error('加密檔格式或版本不符，請重新下載網站包。');
    const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(phrase),{name:'PBKDF2'},false,['deriveKey']);
    const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bin(p.salt),iterations:p.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
    let html;
    try {const result=await crypto.subtle.decrypt({name:'AES-GCM',iv:bin(p.iv),additionalData:new TextEncoder().encode(p.format)},key,bin(p.ciphertext));html=new TextDecoder('utf-8',{fatal:true}).decode(result);}
    catch(_){throw new Error('解鎖碼不正確，或加密檔已損壞。請完整複製，包含中間的連字號。');}
    if(!html.startsWith('<!DOCTYPE html>')&&!html.startsWith('<!doctype html>'))throw new Error('行程內容格式不符。');
    field.value='';field.type='password';$('#showPass').textContent='顯示';$('#showPass').setAttribute('aria-pressed','false');
    $('#guide').srcdoc=html;html='';decrypted=true;$('#gate').hidden=true;$('#reader').hidden=false;
    document.title='關西九日・私人旅記';window.scrollTo(0,0);
  }catch(err){$('#error').textContent=err instanceof Error?err.message:'無法解鎖，請重新嘗試。';}
  finally {phrase='';button.disabled=false;button.textContent='解鎖我的旅記　→';}
});
function lock(){
  const f=$('#guide');try{f.contentWindow.dispatchEvent(new Event('pagehide'));}catch(_){}
  f.removeAttribute('srcdoc');f.src='about:blank';decrypted=false;$('#reader').hidden=true;$('#gate').hidden=false;
  $('#passphrase').value='';$('#error').textContent='';document.title='私人旅記｜解鎖';
  window.scrollTo(0,0);notify('已鎖定行程。本機筆記仍保留；使用共用裝置時，請先匯出備份並在「隨身」清除個人紀錄。');
}
$('#lock').addEventListener('click',lock);
window.addEventListener('pageshow', e=>{if(e.persisted&&decrypted)lock();});
async function prepareOffline(){
  const button=$('#offline');button.disabled=true;button.textContent='準備中…';
  try{
    if(!isSecureContext||!('serviceWorker' in navigator)||!('caches' in window))throw new Error('這個瀏覽器不支援網站離線準備，請以Safari或Chrome開啟HTTPS網址。');
    await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
    await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('離線初始化逾時。請維持網路，再按一次。')),20000))]);
    const cache=await caches.open(CACHE);
    // SW installation downloads a consistent, versioned set. Do not cache decrypted content.
    const results=await Promise.all(ASSETS.map(p=>cache.match(new URL('./'+p,location.href).href)));
    if(results.some(r=>!r||!r.ok))throw new Error('離線檔案尚未完整，請保持連網、重新整理後再試。');
    button.textContent='已備妥離線';
    notify('加密行程已下載。請開飛航模式、關閉Wi-Fi，重新開啟並輸入解鎖碼實測；地圖不含在離線內容內。');
  }catch(err){button.textContent='離線準備';notify(err instanceof Error?err.message:'離線準備未完成，請連網重試。');}
  finally{button.disabled=false;}
}
window.prepareKansaiOffline=prepareOffline;
$('#offline').addEventListener('click',prepareOffline);
if(location.protocol==='file:')$('#error').textContent='此檔是網站部署包。請用GitHub Pages的HTTPS正式網址開啟。';
