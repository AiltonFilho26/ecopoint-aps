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

  const wasteTypeMap = {
    "plastic": "cl-id-plastic",
    "glass": "cl-id-glass",
    "paper": "cl-id-paper",
    "metal": "cl-id-metal",
    "electronics": "cl-id-electronics",
    "batteries": "cl-id-batteries",
  };

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

  /**
   * Renderiza os resultados da API na lista
   * @param {Array} points - A lista de pontos de coleta vinda da API
   */
  function renderResults(points) {
    if (!resultsList) return;
    resultsList.innerHTML = '';
    
    if (points.length === 0) {
      resultsList.innerHTML = '<p>Nenhum ponto de coleta encontrado para esta busca.</p>';
      return;
    }

    points.forEach((point) => {
      // TRADUÇÃO DOS DADOS DA API para o formato do frontend:
      
      // A API retorna `distanceInKm`
      const distance = `${point.distanceInKm.toFixed(1)} km`; 
      
      // A API retorna `wasteTypes: [{ wasteType: { name: 'plastic' } }]`
      const acceptedTypes = point.wasteTypes.map(wt => wt.wasteType.name);

      const card = document.createElement('article');
      card.className = 'result-card';
      card.innerHTML = `
        <h3 class-="result-title">${point.name}</h3>
        <div class="result-row"><i data-lucide="map-pin"></i><span>${point.address}</span></div>
        <div class="row" style="justify-content: space-between; align-items: center;">
          <span class="result-distance">Aprox. ${distance}</span>
          <div class="result-badges">
            ${acceptedTypes
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
  searchBtn?.addEventListener('click', async () => {
    const location = locationInput.value;
    const hasLocation = location.trim().length > 0;
    
    if (!selectedWaste || !hasLocation) {
        alert("Por favor, selecione um tipo de resíduo e informe sua localização.");
        return;
    }
    
    // 1. Traduzir o NOME do resíduo (ex: "plastic") para o ID
    const typeId = wasteTypeMap[selectedWaste];
    if (!typeId) {
        console.error(`ID não encontrado para o tipo: ${selectedWaste}`);
        return;
    }
    
    resultsSection?.removeAttribute('hidden');
    resultsList.innerHTML = '<p>Buscando...</p>';
    
    // 2. SIMULAÇÃO DA API (Aqui está o truque)
    // Quando o Prisma funcionar, você vai apagar o "mockApiResponse"
    // e descomentar o bloco "try/catch" abaixo.

    const mockApiResponse = [
      {
        id: "mock-1",
        name: "EcoPonto (Simulado)",
        address: "Av. Anhanguera, 123 - Centro, Goiânia - GO",
        latitude: -16.67,
        longitude: -49.25,
        distanceInKm: 1.5,
        wasteTypes: [
          { wasteType: { name: "plastic" } },
          { wasteType: { name: "paper" } }
        ]
      },
      {
        id: "mock-2",
        name: "Recicla Goiás (Simulado)",
        address: "Rua 84, 291 - Setor Sul, Goiânia - GO",
        latitude: -16.69,
        longitude: -49.26,
        distanceInKm: 3.2,
        wasteTypes: [
          { wasteType: { name: selectedWaste } } // Sempre inclui o que o usuário buscou
        ]
      }
    ];

    // Filtra a simulação para incluir apenas o tipo selecionado
    const filteredPoints = mockApiResponse.filter(point => 
      point.wasteTypes.some(wt => wt.wasteType.name === selectedWaste)
    );

    // 3. Renderiza os resultados REAIS (da simulação)
    renderResults(filteredPoints);
    resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });


    /*
    // ==========================================================
    // QUANDO O PRISMA FUNCIONAR, APAGUE O CÓDIGO DE SIMULAÇÃO ACIMA
    // E DESCOMENTE ESTE BLOCO ABAIXO
    // ==========================================================

    // 2. Montar a URL da API
    const params = new URLSearchParams();
    params.append('typeIds', typeId);

    if (location.includes(',')) {
      const [lat, lon] = location.split(',').map(s => s.trim());
      params.append('lat', lat);
      params.append('lon', lon);
    } else {
      params.append('address', location);
    }
    const url = `http://localhost:8000/api/points/nearest?${params.toString()}`;

    // 3. Chamar a API
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar pontos.');
      }
      
      const points = await response.json();

      // 4. Renderizar os resultados REAIS
      renderResults(points);
      resultsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    } catch (error) {
      console.error('Erro na busca:', error);
      resultsList.innerHTML = `<p>Erro ao buscar: ${error.message}</p>`;
    }
    
    */

  });
});