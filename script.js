// Helper: compute 2nd Saturday dates for odd months of the current year
function getSecondSaturdays(year) {
  const dates = [];
  for (let m = 0; m < 12; m++) {
    const month = m + 1;
    if (month % 2 === 1) { // odd month
      let date = new Date(year, m, 1);
      // find first Saturday
      while (date.getDay() !== 6) date.setDate(date.getDate() + 1);
      // second Saturday
      date.setDate(date.getDate() + 7);
      dates.push(new Date(date));
    }
  }
  return dates;
}

// State
let themes = [];
let selectedVoteIds = new Set();

// Load themes.json
async function loadThemes() {
  const res = await fetch('themes.json');
  themes = await res.json();
  renderThemes();
  renderFunIdeas();
  renderLocalVoteOptions();
}

// Render schedule cards
function renderSchedule() {
  const year = new Date().getFullYear();
  const schedule = getSecondSaturdays(year);
  const container = document.getElementById('schedule-list');
  container.innerHTML = '';
  schedule.forEach((d, i) => {
    const id = `event-${i}`;
    const card = document.createElement('div');
    card.className = 'card';
    const monthName = d.toLocaleString('en-US', { month: 'long' });
    card.innerHTML = `
      <h4>${monthName} ${d.getDate()}, ${year}</h4>
      <div class="muted">2nd Saturday • Odd month</div>
      <div class="muted">Theme: To be decided</div>
      <div class="muted">Host: Open</div>
      <div class="controls">
        <a class="primary" href="#signup">Sign up to host</a>
        <a href="#signup">Sign up a dish</a>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render themes list
function renderThemes() {
  const list = document.getElementById('theme-list');
  const q = document.getElementById('theme-search').value?.toLowerCase() || '';
  const filtered = themes.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    (t.keralaTouch || '').toLowerCase().includes(q)
  );
  list.innerHTML = '';
  filtered.forEach(t => {
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `
      <h4>${t.name}</h4>
      <div class="muted">${t.description}</div>
      <div><strong>Kerala touch:</strong> ${t.keralaTouch}</div>
      <div><strong>Fun idea:</strong> ${t.fun}</div>
      <div class="controls">
        <button data-id="${t.id}" class="primary add-to-vote">Add to my ballot</button>
      </div>
    `;
    list.appendChild(li);
  });
  // bind buttons
  list.querySelectorAll('.add-to-vote').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.getAttribute('data-id');
      toggleVote(id);
    });
  });
}

// Render fun ideas
function renderFunIdeas() {
  const ul = document.getElementById('fun-ideas');
  ul.innerHTML = '';
  themes.forEach(t => {
    const li = document.createElement('li');
    li.className = 'card';
    li.innerHTML = `<h4>${t.name}</h4><div>${t.fun}</div>`;
    ul.appendChild(li);
  });
}

// Local voting options
function renderLocalVoteOptions() {
  const ul = document.getElementById('vote-options');
  ul.innerHTML = '';
  themes.forEach(t => {
    const li = document.createElement('li');
    li.className = 'card';
    const checked = selectedVoteIds.has(t.id) ? 'checked' : '';
    li.innerHTML = `
      <label>
        <input type="checkbox" data-id="${t.id}" ${checked} />
        ${t.name}
      </label>
      <div class="muted">${t.description}</div>
    `;
    ul.appendChild(li);
  });
  ul.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', e => {
      toggleVote(e.target.getAttribute('data-id'));
    });
  });
}

// Vote selection logic
function toggleVote(id) {
  if (selectedVoteIds.has(id)) {
    selectedVoteIds.delete(id);
  } else {
    if (selectedVoteIds.size >= 6) {
      alert('You can choose up to 6 themes.');
      return;
    }
    selectedVoteIds.add(id);
  }
  document.getElementById('vote-status').textContent =
    `Selected ${selectedVoteIds.size} / 6`;
  renderLocalVoteOptions();
}

// Add new theme prompt
document.addEventListener('DOMContentLoaded', () => {
  renderSchedule();
  loadThemes();

  document.getElementById('theme-search').addEventListener('input', renderThemes);
  document.getElementById('add-theme-btn').addEventListener('click', () => {
    const name = prompt('Theme name:');
    if (!name) return;
    const description = prompt('Short description:');
    const keralaTouch = prompt('Kerala touch (optional):');
    const fun = prompt('Fun idea:');
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const t = { id, name, description: description || '', keralaTouch: keralaTouch || '', fun: fun || '' };
    themes.push(t);
    renderThemes();
    renderLocalVoteOptions();
  });

  document.getElementById('submit-vote-btn').addEventListener('click', () => {
    if (selectedVoteIds.size === 0) {
      alert('Please select at least one theme.');
      return;
    }
    // For local-only prototype, just show a message.
    // To persist, connect to a Google Form or Airtable.
    const names = themes.filter(t => selectedVoteIds.has(t.id)).map(t => t.name);
    alert(`Your vote was recorded:\n${names.join(', ')}`);
    document.getElementById('vote-status').textContent = 'Thanks for voting!';
  });
});
