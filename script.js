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

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    const inputEl = document.getElementById('locationInput');
    if (initialQuery && inputEl) inputEl.value = initialQuery;

    const filterBtns = document.querySelectorAll('.filterBtn');
    let activeFilter = 'all';
    let lastOpts = null;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const txt = btn.textContent.trim();
        if (txt === 'Open Now') activeFilter = 'open';
        else if (txt === 'Partnered') activeFilter = 'partnered';
        else activeFilter = 'all';
        if (lastOpts) fetchStores(lastOpts);
      });
    });

    locForm.addEventListener('submit', e => {
      e.preventDefault();
      const loc = document.getElementById('locationInput').value.trim();
      if (loc) fetchStores({near: loc});
    });

    const geoMsg = document.getElementById('geoMessage');
    if (initialQuery) {
      fetchStores({ near: initialQuery });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const c = pos.coords;
        fetchStores({ ll: `${c.latitude},${c.longitude}` });
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
      lastOpts = opts;
      results.textContent = 'Loading...';
      try {
        const url = new URL('https://api.foursquare.com/v3/places/search');
        url.searchParams.set('query', 'smoke shop');
        url.searchParams.set('limit', '20');
        if (activeFilter === 'open') url.searchParams.set('open_now', 'true');
        if (opts.near) url.searchParams.set('near', opts.near);
        if (opts.ll) {
          url.searchParams.set('ll', opts.ll);
          url.searchParams.set('radius', '10000');
        }

        const resp = await fetch(url.toString(), {
          headers: { 'Accept': 'application/json', 'Authorization': FSQ_API_KEY }
        });
        const data = await resp.json();
        let stores = data.results || [];
        if (activeFilter === 'partnered') {
          stores = stores.filter(s => PARTNERED_IDS.includes(s.fsq_id));
        }
        showResults(stores);
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

  // ----- Simple Login Handling -----
  // Login credentials are now verified by the Flask backend in `app.py`.
  // The results of a successful login are still stored in localStorage so
  // the existing portal checks continue to work.
  const brandForm = document.getElementById('brandLoginForm');
  if (brandForm) {
    brandForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('brandEmail').value.trim();
      const pass = document.getElementById('brandPassword').value;
      try {
        const resp = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });
        if (resp.ok) {
          localStorage.setItem('brandLoggedIn','true');
          window.location.href = 'brand-portal.html';
        } else {
          const data = await resp.json().catch(() => ({}));
          alert(data.error || 'Login failed');
        }
      } catch (err) {
        alert('Login failed');
      }
      brandForm.reset();
    });
  }

  const retailForm = document.getElementById('retailLoginForm');
  if (retailForm) {
    retailForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('retailEmail').value.trim();
      const pass = document.getElementById('retailPassword').value;
      try {
        const resp = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });
        if (resp.ok) {
          localStorage.setItem('retailLoggedIn','true');
          window.location.href = 'retail-portal.html';
        } else {
          const data = await resp.json().catch(() => ({}));
          alert(data.error || 'Login failed');
        }
      } catch (err) {
        alert('Login failed');
      }
      retailForm.reset();
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const status = document.getElementById('contactStatus');
      if (status) status.textContent = 'Thank you for reaching out. We will contact you soon.';
      contactForm.reset();
    });
  }

  // Utility functions for adding accounts manually via browser console
  window.createBrandAccount = (email, password) => {
    const accounts = JSON.parse(localStorage.getItem('brandAccounts') || '{}');
    accounts[email] = { password };
    localStorage.setItem('brandAccounts', JSON.stringify(accounts));
  };

  window.createRetailAccount = (email, password) => {
    const accounts = JSON.parse(localStorage.getItem('retailAccounts') || '{}');
    accounts[email] = { password };
    localStorage.setItem('retailAccounts', JSON.stringify(accounts));
  };

  // ----- Portal Auth Checks -----
  const brandPortal = document.getElementById('brandPortal');
  if (brandPortal && !localStorage.getItem('brandLoggedIn')) {
    window.location.href = 'brand-login.html';
  }
  const brandLogout = document.getElementById('brandLogout');
  if (brandLogout) {
    brandLogout.addEventListener('click', async () => {
      try { await fetch('/api/logout', { method: 'POST' }); } catch(e) {}
      localStorage.removeItem('brandLoggedIn');
      window.location.href = 'brand-login.html';
    });
  }
  const retailPortal = document.getElementById('retailPortal');
  if (retailPortal && !localStorage.getItem('retailLoggedIn')) {
    window.location.href = 'retail-login.html';
  }
  const retailLogout = document.getElementById('retailLogout');
  if (retailLogout) {
    retailLogout.addEventListener('click', async () => {
      try { await fetch('/api/logout', { method: 'POST' }); } catch(e) {}
      localStorage.removeItem('retailLoggedIn');
      window.location.href = 'retail-login.html';
    });
  }
});
