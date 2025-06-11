// Configuração padrão
const DEFAULT_CONFIG = {
    apiKey: '',
    model: 'gpt-3.5-turbo',
    defaultPrompt: JSON.stringify([
        {
            role: "system",
            content: "Você é um especialista técnico em catalogação de bicicletas. Sua tarefa é analisar os dados fornecidos e gerar um relatório detalhado sobre a bicicleta, incluindo suas especificações técnicas, estado de conservação e valor de mercado. Use o formato CSV para apresentar suas conclusões."
        },
        {
            role: "user",
            content: "Por favor, analise os dados da bicicleta fornecidos e gere um relatório detalhado. Inclua:\n\n1. Especificações técnicas\n2. Estado de conservação\n3. Valor de mercado\n4. Observações relevantes\n\nUse o formato CSV para apresentar suas conclusões."
        }
    ], null, 2)
};

// Classe para gerenciar configurações
class ConfigManager {
    static async loadConfig() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['apiKey', 'model', 'defaultPrompt'], (result) => {
                resolve({
                    apiKey: result.apiKey || DEFAULT_CONFIG.apiKey,
                    model: result.model || DEFAULT_CONFIG.model,
                    defaultPrompt: result.defaultPrompt || DEFAULT_CONFIG.defaultPrompt
                });
            });
        });
    }

    static async saveConfig(config) {
        return new Promise((resolve) => {
            chrome.storage.local.set(config, () => {
                resolve();
            });
        });
    }

    static async resetConfig() {
        return new Promise((resolve) => {
            chrome.storage.local.set(DEFAULT_CONFIG, () => {
                resolve();
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.sendMessage({ tipo: "config_get" }, (res) => {
    document.getElementById("apiKey").value = res.openaiKey || "";
    document.getElementById("prompt").value = res.promptPadrao || "";
    document.getElementById("modelo").value = res.modelo || "gpt-4o";
  });

  document.getElementById("salvar").onclick = () => {
    const payload = {
      openaiKey: document.getElementById("apiKey").value,
      promptPadrao: document.getElementById("prompt").value,
      modelo: document.getElementById("modelo").value
    };
    chrome.runtime.sendMessage({ tipo: "config_set", payload }, (res) => {
      alert("✅ Configurações salvas!");
    });
  };
});