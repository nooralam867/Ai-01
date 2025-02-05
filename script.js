const API_KEY = 'AIzaSyAb_8eTD55qyre6UFX6mEwjC3pZaaFgxdw';  // Your API Key
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

async function submitImages() {
    const files = document.getElementById('imageUpload').files;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    if (files.length === 0) {
        alert("Please upload at least one image.");
        return;
    }

    resultDiv.innerHTML = 'Processing... Please wait.';

    const results = [];

    for (const file of files) {
        try {
            const base64Image = await convertToBase64(file);
            const answer = await getAnswerFromAPI(base64Image);
            results.push(`<strong>${file.name}:</strong><br><span class="success">${answer}</span>`);
        } catch (error) {
            console.error('Processing Error:', error);
            results.push(`<strong>${file.name}:</strong><br><span class="error">Error: ${error.message}</span>`);
        }
    }

    resultDiv.innerHTML = results.join('<hr>');
}

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

async function getAnswerFromAPI(base64Image) {
    const requestBody = {
        requests: [
            {
                image: { content: base64Image },
                features: [{ type: "TEXT_DETECTION" }]
            }
        ]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const detectedText = data.responses[0].fullTextAnnotation?.text || "No text detected.";
        return extractAnswers(detectedText);
    } catch (error) {
        throw new Error(error.message || 'Error processing the image.');
    }
}

function extractAnswers(text) {
    const lines = text.split('\n');
    const answers = lines.filter(line => 
        /(Answer|Correct|Option|✓|✔|Selected|Choice)/i.test(line)
    );

    return answers.length ? answers.join('\n') : 'No answers found.';
}
