const dayIndex = Math.floor(Date.now()/86400000);

async function loadJSON(file){const r=await fetch(file); if(!r.ok) throw new Error(file); return r.json();}

async function loadDaily(){
  try{
    const [mantras, knowledge, quizzes, festivals, articles] = await Promise.all([
      loadJSON('mantras.json'), loadJSON('dharma-gyan.json'),
      loadJSON('quiz.json'), loadJSON('festivals.json'), loadJSON('articles.json')
    ]);
    const m=mantras[dayIndex%mantras.length], k=knowledge[dayIndex%knowledge.length], q=quizzes[dayIndex%quizzes.length];
    document.querySelector('#mantraText').textContent=m.mantra;
    document.querySelector('#mantraMeaning').textContent=m.meaning;
    document.querySelector('#knowledgeText').textContent=k.text;

    const today=new Date().toISOString().slice(0,10);
    const upcoming=festivals.filter(x=>x.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0];
    document.querySelector('#festivalText').textContent=upcoming ? `${upcoming.name} — ${upcoming.date}` : 'आने वाले त्योहार जल्द जोड़े जाएंगे।';

    document.querySelector('#quizQuestion').textContent=q.question;
    const box=document.querySelector('#quizOptions');
    q.options.forEach((option,i)=>{const b=document.createElement('button');b.className='quiz-option';b.textContent=option;b.onclick=()=>{document.querySelector('#quizResult').textContent=i===q.answer?'✅ सही उत्तर!':'❌ सही उत्तर: '+q.options[q.answer];};box.appendChild(b);});

    const list=document.querySelector('#latestArticles');
    articles.slice(0,6).forEach(a=>{list.insertAdjacentHTML('beforeend',`<article class="article"><small>${a.date}</small><h3>${a.title}</h3><p>${a.excerpt}</p><a href="${a.url}">पढ़ें →</a></article>`);});
  }catch(e){console.error(e);}
}
loadDaily();

document.querySelector('.menu-btn').addEventListener('click',()=>document.querySelector('.nav').classList.toggle('open'));
