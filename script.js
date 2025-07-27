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
    const FSQ_API_KEY = 'YOUR_FOURSQUARE_API_KEY';
    const PARTNERED_IDS = ['PARTNER_ID_1', 'PARTNER_ID_2'];

    locForm.addEventListener('submit', e => {
      e.preventDefault();
      const loc = document.getElementById('locationInput').value.trim();
      if (loc) fetchStores({near: loc});
    });

    const geoMsg = document.getElementById('geoMessage');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const c = pos.coords;
        fetchStores({ll: `${c.latitude},${c.longitude}`});
      }, () => {
        if (geoMsg) {
          geoMsg.textContent =
            'Unable to access your location. Please search by city or ZIP.';
          geoMsg.removeAttribute('hidden');
        } else {
          results.textContent =
            'Unable to access your location. Please search by city or ZIP.';
        }
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
      stores.forEach(s => {
        const div = document.createElement('div');
        div.className = 'storeItem';

        const nameEl = document.createElement('strong');
        nameEl.textContent = s.name || '';
        div.appendChild(nameEl);

        if (PARTNERED_IDS.includes(s.fsq_id)) {
          div.appendChild(document.createTextNode(' '));
          const badge = document.createElement('span');
          badge.className = 'badge';
          badge.textContent = 'Partner';
          div.appendChild(badge);
        }

        div.appendChild(document.createElement('br'));

        const addr = document.createElement('small');
        addr.textContent = s.location.formatted_address || '';
        div.appendChild(addr);

        results.appendChild(div);
      });
    }
  }
});
