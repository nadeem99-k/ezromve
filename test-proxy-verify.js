const fs = require('fs');

async function testVercelProxy() {
    const fileBuf = fs.readFileSync('../download.jpg');
    const base64Data = "data:image/jpeg;base64," + fileBuf.toString('base64');

    console.log("Sending payload of length:", base64Data.length);
    // Test hit to proxy
    try {
        const res = await fetch('https://ezromve.vercel.app/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create',
                payload: {
                    model_name: 'nano_banana',
                    image: base64Data,
                    prompt: 'test',
                    ratio: 'match_input_image',
                    image_resolution: '1K'
                }
            })
        });

        console.log('Proxy Status:', res.status);
        console.log('Proxy Text:', await res.text());
    } catch (e) {
        console.error(e);
    }
}
testVercelProxy();
