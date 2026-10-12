(function(){
'use strict';
const questionSets={
 ie:[
 ['我比較在意事情在我心中代表什麼','我比較在意事情實際的共識與效果'],
 ['我更重視從內在的概念或想像來理解現實','我更重視從現實狀況來修正我的想法'],
 ['我理解事情時，內在的一致性對我很重要','我理解事情時，與外在情境的貼合度對我很重要'],
 ['我常覺得外在事物只是觸發內在理解的素材','我常覺得要回歸到外界實在事物來驗證理解'],
 ['我常看到某種不會隨著外界形式改變的內在共通點','我常看到事物能夠如何配合不同情境發生變化或調整'],
 ['我更容易相信事物對我帶來的內在啟發','我更容易相信事物實際外顯或展現的樣子'],
 ['外界經常對我刺激過強、資訊過多而讓我懼怕','外界對我而言比內在世界精彩豐富而更吸引'],
 ['我有時候對事物的理解會過於主觀而脫離現實本身的樣子','我有時候對於事物的理解會過於客觀而忽略自己的主觀角度']
 ],
 ETF:[
 ['我傾向以公認事實與理性規則來理解世界','我傾向以社會賦予的意義與價值來理解世界'],
 ['我認為公共秩序應建立在清楚的邏輯與法則上','我認為公共秩序應建立在共同的倫理與情感基礎上'],
 ['我比較在意一套制度是否保障公正的規定','我比較在意一套制度是否在價值上被認同'],
 ['我傾向將世界理解為一個可被邏輯整理的系統','我傾向將世界理解為一個承載共同意義的文化場域'],
 ['無論遵從或對抗，我更關注法律、定理或制度所代表的邏輯權威','無論遵從或對抗，我更關注文化、潮流或意識形態所代表的價值權威'],
 ['管理群體與共識時，制定大家公認的事物運作原理更重要','管理群體與共識時，找出大家公認的價值與嚮往更重要']
 ],
 ENS:[
 ['我比較注意事物現在具備的實際特性','我比較注意事物還可能發展成什麼'],
 ['我比較相信直接經驗到的現實','我比較相信無由來的直覺所暗示的未來方向'],
 ['我傾向按照事物的現有特性與它互動','我傾向嘗試突破事物現有的使用方式'],
 ['我關注的是事物在現實中的表現','我關注的是事物尚未顯現的可能性'],
 ['我很重視事物本身能夠帶來的刺激和體驗','我其實更在意事物背後激發的想像而忽視事物本身'],
 ['我比較容易被具體存在的事物吸引','我比較容易被新出現的想法或方向吸引']
 ],
 ITF:[
 ['我更常思考事物是否符合條件式邏輯的準則','我更常思考事物對我而言是否帶來美好的價值'],
 ['我常在腦中建立一套分類與概念結構','我常在心裡建立一套價值排序與倫理標準'],
 ['我傾向把判斷建立在「我認為正確的定義」上','我傾向把判斷建立在「我認為珍貴的信念」上'],
 ['我傾向把自己當成某種原理的守護者','我傾向把自己當成某種價值的守護者'],
 ['對我而言，合理性是在問事物是否符合我建立的理論框架','對我而言，合理性是在問事物是否符合我認定的情感道理'],
 ['我經常在仔細地定義事物，而忽略如何評價事物對我的意義','我經常在思考事物對我的情感意義，而忽略如何定義事物的結構']
 ],
 INS:[
 ['事物對我而言是一種可以被深刻感受到的存在','事物對我而言只是一種指向更深層意義的象徵'],
 ['我常仔細地體驗經歷帶給我的一切感覺','我常覺得經驗只是通往另一層意義的入口'],
 ['我經常感受到經驗像記憶棉那樣慢慢沉澱成深刻且主觀的印象','我經常感受到靈感像靈光一閃那樣突然浮現成瞬間看見的意象與軌跡'],
 ['事物經常帶給我非常強烈的體感感受，我迫切地感覺到自己被影響','事物通常會觸發一些完全無關的意象，我像是純粹的旁觀者'],
 ['我比較容易陷入經驗本身帶來的感覺','我比較容易飄向經驗背後指向的意味'],
 ['本質對我而言是對於事物透徹的經驗與沉澱','本質對我而言是對於事物最終連結通往的道']
 ]
};
const typePages={ENFJ:2889,ESFJ:2877,ENFP:2957,ENTP:2951,ESFP:2939,ESTP:2934,ENTJ:2865,ESTJ:2832,INFJ:2922,ISFJ:2917,INFP:2996,INTP:2987,ISFP:2975,ISTP:2969,INTJ:2905,ISTJ:2899};
const domOnlyPages={Te:2871,Fe:2894,Se:2945,Ne:2963,Ti:2911,Fi:2928,Si:2981,Ni:3002};
const auxiliary={Te:['Ne','Se'],Fe:['Ne','Se'],Ne:['Te','Fe'],Se:['Te','Fe'],Ti:['Ni','Si'],Fi:['Ni','Si'],Ni:['Ti','Fi'],Si:['Ti','Fi']};
const functions=['Te','Fe','Ne','Se','Ti','Fi','Ni','Si'];
const app=document.getElementById('quiz-app');
const siteRoot=new URL(document.currentScript.src).pathname.replace(/assets\/js\/quiz\.js$/,'');
let stage=1,branch='',firstAnswers=Array(questionSets.ie.length).fill(0),secondQuestions=[],secondAnswers=[];
let quizStarted=false,quizFinished=false,confirmedLeave=false;
const leaveWarning='離開後，這次測驗的作答進度不會保留，必須重新填寫。確定要離開嗎？';
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function fmt(n){return n>0?'+'+n:String(n);}
function activeAnswers(){return stage===1?firstAnswers:secondAnswers;}
function makeCard(pair,index,value){const label=stage===1?'第一部分第'+(index+1)+'題':'第二部分第'+(index+1)+'題';return '<article class="quiz-card"><div class="quiz-card-head"><p class="quiz-question">哪一邊更能描述你？</p><output class="quiz-value" aria-live="polite">'+fmt(value)+'</output></div><div class="quiz-answer-row"><p class="quiz-side left">'+esc(pair[0])+'</p><div class="quiz-range-area"><div class="quiz-range-wrap"><input class="quiz-range" type="range" min="-4" max="4" step="1" value="'+value+'" data-index="'+index+'" aria-label="'+label+'：由較認同左側調整至較認同右側"></div><div class="quiz-scale" aria-hidden="true"><span>−4</span><span class="zero">0</span><span>+4</span></div></div><p class="quiz-side right">'+esc(pair[1])+'</p></div></article>';}
function render(){const pairs=stage===1?questionSets.ie:secondQuestions;const answers=activeAnswers();const title=stage===1?'第一部分｜內傾與外傾':'第二部分｜'+(branch==='E'?'外傾分支':branch==='I'?'內傾分支':'內外傾混合分支');const hint=stage===1?'左側偏內傾（I），右側偏外傾（E）。八題合計後會決定下一部分。':'請逐題選擇較符合自己的描述。左側計負分，右側計正分；預設 0 可保留為中間值。';app.innerHTML='<div class="quiz-progress"><strong>第 '+stage+' 部分，共 2 部分</strong><span>'+pairs.length+' 題</span></div><div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:'+(stage===1?'50':'100')+'%"></div></div><h2 class="quiz-group-title">'+title+'</h2><p class="quiz-instruction">'+hint+'</p><form id="quiz-form" novalidate>'+pairs.map((p,i)=>makeCard(p,i,answers[i])).join('')+'<div class="quiz-actions">'+(stage===2?'<button class="quiz-btn secondary" type="button" id="back-button">返回第一部分</button>':'<span></span>')+'<button class="quiz-btn" type="submit">'+(stage===1?'繼續作答':'查看測驗結果')+'</button></div></form><p class="quiz-message">本測驗提供自我探索參考，結果不應視為最終類型判斷。</p>';
app.querySelectorAll('.quiz-range').forEach(input=>input.addEventListener('input',()=>{const i=Number(input.dataset.index);answers[i]=Number(input.value);quizStarted=true;input.closest('.quiz-card').querySelector('output').textContent=fmt(answers[i]);}));
const back=app.querySelector('#back-button');if(back)back.addEventListener('click',()=>{stage=1;render();window.scrollTo({top:0,behavior:'smooth'});});
app.querySelector('#quiz-form').addEventListener('submit',ev=>{ev.preventDefault();if(stage===1){quizStarted=true;const total=firstAnswers.reduce((a,b)=>a+b,0);branch=total>4?'E':total< -4?'I':'M';secondQuestions=branch==='E'?[...questionSets.ETF,...questionSets.ENS]:branch==='I'?[...questionSets.ITF,...questionSets.INS]:[...questionSets.ETF.slice(0,3),...questionSets.ENS.slice(0,3),...questionSets.ITF.slice(0,3),...questionSets.INS.slice(0,3)];secondAnswers=Array(secondQuestions.length).fill(0);stage=2;render();window.scrollTo({top:0,behavior:'smooth'});}else finish();});}
function positive(n){return Math.max(0,n);}
function getScores(){const totals={ETF:0,ENS:0,ITF:0,INS:0};let groups;if(branch==='E')groups=Array(6).fill('ETF').concat(Array(6).fill('ENS'));else if(branch==='I')groups=Array(6).fill('ITF').concat(Array(6).fill('INS'));else groups=['ETF','ETF','ETF','ENS','ENS','ENS','ITF','ITF','ITF','INS','INS','INS'];secondAnswers.forEach((n,i)=>{totals[groups[i]]+=n;});return {totals,scores:{Te:positive(-totals.ETF),Fe:positive(totals.ETF),Se:positive(-totals.ENS),Ne:positive(totals.ENS),Ti:positive(-totals.ITF),Fi:positive(totals.ITF),Si:positive(-totals.INS),Ni:positive(totals.INS)}};}
function deriveType(dom,aux){const perceptive=['Se','Si','Ne','Ni'],judging=['Te','Ti','Fe','Fi'];const p=perceptive.includes(dom)?dom:aux;const j=judging.includes(dom)?dom:aux;return (['Te','Fe','Ne','Se'].includes(dom)?'E':'I')+(['Se','Si'].includes(p)?'S':'N')+(['Te','Ti'].includes(j)?'T':'F')+(judging.includes(dom)?'J':'P');}
function goToResult(url){quizFinished=true;location.href=url;}
function finish(){const data=getScores(),scores=data.scores;const max=Math.max(...functions.map(f=>scores[f]));const domTies=functions.filter(f=>scores[f]===max);const dom=domTies[0];if(domTies.length>1){const candidates=[];domTies.forEach(d=>{const pool=auxiliary[d];const best=Math.max(...pool.map(a=>scores[a]));pool.filter(a=>scores[a]===best).forEach(a=>candidates.push(deriveType(d,a)));});const q=new URLSearchParams({type_candidates:[...new Set(candidates)].join(',')});goToResult(siteRoot+'page-3008.html?'+q.toString());return;}
const pool=auxiliary[dom],best=Math.max(...pool.map(a=>scores[a])),auxTies=pool.filter(a=>scores[a]===best);if(auxTies.length>1){const q=new URLSearchParams({aux_tie:'1',aux_ties:auxTies.join(','),jung_dom:dom});goToResult(siteRoot+'page-'+domOnlyPages[dom]+'.html?'+q.toString());return;}
const aux=auxTies[0],type=deriveType(dom,aux),page=typePages[type];if(!page){app.innerHTML='<p class="quiz-message error">無法對應結果頁，請稍後再試。</p>';return;}goToResult(siteRoot+'page-'+page+'.html');}
document.addEventListener('click',function(event){
 const link=event.target.closest('a[href]');
 if(!link||!quizStarted||quizFinished||link.hasAttribute('download')||link.target==='_blank')return;
 const destination=new URL(link.href,location.href);
 if(destination.href===location.href)return;
 if(!window.confirm(leaveWarning)){event.preventDefault();event.stopImmediatePropagation();return;}
 confirmedLeave=true;
},true);
window.addEventListener('beforeunload',function(event){
 if(!quizStarted||quizFinished||confirmedLeave)return;
 event.preventDefault();
 event.returnValue=leaveWarning;
});
render();
})();
