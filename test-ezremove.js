const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function testEzRemoveDirect() {
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: 'image/jpeg' });

    let formData = new FormData();
    formData.append('model_name', 'nano_banana');
    formData.append('target_images', blob, 'image.jpg');
    formData.append('prompt', 'test');
    formData.append('ratio', 'match_input_image');
    formData.append('image_resolution', '1K');

    try {
        const res = await fetch('https://api.ezremove.ai/api/ez-remove/photo-editor/create-job', {
            method: 'POST',
            headers: {
                // Let fetch auto-generate Content-Type with boundary
                'Accept': 'application/json, text/plain, */*',
                'Product-Serial': crypto.randomUUID().replace(/-/g, ''),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
                'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                'True-Client-IP': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
            },
            body: formData
        });

        console.log('Status:', res.status);
        console.log('Text:', await res.text());
    } catch (e) {
        console.error(e);
    }
}
testEzRemoveDirect();
