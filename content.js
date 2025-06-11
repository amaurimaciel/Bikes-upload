// Reservado para uso futuro (preenchimento automático ou coleta de imagem)

// Configuração dos campos da bike
const BIKE_FIELDS_CONFIG = [
    { label: "Bike ID", type: "image_id" },
    { label: "Marca", type: "text", id: "brand" },
    { label: "Modelo", type: "text", id: "model" },
    { label: "Ano", type: "text", id: "year" },
    { label: "Tamanho do Quadro", type: "text", id: "frame_size" },
    { label: "Cor", type: "text", id: "color" },
    { label: "Preço", type: "text", id: "price" },
    { label: "Estado", type: "text", id: "condition" },
    { label: "Tipo de Bicicleta", type: "text", id: "bike_type" },
    { label: "Material do Quadro", type: "text", id: "frame_material" },
    { label: "Suspensão", type: "text", id: "suspension" },
    { label: "Número de Marchas", type: "text", id: "gears" },
    { label: "Tipo de Freio", type: "text", id: "brake_type" },
    { label: "Peso", type: "text", id: "weight" },
    { label: "Tamanho do Aro", type: "text", id: "wheel_size" },
    { label: "Tipo de Pneu", type: "text", id: "tire_type" },
    { label: "Tipo de Guidão", type: "text", id: "handlebar_type" },
    { label: "Tipo de Selim", type: "text", id: "saddle_type" },
    { label: "Tipo de Pedal", type: "text", id: "pedal_type" },
    { label: "Tipo de Câmbio", type: "text", id: "derailleur_type" },
    { label: "Tipo de Corrente", type: "text", id: "chain_type" },
    { label: "Tipo de Movimento Central", type: "text", id: "bottom_bracket_type" },
    { label: "Tipo de Garfo", type: "text", id: "fork_type" },
    { label: "Tipo de Caixa de Direção", type: "text", id: "headset_type" },
    { label: "Tipo de Mesa", type: "text", id: "stem_type" },
    { label: "Tipo de Canote", type: "text", id: "seatpost_type" }
];

// Lista de campos padrão
const CAMPOS_PADRAO = [
    { campo: "bikeId", id: "bikeId", tipo: "imagem" },
    { campo: "brand", id: "input-brand" },
    { campo: "model", id: "input-model" },
    { campo: "color", id: "headlessui-combobox-input-:ra:" },
    { campo: "category", id: "category" },
    { campo: "Frame Type", id: "input-frameType", opcoes: ["Closed", "Open"] },
    { campo: "Rack position", id: "input-rackPosition", opcoes: ["Front", "rear", "front and rear"] },
    { campo: "Rear rack max load", id: "input-Rear rack max load" },
    { campo: "year", id: "input-year" },
    { campo: "seatTube (cm)", id: "input-seatTube" },
    { campo: "size (manufacturer)", id: "input-size" },
    { campo: "minSize", id: "input-minSize" },
    { campo: "maxSize", id: "input-maxSize" },
    { campo: "Brakes", id: "headlessui-combobox-input-:r16:" },
    { campo: "tyreBrand", id: "input-tyreBrand" },
    { campo: "etrto", id: "input-etrto" },
    { campo: "wheelsSize", id: "input-wheelsSize" },
    { campo: "transmissionBrand", id: "input-transmissionBrand" },
    { campo: "transmissionModel", id: "input-transmissionModel" },
    { campo: "transmissionSpeed", id: "input-transmissionSpeed" },
    { campo: "Transmission system", id: "input-transmissionSystem" },
    { campo: "Drivetrain", id: "input-drivetrain" },
    { campo: "mileage", id: "input-mileage" },
    { campo: "engineBrand", id: "input-engineBrand" },
    { campo: "engineModel", id: "input-engineModel" },
    { campo: "engineLocation", id: "input-engineLocation" },
    { campo: "completedCycles", id: "input-completedCycles" },
    { campo: "Bosch Display Model", id: "headlessui-combobox-input-:ro8:" },
    { campo: "Bosch Remote Model", id: "headlessui-combobox-input-:roc:" },
    { campo: "batteryCapacity (Wh)", id: "input-batteryCapacity (Wh)" },
    { campo: "batteryVolts", id: "input-batteryVolts" },
    { campo: "Battery Location", id: "input-batteryLocation" },
    { campo: "Battery Removability", id: "headlessui-combobox-input-:r2t:" }
];

