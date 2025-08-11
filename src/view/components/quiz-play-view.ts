/**
 * QuizPlayView
 * 
 * Responsável por exibir e gerenciar a execução de um quiz.
 * Permite responder questões e acompanhar o progresso.
 * 
 * Elementos esperados no DOM:
 * - #quiz-play-screen: container principal da tela de execução do quiz
 */
export class QuizPlayView {
    /** Elemento principal da tela de execução do quiz */
    public element: HTMLElement;

    /**
     * @param onBack Função chamada ao voltar para a lista de quizzes
     * @param onSubmitAnswer Função chamada ao submeter uma resposta
     * @param onFinishQuiz Função chamada ao finalizar o quiz
     */
    constructor(
        onBack: () => void,
        onSubmitAnswer: (questaoId: string, resposta: 'A' | 'B' | 'C' | 'D') => void,
        onFinishQuiz: (score: number) => void
    ) {
        this.element = document.getElementById("quiz-play-screen")! as HTMLElement;
        
        this.element.innerHTML = `
            <div class="quiz-play-container">
                <header class="quiz-header">
                    <button id="quiz-back" class="back-btn">← Voltar</button>
                    <div class="quiz-progress">
                        <span id="question-number">Questão 1 de 5</span>
                        <div class="progress-bar">
                            <div id="progress-fill" class="progress-fill" style="width: 20%"></div>
                        </div>
                    </div>
                </header>
                
                <div class="quiz-content">
                    <div id="quiz-info" class="quiz-info">
                        <h2 id="quiz-title">Carregando quiz...</h2>
                    </div>
                    
                    <div id="question-container" class="question-container">
                        <div id="question-text" class="question-text">Carregando questão...</div>
                        
                        <div id="alternatives-container" class="alternatives-container">
                            <!-- Alternativas serão inseridas dinamicamente -->
                        </div>
                        
                        <div class="question-actions">
                            <button id="submit-answer" class="submit-btn" disabled>Responder</button>
                        </div>
                    </div>
                    
                    <div id="quiz-result" class="quiz-result hidden">
                        <h3>Quiz Finalizado!</h3>
                        <div id="final-score"></div>
                        <button id="back-to-quizzes" class="btn">Voltar aos Quizzes</button>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        const backBtn = this.element.querySelector('#quiz-back') as HTMLButtonElement;
        const submitBtn = this.element.querySelector('#submit-answer') as HTMLButtonElement;
        const backToQuizzesBtn = this.element.querySelector('#back-to-quizzes') as HTMLButtonElement;

        backBtn.addEventListener('click', onBack);
        backToQuizzesBtn.addEventListener('click', onBack);

        // Store callbacks
        this.onSubmitAnswer = onSubmitAnswer;
        this.onFinishQuiz = onFinishQuiz;

        // Setup submit button
        submitBtn.addEventListener('click', () => this.handleSubmitAnswer());
    }

    private onSubmitAnswer: (questaoId: string, resposta: 'A' | 'B' | 'C' | 'D') => void;
    private onFinishQuiz: (score: number) => void;
    private currentQuestionId: string = '';
    private selectedAnswer: 'A' | 'B' | 'C' | 'D' | null = null;

    /**
     * Inicia o quiz com as informações e primeira questão
     */
    public startQuiz(quiz: { titulo: string }, questoes: Array<{
        id: string;
        enunciado: string;
        alternativa_a: string;
        alternativa_b: string;
        alternativa_c: string;
        alternativa_d: string;
    }>) {
        const titleEl = this.element.querySelector('#quiz-title') as HTMLElement;
        titleEl.textContent = quiz.titulo;

        this.questoes = questoes;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.showCurrentQuestion();
    }

    private questoes: Array<{
        id: string;
        enunciado: string;
        alternativa_a: string;
        alternativa_b: string;
        alternativa_c: string;
        alternativa_d: string;
    }> = [];
    private currentQuestionIndex: number = 0;
    private score: number = 0;

    /**
     * Mostra a questão atual
     */
    private showCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questoes.length) {
            this.showFinalResult();
            return;
        }

        const questao = this.questoes[this.currentQuestionIndex];
        this.currentQuestionId = questao.id;
        this.selectedAnswer = null;

        // Atualiza progresso
        const questionNumberEl = this.element.querySelector('#question-number') as HTMLElement;
        const progressFillEl = this.element.querySelector('#progress-fill') as HTMLElement;
        
        questionNumberEl.textContent = `Questão ${this.currentQuestionIndex + 1} de ${this.questoes.length}`;
        progressFillEl.style.width = `${((this.currentQuestionIndex + 1) / this.questoes.length) * 100}%`;

        // Atualiza questão
        const questionTextEl = this.element.querySelector('#question-text') as HTMLElement;
        questionTextEl.textContent = questao.enunciado;

        // Atualiza alternativas
        const alternativesContainer = this.element.querySelector('#alternatives-container') as HTMLElement;
        alternativesContainer.innerHTML = `
            <label class="alternative">
                <input type="radio" name="answer" value="A">
                <span class="alternative-text">A) ${questao.alternativa_a}</span>
            </label>
            <label class="alternative">
                <input type="radio" name="answer" value="B">
                <span class="alternative-text">B) ${questao.alternativa_b}</span>
            </label>
            <label class="alternative">
                <input type="radio" name="answer" value="C">
                <span class="alternative-text">C) ${questao.alternativa_c}</span>
            </label>
            <label class="alternative">
                <input type="radio" name="answer" value="D">
                <span class="alternative-text">D) ${questao.alternativa_d}</span>
            </label>
        `;

        // Event listeners para alternativas
        const radioButtons = alternativesContainer.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                this.selectedAnswer = (radio as HTMLInputElement).value as 'A' | 'B' | 'C' | 'D';
                this.updateSubmitButton();
            });
        });

        this.updateSubmitButton();
    }

    /**
     * Atualiza o estado do botão de submissão
     */
    private updateSubmitButton() {
        const submitBtn = this.element.querySelector('#submit-answer') as HTMLButtonElement;
        submitBtn.disabled = !this.selectedAnswer;
    }

    /**
     * Manipula a submissão de resposta
     */
    private handleSubmitAnswer() {
        if (!this.selectedAnswer || !this.currentQuestionId) return;

        // Chama callback para salvar resposta
        this.onSubmitAnswer(this.currentQuestionId, this.selectedAnswer);

        // Avança para próxima questão
        this.currentQuestionIndex++;
        this.showCurrentQuestion();
    }

    /**
     * Mostra resultado final
     */
    private showFinalResult() {
        const questionContainer = this.element.querySelector('#question-container') as HTMLElement;
        const resultContainer = this.element.querySelector('#quiz-result') as HTMLElement;

        questionContainer.style.display = 'none';
        resultContainer.classList.remove('hidden');

        const finalScoreEl = this.element.querySelector('#final-score') as HTMLElement;
        const percentage = ((this.score / this.questoes.length) * 100).toFixed(1);
        
        finalScoreEl.innerHTML = `
            <p>Você acertou <strong>${this.score}</strong> de <strong>${this.questoes.length}</strong> questões.</p>
            <p>Sua pontuação: <strong>${percentage}%</strong></p>
        `;

        this.onFinishQuiz(this.score);
    }

    /**
     * Atualiza score quando resposta é processada
     */
    public updateScore(correct: boolean) {
        if (correct) {
            this.score++;
        }
    }
}
