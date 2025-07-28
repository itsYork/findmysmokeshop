document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('ageVerified')) {
    const gate = document.createElement('div');
    gate.id = 'ageGate';
    gate.innerHTML = `
      <div class="ageGateBox">
        <p>You must be 21 or older to enter this site.</p>
        <button id="ageConfirm" class="btn btn--primary">I am 21 or older</button>
      </div>`;
    document.body.appendChild(gate);
    document.getElementById('ageConfirm').addEventListener('click', () => {
      localStorage.setItem('ageVerified', 'true');
      location.reload();
    });
    return;
  }
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
    const mapImg  = document.getElementById('mapImage');
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
      if (mapImg) mapImg.src = '';
      try {
        const url = new URL('/api/stores', window.location.origin);
        if (activeFilter === 'open') url.searchParams.set('open', '1');
        if (opts.near) url.searchParams.set('near', opts.near);
        if (opts.ll) url.searchParams.set('ll', opts.ll);
        const resp = await fetch(url.toString());
        const data = await resp.json();
        let stores = data;
        if (activeFilter === 'partnered') {
          stores = stores.filter(s => PARTNERED_IDS.includes(s.place_id));
        }
        showResults(stores);
        updateMap(stores);
      } catch (err) {
        results.textContent = 'Error loading stores.';
      }
    }

    function updateMap(stores) {
      if (!mapImg) return;
      if (!stores.length) { mapImg.alt = 'No stores found'; mapImg.src = ''; return; }
      const params = new URLSearchParams();
      stores.forEach(s => params.append('marker', `${s.lat},${s.lng}`));
      mapImg.src = `/api/static-map?${params.toString()}`;
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

        if (PARTNERED_IDS.includes(s.place_id)) {
          div.appendChild(document.createTextNode(' '));
          const badge = document.createElement('span');
          badge.className = 'badge';
          badge.textContent = 'Partner';
          div.appendChild(badge);
        }

        div.appendChild(document.createElement('br'));

        const addr = document.createElement('small');
        addr.textContent = s.address || '';
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

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('signupEmail').value.trim();
      const pass = document.getElementById('signupPassword').value;
      try {
        const resp = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });
        if (resp.ok) {
          signupForm.innerHTML =
            '<p>Thanks for signing up! Your account is pending approval.</p>';
        } else {
          const data = await resp.json().catch(() => ({}));
          alert(data.error || 'Sign up failed');
        }
      } catch (err) {
        alert('Sign up failed');
      }
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

  const subForm = document.getElementById('subForm');
  if (subForm) {
    subForm.addEventListener('submit', async e => {
      e.preventDefault();
      const status = document.getElementById('subSelect').value;
      try {
        const resp = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        if (resp.ok) alert('Subscription updated');
        else alert('Update failed');
      } catch (err) {
        alert('Update failed');
      }
    });
  }
});
