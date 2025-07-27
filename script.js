document.addEventListener('DOMContentLoaded', () => {
  const menuBtn  = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  if (menuBtn) menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));

  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  const search  = document.getElementById('brandSearch');
  const select  = document.getElementById('categoryFilter');
  if (search && select) {
    const cards = [...document.querySelectorAll('.brandCard')];
    const filter = () => {
      const t = search.value.toLowerCase();
      const c = select.value;
      cards.forEach(card => {
        const okName = card.querySelector('span').textContent.toLowerCase().includes(t);
        const okCat  = !c || card.dataset.cat === c;
        card.style.display = okName && okCat ? 'flex' : 'none';
      });
    };
    search.addEventListener('input', filter);
    select.addEventListener('change', filter);
  }

  const track = document.querySelector('.carousel__track');
  if (track) {
    const prev = document.querySelector('.carousel__nav--prev');
    const next = document.querySelector('.carousel__nav--next');
    const cardWidth = track.querySelector('.productCard').offsetWidth + 16;
    prev.addEventListener('click', () => track.scrollBy({left:-cardWidth,behavior:'smooth'}));
    next.addEventListener('click', () => track.scrollBy({left: cardWidth,behavior:'smooth'}));
  }

  const locForm = document.getElementById('locatorForm');
  if (locForm) {
    const results = document.getElementById('storeResults');
    const mapEl  = document.getElementById('map');
    let map, markers;
    if (mapEl && window.L) {
      map = L.map(mapEl).setView([37.09, -95.71], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      markers = L.layerGroup().addTo(map);
    }

    const FSQ_API_KEY = 'YOUR_FOURSQUARE_API_KEY';
    const PARTNERED_IDS = ['PARTNER_ID_1', 'PARTNER_ID_2'];

    locForm.addEventListener('submit', e => {
      e.preventDefault();
      const loc = document.getElementById('locationInput').value.trim();
      if (loc) fetchStores({near: loc});
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const c = pos.coords;
        fetchStores({ll: `${c.latitude},${c.longitude}`});
      });
    }

    async function fetchStores(opts) {
      results.textContent = 'Loading...';
      try {
        const url = new URL('https://api.foursquare.com/v3/places/search');
        url.searchParams.set('query', 'smoke shop');
        url.searchParams.set('limit', '20');
        if (opts.near) url.searchParams.set('near', opts.near);
        if (opts.ll) {
          url.searchParams.set('ll', opts.ll);
          url.searchParams.set('radius', '10000');
        }

        const resp = await fetch(url.toString(), {
          headers: { 'Accept': 'application/json', 'Authorization': FSQ_API_KEY }
        });
        const data = await resp.json();
        showResults(data.results || []);
      } catch (err) {
        results.textContent = 'Error loading stores.';
      }
    }

    function showResults(stores) {
      if (!stores.length) { results.textContent = 'No stores found.'; return; }
      results.innerHTML = '';
      if (markers) markers.clearLayers();
      let first;
      stores.forEach(s => {
        const div = document.createElement('div');
        div.className = 'storeItem';
        const badge = PARTNERED_IDS.includes(s.fsq_id)
          ? '<span class="badge">Partner</span>' : '';
        const addr = s.location.formatted_address || '';
        div.innerHTML = `<strong>${s.name}</strong> ${badge}<br><small>${addr}</small>`;
        results.appendChild(div);

        if (markers && s.geocodes && s.geocodes.main) {
          const lat = s.geocodes.main.latitude;
          const lon = s.geocodes.main.longitude;
          const m = L.marker([lat, lon]).addTo(markers).bindPopup(`<strong>${s.name}</strong><br>${addr}`);
          if (!first) first = m;
        }
      });
      if (first && map) {
        map.setView(first.getLatLng(), 12);
        first.openPopup();
      }
    }
  }
});
