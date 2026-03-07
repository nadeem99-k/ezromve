async function test() {
    const crypto = require('crypto');
    for (let i = 0; i < 3; i++) {
        const formData = new FormData();
        formData.append('model_name', 'nano_banana');
        formData.append('target_images', new Blob(['test'], { type: 'image/jpeg' }), 'image.jpg');
        formData.append('prompt', 'test');
        formData.append('ratio', 'match_input_image');
        formData.append('image_resolution', '1K');

        const serial = crypto.randomUUID().replace(/-/g, '');
        const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

        try {
            const res = await fetch('https://api.ezremove.ai/api/ez-remove/photo-editor/create-job', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Product-Serial': serial,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'X-Forwarded-For': ip,
                    'Client-IP': ip,
                    'X-Real-IP': ip
                },
                body: formData
            });
            const text = await res.text();
            console.log(`Attempt ${i + 1} Serial:${serial.slice(0, 8)} IP:${ip} Status:${res.status} Body:${text}`);
        } catch (e) { console.error(e); }
    }
}
test();
