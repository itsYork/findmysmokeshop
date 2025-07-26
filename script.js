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
    const mapEl = document.getElementById('map');
    const map = L.map(mapEl).setView([37.09, -95.71], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    const markers = [];
    const PARTNERED_IDS = ['PARTNER_ID_1', 'PARTNER_ID_2'];

    locForm.addEventListener('submit', e => {
      e.preventDefault();
      const loc = document.getElementById('locationInput').value.trim();
      if (loc) fetchStores({near: loc});
    });

    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      document.getElementById('locationInput').value = q;
      fetchStores({near: q});
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const c = pos.coords;
        fetchStores({ll: `${c.latitude},${c.longitude}`});
      });
    }

    async function fetchStores(opts) {
      results.textContent = 'Loading...';
      try {
        let lat, lon;
        if (opts.near) {
          const gUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(opts.near)}&limit=1`;
          const geo = await fetch(gUrl).then(r => r.json());
          if (!geo.length) { results.textContent = 'Location not found.'; return; }
          lat = geo[0].lat; lon = geo[0].lon;
        }
        if (opts.ll) {
          [lat, lon] = opts.ll.split(',');
        }
        const radius = 10000;
        const query = `[out:json];node["shop"="tobacco"](around:${radius},${lat},${lon});out;`;
        const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
        const data = await fetch(url).then(r => r.json());
        showResults(data.elements || [], lat, lon);
      } catch (err) {
        results.textContent = 'Error loading stores.';
      }
    }

    function showResults(stores, lat, lon) {
      if (!stores.length) { results.textContent = 'No stores found.'; return; }
      results.innerHTML = '';
      markers.forEach(m => m.remove());
      markers.length = 0;
      map.setView([lat, lon], 12);
      stores.forEach(s => {
        const div = document.createElement('div');
        div.className = 'storeItem';
        const badge = PARTNERED_IDS.includes(String(s.id))
          ? '<span class="badge">Partner</span>' : '';
        const addressParts = [s.tags['addr:street'], s.tags['addr:city'], s.tags['addr:state'], s.tags['addr:postcode']].filter(Boolean);
        const addr = addressParts.join(', ');
        const name = s.tags.name || 'Smoke Shop';
        div.innerHTML = `<strong>${name}</strong> ${badge}<br><small>${addr}</small>`;
        results.appendChild(div);
        if (s.lat && s.lon) {
          const marker = L.marker([s.lat, s.lon]).addTo(map);
          marker.bindPopup(div.innerHTML);
          markers.push(marker);
        }
      });
    }
  }
});
