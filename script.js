const API_KEY = 'AIzaSyAb_8eTD55qyre6UFX6mEwjC3pZaaFgxdw'; // Replace with your API Key
const API_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + API_KEY;

async function submitImages() {
    const files = document.getElementById('imageUpload').files;
    if (files.length === 0) {
        alert("Please upload at least one image.");
        return;
    }

    document.getElementById('result').innerHTML = 'Processing...';

    const results = [];
    for (const file of files) {
        const base64Image = await convertToBase64(file);
        const answer = await getAnswerFromAPI(base64Image);
        results.push(`<strong>${file.name}:</strong> ${answer}`);
    }

    document.getElementById('result').innerHTML = results.join('<br><br>');
}

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
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
        const detectedText = data.responses[0].fullTextAnnotation?.text || "No text detected";

        // Simple logic to process the detected text (adjust as needed)
        const answers = extractAnswers(detectedText);
        return answers;
    } catch (error) {
        console.error('Error:', error);
        return 'Error processing the image.';
    }
}

function extractAnswers(text) {
    const lines = text.split('\n');
    const answers = lines.filter(line => line.match(/(Answer|Correct|Option|✓)/i)); // Adjust regex as needed
    return answers.length ? answers.join(', ') : 'No answers found';
}
