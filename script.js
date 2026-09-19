(() => {
  const STORAGE_KEY = 'attendance-statuses-v1';
  const list = document.querySelector('#people-list');
  const result = document.querySelector('#result');
  const progress = document.querySelector('#progress');
  const emptyState = document.querySelector('#empty-state');
  const resetButton = document.querySelector('#reset-button');
  const copyButton = document.querySelector('#copy-button');
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

  function render() {
    const names = Array.isArray(window.people) ? window.people : [];
    list.innerHTML = '';
    emptyState.hidden = names.length > 0;

    names.forEach((name, index) => {
      const status = statuses[index] || '';
      const row = document.createElement('div');
      row.className = `person ${status}`;
      row.innerHTML = `
        <span class="person-name"></span>
        <div class="person-actions" role="group" aria-label="Отметка для ${escapeAttribute(name)}">
          <button class="mark-button present ${status === 'present' ? 'active' : ''}" data-index="${index}" data-status="present" type="button" aria-label="${escapeAttribute(name)} — есть" aria-pressed="${status === 'present'}">✓</button>
          <button class="mark-button absent ${status === 'absent' ? 'active' : ''}" data-index="${index}" data-status="absent" type="button" aria-label="${escapeAttribute(name)} — нет" aria-pressed="${status === 'absent'}">×</button>
        </div>`;
      row.querySelector('.person-name').textContent = name;
      list.appendChild(row);
    });

    list.querySelectorAll('.mark-button').forEach((button) => {
      button.addEventListener('click', () => {
        const index = button.dataset.index;
        const nextStatus = statuses[index] === button.dataset.status ? '' : button.dataset.status;
        if (nextStatus) statuses[index] = nextStatus;
        else delete statuses[index];
        saveStatuses();
        render();
      });
    });
    updateResult(names);
  }

  function updateResult(names) {
    const present = names.filter((_, index) => statuses[index] === 'present');
    const absent = names.filter((_, index) => statuses[index] === 'absent');
    const marked = present.length + absent.length;
    progress.textContent = `Отмечено: ${marked} из ${names.length}`;
    result.value = `Кто есть (${present.length}):\n${present.length ? present.join(', ') : '—'}\n\nКого нет (${absent.length}):\n${absent.length ? absent.join(', ') : '—'}`;
  }

  function escapeAttribute(value) {
    return String(value).replace(/[&"'<>]/g, (character) => ({ '&': '&amp;', '"': '&quot;', "'": '&#39;', '<': '&lt;', '>': '&gt;' })[character]);
  }

  resetButton.addEventListener('click', () => {
    statuses = {};
    saveStatuses();
    copyStatus.textContent = '';
    render();
  });

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(result.value);
      copyStatus.textContent = 'Текст скопирован.';
    } catch (error) {
      result.select();
      document.execCommand('copy');
      copyStatus.textContent = 'Текст скопирован.';
    }
  });

  render();
})();
