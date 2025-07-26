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
});
