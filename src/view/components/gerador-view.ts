/**
 * GeradorView
 * 
 * Responsável por exibir e gerenciar a tela do gerador de conteúdo.
 * Permite gerar questões e conteúdo usando IA.
 * 
 * Elementos esperados no DOM:
 * - #gerador-screen: container principal da tela do gerador
 */
export class GeradorView {
    /** Elemento principal da tela do gerador */
    public element: HTMLElement;
    private onQuizGenerated: () => void;

    /**
     * @param onBack Função chamada ao voltar para o dashboard
     * @param onGenerate Função chamada ao gerar conteúdo
     * @param onQuizGenerated Função chamada quando quiz é gerado (redireciona para quizzes)
     */
    constructor(
        onBack: () => void,
        onGenerate: (prompt: string, tipo: string) => void,
        onQuizGenerated: () => void
    ) {
        this.element = document.getElementById("gerador-screen")! as HTMLElement;
        
        this.element.innerHTML = `
            <div class="gerador-container">
                <header class="page-header">
                    <button id="gerador-back" class="back-btn">← Voltar</button>
                    <h2>Gerador de Conteúdo</h2>
                </header>
                
                <div class="gerador-form">
                    <div class="input-group">
                        <label for="gerador-tipo">Tipo de conteúdo:</label>
                        <select id="gerador-tipo">
                            <option value="quiz">Questões de Quiz</option>
                            <option value="texto">Texto/Resumo</option>
                        </select>
                    </div>
                    
                    <div class="input-group">
                        <label for="gerador-prompt">Prompt/Tema:</label>
                        <textarea id="gerador-prompt" 
                                  placeholder="Descreva o que você quer gerar..."
                                  rows="4"></textarea>
                    </div>
                    
                    <div id="gerador-error" class="error-msg" style="display:none"></div>
                    
                    <button id="gerador-submit" class="generate-btn">🤖 Gerar Conteúdo</button>
                </div>
                
                <div id="gerador-result" class="gerador-result" style="display:none">
                    <h3>Resultado:</h3>
                    <div id="gerador-output"></div>
                </div>
            </div>
        `;

        // Event listeners
        const backBtn = this.element.querySelector('#gerador-back') as HTMLButtonElement;
        const submitBtn = this.element.querySelector('#gerador-submit') as HTMLButtonElement;
        
        backBtn.addEventListener('click', onBack);
        
        submitBtn.addEventListener('click', () => {
            this.clearError();
            
            const tipo = (this.element.querySelector('#gerador-tipo') as HTMLSelectElement).value;
            const prompt = (this.element.querySelector('#gerador-prompt') as HTMLTextAreaElement).value.trim();
            
            if (!prompt) {
                this.setError("Por favor, informe o prompt/tema.");
                return;
            }
            
            this.setLoading(true);
            onGenerate(prompt, tipo);
        });

        // Store callback for quiz redirection
        this.onQuizGenerated = onQuizGenerated;
    }

    public setError(msg: string) {
        const errorEl = this.element.querySelector('#gerador-error') as HTMLElement;
        errorEl.textContent = msg;
        errorEl.style.display = '';
    }

    public clearError() {
        const errorEl = this.element.querySelector('#gerador-error') as HTMLElement;
        errorEl.style.display = 'none';
    }

    public setLoading(loading: boolean) {
        const submitBtn = this.element.querySelector('#gerador-submit') as HTMLButtonElement;
        submitBtn.disabled = loading;
        submitBtn.textContent = loading ? '⏳ Gerando...' : '🤖 Gerar Conteúdo';
    }

    public showResult(content: string) {
        const resultEl = this.element.querySelector('#gerador-result') as HTMLElement;
        const outputEl = this.element.querySelector('#gerador-output') as HTMLElement;
        
        outputEl.innerHTML = content;
        resultEl.style.display = '';
        this.setLoading(false);
    }

    public showQuizGenerated(quizTitle: string) {
        const resultEl = this.element.querySelector('#gerador-result') as HTMLElement;
        const outputEl = this.element.querySelector('#gerador-output') as HTMLElement;
        
        outputEl.innerHTML = `
            <div class="quiz-generated-notice">
                <h4>✅ Quiz Gerado com Sucesso!</h4>
                <p><strong>Título:</strong> ${quizTitle}</p>
                <p>O quiz foi criado e está disponível na seção de Quizzes.</p>
                <button id="go-to-quizzes" class="btn">Ir para Quizzes</button>
            </div>
        `;
        
        resultEl.style.display = '';
        this.setLoading(false);

        // Add event listener for quiz navigation
        const goBtn = outputEl.querySelector('#go-to-quizzes') as HTMLButtonElement;
        goBtn.addEventListener('click', () => {
            this.onQuizGenerated();
        });
    }
}
