export const config = {
    api: {
        bodyParser: {
            sizeLimit: '20mb',
        },
    },
};

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Product-Serial');
}

export default async function handler(req, res) {
    setCorsHeaders(res);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    try {
        const { action, payload, serial } = req.body;
        let targetUrl = '';

        // We handle two actions: 'create' for generating, and 'status' for polling
        if (action === 'create') {
            targetUrl = 'https://api.ezremove.ai/api/ez-remove/photo-editor/create-job';
        } else if (action === 'status') {
            targetUrl = `https://api.ezremove.ai/api/ez-remove/photo-editor/get-job-result/${payload.job_id}`;
            // Sometimes the endpoint is actually get-result or just /photo-editor/job/
            // we will use what the user specified, assuming it returns 404 while processing.
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        // 1. Generate Fake Device ID if one isn't provided by the client's current session
        let deviceSerial = serial;
        if (!deviceSerial) {
            const crypto = await import('crypto');
            deviceSerial = crypto.randomUUID().replace(/-/g, '');
        }

        const headers = {
            'Accept': 'application/json, text/plain, */*',
            'Product-Serial': deviceSerial,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
        };

        let apiRes;

        if (action === 'create') {
            if (!payload.image) return res.status(400).json({ error: 'Missing image' });

            // 2. Rebuild the physical form data completely dynamically so it acts as a fresh request
            const formData = new FormData();
            formData.append('model_name', payload.model_name || 'nano_banana');

            // Convert base64 from client into a Blob buffer
            const base64Data = payload.image.replace(/^data:image\/\w+;base64,/, "");
            const buffer = Buffer.from(base64Data, 'base64');
            const blob = new Blob([buffer], { type: 'image/jpeg' });
            formData.append('target_images', blob, 'image.jpg');

            formData.append('prompt', payload.prompt || 'remix');
            formData.append('ratio', payload.ratio || 'match_input_image');
            formData.append('image_resolution', payload.image_resolution || '1K');

            // 3. Send out via Vercel's dynamic IP address pool
            apiRes = await fetch(targetUrl, { method: 'POST', headers, body: formData });
        } else if (action === 'status') {
            // Polling checking mechanism
            apiRes = await fetch(targetUrl, { method: 'GET', headers });

            // Fallback in case EzRemove uses POST without body for getting results
            if (apiRes.status === 405 || apiRes.status === 404) {
                apiRes = await fetch(targetUrl, { method: 'POST', headers });
            }
        }

        const dataText = await apiRes.text();
        let data;
        try { data = JSON.parse(dataText); } catch (e) { data = { raw: dataText }; }

        let finalStatus = apiRes.status;

        // Mask 404 as 200 during polling so we don't spam the browser console
        if (action === 'status' && finalStatus === 404) {
            finalStatus = 200;
            if (!data.status && !data.result && !data.data) {
                data = { data: { status: 'processing', raw: data.raw } };
            }
        }

        // Return the response back to client, PLUS the specific serial we generated so the client can reuse it during polling!
        return res.status(finalStatus).json({ ...data, _deviceSerial: deviceSerial });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}
