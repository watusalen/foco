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
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <header class="flex items-center gap-4 mb-6">
        <button id="quiz-back"
          class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
          ← Voltar
        </button>

        <div class="flex-1">
          <div class="flex items-center justify-between text-sm text-gray-700">
            <span id="question-number">Questão 1 de 5</span>
          </div>
          <div class="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div id="progress-fill" class="h-2 bg-indigo-600 transition-all duration-300" style="width: 20%"></div>
          </div>
        </div>
      </header>

      <div class="quiz-content space-y-6">
        <div id="quiz-info" class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 id="quiz-title" class="text-lg font-semibold text-gray-900">Carregando quiz...</h2>
        </div>

        <div id="question-container" class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div id="question-text" class="text-gray-900 text-base mb-4">Carregando questão...</div>

          <div id="alternatives-container" class="space-y-2">
            <!-- Alternativas rendereizadas dinamicamente -->
          </div>

          <div class="mt-4">
            <button id="submit-answer" class="submit-btn inline-flex items-center justify-center rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 cursor-not-allowed" disabled>
              Responder
            </button>
          </div>
        </div>

        <div id="quiz-result" class="quiz-result hidden">
          <div class="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Quiz Finalizado!</h3>
            <div id="final-score" class="text-sm text-gray-700"></div>
            <button id="back-to-quizzes"
              class="mt-4 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Voltar aos Quizzes
            </button>
          </div>
        </div>
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
  ${['A', 'B', 'C', 'D'].map((letra, i) => {
            const texto = (letra === 'A' ? questao.alternativa_a :
                letra === 'B' ? questao.alternativa_b :
                    letra === 'C' ? questao.alternativa_c : questao.alternativa_d);
            return `
      <label class="alternative flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50">
        <input type="radio" name="answer" value="${letra}" class="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
        <span class="alternative-text text-sm text-gray-800"><strong>${letra})</strong> ${texto}</span>
      </label>
    `;
        }).join('')}
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
        const enabled = !!this.selectedAnswer;
        submitBtn.disabled = !enabled;

        submitBtn.className = enabled
            ? 'submit-btn inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700'
            : 'submit-btn inline-flex items-center justify-center rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 cursor-not-allowed';
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

        questionContainer.classList.add('hidden');
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
