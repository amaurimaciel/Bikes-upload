import { OpenAIService } from './openai-service.js';

// Configuração padrão
const DEFAULT_PROMPT = [
    {
        role: "system",
        content: "Você é um especialista em análise de dados de bicicletas. Analise os dados fornecidos e forneça insights relevantes."
    },
    {
        role: "user",
        content: "Analise os dados da bicicleta e forneça um relatório detalhado."
    }
];

// Função para injetar o content script
async function injectContentScript(tabId) {
    try {
        // Primeiro, tenta remover o script existente para evitar duplicatas
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                const existingScript = document.getElementById('bike-catalog-script');
                if (existingScript) {
                    existingScript.remove();
                }
            }
        });

        // Injeta o novo script
        await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });

        // Aguarda um momento para garantir que o script foi carregado
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Verifica se o script está respondendo
        const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        if (response && response.success) {
            console.log('Content script injetado e respondendo com sucesso');
            return true;
        } else {
            throw new Error('Content script não está respondendo corretamente');
        }
    } catch (error) {
        console.error('Erro ao injetar content script:', error);
        return false;
    }
}

// Função para capturar dados
async function captureData() {
    console.log('Iniciando captura de dados...');
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Capturando dados...';
    statusDiv.className = 'status';
    statusDiv.style.display = 'block';

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('Tab atual:', tab);

        if (!tab) {
            throw new Error('Nenhuma aba ativa encontrada');
        }

        // Injetar content script antes de tentar capturar
        const injected = await injectContentScript(tab.id);
        if (!injected) {
            throw new Error('Não foi possível injetar o content script');
        }

        // Tenta capturar os dados várias vezes se necessário
        let attempts = 0;
        const maxAttempts = 3;
        let response;

        while (attempts < maxAttempts) {
            try {
                response = await chrome.tabs.sendMessage(tab.id, { action: 'captureData' });
                if (response && response.success) {
                    break;
                }
            } catch (error) {
                console.log(`Tentativa ${attempts + 1} falhou:`, error);
                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        if (!response || !response.success) {
            throw new Error('Não foi possível capturar os dados após várias tentativas');
        }

        console.log('Resposta do content script:', response);
        statusDiv.textContent = 'Dados capturados com sucesso!';
        statusDiv.className = 'status success';
    } catch (error) {
        console.error('Erro na captura:', error);
        statusDiv.textContent = `Erro: ${error.message}`;
        statusDiv.className = 'status error';
    }
}

// Função para obter dados do CSV
async function getCSVData() {
    console.log('Obtendo dados do CSV...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getCSVData' });
    
    if (!response.success) {
        throw new Error(response.error || 'Erro ao obter dados do CSV');
    }
    
    return response.data;
}

// Função para obter links das imagens
async function getImageLinks() {
    console.log('Obtendo links das imagens...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getImageLinks' });
    
    if (!response.success) {
        throw new Error(response.error || 'Erro ao obter links das imagens');
    }
    
    return response.data;
}

// Função para analisar com IA
async function analyzeWithAI() {
    console.log('Iniciando análise com IA...');
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Analisando dados...';
    statusDiv.className = 'status';
    statusDiv.style.display = 'block';

    try {
        // Obter configurações
        const config = await chrome.storage.local.get(['openaiApiKey', 'model', 'prompt']);
        console.log('Configurações carregadas:', config);

        if (!config.openaiApiKey) {
            throw new Error('API key não configurada. Configure a API key nas configurações.');
        }

        if (!config.prompt) {
            throw new Error('Prompt padrão não configurado. Configure o prompt nas configurações.');
        }

        // Obter dados
        const csvData = await getCSVData();
        const imageLinks = await getImageLinks();
        
        console.log('Dados obtidos para análise:');
        console.log('CSV Data:', csvData);
        console.log('Image Links:', imageLinks);

        // Preparar mensagens para a API
        const messages = [
            {
                role: "system",
                content: "Você é um especialista em análise de dados de bicicletas."
            },
            {
                role: "user",
                content: config.prompt
                    .replace('{csvData}', csvData)
                    .replace('{imageLinks}', imageLinks.join('\n'))
            }
        ];

        console.log('Mensagens preparadas para a API:', messages);
        console.log('Usando modelo:', config.model);

        // Enviar para a API
        const openaiService = new OpenAIService(config.openaiApiKey, config.model);
        const response = await openaiService.sendMessage(messages);
        console.log('Resposta da API:', response);

        // Exibir resultado
        await displayAnalysisResult(response);
        statusDiv.textContent = 'Análise concluída com sucesso!';
        statusDiv.className = 'status success';
    } catch (error) {
        console.error('Erro na análise:', error);
        statusDiv.textContent = `Erro: ${error.message}`;
        statusDiv.className = 'status error';
    }
}

// Função para exibir o resultado da análise
async function displayAnalysisResult(result) {
    console.log('Exibindo resultado da análise:', result);
    const resultDiv = document.getElementById('analysis-result');
    
    try {
        // Verificar se o resultado é um CSV válido
        if (!result.includes('Campo,Confiança (%),Sugestão,Fonte Primária,Observações')) {
            throw new Error('Formato de resposta inválido. A resposta deve ser um CSV.');
        }

        // Criar uma tabela HTML para exibir o CSV
        const rows = result.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',');
        
        let tableHTML = '<table class="analysis-table">';
        
        // Adicionar cabeçalho
        tableHTML += '<thead><tr>';
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr></thead>';
        
        // Adicionar linhas
        tableHTML += '<tbody>';
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].split(',');
            tableHTML += '<tr>';
            cells.forEach(cell => {
                tableHTML += `<td>${cell}</td>`;
            });
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';
        
        resultDiv.innerHTML = tableHTML;
        resultDiv.style.display = 'block';
    } catch (error) {
        console.error('Erro ao exibir resultado:', error);
        resultDiv.innerHTML = `<div class="error">Erro ao processar resultado: ${error.message}</div>`;
        resultDiv.style.display = 'block';
    }
}

// Adicionar event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Adicionando event listeners...');
    
    // Menu hamburguer
    const menuButton = document.getElementById('menu-button');
    const menu = document.getElementById('menu');
    const configBtn = document.getElementById('config-btn');

    menuButton.addEventListener('click', () => {
        console.log('Menu button clicked');
        menu.classList.toggle('show');
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', (event) => {
        if (!menuButton.contains(event.target) && !menu.contains(event.target)) {
            menu.classList.remove('show');
        }
    });

    configBtn.addEventListener('click', () => {
        console.log('Config button clicked');
        chrome.runtime.openOptionsPage();
    });

    // Botões principais
    const startBtn = document.getElementById('start-btn');
    const analyzeBtn = document.getElementById('analyze-btn');

    if (startBtn) {
        console.log('Adicionando listener para start-btn');
        startBtn.addEventListener('click', captureData);
    } else {
        console.error('Elemento start-btn não encontrado');
    }

    if (analyzeBtn) {
        console.log('Adicionando listener para analyze-btn');
        analyzeBtn.addEventListener('click', analyzeWithAI);
    } else {
        console.error('Elemento analyze-btn não encontrado');
    }
}); 