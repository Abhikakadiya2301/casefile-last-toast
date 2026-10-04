(() => {
  const assets = {
    victim: 'assets/Adrian Blackwood.png',
    crimeScene: 'assets/scenes/Mysterious Study Crime Scene Investigation.png',
    suspects: {
      'Eleanor Blackwood': 'assets/Eleanor Blackwood.png',
      'Daniel Blackwood': 'assets/Daniel Blackwood.png',
      'Dr. Maya Sen': 'assets/Dr. Maya Sen.png',
      'Victor Hale': 'assets/Victor Hale.png',
      'Thomas Reed': 'assets/Thomas Reed.png'
    },
    evidence: {
      'Victim examination': 'assets/Adrian Blackwood.png'
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
