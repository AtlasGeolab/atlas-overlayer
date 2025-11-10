<script>
// Each example = title, description, basemap id, overlays (tile or geojson)
window.ATLAS_EXAMPLES = [
  {
    id: "flood-risk",
    title: "Flood risk demo",
    desc: "Simple polygons to illustrate at-risk zones and rivers.",
    basemap: "esri-sat",
    overlays: [
      { type:"geojson", url:"data/flood_zones.geojson", style:{color:"#1976d2", fillColor:"#42a5f5", fillOpacity:0.25} },
      { type:"geojson", url:"data/rivers.geojson", style:{color:"#0d47a1", weight:2} }
    ]
  },
  {
    id: "urban-heat",
    title: "Urban heat islands",
    desc: "Sample ‘hotspot’ points and an isochrone-like polygon.",
    basemap: "carto",
    overlays: [
      { type:"geojson", url:"data/urban_heat.geojson", style:{color:"#e65100", fillColor:"#ff8f00", fillOpacity:0.3} }
    ]
  },
  {
    id: "wind-siting",
    title: "Wind farm siting (toy)",
    desc: "Candidate areas + exclusion buffers (toy data).",
    basemap: "osm",
    overlays: [
      { type:"geojson", url:"data/windfarms.geojson", style:{color:"#2e7d32", fillColor:"#66bb6a", fillOpacity:0.25} }
    ]
  },
  {
    id: "shipping-lanes",
    title: "Shipping lanes (toy)",
    desc: "Linework to illustrate corridors + ports.",
    basemap: "esri-sat",
    overlays: [
      { type:"geojson", url:"data/ship_routes.geojson", style:{color:"#26c6da", weight:3} },
      { type:"geojson", url:"data/ports.geojson", style:{color:"#004d40", fillColor:"#26a69a", fillOpacity:0.7} }
    ]
  },
  {
    id: "landslide-risk",
    title: "Landslide susceptibility",
    desc: "Hilly polygons + points (toy).",
    basemap: "opentopo",
    overlays: [
      { type:"geojson", url:"data/landslide_risk.geojson", style:{color:"#6a1b9a", fillColor:"#ab47bc", fillOpacity:0.25} }
    ]
  }
];

// Basemap registry for Leaflet
window.ATLAS_BASEMAPS = {
  "osm": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OSM' }),
  "esri-sat": L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: '&copy; Esri' }),
  "carto": L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20, attribution: '&copy; CARTO' }),
  "opentopo": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '&copy; OpenTopoMap' })
};

// Load a preset into a Leaflet map
async function loadPreset(map, presetId) {
  const cfg = ATLAS_EXAMPLES.find(e => e.id === presetId) || ATLAS_EXAMPLES[0];
  if (!cfg) return;
  // Clear layers (except the basemap)
  map.eachLayer(l => map.removeLayer(l));
  // Basemap
  (ATLAS_BASEMAPS[cfg.basemap] || ATLAS_BASEMAPS["osm"]).addTo(map);

  // Bounds accumulator
  const bounds = [];

  for (const layer of cfg.overlays) {
    if (layer.type === "geojson") {
      const res = await fetch(layer.url);
      const gj = await res.json();
      const l = L.geoJSON(gj, { style: layer.style || {} }).addTo(map);
      try { bounds.push(l.getBounds()); } catch {}
    } else if (layer.type === "tiles") {
      L.tileLayer(layer.url, layer.options || {}).addTo(map);
    }
  }

  // Fit
  if (bounds.length) {
    const union = bounds.reduce((acc,b) => acc? acc.extend(b): b, null);
    if (union) map.fitBounds(union.pad(0.2));
  }
}
</script>
