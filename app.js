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
function castHTML(cls='cast',candidates=ids){return `<div class="${cls}">${ids.map(id=>`<div class="${cls==='cast'?'castCard':cls==='candidateStrip'?'mini '+(candidates.includes(id)?'alive':''):'typeTile'}"><img src="${originalCharacter(id)}" alt="${esc(results[id].author)}" loading="lazy">${cls==='candidateStrip'?'':`<span>${results[id].phase}</span>`}</div>`).join('')}</div>`;}
function selectCharacter(value){gender=value;const u=new URL(location.href);u.searchParams.set('character',gender);u.searchParams.delete('result');window.history.replaceState(null,'',u);startScreen();}
function startScreen(){const titleUrl=new URL(location.href);titleUrl.searchParams.delete('result');titleUrl.searchParams.set('character',gender);window.history.replaceState(null,'',titleUrl);current='q1';history=[];statusEl.textContent='READY';screen.innerHTML=`<div class="hero"><nav class="languageSwitch" aria-label="Language">${[['ja','日本語'],['ko','한국어'],['en','English']].map(([l,n])=>`<a href="${languageLink(l)}" lang="${l}" ${lang===l?'aria-current="page"':''}>${n}</a>`).join('')}</nav><div class="kicker">${t(0)}</div><h1>WHO'S YOUR <span class="q">STORY?</span></h1><div class="sub">${t(1)}</div><p class="lead">${t(2)}</p><fieldset class="characterSwitch"><legend>${t(3)}</legend>${['male','female'].map((g,i)=>`<label><input type="radio" name="character" value="${g}" ${gender===g?'checked':''} onchange="selectCharacter(this.value)"> ${t(i+4)}</label>`).join('')}</fieldset><button class="start" onclick="startGame()">${t(6)}</button>${castHTML()}<div class="note">${t(23)}</div></div>`;}
function startGame(){current='q1';history=[];renderQuestion();}
function routeHTML(){return `<ol>${history.map(h=>`<li>${esc(nodes[h.id].text)} → ${h.answer?'YES':'NO'}</li>`).join('')}</ol>`;}
function renderQuestion(){const n=nodes[current],cand=reach[current];statusEl.textContent=`Q${history.length+1}`;screen.innerHTML=`<div class="questionHead"><div class="qno">QUESTION ${history.length+1}</div><div class="candidates">${t(12)} ${cand.length} / 8</div></div><div class="questionBox"><div class="questionText">${esc(n.text)}</div></div><div class="answers"><button class="answer yes" onclick="answer(true)"><small>YES</small>${t(7)}</button><button class="answer no" onclick="answer(false)"><small>NO</small>${t(8)}</button></div>${castHTML('candidateStrip',cand)}<div class="controls"><button class="ghost" onclick="undo()" ${history.length?'':'disabled'}>${t(9)}</button><button class="ghost" onclick="startScreen()">${t(10)}</button></div><details class="route"><summary>${t(11)}</summary>${routeHTML()}</details>`;}
function answer(value){const next=nodes[current][value?'yes':'no'];history.push({id:current,answer:value});if(results[next])renderResult(next);else{current=next;renderQuestion();}}
function undo(){if(history.length){current=history.pop().id;renderQuestion();}}
function resultFor(id){const r={...results[id]};if(gender==='female'){if(id==='r15')r.recs=[r.recs[0],{ja:'若きウェルテルの悩み',ko:'젊은 베르테르의 슬픔',en:'The Sorrows of Young Werther'}[lang],r.recs[2]];if(id==='r25'){r.detailTag={ja:'はぁ？あんたバカァ？',ko:'뭐? 너 바보야?',en:'Huh? Are you kidding me?'}[lang];r.desc={ja:'困難を課題と捉え、努力や工夫によって成長できると信じます。挑戦や強いライバルとの出会いを楽しみ、自ら行動することで人生を切り拓いていきます。',ko:'어려움을 과제로 받아들이고, 노력과 궁리를 통해 성장할 수 있다고 믿습니다. 도전과 강한 라이벌과의 만남을 즐기며, 스스로 행동하여 삶을 개척합니다.',en:'You see difficulties as challenges and believe you can grow through effort and ingenuity. You enjoy taking on challenges and meeting strong rivals, shaping your life through your own actions.'}[lang];}}return r;}
const localizedCardCache={};
function wrapCardText(text,font,maxWidth,maxLines){
 const context=document.createElement('canvas').getContext('2d');context.font=font;
 const words=String(text).trim().split(/\s+/);let line='',lines=[];
 for(const word of words){const candidate=line?line+' '+word:word;if(context.measureText(candidate).width>maxWidth&&line){lines.push(line);line=word;}else line=candidate;}
 if(line)lines.push(line);
 if(lines.length>maxLines){lines=lines.slice(0,maxLines);lines[maxLines-1]=lines[maxLines-1].replace(/[.,;:!?，。！？]$/,'')+'…';}
 return lines;
}
function svgTextLines(lines,x,y,size,lineHeight,color,family,weight){
 return '<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="'+size+'" font-family="'+family+'" font-weight="'+weight+'">'+lines.map((line,i)=>'<tspan x="'+x+'" dy="'+(i?lineHeight:0)+'">'+esc(line)+'</tspan>').join('')+'</text>';
}
async function localizedCardDataURL(id){
 const key=lang+'-'+gender+'-'+id;if(localizedCardCache[key])return localizedCardCache[key];
 const response=await fetch(asset(id,true));if(!response.ok)throw Error('Portrait unavailable');
 const portraitBlob=await response.blob();
 const portraitData=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(portraitBlob);});
 const r=resultFor(id);
 const tagLines=wrapCardText(r.detailTag,'bold 36px system-ui',440,2);
 const authorLines=wrapCardText(r.author,'bold 34px system-ui',440,2);
 const descLines=wrapCardText(r.desc,'28px system-ui',650,5);
 const descY=375,descSvg=svgTextLines(descLines,78,descY,28,42,'#392d3d','system-ui, sans-serif',500);
 const recTitleY=descY+descLines.length*42+36;
 let recY=recTitleY+58;
 const recSvg=r.recs.map(title=>{
  const lines=wrapCardText(title,'25px system-ui',630,2);
  const y=recY;recY+=lines.length*33+8;
  return '<path d="M78 '+(y-18)+' l16 10 -16 10 z" fill="#bc8f2c"/>'+svgTextLines(lines,112,y,25,33,'#3b2e3f','system-ui, sans-serif',600);
 }).join('');
 const svg='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1536" height="1024" viewBox="0 0 1536 1024">'+
 '<defs><clipPath id="card"><rect x="10" y="10" width="1516" height="1004" rx="28"/></clipPath><linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf5e8"/><stop offset="1" stop-color="#eee2c9"/></linearGradient><linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#352442"/><stop offset="1" stop-color="#352442" stop-opacity="0"/></linearGradient></defs>'+
 '<g clip-path="url(#card)"><rect width="1536" height="1024" fill="url(#paper)"/>'+
 '<image x="760" y="0" width="776" height="1024" preserveAspectRatio="xMidYMid slice" href="'+portraitData+'" xlink:href="'+portraitData+'"/>'+
 '<path d="M0 0 H820 V235 C600 270 300 285 0 340 Z" fill="#352442"/>'+
 '<path d="M730 0 H820 V1024 H730 Z" fill="url(#fade)" opacity=".18"/>'+
 '<text x="68" y="70" fill="#f2d88e" font-size="28" font-family="Georgia,serif" font-style="italic" letter-spacing="4">STORY TYPE</text>'+
 '<text x="52" y="222" fill="#f2d88e" font-size="164" font-family="Georgia,serif" font-weight="700">'+esc(r.phase)+'</text>'+
 svgTextLines(tagLines,300,120,36,42,'#fbf5e8','Georgia, serif',700)+
 svgTextLines(authorLines,300,184,34,40,'#fbf5e8','system-ui, sans-serif',800)+
 '<path d="M76 306 V548" stroke="#b88a31" stroke-width="5"/>'+
 descSvg+
 '<rect x="60" y="'+(recTitleY-34)+'" width="430" height="46" rx="8" fill="#352442"/>'+
 '<text x="92" y="'+(recTitleY-3)+'" fill="#f2d88e" font-size="25" font-family="Georgia,serif" font-weight="700" letter-spacing="2">'+esc(t(13).toUpperCase())+'</text>'+
 recSvg+
 '</g><rect x="12" y="12" width="1512" height="1000" rx="28" fill="none" stroke="#c8a04c" stroke-width="12"/><rect x="28" y="28" width="1480" height="968" rx="20" fill="none" stroke="#f6df9a" stroke-width="3"/></svg>';
 const dataURL='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);localizedCardCache[key]=dataURL;return dataURL;
}
function renderResult(id,shared=false){
 const r=resultFor(id);statusEl.textContent='RESULT';
 const cardMarkup=lang==='ja'
  ? '<figure class="resultCard"><a href="'+asset(id)+'" target="_blank" rel="noopener"><img src="'+asset(id)+'" alt="'+esc(r.phase+' '+r.author+' '+r.desc)+'"></a></figure>'
  : '<figure class="resultCard"><a id="localizedCardLink" href="'+asset(id,true)+'" target="_blank" rel="noopener"><img id="localizedCardImage" src="'+asset(id,true)+'" alt="'+esc(r.phase+' '+r.author+' '+r.desc)+'"></a></figure>';
 screen.innerHTML=(shared?'<div class="sharedBadge">'+t(19)+'</div>':'')+cardMarkup+
 '<div class="resultBtns"><button class="xshare" onclick="shareX(\''+id+'\')">'+t(14)+'</button><button class="linkcopy" onclick="saveResultImage(\''+id+'\')">'+t(15)+'</button><button class="linkcopy" onclick="copyText(sharePageUrl(\''+id+'\'))">'+t(16)+'</button><button class="primary" onclick="copyText(resultText(\''+id+'\'))">'+t(17)+'</button><button class="secondary" onclick="startGame()">'+t(18)+'</button><button class="secondary" onclick="startScreen()">'+t(10)+'</button></div>'+
 (shared?'':'<details class="route"><summary>'+t(11)+'</summary>'+routeHTML()+'</details>')+
 '<div class="allTypes"><h3>ALL 8 TYPES</h3>'+castHTML('typeGrid')+'</div>'+
 '<div class="feedbackBox"><button class="feedbackPost" onclick="postFeedback(\''+id+'\')">'+{ja:'Xでご意見・改善提案',ko:'X에 의견·개선 제안 쓰기',en:'Share feedback on X'}[lang]+'</button></div>';
 if(lang!=='ja')localizedCardDataURL(id).then(url=>{const image=document.getElementById('localizedCardImage'),link=document.getElementById('localizedCardLink');if(image)image.src=url;if(link)link.href=url;}).catch(()=>{});
}
function resultText(id){const r=resultFor(id);return `WHO'S YOUR STORY?\n${r.phase} ${r.detailTag}\n${r.author}\n${r.desc}`;}

