(() => {
  const assets = {
    victim: 'assets/adrian-blackwood.webp',
    crimeScene: 'assets/scenes/Mysterious Study Crime Scene Investigation.png',
    suspects: {
      'Eleanor Blackwood': 'assets/eleanor-blackwood.webp',
      'Daniel Blackwood': 'assets/daniel-blackwood.webp',
      'Dr. Maya Sen': 'assets/maya-sen.webp',
      'Victor Hale': 'assets/victor-hale.webp',
      'Thomas Reed': 'assets/thomas-reed.webp'
    },
    evidence: {
      'Victim examination': 'assets/adrian-blackwood.webp',
      'Whiskey glass': 'assets/evidence-whiskey.webp',
      'Stopped pocket watch': 'assets/evidence-watch.webp',
      'Torn envelope to Victor': 'assets/evidence-letter.webp',
      'Private financial audit': 'assets/evidence-letter.webp',
      "Adrian's final message": 'assets/evidence-letter.webp',
      'Toxicology report': 'assets/evidence-whiskey.webp',
      'Latent print report': 'assets/evidence-whiskey.webp'
    }
  };

  const makeImage = (src, alt, className = '') => {
    if (!src) return null;
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.onerror = () => image.remove();
    if (className) image.className = className;
    return image;
  };

  function enhanceCrimeScene() {
    const scene = document.querySelector('.study-room');
    if (!scene || scene.classList.contains('crime-art-loaded')) return;
    const image = makeImage(assets.crimeScene, 'Blackwood study crime scene with evidence markers 1, 2 and 3', 'crime-scene-art');
    if (!image) return;
    scene.prepend(image);
    scene.classList.add('crime-art-loaded');
  }

  function enhanceVictim() {
    const portrait = document.querySelector('.victim-portrait');
    if (!portrait || portrait.classList.contains('art-loaded')) return;
    const image = makeImage(assets.victim, 'Adrian Blackwood');
    if (!image) return;
    portrait.textContent = '';
    portrait.append(image);
    portrait.classList.add('art-loaded');
  }

  function enhanceSuspects() {
    document.querySelectorAll('.suspect-card').forEach(card => {
      const name = card.querySelector('h3')?.textContent.trim();
      const portrait = card.querySelector('.suspect-portrait');
      if (!name || !portrait || portrait.classList.contains('art-loaded')) return;
      const image = makeImage(assets.suspects[name], name);
      if (!image) return;
      portrait.textContent = '';
      portrait.append(image);
      portrait.classList.add('art-loaded');
    });
  }

  function enhanceEvidence() {
    document.querySelectorAll('.evidence-card').forEach(card => {
      if (card.querySelector('.evidence-thumb-art')) return;
      const title = card.querySelector('h4')?.textContent.trim();
      const image = makeImage(assets.evidence[title], title || 'Case evidence', 'evidence-thumb-art');
      if (image) card.prepend(image);
    });
  }

  function enhanceReports() {
    const reportImages = ['assets/evidence-whiskey.webp', 'assets/evidence-letter.webp', 'assets/evidence-whiskey.webp'];
    document.querySelectorAll('.report-card').forEach((card, index) => {
      if (card.querySelector('.report-photo-art')) return;
      const heading = card.querySelector('h3');
      const image = makeImage(reportImages[index % reportImages.length], heading?.textContent || 'Case report', 'report-photo-art');
      if (image && heading) heading.insertAdjacentElement('afterend', image);
    });
  }

  function enhanceModal() {
    const modal = document.querySelector('#modalContent');
    if (!modal || modal.querySelector('.modal-art,.modal-suspect-art')) return;
    const text = modal.textContent || '';
    const evidenceTitle = Object.keys(assets.evidence).find(title => text.includes(title));
    if (evidenceTitle) {
      const image = makeImage(assets.evidence[evidenceTitle], evidenceTitle, 'modal-art');
      if (image) modal.prepend(image);
      return;
    }
    const suspectName = Object.keys(assets.suspects).find(name => text.includes(name));
    if (suspectName) {
      const image = makeImage(assets.suspects[suspectName], suspectName, 'modal-suspect-art');
      if (image) modal.prepend(image);
    }
  }

  function enhanceAll() {
    enhanceCrimeScene();
    enhanceVictim();
    enhanceSuspects();
    enhanceEvidence();
    enhanceReports();
    enhanceModal();
  }

  function boot() {
    enhanceAll();
    const observer = new MutationObserver(() => requestAnimationFrame(enhanceAll));
    observer.observe(document.body, { subtree: true, childList: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
