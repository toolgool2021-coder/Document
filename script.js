(() => {
  const STORAGE_KEY = 'attendance-status-v3';
  const listEl = document.querySelector('#people-list');
  const resultEl = document.querySelector('#result');
  const totalEl = document.querySelector('#total-count');
  const resetButton = document.querySelector('#resetButton');
  const copyButton = document.querySelector('#copyButton');
  const copyStatus = document.querySelector('#copy-status');

  let statuses = loadStatuses();

  function loadStatuses() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveStatuses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  }

  function setStatus(index, status, time = '') {
    if (statuses[index]?.type === status && status !== 'late') {
      delete statuses[index];
    } else if (status === 'late') {
      const enteredTime = window.prompt('Во сколько пришёл человек?', statuses[index]?.time || '');
      if (enteredTime === null) return;
      const cleanTime = enteredTime.trim();
      if (!cleanTime) return;
      statuses[index] = { type: 'late', time: cleanTime };
    } else {
      statuses[index] = { type: status };
    }
    saveStatuses();
    renderList();
  }

  function getStatus(index) {
    const value = statuses[index];
    if (!value) return '';
    // Совместимость со старыми отметками: present/absent были строками.
    return typeof value === 'string' ? value : value.type;
  }

  function updateResult(names) {
    const present = [];
    const absent = [];
    const late = [];

    names.forEach((name, index) => {
      const value = statuses[index];
      const type = getStatus(index);
      if (type === 'present') present.push(name);
      if (type === 'absent') absent.push(name);
      if (type === 'late') late.push(`${name} [${value.time}]`);
    });

    const marked = present.length + absent.length + late.length;
    totalEl.textContent = `Отмечено: ${marked} из ${names.length}`;
    resultEl.value = [
      `Кто есть (${present.length}):`,
      present.length ? present.join(', ') : '—',
      '',
      `Опоздавшие (${late.length}):`,
      late.length ? late.join(', ') : '—',
      '',
      `Кого нет (${absent.length}):`,
      absent.length ? absent.join(', ') : '—'
    ].join('\n');
  }

  function createActionButton(label, className, name, pressed, callback) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `action-btn ${className} ${pressed ? 'active' : ''}`;
    button.textContent = label;
    button.setAttribute('aria-label', `${name} — ${className === 'present' ? 'есть' : className === 'absent' ? 'нет' : 'опоздал'}`);
    button.setAttribute('aria-pressed', String(pressed));
    button.addEventListener('click', callback);
    return button;
  }

  function renderList() {
    const names = Array.isArray(window.people) ? window.people : [];
    listEl.innerHTML = '';

    names.forEach((name, index) => {
      const status = getStatus(index);
      const card = document.createElement('div');
      card.className = `note ${status}`;

      const label = document.createElement('span');
      label.className = 'person-name';
      label.textContent = name;

      const actions = document.createElement('div');
      actions.className = 'note-actions';
      actions.append(
        createActionButton('✓', 'present', name, status === 'present', () => setStatus(index, 'present')),
        createActionButton('✕', 'absent', name, status === 'absent', () => setStatus(index, 'absent')),
        createActionButton('⏱️', 'late', name, status === 'late', () => setStatus(index, 'late'))
      );

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
