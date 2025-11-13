document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const wasteGrid = document.getElementById('waste-grid');
  const locationInput = document.getElementById('location-input');
  const useLocationBtn = document.getElementById('use-location');
  const searchBtn = document.getElementById('search-btn');
  const resultsSection = document.getElementById('results');
  const resultsList = document.getElementById('results-list');

  let selectedWaste = '';

  // Select waste type
  wasteGrid?.addEventListener('click', (e) => {
    const btn = (e.target instanceof Element) ? e.target.closest('.waste-card') : null;
    if (!btn) return;
    const type = btn.getAttribute('data-type') || '';
    if (!type) return;

    selectedWaste = type;
    document.querySelectorAll('.waste-card').forEach((el) => el.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
  });

  // Use geolocation
  useLocationBtn?.addEventListener('click', () => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const value = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        if (locationInput instanceof HTMLInputElement) {
          locationInput.value = value;
        }
      },
      (err) => {
        console.error('Erro ao obter localização:', err);
      }
    );
  });

  const mockResults = [
    {
      id: '1',
      name: 'Cooperativa Goiás Verde',
      address: 'Rua das Flores, 123 - Setor Central, Goiânia - GO',
      distance: '2.4 km',
      acceptedTypes: ['plastic', 'paper', 'metal'],
    },
    {
      id: '2',
      name: 'EcoPonto Shopping Boulevard',
      address: 'Av. Dep. Jamel Cecílio, 3.300 - Jardim Goiás, Goiânia - GO',
      distance: '3.1 km',
      acceptedTypes: ['electronics', 'batteries'],
    },
    {
      id: '3',
      name: 'Reciclagem Cerrado',
      address: 'Rua 84, 291 - Setor Sul, Goiânia - GO',
      distance: '4.5 km',
      acceptedTypes: ['plastic', 'glass', 'metal'],
    },
    {
      id: '4',
      name: 'Centro de Reciclagem Municipal',
      address: 'Av. Goiás, 1020 - Centro, Goiânia - GO',
      distance: '5.2 km',
      acceptedTypes: ['paper', 'electronics', 'batteries'],
    },
  ];

  const iconMap = {
    plastic: 'recycle',
    glass: 'wine',
    paper: 'file-text',
    metal: 'recycle',
    electronics: 'cpu',
    batteries: 'battery',
  };

  function renderResults() {
    if (!resultsList) return;
    resultsList.innerHTML = '';

    mockResults.forEach((point) => {
      const card = document.createElement('article');
      card.className = 'result-card';
      card.innerHTML = `
        <h3 class="result-title">${point.name}</h3>
        <div class="result-row"><i data-lucide="map-pin"></i><span>${point.address}</span></div>
        <div class="row" style="justify-content: space-between; align-items: center;">
          <span class="result-distance">Aprox. ${point.distance}</span>
          <div class="result-badges">
            ${point.acceptedTypes
              .map((t) => `<span class="badge"><i data-lucide="${iconMap[t]}" aria-label="${t}"></i></span>`) 
              .join('')}
          </div>
        </div>`;
      resultsList.appendChild(card);
    });

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons({ attrs: { width: 18, height: 18 } });
    }
  }

  // Search action
  searchBtn?.addEventListener('click', () => {
    const hasLocation = locationInput instanceof HTMLInputElement && locationInput.value.trim().length > 0;
    if (!selectedWaste || !hasLocation) return;

    resultsSection?.removeAttribute('hidden');
    renderResults();
    resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
