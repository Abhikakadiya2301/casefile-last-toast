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
      'Victim examination': 'assets/Adrian Blackwood.png',
      'Whiskey glass': null,
      'Dinner photograph': null,
      "Daniel's call log": 'assets/Cinematic Call Log Investigation.png',
      'Torn envelope to Victor': null,
      'East corridor access log': null,
      'Private financial audit': null,
      "Dr. Sen's medical bag": null,
      'Security override record': 'assets/Security Office.png',
      'Toxicology report': 'assets/scenes/Mysterious Study Crime Scene Investigation.png',
      'Latent print report': 'assets/scenes/Mysterious Study Crime Scene Investigation.png',
      "Adrian's final message": 'assets/scenes/Mysterious Study Crime Scene Investigation.png'
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

  function loadWhiskeyEvidence() {
    if (window.CASEFILE_IMAGES?.whiskey) {
      assets.evidence['Whiskey glass'] = window.CASEFILE_IMAGES.whiskey;
      enhanceAll();
      return;
    }
    if (document.querySelector('script[data-casefile-whiskey]')) return;
    const script = document.createElement('script');
    script.src = 'assets/evidence-whiskey.js';
    script.dataset.casefileWhiskey = 'true';
    script.onload = () => {
      if (window.CASEFILE_IMAGES?.whiskey) {
        assets.evidence['Whiskey glass'] = window.CASEFILE_IMAGES.whiskey;
        enhanceAll();
      }
    };
    document.head.append(script);
  }

  function cleanCrimeSceneUI(scene) {
    scene.querySelectorAll('.hotspot,.desk-shape,.lamp-shape,.body-outline').forEach(el => el.remove());
    const layout = scene.closest('.scene-layout');
    const sidebar = layout?.querySelector('.scene-sidebar');
    if (sidebar) sidebar.remove();
    if (layout) layout.classList.add('scene-image-only');
  }

  function enhanceCrimeScene() {
    const scene = document.querySelector('.study-room');
    if (!scene) return;
    cleanCrimeSceneUI(scene);
    if (scene.classList.contains('crime-art-loaded')) return;
    const image = makeImage(assets.crimeScene, 'Blackwood study crime scene', 'crime-scene-art');
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
      const title = card.querySelector('h4')?.textContent.trim();
      const src = assets.evidence[title];
      if (!src) {
        card.querySelector('.evidence-thumb-art')?.remove();
        return;
      }
      const current = card.querySelector('.evidence-thumb-art');
      if (current) {
        if (current.src !== src && !current.src.endsWith(encodeURI(src))) current.src = src;
        current.alt = title || 'Case evidence';
        return;
      }
      const image = makeImage(src, title || 'Case evidence', 'evidence-thumb-art');
      if (image) card.prepend(image);
    });
  }

  function enhanceModal() {
    const modal = document.querySelector('#modalContent');
    if (!modal) return;
    const text = modal.textContent || '';
    const evidenceTitle = Object.keys(assets.evidence).find(title => text.includes(title));
    if (evidenceTitle) {
      const src = assets.evidence[evidenceTitle];
      const existing = modal.querySelector('.modal-art');
      if (!src) {
        if (existing) existing.remove();
        return;
      }
      if (existing) {
        if (existing.src !== src && !existing.src.endsWith(encodeURI(src))) existing.src = src;
        existing.alt = evidenceTitle;
        return;
      }
      if (modal.querySelector('.modal-suspect-art')) return;
      const image = makeImage(src, evidenceTitle, 'modal-art');
      if (image) modal.prepend(image);
      return;
    }
    if (modal.querySelector('.modal-art,.modal-suspect-art')) return;
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
    loadWhiskeyEvidence();
    enhanceAll();
    const observer = new MutationObserver(() => requestAnimationFrame(enhanceAll));
    observer.observe(document.body, { subtree: true, childList: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
