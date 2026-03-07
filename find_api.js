const fs = require('fs');

async function run() {
  try {
    const res = await fetch('https://ezremove.ai');
    const html = await res.text();
    const scriptRegex = /<script[^>]*src=[\"']([^\"']+\.js)[\"'][^>]*>/g;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
      let jsUrl = match[1];
      if (jsUrl.startsWith('/')) jsUrl = 'https://ezremove.ai' + jsUrl;
      console.log('Fetching', jsUrl);
      try {
        const jsRes = await fetch(jsUrl);
        const jsText = await jsRes.text();
        
        // Let's find any occurrences of job result URLs
        var urls = jsText.match(/\/api\/[a-zA-Z0-9_\-\/]+/g);
        if (urls) {
           let hits = [...new Set(urls)].filter(u => u.includes('job') || u.includes('result') || u.includes('ez-remove'));
           if (hits.length > 0) {
              console.log('Found relevant APIs in', jsUrl, '->', hits);
           }
        }
      } catch(e) {
        console.error(e.message);
      }
    }
  } catch(e) {
    console.error(e);
  }
}
run();
