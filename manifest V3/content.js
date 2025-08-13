// Helpers: storage (Promise) and sendMessage (Promise)
function getStorage(keys) {
  return new Promise(resolve => {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
      browser.storage.local.get(keys).then(resolve);
    } else {
      chrome.storage.local.get(keys, resolve);
    }
  });
}
function sendMessage(message) {
  return new Promise(resolve => {
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
      browser.runtime.sendMessage(message).then(resolve).catch(() => resolve(null));
    } else {
      chrome.runtime.sendMessage(message, (response) => resolve(response));
    }
  });
}

// Helper to format numbers into K/M/B
function formatNumberShort(num) {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

(function() {
  try {
    const m = window.location.href.match(/[?&]XID=(\d+)/);
    if (!m) {
      console.log('[SSE] no XID in URL; not running.');
      return;
    }
    const userID = m[1];
    console.log('[SSE] detected userID', userID);

    (async () => {
      const store = await getStorage('apiKey');
      const apiKey = store && store.apiKey;
      if (!apiKey) {
        showError('SSE: No API key set. Click the extension icon and save a limited access API key.');
        console.warn('[SSE] no apiKey in storage.');
        return;
      }

      const response = await sendMessage({ type: 'fetchYata', userID, apiKey });
      if (!response) {
        showError('SSE: No response from extension background script.');
        console.error('[SSE] no response from background.');
        return;
      }
      if (!response.success) {
        showError('SSE: API error — ' + (response.error || 'unknown'));
        console.error('[SSE] api error', response.error);
        return;
      }

      const payload = response.data;
      console.log('[SSE] raw payload:', payload);

      const key = Object.keys(payload).find(k => k == userID);
      if (!key) {
        showError("SSE: No matching user data found in YATA response.");
        console.error('[SSE] userID not found in payload keys:', Object.keys(payload));
        return;
      }

      const userData = payload[key];
      if (!userData || typeof userData.total === 'undefined') {
        showError("SSE: 'total' not found in YATA response.");
        console.error('[SSE] invalid userData', userData);
        return;
      }

      showStatsBar(userData);
      console.log('[SSE] displayed user data', userData);
    })();
  } catch (err) {
    console.error('[SSE] content script error', err);
  }

  function showError(message) {
    const id = 'SSE-error-bar';
    if (document.getElementById(id)) return;
    const bar = document.createElement('div');
    bar.id = id;
    bar.textContent = message;
    Object.assign(bar.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      padding: '8px 12px',
      background: '#b00',
      color: '#fff',
      fontSize: '13px',
      zIndex: 999999,
      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
      textAlign: 'center'
    });
    document.documentElement.style.paddingTop = '42px';
    document.body.prepend(bar);
  }

  function showStatsBar(data) {
    const id = 'SSE-yata-bar';
    if (document.getElementById(id)) return;

    const dateStr = new Date(data.timestamp * 1000).toLocaleString();

    const bar = document.createElement('div');
    bar.id = id;
    bar.innerHTML = `
      <strong>Stat Estimate:</strong> ${formatNumberShort(data.total)} |
      <strong>Score:</strong> ${formatNumberShort(data.score)} |
      <strong>Type:</strong> ${data.type} |
      <strong>Build Skewness:</strong> ${data.skewness}% |
      <strong>Updated:</strong> ${dateStr}

    `;
    Object.assign(bar.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      padding: '8px 12px',
      background: '#333333',
      color: '#81C81D',
      fontSize: '14px',
      zIndex: 999999,
      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
      textAlign: 'center',
      cursor: 'pointer'
    });

    bar.addEventListener('click', () => {
      bar.remove();
      document.documentElement.style.paddingTop = '';
    });

    document.documentElement.style.paddingTop = '42px';
    document.body.prepend(bar);
  }
})();
