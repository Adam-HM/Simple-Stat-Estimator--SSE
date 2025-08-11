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
    // browser.runtime.sendMessage returns a Promise in Firefox
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
      browser.runtime.sendMessage(message).then(resolve).catch(() => resolve(null));
    } else {
      chrome.runtime.sendMessage(message, (response) => resolve(response));
    }
  });
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
      // YATA example: { "3755807": { "total": 121614, ... } }
      const total = payload && payload[userID] && payload[userID].total;
      if (typeof total === 'undefined') {
        showError("SSE: 'total' not found in YATA response.");
        console.error('[SSE] invalid payload', payload);
        return;
      }

      showTotalBar(Number(total));
      console.log('[SSE] displayed total', total);
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

  function showTotalBar(total) {
    const id = 'SSE-yata-bar';
    if (document.getElementById(id)) return;
    const bar = document.createElement('div');
    bar.id = id;
    bar.textContent = `Battle Stat Estimate: ${total.toLocaleString()}`;
    Object.assign(bar.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      padding: '8px 12px',
      background: '#111',
      color: '#fff',
      fontSize: '14px',
      zIndex: 999999,
      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
      textAlign: 'center',
      cursor: 'pointer'
    });
    // click to remove
    bar.addEventListener('click', () => {
      bar.remove();
      document.documentElement.style.paddingTop = '';
    });
    document.documentElement.style.paddingTop = '42px';
    document.body.prepend(bar);
  }
})();