// Função para extrair Bike ID da URL da imagem
function extractBikeIdFromImageUrl(url) {
    try {
        // Procura por padrões como AMR12-1.jpg ou similar
        const match = url.match(/\/([A-Z0-9]+)-\d+\.jpg/);
        if (match && match[1]) {
            return match[1];
        }
        return 'N/A';
    } catch (error) {
        console.error('Erro ao extrair Bike ID:', error);
        return 'N/A';
    }
}

// Função para capturar dados
async function captureData() {
    console.log('Content script: Iniciando captura de dados...');
    try {
        // Capturar dados da página
        const data = {};
        
        // Primeiro, tentar capturar o Bike ID das imagens
        const images = Array.from(document.querySelectorAll('img[src]'));
        let bikeId = 'N/A';
        
        for (const img of images) {
            const src = img.src;
            if (src.includes('upway-public/images/bikes/')) {
                bikeId = extractBikeIdFromImageUrl(src);
                if (bikeId !== 'N/A') break;
            }
        }
        
        // Capturar cada campo da lista
        for (const campo of CAMPOS_PADRAO) {
            if (campo.campo === 'bikeId') {
                data[campo.campo] = bikeId;
            } else {
                const element = document.getElementById(campo.id);
                if (element) {
                    data[campo.campo] = element.value || element.textContent || 'N/A';
                } else {
                    console.log(`Elemento não encontrado para o campo ${campo.campo} (ID: ${campo.id})`);
                    data[campo.campo] = 'N/A';
                }
            }
        }

        console.log('Content script: Dados capturados:', data);

        // Converter para CSV
        const headers = CAMPOS_PADRAO.map(campo => campo.campo);
        const rows = [headers.map(campo => data[campo])];

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        console.log('Content script: CSV gerado:', csv);

        // Salvar no storage
        await chrome.storage.local.set({ 'bikeData': data });

        // Enviar mensagem para download
        chrome.runtime.sendMessage({
            action: 'downloadCSV',
            url: 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv),
            filename: `envio/${data.bikeId}_inicial.csv`
        });

        return { success: true, data };
    } catch (error) {
        console.error('Content script: Erro na captura:', error);
        return { success: false, error: error.message };
    }
}

// Função para obter dados do CSV
async function getCSVData() {
    console.log('Content script: Obtendo dados do CSV...');
    try {
        const { bikeData } = await chrome.storage.local.get('bikeData');
        if (!bikeData) {
            throw new Error('Nenhum dado encontrado. Capture os dados primeiro.');
        }

        const headers = CAMPOS_PADRAO.map(campo => campo.campo);
        const rows = [headers.map(campo => bikeData[campo])];

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        console.log('Content script: CSV gerado:', csv);
        return { success: true, data: csv };
    } catch (error) {
        console.error('Content script: Erro ao obter CSV:', error);
        return { success: false, error: error.message };
    }
}

// Função para obter links das imagens
async function getImageLinks() {
    console.log('Content script: Obtendo links das imagens...');
    try {
        const images = Array.from(document.querySelectorAll('img[src]'))
            .map(img => img.src)
            .filter(src => src.startsWith('http'));

        console.log('Content script: Links encontrados:', images);
        return { success: true, data: images };
    } catch (error) {
        console.error('Content script: Erro ao obter links:', error);
        return { success: false, error: error.message };
    }
}

// Listener para mensagens
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script: Mensagem recebida:', request);
    
    switch (request.action) {
        case 'ping':
            console.log('Content script: Ping recebido');
            sendResponse({ success: true });
            break;
        case 'captureData':
            captureData().then(sendResponse);
            break;
        case 'getCSVData':
            getCSVData().then(sendResponse);
            break;
        case 'getImageLinks':
            getImageLinks().then(sendResponse);
            break;
        default:
            console.error('Content script: Ação desconhecida:', request.action);
            sendResponse({ success: false, error: 'Ação desconhecida' });
    }
    
    return true; // Mantém a conexão aberta para resposta assíncrona
});

// Notificar que o content script está carregado
console.log('Content script carregado e pronto');
chrome.runtime.sendMessage({ action: 'contentScriptReady' });