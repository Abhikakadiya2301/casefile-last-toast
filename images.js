(() => {
  const assetScripts = [
    'assets/adrian-image.js',
    'assets/characters-a.js',
    'assets/daniel-image.js',
    'assets/maya-image.js',
    'assets/victor-image.js',
    'assets/thomas-image.js',
    'assets/evidence-whiskey.js',
    'assets/evidence-watch.js',
    'assets/evidence-letter.js'
  ];
  const art = () => window.CASEFILE_IMAGES || {};
  const suspects = {
    'Eleanor Blackwood':'eleanor',
    'Daniel Blackwood':'daniel',
    'Dr. Maya Sen':'maya',
    'Victor Hale':'victor',
    'Thomas Reed':'thomas'
  };
  const evidence = {
    'Victim examination':'adrian',
    'Whiskey glass':'whiskey',
    'Stopped pocket watch':'watch',
    'Torn envelope to Victor':'letter',
    'Private financial audit':'letter',
    "Adrian's final message":'letter',
    'Toxicology report':'whiskey',
    'Latent print report':'whiskey'
  };
  const reportImgs=['whiskey','letter','whiskey'];
  const loadScript = src => new Promise(resolve => {
    if (document.querySelector(`script[data-casefile-art="${src}"]`)) return resolve();
    const s=document.createElement('script');
    s.src=src; s.dataset.casefileArt=src; s.onload=resolve; s.onerror=resolve;
    document.head.appendChild(s);
  });
  function img(key,alt,cls=''){ const src=art()[key]; if(!src) return null; const el=document.createElement('img'); el.src=src; el.alt=alt; el.loading='lazy'; el.decoding='async'; if(cls) el.className=cls; return el; }
  function enhanceVictim(){ const el=document.querySelector('.victim-portrait'); if(el && !el.classList.contains('art-loaded')){ const im=img('adrian','Adrian Blackwood'); if(im){ el.textContent=''; el.append(im); el.classList.add('art-loaded'); } } }
  function enhanceSuspects(){ document.querySelectorAll('.suspect-card').forEach(card=>{ const name=card.querySelector('h3')?.textContent.trim(); const portrait=card.querySelector('.suspect-portrait'); const im=name ? img(suspects[name],name) : null; if(im && portrait && !portrait.classList.contains('art-loaded')){ portrait.textContent=''; portrait.append(im); portrait.classList.add('art-loaded'); } }); }
  function enhanceEvidence(){ document.querySelectorAll('.evidence-card').forEach(card=>{ const title=card.querySelector('h4')?.textContent.trim(); const im=title ? img(evidence[title],title,'evidence-thumb-art') : null; if(im && !card.querySelector('.evidence-thumb-art')) card.prepend(im); }); }
  function enhanceReports(){ document.querySelectorAll('.report-card').forEach((card,i)=>{ if(card.querySelector('.report-photo-art')) return; const title=card.querySelector('h3')?.textContent||'Case report'; const im=img(reportImgs[i%reportImgs.length],title,'report-photo-art'); if(im) card.querySelector('h3')?.insertAdjacentElement('afterend',im); }); }
  function enhanceModal(){ const box=document.querySelector('#modalContent'); if(!box || box.querySelector('.modal-art,.modal-suspect-art')) return; const text=box.textContent||''; const e=Object.keys(evidence).find(k=>text.includes(k)); if(e){ const im=img(evidence[e],e,'modal-art'); if(im) box.prepend(im); return; } const s=Object.keys(suspects).find(k=>text.includes(k)); if(s){ const im=img(suspects[s],s,'modal-suspect-art'); if(im) box.prepend(im); } }
  function run(){ enhanceVictim(); enhanceSuspects(); enhanceEvidence(); enhanceReports(); enhanceModal(); }
  async function boot(){ await Promise.all(assetScripts.map(loadScript)); run(); const obs=new MutationObserver(()=>requestAnimationFrame(run)); obs.observe(document.body,{subtree:true,childList:true}); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
