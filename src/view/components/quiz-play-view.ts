/**
 * QuizPlayView
 *
 * Execução de quiz com paleta violet, header consistente e UX polida
 */
export class QuizPlayView {
  public element: HTMLElement;

  private onSubmitAnswer: (questaoId: string, resposta: 'A' | 'B' | 'C' | 'D') => void;
  private onFinishQuiz: (score: number) => void;
  private currentQuestionId: string = '';
  private selectedAnswer: 'A' | 'B' | 'C' | 'D' | null = null;

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

  // Ícones
  private readonly icons = {
    back: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M10.5 19.5L3 12l7.5-7.5M3 12h18"></path>
</svg>`.trim(),
  };

  constructor(
    onBack: () => void,
    onSubmitAnswer: (questaoId: string, resposta: 'A' | 'B' | 'C' | 'D') => void,
    onFinishQuiz: (score: number) => void
  ) {
    this.element = document.getElementById("quiz-play-screen")! as HTMLElement;

    this.element.innerHTML = `
  <div class="min-h-screen bg-gradient-to-b from-white to-violet-50/40">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <!-- Header consistente -->
      <header class="mb-6 grid grid-cols-[auto_1fr] items-center gap-4">
        <button id="quiz-back"
          class="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300">
          ${this.icons.back}<span>Voltar</span>
        </button>

        <div class="flex items-center gap-4">
          <div class="flex-1">
            <div class="flex items-center justify-between text-sm text-gray-700">
              <span id="question-number">Questão 1 de 5</span>
            </div>
            <div class="mt-2 h-2 w-full rounded-full bg-violet-100 overflow-hidden" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="20">
              <div id="progress-fill" class="h-2 bg-violet-600 transition-all duration-300" style="width: 20%"></div>
            </div>
          </div>
        </div>
      </header>

      <div class="quiz-content space-y-6">
        <!-- Info do quiz -->
        <div id="quiz-info" class="rounded-xl border border-violet-200 bg-white p-5 shadow-sm">
          <h2 id="quiz-title" class="text-lg font-semibold text-gray-900">Carregando quiz...</h2>
        </div>

        <!-- Questão -->
        <div id="question-container" class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div id="question-text" class="text-gray-900 text-base mb-4">Carregando questão...</div>

          <div id="alternatives-container" class="space-y-2">
            <!-- Alternativas injetadas -->
          </div>

          <div class="mt-4">
            <button id="submit-answer"
              class="submit-btn inline-flex items-center justify-center rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 cursor-not-allowed"
              disabled>
              Responder
            </button>
          </div>
        </div>

        <!-- Resultado final -->
        <div id="quiz-result" class="quiz-result hidden">
          <div class="rounded-xl border border-violet-200 bg-white p-6 text-center shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Quiz finalizado!</h3>
            <div id="final-score" class="text-sm text-gray-700"></div>
            <button id="back-to-quizzes"
              class="mt-4 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Voltar aos Quizzes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

    // Listeners base
    (this.element.querySelector('#quiz-back') as HTMLButtonElement).addEventListener('click', onBack);
    (this.element.querySelector('#back-to-quizzes') as HTMLButtonElement).addEventListener('click', onBack);

    // Store callbacks
    this.onSubmitAnswer = onSubmitAnswer;
    this.onFinishQuiz = onFinishQuiz;

    // Submit
    (this.element.querySelector('#submit-answer') as HTMLButtonElement)
      .addEventListener('click', () => this.handleSubmitAnswer());
  }

  /** Inicia o quiz com as informações e primeira questão */
  public startQuiz(
    quiz: { titulo: string },
    questoes: Array<{
      id: string;
      enunciado: string;
      alternativa_a: string;
      alternativa_b: string;
      alternativa_c: string;
      alternativa_d: string;
    }>
  ) {
    // Reset de estado visual
    const questionContainer = this.element.querySelector('#question-container') as HTMLElement;
    const resultContainer = this.element.querySelector('#quiz-result') as HTMLElement;
    questionContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');

    (this.element.querySelector('#quiz-title') as HTMLElement).textContent = quiz.titulo;

    this.questoes = questoes;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.showCurrentQuestion();
  }

