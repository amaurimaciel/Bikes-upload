// Função para capturar dados
export async function captureData() {
    try {
        // Coletar dados do formulário
        const formData = {};
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.id && input.value) {
                formData[input.id] = input.value;
            }
        });

        // Coletar links das imagens
        const imageLinks = Array.from(document.querySelectorAll('img'))
            .map(img => img.src)
            .filter(src => src && src.startsWith('http'));

        // Coletar links dos documentos
        const documentLinks = Array.from(document.querySelectorAll('a'))
            .map(a => a.href)
            .filter(href => href && href.startsWith('http'));

        // Extrair ID da bike da URL
        const bikeId = window.location.pathname.split('/').pop();

        // Criar objeto com todos os dados
        const collectedData = {
            bikeId,
            formData,
            imageLinks,
            documentLinks,
            url: window.location.href
        };

        // Log dos dados coletados
        console.log('Dados coletados:', collectedData);

        // Converter para CSV
        const csvRows = [];
        
        // Adicionar cabeçalho
        const headers = ['Campo', 'Valor'];
        csvRows.push(headers.join(','));
        
        // Adicionar dados do formulário
        Object.entries(formData).forEach(([key, value]) => {
            csvRows.push(`${key},${value}`);
        });
        
        // Adicionar links das imagens
        imageLinks.forEach(link => {
            csvRows.push(`image,${link}`);
        });
        
        // Adicionar links dos documentos
        documentLinks.forEach(link => {
            csvRows.push(`document,${link}`);
        });
        
        // Adicionar URL
        csvRows.push(`url,${window.location.href}`);
        
        const csvContent = csvRows.join('\n');

        // Salvar dados no localStorage
        await chrome.storage.local.set({ 
            [`bike_${bikeId}`]: collectedData,
            [`csv_${bikeId}`]: csvContent
        });

        // Criar blob do CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        // Enviar mensagem para download
        chrome.runtime.sendMessage({
            action: 'downloadCSV',
            url: url,
            filename: `envio/${bikeId}_inicial.csv`
        });

        return { success: true, data: collectedData };
    } catch (error) {
        console.error('Erro na captura:', error);
        return { success: false, error: error.message };
    }
}

// Função para obter dados do CSV
export async function getCSVData() {
    try {
        const bikeId = window.location.pathname.split('/').pop();
        const result = await chrome.storage.local.get([`csv_${bikeId}`]);
        const csvData = result[`csv_${bikeId}`];
        
        if (!csvData) {
            throw new Error('Dados não encontrados');
        }
        
        return { success: true, data: csvData };
    } catch (error) {
        console.error('Erro ao obter CSV:', error);
        return { success: false, error: error.message };
    }
}

// Função para obter links das imagens
export async function getImageLinks() {
    try {
        const bikeId = window.location.pathname.split('/').pop();
        const result = await chrome.storage.local.get([`bike_${bikeId}`]);
        const bikeData = result[`bike_${bikeId}`];
        
        if (!bikeData) {
            throw new Error('Dados não encontrados');
        }
        
        return { 
            success: true, 
            links: [...bikeData.imageLinks, ...bikeData.documentLinks] 
        };
    } catch (error) {
        console.error('Erro ao obter links:', error);
        return { success: false, error: error.message };
    }
} 