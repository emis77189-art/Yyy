/* إعداد Firebase المشترك. اترك FB_URL فارغًا للكشف التلقائي، أو ضع رابط قاعدة البيانات الكامل (من صفحة diagnose.html). */
window.FB_PROJECT='golden-class-dee0d';
window.FB_URL='https://golden-class-dee0d-default-rtdb.firebaseio.com';
(function(){
 const p=window.FB_PROJECT,C=['https://'+p+'-default-rtdb.firebaseio.com','https://'+p+'-default-rtdb.europe-west1.firebasedatabase.app','https://'+p+'-default-rtdb.asia-southeast1.firebasedatabase.app'];
 window.FB_CANDIDATES=C;
 window.fbUrlSync=()=>{if(window.FB_URL)return window.FB_URL;try{return localStorage.getItem('fb_url')||undefined}catch(e){return undefined}};
 const probe=async u=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),6000);try{const r=await fetch(u+'/home.json?shallow=true',{signal:c.signal});return r.status===200||r.status===401||r.status===403}catch(e){return false}finally{clearTimeout(t)}};
 /* كشف في الخلفية: إن لم تستجب القاعدة الحالية جرّب بقية العناوين وأعد التحميل مرة واحدة */
 window.fbDetect=async function(){try{if(window.FB_URL||sessionStorage.getItem('fb_tried'))return;const eff=window.fbUrlSync()||C[0];if(await probe(eff))return;sessionStorage.setItem('fb_tried','1');for(const u of C){if(u!==eff&&await probe(u)){localStorage.setItem('fb_url',u);location.reload();return}}}catch(e){}};
})();
