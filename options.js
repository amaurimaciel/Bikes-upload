// Configurações padrão
const DEFAULT_CONFIG = {
    openaiApiKey: '',
    model: 'gpt-4',
    prompt: `Você é um especialista técnico em catalogação de bicicletas. Sua função é atuar como um agente de análise investigativa, combinando múltiplas fontes de informação — CSV, imagens, documentos e pesquisa na internet — para extrair e sugerir os melhores dados possíveis. Você deve aplicar OCR, interpretação de imagem, análise de contexto e buscar em fontes públicas para garantir que a sugestão final seja a mais confiável, e não apenas repetir o que está no HTML ou documentos.

Estou enviando a seguir:

- O CSV de uma página de uma bicicleta específica no sistema interno da empresa.
- Fotos e documentos anexos relacionados à bicicleta (como fotos do quadro, da nota fiscal, adesivos de identificação, etiquetas, manuais).
- O nome da marca, modelo ou qualquer outro dado disponível visível na página ou documentos (mesmo que incompleto).

Sua tarefa é:

1. **Ignorar dados que estejam incompletos ou possivelmente incorretos no HTML**. Use-os apenas como ponto de partida.

2. **Analisar cuidadosamente todos os documentos e imagens**, utilizando OCR e interpretação de imagem para extrair dados visuais, como número de série, logotipo da marca, tipo de freio, suspensão, ano de fabricação, etc.

3. **Pesquisar na internet** (fontes confiáveis como sites oficiais de fabricantes, catálogos de bike, fóruns técnicos, comparadores, vídeos de análise) para validar ou complementar os dados. Caso identifique divergência entre a imagem/documento e o CSV, **priorize a evidência mais confiável.**

4. Gerar um CSV com as seguintes colunas:
   - **Campo**: Nome do campo de entrada no sistema da empresa (ex: Marca, Modelo, Ano, Tipo de Quadro...).
   - **Confiança (%)**: Quão certo você está da sugestão feita.
   - **Sugestão**: O valor que você considera mais adequado para preencher.
   - **Fonte Primária**: Onde você encontrou essa informação (ex: "Imagem do Quadro", "Nota Fiscal", "Bikepedia.com", "manual oficial").
   - **Observações**: Detalhes como links de onde buscou, inconsistência entre fontes, dúvidas sobre a leitura da imagem, ou qualquer contexto relevante.

5. Caso a confiança em algum dado seja inferior a 60%, **não preencha o valor da sugestão** e explique o motivo nas observações.

6. O formato de saída deve ser **um CSV estruturado, claro e completo**, para ser exibido ao usuário e opcionalmente preenchido automaticamente no sistema da empresa.

Aqui estão os dados:

Dados do CSV:
{csvData}

Links das imagens:
{imageLinks}

A resposta deve ser APENAS um CSV na configuração exposta aqui.`
};

// Mapeamento de modelos para valores da API
const MODEL_MAPPING = {
    'gpt-4': 'gpt-4',
    'gpt-4.1': 'gpt-4-1106-preview',
    'o4-mini': 'gpt-4-1106-preview',
    'o3': 'gpt-3.5-turbo-1106'
};

// Elementos do DOM
const apiKeyInput = document.getElementById('api-key');
const modelSelect = document.getElementById('model');
const promptTextarea = document.getElementById('prompt');
const saveButton = document.getElementById('save-btn');
const resetButton = document.getElementById('reset-btn');
const statusDiv = document.getElementById('status');

// Função para mostrar mensagem de status
function showStatus(message, type) {
    console.log(`Status: ${message} (${type})`);
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    setTimeout(() => {
        statusDiv.className = 'status';
    }, 3000);
}

// Carregar configurações salvas
async function loadConfig() {
    console.log('Carregando configurações...');
    try {
        const result = await chrome.storage.local.get(['openaiApiKey', 'model', 'prompt']);
        console.log('Configurações carregadas:', result);

        apiKeyInput.value = result.openaiApiKey || DEFAULT_CONFIG.openaiApiKey;
        modelSelect.value = result.model || DEFAULT_CONFIG.model;
        promptTextarea.value = result.prompt || DEFAULT_CONFIG.prompt;

        showStatus('Configurações carregadas com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        showStatus('Erro ao carregar configurações!', 'error');
    }
}

// Salvar configurações
async function saveConfig() {
    console.log('Salvando configurações...');
    try {
        const config = {
            openaiApiKey: apiKeyInput.value,
            model: modelSelect.value,
            prompt: promptTextarea.value
        };

        console.log('Configurações a serem salvas:', config);

        // Validar modelo
        if (!MODEL_MAPPING[config.model]) {
            showStatus('Modelo inválido selecionado!', 'error');
            return;
        }

        // Validar API key
        if (!config.openaiApiKey) {
            showStatus('API key não pode estar vazia!', 'error');
            return;
        }

        // Validar prompt
        if (!config.prompt) {
            showStatus('Prompt não pode estar vazio!', 'error');
            return;
        }

        await chrome.storage.local.set(config);
        console.log('Configurações salvas com sucesso!');
        showStatus('Configurações salvas com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        showStatus('Erro ao salvar configurações!', 'error');
    }
}

// Restaurar configurações padrão
async function resetConfig() {
    console.log('Restaurando configurações padrão...');
    try {
        apiKeyInput.value = DEFAULT_CONFIG.openaiApiKey;
        modelSelect.value = DEFAULT_CONFIG.model;
        promptTextarea.value = DEFAULT_CONFIG.prompt;
        
        await chrome.storage.local.set(DEFAULT_CONFIG);
        console.log('Configurações restauradas com sucesso!');
        showStatus('Configurações restauradas para o padrão!', 'success');
    } catch (error) {
        console.error('Erro ao restaurar configurações:', error);
        showStatus('Erro ao restaurar configurações!', 'error');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando...');
    loadConfig();
    
    saveButton.addEventListener('click', () => {
        console.log('Botão salvar clicado');
        saveConfig();
    });
    
    resetButton.addEventListener('click', () => {
        console.log('Botão reset clicado');
        resetConfig();
    });
}); 