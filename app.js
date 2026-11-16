'use strict';
const lang=document.documentElement.lang;
const base=new URL(lang==='ja'?'./':'../',location.href);
const params=new URL(location.href).searchParams;
let gender=params.get('character')==='female'?'female':'male';
let current='q1',history=[],data,nodes,results,reach;
const ids=['r10','r15','r20','r25','r30','r35','r40','r45'];
const screen=document.getElementById('screen'),statusEl=document.getElementById('status');
const words={ja:['物語フェーズ診断ゲーム','あなたはどの作家タイプ？','いくつかの問いに YES / NO で答えてください。あなたのものの見方に近い作家タイプを、8つの物語フェーズから診断します。','キャラクターを選択','男子版','女子版','診断をはじめる','はい','いいえ','← 前の質問','タイトルへ','回答ルートを見る','候補作家','おすすめの物語','𝕏 で結果をシェア','結果画像を保存','共有リンクをコピー','結果文をコピー','もう一度診断','友だちの診断結果','コピーしました','コピーしてください','画像を保存できませんでした','※物語フェーズモデルを使ったエンターテインメント診断です。心理検査・医学的評価ではありません。','採用カードを見る（日本語）'],ko:['이야기 페이즈 진단 게임','당신은 어떤 작가 타입일까요?','몇 가지 질문에 YES / NO로 답해 주세요. 당신의 관점과 가까운 작가 타입을 8가지 이야기 페이즈로 알아봅니다.','캐릭터 선택','남자 버전','여자 버전','진단 시작하기','그렇다','그렇지 않다','← 이전 질문','처음으로','답변 과정 보기','후보 작가','추천 작품','𝕏에 결과 공유','결과 이미지 저장','공유 링크 복사','결과 설명 복사','다시 진단하기','친구의 진단 결과','복사했습니다','복사해 주세요','이미지를 저장하지 못했습니다','※ 재미로 보는 진단입니다. 심리검사나 의학적 평가가 아닙니다.','채택 카드 보기 (일본어)'],en:['STORY PHASE QUIZ','Which storyteller are you?','Answer a few YES / NO questions to discover which of eight story types comes closest to the way you see the world.','Choose your character','Male version','Female version','Discover my story','Yes','No','← Back','Title screen','View my answers','Possible types','Recommended stories','Share on 𝕏','Save result image','Copy result link','Copy result text','Try again',"A friend’s result",'Copied','Copy this text','Could not save the image','For entertainment, based on the story phase model. This is not a psychological or medical assessment.','View adopted card (Japanese)']}[lang];
const t=i=>words[i];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const originalCharacter=id=>new URL(`assets/original-characters/${id}.webp`,base).href;
const asset=(id,portrait=false)=>new URL(`assets/${portrait?'portraits':'result-cards'}/${gender}/${id}.jpg`,base).href;
const entry=l=>new URL(l==='ja'?'./':`${l}/`,base);
function sharePageUrl(id){return new URL(`${lang==='ja'?'':lang+'/'}share/${gender}/${id}.html`,base).href;}
function languageLink(l){const u=entry(l);u.searchParams.set('character',gender);return u.href;}
function castHTML(cls='cast',candidates=ids){return `<div class="${cls}">${ids.map(id=>`<div class="${cls==='cast'?'castCard':cls==='candidateStrip'?'mini '+(candidates.includes(id)?'alive':''):'typeTile'}"><img src="${asset(id,true)}" alt="${esc(results[id].author)}" loading="lazy">${cls==='candidateStrip'?'':`<span>${results[id].phase}</span>`}</div>`).join('')}</div>`;}
function selectCharacter(value){gender=value;const u=new URL(location.href);u.searchParams.set('character',gender);u.searchParams.delete('result');window.history.replaceState(null,'',u);startScreen();}
function startScreen(){const titleUrl=new URL(location.href);titleUrl.searchParams.delete('result');titleUrl.searchParams.set('character',gender);window.history.replaceState(null,'',titleUrl);current='q1';history=[];statusEl.textContent='READY';screen.innerHTML=`<div class="hero"><nav class="languageSwitch" aria-label="Language">${[['ja','日本語'],['ko','한국어'],['en','English']].map(([l,n])=>`<a href="${languageLink(l)}" lang="${l}" ${lang===l?'aria-current="page"':''}>${n}</a>`).join('')}</nav><div class="kicker">${t(0)}</div><h1>WHO'S YOUR <span class="q">STORY?</span></h1><div class="sub">${t(1)}</div><p class="lead">${t(2)}</p><fieldset class="characterSwitch"><legend>${t(3)}</legend>${['male','female'].map((g,i)=>`<label><input type="radio" name="character" value="${g}" ${gender===g?'checked':''} onchange="selectCharacter(this.value)"> ${t(i+4)}</label>`).join('')}</fieldset><button class="start" onclick="startGame()">${t(6)}</button>${castHTML()}<div class="note">${t(23)}</div></div>`;}
function startGame(){current='q1';history=[];renderQuestion();}
function routeHTML(){return `<ol>${history.map(h=>`<li>${esc(nodes[h.id].text)} → ${h.answer?'YES':'NO'}</li>`).join('')}</ol>`;}
function renderQuestion(){const n=nodes[current],cand=reach[current];statusEl.textContent=`Q${history.length+1}`;screen.innerHTML=`<div class="questionHead"><div class="qno">QUESTION ${history.length+1}</div><div class="candidates">${t(12)} ${cand.length} / 8</div></div><div class="questionBox"><div class="questionText">${esc(n.text)}</div></div><div class="answers"><button class="answer yes" onclick="answer(true)"><small>YES</small>${t(7)}</button><button class="answer no" onclick="answer(false)"><small>NO</small>${t(8)}</button></div>${castHTML('candidateStrip',cand)}<div class="controls"><button class="ghost" onclick="undo()" ${history.length?'':'disabled'}>${t(9)}</button><button class="ghost" onclick="startScreen()">${t(10)}</button></div><details class="route"><summary>${t(11)}</summary>${routeHTML()}</details>`;}
function answer(value){const next=nodes[current][value?'yes':'no'];history.push({id:current,answer:value});if(results[next])renderResult(next);else{current=next;renderQuestion();}}
function undo(){if(history.length){current=history.pop().id;renderQuestion();}}
function resultFor(id){const r={...results[id]};if(gender==='female'){if(id==='r15')r.recs=[r.recs[0],{ja:'若きウェルテルの悩み',ko:'젊은 베르테르의 슬픔',en:'The Sorrows of Young Werther'}[lang],r.recs[2]];if(id==='r25'){r.detailTag={ja:'はぁ？あんたバカァ？',ko:'뭐? 너 바보야?',en:'Huh? Are you kidding me?'}[lang];r.desc={ja:'困難を課題と捉え、努力や工夫によって成長できると信じます。挑戦や強いライバルとの出会いを楽しみ、自ら行動することで人生を切り拓いていきます。',ko:'어려움을 과제로 받아들이고, 노력과 궁리를 통해 성장할 수 있다고 믿습니다. 도전과 강한 라이벌과의 만남을 즐기며, 스스로 행동하여 삶을 개척합니다.',en:'You see difficulties as challenges and believe you can grow through effort and ingenuity. You enjoy taking on challenges and meeting strong rivals, shaping your life through your own actions.'}[lang];}}return r;}
function renderResult(id,shared=false){const r=resultFor(id);statusEl.textContent='RESULT';screen.innerHTML=`${shared?`<div class="sharedBadge">${t(19)}</div>`:''}${lang==='ja'?`<figure class="resultCard"><a href="${asset(id)}" target="_blank" rel="noopener"><img src="${asset(id)}" alt="${esc(r.phase+' '+r.author+' '+r.desc)}"></a></figure>`:`<div class="resultGrid"><div class="portrait"><img src="${asset(id,true)}" alt="${esc(r.author)}"></div><div><div class="phase">${r.phase}</div><div class="chartTag">${esc(r.detailTag)}</div><div class="author">${esc(r.author)}</div><p class="desc">${esc(r.desc)}</p><div class="recTitle">${t(13)}</div><div class="recs">${r.recs.map(x=>`<span class="rec">${esc(x)}</span>`).join('')}</div></div></div><p><a class="ghost" href="${asset(id)}" target="_blank" rel="noopener">${t(24)}</a></p>`}<div class="resultBtns"><button class="xshare" onclick="shareX('${id}')">${t(14)}</button><button class="linkcopy" onclick="saveResultImage('${id}')">${t(15)}</button><button class="linkcopy" onclick="copyText(sharePageUrl('${id}'))">${t(16)}</button><button class="primary" onclick="copyText(resultText('${id}'))">${t(17)}</button><button class="secondary" onclick="startGame()">${t(18)}</button><button class="secondary" onclick="startScreen()">${t(10)}</button></div>${shared?'':`<details class="route"><summary>${t(11)}</summary>${routeHTML()}</details>`}<div class="allTypes"><h3>ALL 8 TYPES</h3>${castHTML('typeGrid')}</div>${lang==='ja'?'':`<details class="allCardsGallery"><summary>${lang==='ko'?'8가지 결과 카드 모두 보기':'View all eight result cards'}</summary><div class="localizedCardGrid">${ids.map(localizedCardHTML).join('')}</div></details>`}<div class="feedbackBox"><button class="feedbackPost" onclick="postFeedback('${id}')">${{ja:'Xでご意見・改善提案',ko:'X에 의견·개선 제안 쓰기',en:'Share feedback on X'}[lang]}</button></div>`;}
function localizedCardHTML(id){const r=resultFor(id);return `<article class="localizedCard"><div class="localizedCardArt"><img src="${asset(id,true)}" alt="${esc(r.author)}" loading="lazy"></div><div class="localizedCardBody"><div class="localizedPhase">${r.phase}</div><div class="chartTag">${esc(r.detailTag)}</div><div class="author">${esc(r.author)}</div><p class="desc">${esc(r.desc)}</p><div class="recTitle">${t(13)}</div><div class="recs">${r.recs.map(x=>`<span class="rec">${esc(x)}</span>`).join('')}</div><button class="linkcopy" onclick="saveResultImage('${id}')">${t(15)}</button></div></article>`;}
function resultText(id){const r=resultFor(id);return `WHO'S YOUR STORY?\n${r.phase} ${r.detailTag}\n${r.author}\n${r.desc}`;}

