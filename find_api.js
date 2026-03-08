const fs = require('fs');

async function run() {
  try {
    const res = await fetch('https://ezremove.ai');
    const html = await res.text();
    const scriptRegex = /src=[\"']([^\"']+\.js)[\"']/g;
    let match;
    let allApis = {};
    while ((match = scriptRegex.exec(html)) !== null) {
      let jsUrl = match[1];
      if (jsUrl.startsWith('/')) {
        jsUrl = 'https://ezremove.ai' + jsUrl;
      } else if (!jsUrl.startsWith('http')) {
        jsUrl = 'https://ezremove.ai/' + jsUrl;
      }

      try {
        const jsRes = await fetch(jsUrl);
        const jsText = await jsRes.text();

        var urls = jsText.match(/\/api\/[a-zA-Z0-9_\-\/]+/g);
        if (urls) {
          let hits = [...new Set(urls)];
          if (hits.length > 0) {
            allApis[jsUrl] = hits;
          }
        }
      } catch (e) {
      }
    }
    fs.writeFileSync('apis.json', JSON.stringify(allApis, null, 2));
    console.log('Saved to apis.json');
  } catch (e) {
    console.error(e);
  }
}
run();
