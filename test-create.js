const fs = require('fs');

async function run() {
    // A tiny transparent 1x1 png image in base64
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const prompt = "test prompt";

    try {
        const res = await fetch('https://ezromve.vercel.app/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create',
                payload: { image: base64Image, prompt: prompt }
            })
        });

        const status = res.status;
        const text = await res.text();
        console.log('Status:', status);
        console.log('Response body text:', text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.log("Could not parse JSON body");
            return;
        }

        console.log("Parsed JSON:", JSON.stringify(data, null, 2));

    } catch (err) {
        console.error("Fetch threw error:", err);
    }
}
run();
