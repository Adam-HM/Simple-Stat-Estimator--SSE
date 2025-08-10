// Cross-browser storage helpers (Promise-based)
function getStorage(keys) {
  return new Promise(resolve => {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
      browser.storage.local.get(keys).then(resolve);
    } else {
      chrome.storage.local.get(keys, resolve);
    }
  });
}
function setStorage(obj) {
  return new Promise(resolve => {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
      browser.storage.local.set(obj).then(resolve);
    } else {
      chrome.storage.local.set(obj, resolve);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const input = document.getElementById('apiKey');
  const status = document.getElementById('status');
  const data = await getStorage('apiKey');
  if (data && data.apiKey) input.value = data.apiKey;
  status.textContent = 'Enter your YATA API key (or any limited access key) and click Save.';
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  const input = document.getElementById('apiKey');
  const status = document.getElementById('status');
  const key = input.value.trim();
  if (!key) {
    status.textContent = 'API key is empty.';
    return;
  }
  await setStorage({ apiKey: key });
  status.textContent = 'API key saved.';
  console.log('[SSE] API key saved.');
});
