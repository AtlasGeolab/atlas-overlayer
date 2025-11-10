<script>
// ---------- Navbar + helpers ----------
function nav(active = "") {
  return `
  <header class="site-header">
    <div class="container nav">
      <a class="brand" href="/atlas-overlayer/">Atlas Geolab</a>
      <nav>
        <a href="/atlas-overlayer/" ${active==="tool"?"class='active'":""}>Tool</a>
        <a href="/atlas-overlayer/examples.html" ${active==="examples"?"class='active'":""}>Examples</a>
        <a href="/atlas-overlayer/how-it-works.html" ${active==="how"?"class='active'":""}>How it works</a>
        <a href="/atlas-overlayer/offer.html" ${active==="offer"?"class='active'":""}>Offer</a>
      </nav>
    </div>
  </header>`;
}

function mountNav(active) {
  const slot = document.getElementById('nav-slot');
  if (slot) slot.innerHTML = nav(active);
}

function footer() {
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer">
    <div class="container">
      <p>© ${year} Atlas Geolab. Geospatial tools & prototypes with satellite data + AI.</p>
      <p><a href="https://github.com/AtlasGeolab/atlas-overlayer">GitHub</a></p>
    </div>
  </footer>`;
}

function mountFooter() {
  const slot = document.getElementById('footer-slot');
  if (slot) slot.innerHTML = footer();
}
</script>
