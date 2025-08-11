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
    private onCronogramaGenerated: () => void;

    /**
     * @param onBack Função chamada ao voltar para o dashboard
     * @param onGenerate Função chamada ao gerar conteúdo
     * @param onQuizGenerated Função chamada quando quiz é gerado (redireciona para quizzes)
     * @param onCronogramaGenerated Função chamada quando cronograma é gerado (redireciona para cronogramas)
     */
    constructor(
        onBack: () => void,
        onGenerate: (prompt: string, tipo: string) => void,
        onQuizGenerated: () => void,
        onCronogramaGenerated: () => void
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
                            <option value="cronograma">Cronograma de Estudos</option>
                        </select>
                    </div>
                    
                    <div class="input-group">
                        <label for="gerador-prompt">Prompt/Tema:</label>
                        <textarea id="gerador-prompt" 
                                  placeholder="Descreva o que você quer gerar..."
                                  rows="4"></textarea>
                        <div class="prompt-examples" id="prompt-examples">
                            <small><strong>Exemplos:</strong></small>
                            <ul id="examples-list">
                                <li>Questões sobre programação em JavaScript</li>
                                <li>Resumo sobre inteligência artificial</li>
                            </ul>
                        </div>
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
        const tipoSelect = this.element.querySelector('#gerador-tipo') as HTMLSelectElement;
        
        backBtn.addEventListener('click', onBack);
        
        // Atualiza exemplos baseado no tipo selecionado
        tipoSelect.addEventListener('change', () => {
            this.updateExamples(tipoSelect.value);
        });
        
        submitBtn.addEventListener('click', () => {
            this.clearError();
            
            const tipo = tipoSelect.value;
            const prompt = (this.element.querySelector('#gerador-prompt') as HTMLTextAreaElement).value.trim();
            
            if (!prompt) {
                this.setError("Por favor, informe o prompt/tema.");
                return;
            }
            
            this.setLoading(true);
            onGenerate(prompt, tipo);
        });

        // Store callbacks
        this.onQuizGenerated = onQuizGenerated;
        this.onCronogramaGenerated = onCronogramaGenerated;
        
        // Initialize examples
        this.updateExamples('quiz');
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

    private updateExamples(tipo: string) {
        const examplesList = this.element.querySelector('#examples-list') as HTMLElement;
        
        const examples = {
            quiz: [
                'Digite o tema do seu quiz',
                'Exemplo: "Programação JavaScript"',
                'Exemplo: "História do Brasil"'
            ],
            texto: [
                'Digite o assunto para seu texto',
                'Exemplo: "Inteligência artificial"',
                'Exemplo: "Fotossíntese"'
            ],
            cronograma: [
                'Digite seu objetivo de estudo',
                'Exemplo: "Aprender React"',
                'Exemplo: "Estudar para concurso"'
            ]
        };

        examplesList.innerHTML = examples[tipo as keyof typeof examples]
            .map(example => `<li>${example}</li>`)
            .join('');
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
            <div class="generation-success">
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

    public showTextoGenerated(textoTitle: string, onGoToTextos: () => void) {
        const resultEl = this.element.querySelector('#gerador-result') as HTMLElement;
        const outputEl = this.element.querySelector('#gerador-output') as HTMLElement;
        
        outputEl.innerHTML = `
            <div class="generation-success">
                <h4>✅ Texto Gerado com Sucesso!</h4>
                <p><strong>Título:</strong> ${textoTitle}</p>
                <p>O texto foi criado e está disponível na seção de Textos.</p>
                <button id="go-to-textos" class="btn">Ver Texto</button>
            </div>
        `;
        
        resultEl.style.display = '';
        this.setLoading(false);

        // Add event listener for texto navigation
        const goBtn = outputEl.querySelector('#go-to-textos') as HTMLButtonElement;
        goBtn.addEventListener('click', () => {
            onGoToTextos();
        });
    }

    public showCronogramaGenerated(cronogramaTitle: string, atividadesCount: number) {
        const resultEl = this.element.querySelector('#gerador-result') as HTMLElement;
        const outputEl = this.element.querySelector('#gerador-output') as HTMLElement;
        
        outputEl.innerHTML = `
            <div class="generation-success">
                <h4>✅ Cronograma Gerado com Sucesso!</h4>
                <p><strong>Título:</strong> ${cronogramaTitle}</p>
                <p><strong>Atividades criadas:</strong> ${atividadesCount}</p>
                <p>O cronograma completo foi criado e está disponível na seção de Cronogramas.</p>
                <button id="go-to-cronogramas" class="btn">Ver Cronograma</button>
            </div>
        `;
        
        resultEl.style.display = '';
        this.setLoading(false);

        // Add event listener for cronograma navigation
        const goBtn = outputEl.querySelector('#go-to-cronogramas') as HTMLButtonElement;
        goBtn.addEventListener('click', () => {
            this.onCronogramaGenerated();
        });
    }

    /**
     * Pré-seleciona o tipo de conteúdo
     */
    public preSelectType(tipo: 'quiz' | 'texto' | 'cronograma') {
        const selectElement = this.element.querySelector('#gerador-tipo') as HTMLSelectElement;
        if (selectElement) {
            selectElement.value = tipo;
            this.updateExamples(tipo);
        }
    }

    /**
     * Limpa o formulário
     */
    public clearForm() {
        const promptInput = this.element.querySelector('#gerador-prompt') as HTMLTextAreaElement;
        const resultEl = this.element.querySelector('#gerador-result') as HTMLElement;
        
        if (promptInput) promptInput.value = '';
        if (resultEl) resultEl.style.display = 'none';
        this.setLoading(false);
    }
}
