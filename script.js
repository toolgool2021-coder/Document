(() => {
  const STORAGE_KEY = 'attendance-statuses-v4';
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

  function getType(index) {
    const status = statuses[index];
    if (!status) return '';
    return typeof status === 'string' ? status : status.type;
  }

  function setStatus(index, type) {
    if (type === 'late') {
      const previousTime = statuses[index]?.time || '';
      const time = window.prompt('Введите время прихода, например 08:35:', previousTime);
      if (time === null || !time.trim()) return;
      statuses[index] = { type: 'late', time: time.trim() };
    } else if (getType(index) === type) {
      delete statuses[index];
    } else {
      statuses[index] = { type };
    }

    saveStatuses();
    renderList();
  }

  function updateResult(names) {
    const present = [];
    const late = [];
    const absent = [];

    names.forEach((name, index) => {
      const status = statuses[index];
      const type = getType(index);
      if (type === 'present') present.push(name);
      if (type === 'late') late.push(`${name} [${status.time}]`);
      if (type === 'absent') absent.push(name);
    });

    const marked = present.length + late.length + absent.length;
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

  function makeButton(label, type, name, active) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `action-btn ${type}${active ? ' active' : ''}`;
    button.textContent = label;
    button.setAttribute('aria-label', `${name}: ${type === 'present' ? 'есть' : type === 'absent' ? 'нет' : 'опоздал'}`);
    button.setAttribute('aria-pressed', String(active));
    return button;
  }

  function renderList() {
    const names = Array.isArray(window.people) ? window.people : [];
    listEl.innerHTML = '';

    names.forEach((name, index) => {
      const type = getType(index);
      const card = document.createElement('div');
      card.className = `note ${type}`;

      const nameEl = document.createElement('span');
      nameEl.className = 'person-name';
      nameEl.textContent = name;

      const actions = document.createElement('div');
      actions.className = 'note-actions';

      const presentButton = makeButton('✓', 'present', name, type === 'present');
      const absentButton = makeButton('✕', 'absent', name, type === 'absent');
      const lateButton = makeButton('⏱️', 'late', name, type === 'late');

      presentButton.addEventListener('click', () => setStatus(index, 'present'));
      absentButton.addEventListener('click', () => setStatus(index, 'absent'));
      lateButton.addEventListener('click', () => setStatus(index, 'late'));

      actions.append(presentButton, absentButton, lateButton);
      card.append(nameEl, actions);
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
    } catch (error) {
      resultEl.focus();
      resultEl.select();
      document.execCommand('copy');
    }
    copyStatus.textContent = 'Текст скопирован.';
  });

  renderList();
})();
