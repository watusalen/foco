/**
 * QuizPlayView
 * 
 * Responsável pela interface e interação para execução de um quiz.
 * Apresenta perguntas, alternativas, progresso e resultado final.
 * Usa paleta violet, header consistente e UX polida.
 */
export class QuizPlayView {
  /** Elemento principal da tela do quiz */
  public element: HTMLElement;

  /** Callback acionado ao enviar resposta (id da questão + alternativa) */
  private onSubmitAnswer: (questaoId: string, resposta: 'A' | 'B' | 'C' | 'D') => void;

  /** Callback acionado ao finalizar o quiz, enviando o score final */
  private onFinishQuiz: (score: number) => void;

  /** ID da questão atual */
  private currentQuestionId: string = '';

  /** Alternativa selecionada pelo usuário */
  private selectedAnswer: 'A' | 'B' | 'C' | 'D' | null = null;

  /** Array com as questões do quiz */
  private questoes: Array<{
    id: string;
    enunciado: string;
    alternativa_a: string;
    alternativa_b: string;
    alternativa_c: string;
    alternativa_d: string;
  }> = [];

  /** Índice da questão atual no array */
  private currentQuestionIndex: number = 0;

  /** Pontuação acumulada do usuário */
  private score: number = 0;

  /** Ícones SVG utilizados na interface */
  private readonly icons = {
    back: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M10.5 19.5L3 12l7.5-7.5M3 12h18"></path>
</svg>`.trim(),
  };

  /**
   * Construtor da view, monta o HTML e configura eventos.
   * @param onBack Função chamada ao clicar em voltar
   * @param onSubmitAnswer Função chamada ao enviar uma resposta (id da questão, alternativa)
   * @param onFinishQuiz Função chamada ao finalizar o quiz, com o score
   */
  constructor(
    onBack: () => void,
    onSubmitAnswer: (questaoId: string, resposta: 'A' | 'B' | 'C' | 'D') => void,
    onFinishQuiz: (score: number) => void
  ) {
    this.element = document.getElementById("quiz-play-screen")! as HTMLElement;

    // Monta o layout HTML da tela de quiz
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

    // Eventos de navegação voltar
    (this.element.querySelector('#quiz-back') as HTMLButtonElement).addEventListener('click', onBack);
    (this.element.querySelector('#back-to-quizzes') as HTMLButtonElement).addEventListener('click', onBack);

    // Armazena callbacks para uso posterior
    this.onSubmitAnswer = onSubmitAnswer;
    this.onFinishQuiz = onFinishQuiz;

    // Evento do botão responder
    (this.element.querySelector('#submit-answer') as HTMLButtonElement)
      .addEventListener('click', () => this.handleSubmitAnswer());
  }

  /**
   * Inicializa o quiz com título e lista de questões.
   * Reseta o estado visual e mostra a primeira questão.
   * @param quiz Objeto com título do quiz
   * @param questoes Lista de questões com alternativas
   */
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
    // Reset visual
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

  /**
   * Exibe a questão atual com enunciado, alternativas e progresso.
   * Se o quiz terminou, exibe o resultado final.
   */
  private showCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questoes.length) {
      this.showFinalResult();
      return;
    }

    const questao = this.questoes[this.currentQuestionIndex];
    this.currentQuestionId = questao.id;
    this.selectedAnswer = null;

    // Atualiza progresso visual
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

    // Configura listeners para seleção e highlight das alternativas
    const radios = alternativesContainer.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        this.selectedAnswer = radio.value as 'A' | 'B' | 'C' | 'D';
        // Remove destaque antigo
        alternativesContainer.querySelectorAll('.alternative').forEach(el => {
          el.classList.remove('ring-2','ring-violet-400','border-violet-300','bg-violet-50');
        });
        // Destaca alternativa selecionada
        const label = radio.closest('.alternative') as HTMLElement;
        if (label) label.classList.add('ring-2','ring-violet-400','border-violet-300','bg-violet-50');
        this.updateSubmitButton();
      });
    });

    this.updateSubmitButton();
    this.updateSubmitCta();
  }

  /** Atualiza o texto do botão enviar para "Finalizar" na última questão */
  private updateSubmitCta() {
    const submitBtn = this.element.querySelector('#submit-answer') as HTMLButtonElement;
    const isLast = this.currentQuestionIndex === this.questoes.length - 1;
    submitBtn.textContent = isLast ? 'Finalizar' : 'Responder';
  }

  /** Habilita ou desabilita o botão enviar com base na seleção */
  private updateSubmitButton() {
    const submitBtn = this.element.querySelector('#submit-answer') as HTMLButtonElement;
    const enabled = !!this.selectedAnswer;
    submitBtn.disabled = !enabled;
    submitBtn.className = enabled
      ? 'submit-btn inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700'
      : 'submit-btn inline-flex items-center justify-center rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 cursor-not-allowed';
  }

  /** Envia a resposta selecionada e avança para a próxima questão */
  private handleSubmitAnswer() {
    if (!this.selectedAnswer || !this.currentQuestionId) return;

    this.onSubmitAnswer(this.currentQuestionId, this.selectedAnswer);

    this.currentQuestionIndex++;
    this.showCurrentQuestion();
  }

  /**
   * Exibe o resultado final do quiz, com a pontuação do usuário.
   * Aciona o callback onFinishQuiz com o score.
   */
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

  /**
   * Atualiza a pontuação do usuário.
   * Deve ser chamado pelo controlador quando a resposta for correta.
   * @param correct Indica se a resposta foi correta
   */
  public updateScore(correct: boolean) {
    if (correct) this.score++;
  }
}