  /** Mostra a questão atual */
  private showCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questoes.length) {
      this.showFinalResult();
      return;
    }

    const questao = this.questoes[this.currentQuestionIndex];
    this.currentQuestionId = questao.id;
    this.selectedAnswer = null;

    // Progresso
    const total = this.questoes.length;
    const now = Math.round(((this.currentQuestionIndex + 1) / total) * 100);
    const questionNumberEl = this.element.querySelector('#question-number') as HTMLElement;
    const progressFillEl = this.element.querySelector('#progress-fill') as HTMLElement;
    const progressBar = progressFillEl.parentElement as HTMLElement;

    questionNumberEl.textContent = `Questão ${this.currentQuestionIndex + 1} de ${total}`;
    progressFillEl.style.width = `${now}%`;
    progressBar.setAttribute('aria-valuenow', String(now));

    // Enunciado
    (this.element.querySelector('#question-text') as HTMLElement).textContent = questao.enunciado;

    // Alternativas
    const alternativesContainer = this.element.querySelector('#alternatives-container') as HTMLElement;
    alternativesContainer.innerHTML = `
      ${(['A','B','C','D'] as const).map((letra) => {
        const texto =
          letra === 'A' ? questao.alternativa_a :
          letra === 'B' ? questao.alternativa_b :
          letra === 'C' ? questao.alternativa_c :
                          questao.alternativa_d;
        return `
<label class="alternative group flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:bg-violet-50 cursor-pointer transition">
  <input type="radio" name="answer" value="${letra}"
         class="peer mt-1 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
  <span class="alternative-text text-sm text-gray-800">
    <strong>${letra})</strong> ${texto}
  </span>
</label>`;
      }).join('')}
    `;

    // Listeners das alternativas + highlight
    const radios = alternativesContainer.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        this.selectedAnswer = radio.value as 'A' | 'B' | 'C' | 'D';
        // highlight visual
        alternativesContainer.querySelectorAll('.alternative').forEach(el => {
          el.classList.remove('ring-2','ring-violet-400','border-violet-300','bg-violet-50');
        });
        const label = radio.closest('.alternative') as HTMLElement;
        if (label) label.classList.add('ring-2','ring-violet-400','border-violet-300','bg-violet-50');
        this.updateSubmitButton();
      });
    });

    // Botão “Responder/Finalizar”
    this.updateSubmitButton();
    this.updateSubmitCta();
  }

  /** Atualiza o texto do botão (Finalizar na última questão) */
  private updateSubmitCta() {
    const submitBtn = this.element.querySelector('#submit-answer') as HTMLButtonElement;
    const isLast = this.currentQuestionIndex === this.questoes.length - 1;
    submitBtn.textContent = isLast ? 'Finalizar' : 'Responder';
  }

  /** Habilita/desabilita o botão de envio */
  private updateSubmitButton() {
    const submitBtn = this.element.querySelector('#submit-answer') as HTMLButtonElement;
    const enabled = !!this.selectedAnswer;
    submitBtn.disabled = !enabled;
    submitBtn.className = enabled
      ? 'submit-btn inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700'
      : 'submit-btn inline-flex items-center justify-center rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 cursor-not-allowed';
  }

  /** Envia resposta e avança */
  private handleSubmitAnswer() {
    if (!this.selectedAnswer || !this.currentQuestionId) return;
    // salva resposta
    this.onSubmitAnswer(this.currentQuestionId, this.selectedAnswer);
    // próxima
    this.currentQuestionIndex++;
    this.showCurrentQuestion();
  }

  /** Mostra o resultado final */
  private showFinalResult() {
    const questionContainer = this.element.querySelector('#question-container') as HTMLElement;
    const resultContainer = this.element.querySelector('#quiz-result') as HTMLElement;
    questionContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    const finalScoreEl = this.element.querySelector('#final-score') as HTMLElement;
    const total = this.questoes.length || 1;
    const percentage = ((this.score / total) * 100).toFixed(1);

    finalScoreEl.innerHTML = `
      <p>Você acertou <strong>${this.score}</strong> de <strong>${total}</strong> questões.</p>
      <p class="mt-1">Sua pontuação: <strong>${percentage}%</strong></p>
    `;

    this.onFinishQuiz(this.score);
  }

  /** Atualiza o score quando a resposta é processada pelo controlador */
  public updateScore(correct: boolean) {
    if (correct) this.score++;
  }
}