function shareX(id){window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent(`WHO'S YOUR STORY?\n${resultFor(id).phase} ${resultFor(id).detailTag}\n${resultFor(id).author}\n#WhosYourStory`)+'&url='+encodeURIComponent(sharePageUrl(id)),'_blank','noopener,noreferrer');}
async function copyText(text){try{await navigator.clipboard.writeText(text);alert(t(20));}catch(e){prompt(t(21),text);}}
async function saveResultImage(id){
 try{
  if(lang==='ja'){
   const response=await fetch(asset(id));if(!response.ok)throw Error();
   const url=URL.createObjectURL(await response.blob()),link=document.createElement('a');
   link.href=url;link.download='whos-your-story-'+gender+'-'+id+'.jpg';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);return;
  }
  const cardURL=await localizedCardDataURL(id),image=new Image();image.src=cardURL;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1024;
  canvas.getContext('2d').drawImage(image,0,0,1536,1024);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error()),'image/png'));
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='whos-your-story-'+gender+'-'+lang+'-'+id+'.png';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
 }catch(e){alert(t(22));}
}
fetch(new URL('game-data.json',base)).then(r=>{if(!r.ok)throw Error();return r.json();}).then(d=>{data=d;({nodes,results,reach}=data[lang]);const id=params.get('result');if(ids.includes(id))renderResult(id,true);else startScreen();}).catch(()=>{screen.textContent={ja:'読み込めませんでした。再読み込みしてください。',ko:'불러오지 못했습니다. 새로고침해 주세요.',en:'Could not load the quiz. Please reload.'}[lang];});

function postFeedback(id){const text={ja:'ご意見・改善提案',ko:'의견·개선 제안',en:'Feedback and suggestions'}[lang];window.open('https://twitter.com/intent/tweet?text='+encodeURIComponent("WHO'S YOUR STORY? "+text+'\n'+resultFor(id).author+'\n#WhosYourStoryFeedback')+'&url='+encodeURIComponent(languageLink(lang)),'_blank','noopener,noreferrer');}
