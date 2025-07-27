document.addEventListener('DOMContentLoaded', () => {
  const menuBtn  = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  if (menuBtn) menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));

  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  // Seed default accounts for testing if none exist
  const seedDefaults = () => {
    if (!localStorage.getItem('brandAccounts')) {
      localStorage.setItem('brandAccounts', JSON.stringify({
        'brand@test.com': { password: 'test123' }
      }));
    }
    if (!localStorage.getItem('retailAccounts')) {
      localStorage.setItem('retailAccounts', JSON.stringify({
        'store@test.com': { password: 'test123' }
      }));
    }
  };
  seedDefaults();

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
  const brandForm = document.getElementById('brandLoginForm');
  if (brandForm) {
    if (localStorage.getItem('brandLoggedIn')) {
      window.location.href = 'brand-dashboard.html';
    }
    brandForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('brandEmail').value.trim();
      const pass = document.getElementById('brandPassword').value;
      const accounts = JSON.parse(localStorage.getItem('brandAccounts') || '{}');
      if (accounts[email] && accounts[email].password === pass) {
        localStorage.setItem('brandLoggedIn', email);
        window.location.href = 'brand-dashboard.html';
      } else {
        alert('Invalid credentials. Please contact us to request access.');
      }
      brandForm.reset();
    });
  }

  const retailForm = document.getElementById('retailLoginForm');
  if (retailForm) {
    if (localStorage.getItem('retailLoggedIn')) {
      window.location.href = 'retail-dashboard.html';
    }
    retailForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('retailEmail').value.trim();
      const pass = document.getElementById('retailPassword').value;
      const accounts = JSON.parse(localStorage.getItem('retailAccounts') || '{}');
      if (accounts[email] && accounts[email].password === pass) {
        localStorage.setItem('retailLoggedIn', email);
        window.location.href = 'retail-dashboard.html';
      } else {
        alert('Invalid credentials. Please contact us to request access.');
      }
      retailForm.reset();
    });
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const msg = document.getElementById('contactMessage').value.trim();
      const status = document.getElementById('contactStatus');
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${msg}`);
      window.location.href = `mailto:ecoelevation.owner@gmail.com?subject=Account%20Request&body=${body}`;
      if (status) {
        status.textContent = 'Opening your email client...';
      }
      contactForm.reset();
    });
  }

  // ----- Dashboard handling -----
  const brandDash = document.getElementById('brandDashboard');
  if (brandDash) {
    const email = localStorage.getItem('brandLoggedIn');
    if (!email) {
      window.location.href = 'brand-login.html';
    } else {
      brandDash.querySelector('.user-email').textContent = email;
      document.getElementById('brandLogout').addEventListener('click', () => {
        localStorage.removeItem('brandLoggedIn');
        window.location.href = 'brand-login.html';
      });
    }
  }

  const retailDash = document.getElementById('retailDashboard');
  if (retailDash) {
    const email = localStorage.getItem('retailLoggedIn');
    if (!email) {
      window.location.href = 'retail-login.html';
    } else {
      retailDash.querySelector('.user-email').textContent = email;
      document.getElementById('retailLogout').addEventListener('click', () => {
        localStorage.removeItem('retailLoggedIn');
        window.location.href = 'retail-login.html';
      });
    }
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
});
