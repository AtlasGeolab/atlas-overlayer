// Basic map
const map = L.map('map', { zoomControl: true }).setView([20, 0], 2);

// Base layers
const basemaps = {
  osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; OpenStreetMap'
  }),
  esri: L.esri.basemapLayer('Imagery')
};
let currentBase = basemaps.osm.addTo(map);

document.getElementById('basemap').addEventListener('change', (e) => {
  map.removeLayer(currentBase);
  currentBase = basemaps[e.target.value];
  currentBase.addTo(map);
});

// Overlay group & state
const overlayGroup = L.layerGroup().addTo(map);
let overlayOpacity = 0.8;

const setOpacity = (opacity) => {
  overlayOpacity = Number(opacity);
  overlayGroup.eachLayer(l => {
    if (l.setOpacity) l.setOpacity(overlayOpacity);
    if (l.setStyle) l.setStyle({ fillOpacity: overlayOpacity, opacity: overlayOpacity });
  });
};

document.getElementById('opacity').addEventListener('input', e => setOpacity(e.target.value));

// File upload (GeoJSON or CSV)
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const text = await file.text();

  if (file.name.endsWith('.csv')) {
    const parsed = Papa.parse(text, { header: true, dynamicTyping: true });
    // Expect columns lat, lon (or latitude, longitude)
    const latKey = ['lat','latitude','y','Lat'].find(k => k in parsed.data[0]) || 'lat';
    const lonKey = ['lon','lng','longitude','x','Lon','Lng'].find(k => k in parsed.data[0]) || 'lon';

    const geojson = {
      type: 'FeatureCollection',
      features: parsed.data.filter(Boolean).map(row => ({
        type: 'Feature',
        properties: row,
        geometry: {
          type: 'Point',
          coordinates: [Number(row[lonKey]), Number(row[latKey])]
        }
      }))
    };
    addGeoJSON(geojson);
  } else {
    const geojson = JSON.parse(text);
    addGeoJSON(geojson);
  }
});

function addGeoJSON(geojson) {
  const layer = L.geoJSON(geojson, {
    pointToLayer: (f, latlng) => L.circleMarker(latlng, {
      radius: 5, color: '#4fc3f7', weight: 1, fillColor: '#4fc3f7', fillOpacity: overlayOpacity
    }),
    style: () => ({ color: '#ffe08a', weight: 2, fillOpacity: overlayOpacity, opacity: overlayOpacity }),
    onEachFeature: (feature, layer) => {
      const props = feature.properties || {};
      const html = `<pre style="margin:0; font-size:12px">${escapeHtml(JSON.stringify(props, null, 2))}</pre>`;
      layer.bindPopup(html);
    }
  });
  overlayGroup.addLayer(layer);
  try { map.fitBounds(layer.getBounds(), { maxZoom: 12 }); } catch {}
}

function escapeHtml(s){ return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// Optional: add raster/tiles by URL
document.getElementById('addRasterBtn').addEventListener('click', () => {
  const url = document.getElementById('rasterUrl').value.trim();
  if (!url) return;

  // Heuristic: treat as WMS if it contains "SERVICE=WMS"
  if (/service=wms/i.test(url)) {
    const wms = L.tileLayer.wms(url, { format: 'image/png', transparent: true, opacity: overlayOpacity });
    overlayGroup.addLayer(wms);
  } else {
    const tiles = L.tileLayer(url, { opacity: overlayOpacity, maxZoom: 22 });
    overlayGroup.addLayer(tiles);
  }
});
