// Mapeamento de modelos para valores da API
const MODEL_MAPPING = {
    'gpt-4': 'gpt-4',
    'gpt-4.1': 'gpt-4-1106-preview',
    'o4-mini': 'gpt-4-1106-preview',
    'o3': 'gpt-3.5-turbo-1106'
};

// Classe para gerenciar requisições à API da OpenAI
export class OpenAIService {
    constructor(apiKey, model = 'gpt-4') {
        this.apiKey = apiKey;
        this.model = MODEL_MAPPING[model] || model; // Usa o mapeamento ou o modelo original
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    }

    async sendMessage(messages) {
        try {
            // Log do que será enviado para a API
            console.log('Enviando para a API:', {
                model: this.model,
                messages
            });

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
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

            // Log da resposta da API
            console.log('Resposta da API:', data);

            return data.choices[0].message.content;
        } catch (error) {
            // Log do erro
            console.error('Erro ao enviar mensagem para OpenAI:', error);
            throw error;
        }
    }

    async generateContent(prompt, options = {}) {
        try {
            console.log(`Gerando conteúdo com OpenAI usando modelo ${this.model}...`);
            
            const response = await fetch(`${this.apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: options.temperature || 0.7,
                    max_tokens: options.max_tokens || 1000,
                    top_p: options.top_p || 1,
                    frequency_penalty: options.frequency_penalty || 0,
                    presence_penalty: options.presence_penalty || 0
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro na API da OpenAI: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            console.log('Resposta recebida da OpenAI:', data);

            if (!data.choices || !data.choices[0]?.message?.content) {
                throw new Error('Resposta inválida da OpenAI');
            }

            return {
                text: data.choices[0].message.content,
                usage: data.usage
            };

        } catch (error) {
            console.error('Erro ao gerar conteúdo com OpenAI:', error);
            throw error;
        }
    }
} 