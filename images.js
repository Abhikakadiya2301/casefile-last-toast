(() => {
  const A='assets/';
  const suspects={
    'Eleanor Blackwood':'eleanor-blackwood.webp',
    'Daniel Blackwood':'daniel-blackwood.webp',
    'Dr. Maya Sen':'maya-sen.webp',
    'Victor Hale':'victor-hale.webp',
    'Thomas Reed':'thomas-reed.webp'
  };
  const evidence={
    'Victim examination':'adrian-blackwood.webp',
    'Whiskey glass':'evidence-whiskey.webp',
    'Stopped pocket watch':'evidence-watch.webp',
    'Torn envelope to Victor':'evidence-letter.webp'
  };
  const reportImgs=['evidence-whiskey.webp','evidence-letter.webp','evidence-whiskey.webp'];
  function img(src,alt,cls=''){ const el=document.createElement('img'); el.src=A+src; el.alt=alt; el.loading='lazy'; el.decoding='async'; if(cls) el.className=cls; return el; }
  function enhanceVictim(){ const el=document.querySelector('.victim-portrait'); if(el && !el.classList.contains('art-loaded')){ el.textContent=''; el.append(img('adrian-blackwood.webp','Adrian Blackwood')); el.classList.add('art-loaded'); } }
  function enhanceSuspects(){ document.querySelectorAll('.suspect-card').forEach(card=>{ const name=card.querySelector('h3')?.textContent.trim(); const portrait=card.querySelector('.suspect-portrait'); if(name && suspects[name] && portrait && !portrait.classList.contains('art-loaded')){ portrait.textContent=''; portrait.append(img(suspects[name],name)); portrait.classList.add('art-loaded'); } }); }
  function enhanceEvidence(){ document.querySelectorAll('.evidence-card').forEach(card=>{ const title=card.querySelector('h4')?.textContent.trim(); if(title && evidence[title] && !card.querySelector('.evidence-thumb-art')) card.prepend(img(evidence[title],title,'evidence-thumb-art')); }); }
  function enhanceReports(){ document.querySelectorAll('.report-card').forEach((card,i)=>{ if(!card.querySelector('.report-photo-art')){ const title=card.querySelector('h3')?.textContent||'Case report'; card.querySelector('h3')?.insertAdjacentElement('afterend',img(reportImgs[i%reportImgs.length],title,'report-photo-art')); }}); }
  function enhanceModal(){ const box=document.querySelector('#modalContent'); if(!box || box.querySelector('.modal-art,.modal-suspect-art')) return; const text=box.textContent||''; const e=Object.keys(evidence).find(k=>text.includes(k)); if(e){ box.prepend(img(evidence[e],e,'modal-art')); return; } const s=Object.keys(suspects).find(k=>text.includes(k)); if(s) box.prepend(img(suspects[s],s,'modal-suspect-art')); }
  function run(){ enhanceVictim(); enhanceSuspects(); enhanceEvidence(); enhanceReports(); enhanceModal(); }
  const obs=new MutationObserver(()=>requestAnimationFrame(run));
  document.addEventListener('DOMContentLoaded',()=>{ run(); obs.observe(document.body,{subtree:true,childList:true}); });
})();
