// EcoPoint • Frontend Script (simples)
// Integra com a API Node (Express + Prisma)
// Ajuste a URL se o front estiver em domínio diferente

const API_BASE = window.ECOPOINT_API || (window.location.origin + "/api");

let map, userMarker, pointMarker, lineLayer;
let userPos = { lat: -16.6869, lng: -49.2648 }; // Goiânia por padrão

// Helpers de DOM
const $ = (s) => document.querySelector(s);
const statusEl = $("#status");
const tipoSel  = $("#tipo");

function setStatus(msg) { statusEl.textContent = msg; }

function initMap() {
  map = L.map("map").setView([userPos.lat, userPos.lng], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
  userMarker = L.marker([userPos.lat, userPos.lng]).addTo(map).bindPopup("Sua posição (aprox.)");
}

function drawResult(p) {
  if (!p) return;
  if (pointMarker) map.removeLayer(pointMarker);
  if (lineLayer) map.removeLayer(lineLayer);

  pointMarker = L.marker([p.latitude, p.longitude]).addTo(map)
    .bindPopup(`<b>${p.name || "Ponto de coleta"}</b><br>${p.address || ""}`);

  const latlngs = [ [userPos.lat, userPos.lng], [p.latitude, p.longitude] ];
  lineLayer = L.polyline(latlngs, { weight: 3, opacity: 0.9 }).addTo(map);
  map.fitBounds(L.latLngBounds(latlngs).pad(0.25));
}

async function loadTipos() {
  try {
    setStatus("Carregando tipos de resíduo…");
    const r = await fetch(`${API_BASE}/types`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const tipos = await r.json(); // [{id, name}]
    tipoSel.innerHTML = '<option value="">Selecione o tipo…</option>' +
      tipos.map(t => `<option value="${t.id}">${t.name}</option>`).join("");
    setStatus("Tipos carregados. Permita a localização e busque o ponto.");
  } catch (e) {
    console.error(e);
    tipoSel.innerHTML = '<option value="">(Falha ao carregar tipos)</option>';
    setStatus("Erro ao carregar tipos. Verifique a API.");
  }
}

function pedirGeo() {
  if (!("geolocation" in navigator)) {
    setStatus("Geolocalização não suportada neste navegador.");
    return;
  }
  setStatus("Obtendo sua localização…");
  navigator.geolocation.getCurrentPosition((pos) => {
    userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    userMarker.setLatLng([userPos.lat, userPos.lng]).bindPopup("Sua posição atual").openPopup();
    map.setView([userPos.lat, userPos.lng], 14);
    setStatus("Localização obtida. Agora clique em Buscar ponto.");
  }, (err) => {
    console.warn(err);
    setStatus("Não foi possível obter localização (verifique permissões).");
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
}

async function buscarPonto() {
  const tipoId = tipoSel.value;
  if (!tipoId) { setStatus("Selecione um tipo de resíduo."); return; }
  setStatus("Buscando ponto mais próximo…");
  try {
    const url = new URL(`${API_BASE}/points/nearest`);
    url.searchParams.set("lat", userPos.lat);
    url.searchParams.set("lng", userPos.lng);
    url.searchParams.set("typeIds", String(tipoId)); // API aceita lista separada por vírgula

    const r = await fetch(url);
    if (r.status === 404) { setStatus("Nenhum ponto encontrado para esse tipo."); return; }
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const ponto = await r.json();
    drawResult(ponto);
    setStatus("Ponto encontrado!");
  } catch (e) {
    console.error(e);
    setStatus("Erro ao buscar ponto. Verifique se a API está rodando.");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  initMap();
  loadTipos();
  $("#btnGeo").addEventListener("click", pedirGeo);
  $("#btnBuscar").addEventListener("click", buscarPonto);
});
