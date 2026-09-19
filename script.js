(() => {
  const STORAGE_KEY = 'attendance-status-v2';
  const listEl = document.querySelector('#people-list');
  const resultEl = document.querySelector('#result');
  const totalEl = document.querySelector('#total-count');
  const resetButton = document.querySelector('#resetButton');
  const copyButton = document.querySelector('#copyButton');
  const copyStatus = document.querySelector('#copy-status');

  let statuses = loadStatuses();

  function loadStatuses() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      return {};
    }
  }

  function saveStatuses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  }

  function updateResult(names) {
    const present = names.filter((_, index) => statuses[index] === 'present');
    const absent = names.filter((_, index) => statuses[index] === 'absent');
    const marked = present.length + absent.length;

    totalEl.textContent = `Отмечено: ${marked} из ${names.length}`;

    resultEl.value = [
      `Кто есть (${present.length}):`,
      present.length ? present.join(', ') : '—',
      '',
      `Кого нет (${absent.length}):`,
      absent.length ? absent.join(', ') : '—'
    ].join('\n');
  }

  function renderList() {
    const names = Array.isArray(window.people) ? window.people : [];
    listEl.innerHTML = '';

    names.forEach((name, index) => {
      const status = statuses[index] || '';
      const card = document.createElement('div');
      card.className = `note ${status}`;

      const label = document.createElement('span');
      label.className = 'person-name';
      label.textContent = name;

      const actions = document.createElement('div');
      actions.className = 'note-actions';

      const presentBtn = document.createElement('button');
      presentBtn.type = 'button';
      presentBtn.className = `action-btn present ${status === 'present' ? 'active' : ''}`;
      presentBtn.textContent = '✓';
      presentBtn.setAttribute('aria-label', `${name} — есть`);
      presentBtn.setAttribute('aria-pressed', String(status === 'present'));

      const absentBtn = document.createElement('button');
      absentBtn.type = 'button';
      absentBtn.className = `action-btn absent ${status === 'absent' ? 'active' : ''}`;
      absentBtn.textContent = '✕';
      absentBtn.setAttribute('aria-label', `${name} — нет`);
      absentBtn.setAttribute('aria-pressed', String(status === 'absent'));

      presentBtn.addEventListener('click', () => {
        statuses[index] = statuses[index] === 'present' ? '' : 'present';
        saveStatuses();
        renderList();
      });

      absentBtn.addEventListener('click', () => {
        statuses[index] = statuses[index] === 'absent' ? '' : 'absent';
        saveStatuses();
        renderList();
      });

      actions.append(presentBtn, absentBtn);
      card.append(label, actions);
      listEl.appendChild(card);
    });

    updateResult(names);
  }

  resetButton.addEventListener('click', () => {
    statuses = {};
    saveStatuses();
    copyStatus.textContent = '';
    renderList();
  });

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(resultEl.value);
      copyStatus.textContent = 'Текст скопирован.';
    } catch (error) {
      resultEl.focus();
      resultEl.select();
      document.execCommand('copy');
      copyStatus.textContent = 'Текст скопирован.';
    }
  });

  renderList();
})();
