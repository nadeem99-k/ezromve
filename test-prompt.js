const crypto = require('crypto');

// A 10x10 red square
const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FAAhKDveksOjmAAAAAElFTkSuQmCC";

async function testEzRemoveDirect() {
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: 'image/jpeg' });

    let formData = new FormData();
    formData.append('model_name', 'ezremove_4.0');
    formData.append('target_images', blob, 'image.jpg');
    formData.append('prompt', 'a beautiful blue square');
    formData.append('ratio', 'match_input_image');
    formData.append('image_resolution', '1K');

    const deviceSerial = crypto.randomUUID().replace(/-/g, '');

    try {
        console.log('Creating job...');
        const res = await fetch('https://api.ezremove.ai/api/ez-remove/photo-editor/create-job', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Product-Serial': deviceSerial
            },
            body: formData
        });

        const data = await res.json();
        console.log('Create Job Response:', data);

        let jobId = data.result?.job_id || data.result?.id || (data.data && data.data.job_id);

        if (!jobId && data.result?.image_url) {
            console.log('Immediate result:', data.result.image_url);
            return;
        }

        if (!jobId) {
            console.error('No job ID returned!');
            return;
        }

        console.log('Waiting for job:', jobId);

        let isDone = false;
        while (!isDone) {
            await new Promise(r => setTimeout(r, 2000));

            const statusUrl = `https://api.ezremove.ai/api/ez-remove/photo-editor/get-job-result/${jobId}`;
            let pollRes = await fetch(statusUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Product-Serial': deviceSerial
                }
            });

            if (pollRes.status === 405 || pollRes.status === 404) {
                pollRes = await fetch(statusUrl, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Product-Serial': deviceSerial
                    }
                });
            }

            if (pollRes.status === 404) {
                console.log('Status: 404 (processing...)');
                continue;
            }

            const pollData = await pollRes.json();
            const status = pollData.data?.status || pollData.result?.status;

            console.log('Status:', status);
            if (status === 'success' || status === 'finished') {
                console.log('Final Result:', pollData);
                isDone = true;
            } else if (status === 'failed') {
                console.log('Failed!', pollData);
                isDone = true;
            }
        }
    } catch (e) {
        console.error(e);
    }
}
testEzRemoveDirect();