function shareX(id){window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(`WHO'S YOUR STORY?\n${resultFor(id).phase} ${resultFor(id).detailTag}\n${resultFor(id).author}\n#WhosYourStory`)+'&url='+encodeURIComponent(sharePageUrl(id)),'_blank','noopener,noreferrer');}
async function copyText(text){try{await navigator.clipboard.writeText(text);alert(t(20));}catch(e){prompt(t(21),text);}}
async function saveResultImage(id){
 try{
  if(lang==='ja'){
   const response=await fetch(asset(id));if(!response.ok)throw Error();
   const url=URL.createObjectURL(await response.blob()),link=document.createElement('a');
   link.href=url;link.download=`whos-your-story-${gender}-ja-${id}.jpg`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);return;
  }
  const r=resultFor(id),image=new Image();image.src=asset(id,true);await image.decode();
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1600;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#0d1017';ctx.fillRect(0,0,1200,1600);
  const scale=Math.min(1200/image.naturalWidth,900/image.naturalHeight),iw=image.naturalWidth*scale,ih=image.naturalHeight*scale;
  ctx.drawImage(image,(1200-iw)/2,900-ih,iw,ih);
  const fade=ctx.createLinearGradient(0,650,0,930);fade.addColorStop(0,'rgba(13,16,23,0)');fade.addColorStop(1,'#0d1017');ctx.fillStyle=fade;ctx.fillRect(0,650,1200,300);
  ctx.fillStyle='#e9ba52';ctx.font='900 28px system-ui, sans-serif';ctx.fillText("WHO'S YOUR STORY?",64,915);
  ctx.font='900 96px Georgia, serif';ctx.fillText(r.phase,64,960);
  ctx.fillStyle='#f7f7fb';ctx.font='900 42px system-ui, sans-serif';ctx.fillText(r.detailTag,64,1065);
  ctx.fillStyle='#f0d181';ctx.font='900 34px system-ui, sans-serif';ctx.fillText(r.author,64,1122);
  function drawWrapped(text,x,y,maxWidth,lineHeight,font,maxLines=5){
   ctx.font=font;ctx.fillStyle='#c4cad7';const tokens=lang==='en'||lang==='ko'?String(text).split(/\s+/):Array.from(String(text));let line='',lines=[];
   for(const token of tokens){const candidate=line?(lang==='en'||lang==='ko'?line+' '+token:line+token):token;if(ctx.measureText(candidate).width>maxWidth&&line){lines.push(line);line=token;}else line=candidate;}
   if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);lines[maxLines-1]=lines[maxLines-1].replace(/[.,;:!?，。！？]$/,'')+'…';}
   lines.forEach((item,index)=>ctx.fillText(item,x,y+index*lineHeight));return y+lines.length*lineHeight;
  }
  let y=drawWrapped(r.desc,64,1182,1072,40,'28px system-ui, sans-serif',5)+24;
  ctx.fillStyle='#929bad';ctx.font='900 22px system-ui, sans-serif';ctx.fillText(t(13).toUpperCase(),64,y);y+=38;
  drawWrapped(r.recs.join('   ·   '),64,y,1072,34,'23px system-ui, sans-serif',3);
  ctx.fillStyle='#687286';ctx.font='18px system-ui, sans-serif';ctx.fillText(lang.toUpperCase()+'  ·  '+gender.toUpperCase(),64,1545);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error()),'image/jpeg',0.94));
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`whos-your-story-${gender}-${lang}-${id}.jpg`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
 }catch(e){alert(t(22));}
}
fetch(new URL('game-data.json',base)).then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{data=d;({nodes,results,reach}=data[lang]);const id=params.get('result');if(ids.includes(id))renderResult(id,true);else startScreen();}).catch(()=>{screen.textContent={ja:'読み込めませんでした。再読み込みしてください。',ko:'불러오지 못했습니다. 새로고침해 주세요.',en:'Could not load the quiz. Please reload.'}[lang];});

function postFeedback(id){const text={ja:'ご意見・改善提案',ko:'의견·개선 제안',en:'Feedback and suggestions'}[lang];window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent("WHO'S YOUR STORY? "+text+'\n'+resultFor(id).author+'\n#WhosYourStoryFeedback')+'&url='+encodeURIComponent(languageLink(lang)),'_blank','noopener,noreferrer');}
