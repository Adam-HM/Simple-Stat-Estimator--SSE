// Background message handler - does the cross-origin fetch to YATA
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== 'fetchYata') return;
  const userID = String(message.userID || '');
  const apiKey = String(message.apiKey || '');
  const url = `https://yata.yt/api/v1/bs/${encodeURIComponent(userID)}/?key=${encodeURIComponent(apiKey)}`;
  console.log('[SSE] background fetching', url);

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(data => {
      console.log('[SSE] background received', data);
      sendResponse({ success: true, data });
    })
    .catch(err => {
      console.error('[SSE] background fetch error', err);
      sendResponse({ success: false, error: err.toString() });
    });

  return true; // tell runtime we're responding asynchronously
});
