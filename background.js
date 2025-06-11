// Função para enviar mensagem para a API da OpenAI
async function sendMessageToOpenAI(messages, model, apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Erro na requisição à API');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Erro ao enviar mensagem para OpenAI:', error);
        throw error;
    }
}

// Listener para mensagens
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script: Mensagem recebida:', request);

    if (request.action === 'downloadCSV') {
        console.log('Background script: Iniciando download do CSV...');
        chrome.downloads.download({
            url: request.url,
            filename: request.filename,
            saveAs: false
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error('Background script: Erro no download:', chrome.runtime.lastError);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                console.log('Background script: Download iniciado com ID:', downloadId);
                sendResponse({ success: true, downloadId });
            }
        });
        return true; // Mantém a conexão aberta para resposta assíncrona
    }

    if (request.action === 'sendMessage') {
        console.log('Background script: Enviando mensagem para API...');
        sendMessageToOpenAI(request.messages, request.model, request.apiKey)
            .then(response => {
                sendResponse({ success: true, data: response });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true; // Mantém a conexão aberta para resposta assíncrona
    }
});