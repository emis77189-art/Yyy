/* منطق مشترك: توليد مهام اليوم وحساب النقاط */
const DEF={sleep:'20:30',wakeAm:'07:00',bfAm:'07:15',bfPm:'08:00',bfWk:'09:00',lunch:'13:00',lunchPm:'10:30',dinner:'19:30',swap:false,pin:'',amS:'12:00',amE:'21:00',pmMS:'08:00',pmME:'11:00',pmES:'16:30',pmEE:'22:00',wkFrom:'09:00',wkTo:'22:00'};
const SCH={am:[480,720],pm:[720,990]};
const m2t=m=>{m=((m%1440)+1440)%1440;const h=Math.floor(m/60),n=m%60;return (h%12||12)+':'+String(n).padStart(2,'0')+' '+(h<12?'ص':'م')};
const t2m=t=>{const[a,b]=(t||'0:0').split(':');return +a*60+ +b};
const dayKey=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function shiftOf(c,di){return((di<2)!==!!c.swap)?'am':'pm'}
/* مواد النشاط (رياضة/فنية/أخلاقية...) لا تدخل المهام */
const isAct=s=>/رياضه|رياضيه|بدنيه|فنيه|اخلاق|موسيق|نشاط/.test(cmp(s));
/* دروس يوم دراسي s: ما يُحضَّر مساء اليوم السابق (before)، وما يُحضَّر صباح اليوم نفسه (same، للدوام العصري فقط) */
function split(c,sch,s){const L=((sch||{})[s]||[]).filter(x=>!isAct(x));if(shiftOf(c,s)==='am')return{before:L,same:[]};const h=Math.ceil(L.length/2);return{before:L.slice(0,h),same:L.slice(h)}}
/* مهام اليوم di: mor = تحضير صباح اليوم نفسه، eve = تحضير ما بعد العودة لدروس اليوم التالي */
function daySubs(c,sch,di){c={...DEF,...c};
 if(di<5)return{mor:shiftOf(c,di)==='pm'?split(c,sch,di).same:[],eve:di===4?[]:split(c,sch,di+1).before};
 const b=split(c,sch,0).before,h=Math.ceil(b.length/2);return{mor:[],eve:di===5?b.slice(0,h):b.slice(h)}}
function genD(c,sch,di){return gen(c,daySubs(c,sch,di),di)}
function wins(c,di){c={...DEF,...c};if(di>=5)return[[t2m(c.wkFrom),t2m(c.wkTo)]];return shiftOf(c,di)==='am'?[[t2m(c.amS),t2m(c.amE)]]:[[t2m(c.pmMS),t2m(c.pmME)],[t2m(c.pmES),t2m(c.pmEE)]]}
function phase(c,di,m){c={...DEF,...c};const W=wins(c,di),T=gen(c,{},di),wk=di>=5,S=SCH[wk?'am':shiftOf(c,di)];
 const Z=[...W,...T.map(t=>[t.from,t.to])].sort((a,b)=>a[0]-b[0]);
 if(Z.some(z=>m>=z[0]&&m<=z[1]))return{k:'in'};
 const nx=Z.find(z=>z[0]>m);
 if(!nx)return{k:'done',text:'🌙 انتهى يوم المهام، تصبح على خير'};
 if(!wk&&m>=S[0]&&m<S[1])return{k:'school',text:'🏫 أنت الآن في المدرسة، تبدأ مهامك الساعة '+m2t(nx[0])};
 return{k:'before',text:'تبدأ مهامك الساعة '+m2t(nx[0])}}
function gen(c,d,di){
 c={...DEF,...c};d=d||{};const wk=di>=5,sh=wk?'wk':shiftOf(c,di),W=wins(c,di),T=[],sl=t2m(c.sleep),busy=[];
 const inW=(f,t)=>W.some(w=>f>=w[0]&&t<=w[1]);
 const add=(id,title,f,t,p,x,force)=>{if(force||inW(f,t))T.push({id,title,from:f,to:t,pts:p,...x})};
 const S0=SCH[sh==='pm'?'pm':'am'];
 if(sh==='am'){const w=t2m(c.wakeAm);add('wake','استيقظت من النوم',w,w+15,5,0,1)}
 if(!wk){add('go','انطلقت إلى مدرستي 🏫',S0[0]-30,S0[0]+15,3,0,1);add('back','عدت إلى البيت 🏠',S0[1],S0[1]+30,3,0,1);busy.push([S0[1],S0[1]+30])}
 busy.push([sl-30,sl+60]);
 const pre=wk?'مراجعة درس ':'تحضير درس ',pools=sh==='pm'?[d.mor,d.eve]:[d.eve];let k=0;
 W.forEach((w,wi)=>{(pools[wi]||[]).filter(s=>!isAct(s)).forEach(s=>{add('h'+k++,pre+s,w[0],w[1],6,{hw:1,kind:'study'})})});
 add('sleep','أنا نائم الآن 😴',sl-30,sl+30,20,{pin:1},1);
 return T.sort((a,b)=>a.from-b.from)}
/* نقاط: ضمن النافذة كاملة، وبعد انتهائها تُغلق المهمة */
function pts(t,mins){if(mins<t.from)return -1;if(mins<=t.to)return t.pts;return 0}
/* تطبيع الاسم للبحث */
const nm=s=>(s||'').replace(/[\u064B-\u065F\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ئ/g,'ي').replace(/ؤ/g,'و').replace(/ء/g,'').replace(/[^\u0621-\u064Aa-zA-Z0-9\s]/g,'').trim().split(/\s+/).filter(Boolean).join('_');
const cmp=s=>nm(s).replace(/_/g,'');
const nkeys=n=>{const w=(n||'').trim().split(/\s+/);return[...new Set([nm(n),nm(w.slice(0,3).join(' '))])].filter(Boolean)};
