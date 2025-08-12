/**
 * QuizzesView
 *
 * Tela de quizzes: 2 colunas, cards refinados, varinha no gerar, e reset de estado.
 * Mantém consistência visual com o resto do app (header e paleta).
 *
 * O que esta view faz:
 *  - Lista quizzes existentes em cards (2 colunas em telas ≥ sm).
 *  - Mostra status do quiz (Novo / desempenho por acertos) via chips.
 *  - Permite gerar novo quiz via IA (ícone de varinha).
 *  - Permite iniciar/refazer quiz.
 *  - Permite excluir quiz.
 *  - Faz reset de estados/overlays do quiz anterior ao abrir/gerar para evitar telas “presas” no resultado.
 *
 * Elementos esperados no DOM:
 *  - #quizzes-screen: container principal onde o conteúdo da view é renderizado.
 *
 * Callbacks (injetados pelo controlador):
 *  - onBack(): navega de volta ao dashboard (ou tela anterior).
 *  - onGenerateQuiz(): aciona a geração de quiz por IA e navegação/atualização conforme a app.
 *  - onStartQuiz(quizId): inicia (ou refaz) um quiz específico.
 *  - onDeleteQuiz(quizId): exclui um quiz específico.
 */
export class QuizzesView {
  /** Elemento raiz da tela de quizzes. Deve existir no HTML com id="quizzes-screen". */
  public element: HTMLElement;

  /** Callbacks controlados pela camada superior (controller/router). */
  private onBack: () => void;
  private onGenerateQuiz: () => void;
  private onStartQuiz: (quizId: string) => void;
  private onDeleteQuiz: (quizId: string) => void;

  /**
   * Conjunto de ícones SVG usados nos botões e chips desta tela.
   * Mantidos inline para evitar dependência externa de assets.
   */
  private readonly icons = {
    /** Ícone "voltar" (seta para a esquerda). */
    back: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M10.5 19.5L3 12l7.5-7.5M3 12h18"></path>
</svg>`.trim(),
    /** Ícone varinha mágica (usar IA). */
    wand: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M4 20L16.5 7.5"></path>
  <rect x="16" y="4" width="4" height="4" rx="1" transform="rotate(45 18 6)"></rect>
  <path d="M12 3l.4 1.2L13.6 5 12.4 5.4 12 6.6 11.6 5.4 10.4 5l1.2-.8z"></path>
  <path d="M20 10l.3.9.7.7-.9.3-.3.9-.3-.9-.9-.3.7-.7z"></path>
</svg>`.trim(),
    /** Ícone lista (usado para indicar número de questões). */
    list: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M8 6h13M8 12h13M8 18h13"></path>
  <circle cx="3" cy="6" r="1.5"></circle>
  <circle cx="3" cy="12" r="1.5"></circle>
  <circle cx="3" cy="18" r="1.5"></circle>
</svg>`.trim(),
    /** Ícone "play" (iniciar). */
    play: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M8 5v14l11-7z"></path>
</svg>`.trim(),
    /** Ícone "refresh" (refazer). */
    refresh: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M21 12a9 9 0 1 1-3-6.7"></path>
  <path d="M21 3v6h-6"></path>
</svg>`.trim(),
    /** Ícone lixeira (excluir). */
    trash: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="3 6 5 6 21 6"></polyline>
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
  <path d="M10 11v6M14 11v6"></path>
  <path d="M8 6l1-2h6l1 2"></path>
</svg>`.trim(),
  };

  /**
   * Constrói a view de quizzes e injeta o layout inicial no DOM.
   *
   * @param onBack            Callback para voltar à tela anterior.
   * @param onGenerateQuiz    Callback disparado ao clicar em "Gerar com IA".
   * @param onStartQuiz       Callback para iniciar/refazer um quiz (recebe o id).
   * @param onDeleteQuiz      Callback para excluir um quiz (recebe o id).
   */
  constructor(
    onBack: () => void,
    onGenerateQuiz: () => void,
    onStartQuiz: (quizId: string) => void,
    onDeleteQuiz: (quizId: string) => void
  ) {
    // Guarda callbacks para uso posterior.
    this.onBack = onBack;
    this.onGenerateQuiz = onGenerateQuiz;
    this.onStartQuiz = onStartQuiz;
    this.onDeleteQuiz = onDeleteQuiz;

    // Obtém o container principal e injeta o HTML base da view.
    this.element = document.getElementById("quizzes-screen")! as HTMLElement;

    this.element.innerHTML = `
  <div class="min-h-screen bg-gradient-to-b from-white to-violet-50/40">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <!-- Header consistente -->
      <header class="mb-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <button id="quizzes-back"
          class="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300">
          ${this.icons.back}<span>Voltar</span>
        </button>
        <h2 class="justify-self-center text-xl font-semibold text-gray-900">Quizzes</h2>
        <button id="quizzes-generate"
          class="justify-self-end inline-flex items-center gap-2 rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700">
          ${this.icons.wand}<span>Gerar com IA</span>
        </button>
      </header>

      <!-- Banner informativo (violet) -->
      <div class="mb-6 rounded-md border border-violet-200 bg-violet-50 p-4 text-violet-900">
        <div class="flex items-center gap-2 font-medium">
          <span class="rounded-md bg-violet-100 p-1.5 text-violet-700">${this.icons.wand}</span>
          <strong>Seus quizzes são criados pela IA!</strong>
        </div>
        <p class="mt-1 text-sm">Clique em “Gerar com IA” para criar um quiz personalizado sobre qualquer tema.</p>
      </div>

      <!-- 2 colunas fixas (1 no mobile) -->
      <div id="quizzes-list" class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
        <p class="text-gray-600">Carregando quizzes...</p>
      </div>
    </div>
  </div>
`;

    // Ligações de eventos do header.
    const backBtn = this.element.querySelector('#quizzes-back') as HTMLButtonElement;
    const generateBtn = this.element.querySelector('#quizzes-generate') as HTMLButtonElement;

    backBtn.addEventListener('click', onBack);

    // Ao gerar novo quiz, também limpamos estados anteriores para evitar reabertura de resultados.
    generateBtn.addEventListener('click', () => {
      this.resetQuizRuntimeState();
      onGenerateQuiz();
    });

    // Ao entrar na tela, garantimos que resíduos visuais/estados do quiz anterior sejam limpos.
    this.resetQuizRuntimeState();
  }

  /**
   * Limpa overlays, cartões de resultado e quaisquer flags persistidas do quiz anterior
   * para impedir que a tela de finalização reabra indevidamente.
   *
   * - Remove elementos temporários do DOM.
   * - Remove chaves relacionadas a "quiz:" do localStorage (compat inclui chaves antigas).
   * - Se a tela de execução estiver montada, força o modo “perguntas”.
   */
  private resetQuizRuntimeState() {
    // Remove overlays/artefatos do DOM que possam ter ficado.
    [
      '.quiz-result-overlay',
      '.quiz-finish-overlay',
      '.quiz-complete-screen',
      '.quiz-result-card',
      '.quiz-modal-overlay'
    ].forEach(sel => document.querySelectorAll(sel).forEach(n => n.remove()));

    // Limpa localStorage de estado do quiz.
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i)!;
        if (k && k.startsWith('quiz:')) localStorage.removeItem(k);
      }
      // Compatibilidade com chaves antigas.
      ['currentQuizState', 'currentQuizResult', 'lastQuizResult', 'quiz:lastSession', 'quiz:lastResult']
        .forEach(k => localStorage.removeItem(k));
    } catch {}

    // Se a tela de execução do quiz existir, garante que o resultado não esteja visível.
    const quizPlayScreen = document.getElementById('quiz-play-screen');
    if (quizPlayScreen) {
      const questionContainer = quizPlayScreen.querySelector('#question-container') as HTMLElement;
      const resultContainer = quizPlayScreen.querySelector('#quiz-result') as HTMLElement;
      if (questionContainer) questionContainer.classList.remove('hidden');
      if (resultContainer) resultContainer.classList.add('hidden');
    }
  }

  /**
   * Renderiza ou atualiza a lista de quizzes.
   *
   * @param quizzes Array de quizzes a exibir. Cada item deve conter:
   *  - id: string — identificador do quiz (usado em ações).
   *  - titulo: string — título do quiz.
   *  - questoes?: number — quantidade de questões (para exibir meta info).
   *  - acertos?: number | null — último número de acertos (para status).
   *  - totalRespostas?: number | null — (opcional) total respondido (não usado no chip atual).
   */
  public updateQuizzesList(
    quizzes: Array<{ id: string; titulo: string; questoes?: number; acertos?: number | null; totalRespostas?: number | null }>
  ) {
    const listEl = this.element.querySelector('#quizzes-list') as HTMLElement;

    // Garante layout de 2 colunas (1 no mobile).
    listEl.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto w-full';

    // Estado vazio: sem quizzes.
    if (quizzes.length === 0) {
      listEl.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-violet-200 bg-violet-50/40 p-6 text-center">
        <h3 class="text-lg font-medium text-gray-900">Nenhum quiz disponível</h3>
        <p class="text-sm text-gray-700">Clique em “Gerar com IA” para criar seu primeiro quiz.</p>
      </div>
    `;
      return;
    }

    // Monta os cards de quiz.
    const quizzesHtml = quizzes.map(quiz => {
      const qtd = quiz.questoes ?? 0;

      // Badge de status (Novo ou desempenho em cores).
      const scoreChip = (() => {
        const acertos = quiz.acertos;
        const totalQuestoes = quiz.questoes ?? 0;

        // Nunca feito: mostra "Novo".
        if (acertos == null || totalQuestoes === 0) {
          return `
          <span class="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-800">
            <span class="h-2 w-2 rounded-full bg-slate-400"></span>
            Novo
          </span>`;
        }

        // Feito: usa tons por desempenho.
        const percentual = (acertos / totalQuestoes) * 100;
        const tone =
          percentual >= 80 ? { bg: 'bg-emerald-100', fg: 'text-emerald-800', dot: 'bg-emerald-600' } :
          percentual >= 50 ? { bg: 'bg-amber-100',  fg: 'text-amber-800',  dot: 'bg-amber-600' } :
                             { bg: 'bg-rose-100',   fg: 'text-rose-800',   dot: 'bg-rose-600' };

        return `
        <span class="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${tone.bg} ${tone.fg}">
          <span class="h-2 w-2 rounded-full ${tone.dot}"></span>
          ${acertos}/${totalQuestoes} acertos
        </span>`;
      })();

      // Define ícone/texto do CTA principal (iniciar vs refazer).
      const primaryBtnIcon = quiz.acertos != null ? this.icons.refresh : this.icons.play;
      const primaryBtnText = quiz.acertos != null ? 'Refazer Quiz' : 'Iniciar Quiz';

      // Card do quiz.
      return `
      <div class="quiz-card rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <!-- Header: título + excluir -->
        <div class="mb-2 flex items-start justify-between gap-3">
          <h4 class="text-base font-semibold text-gray-900 leading-snug">${quiz.titulo}</h4>
          <button
            class="delete-quiz-btn inline-flex items-center justify-center rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"
            data-quiz-id="${quiz.id}" title="Excluir quiz" aria-label="Excluir quiz">
            ${this.icons.trash}
          </button>
        </div>

        <!-- Meta: quantidade de questões + status -->
        <div class="flex items-center justify-between gap-3">
          <span class="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">
            ${this.icons.list}
            <span>${qtd} ${qtd === 1 ? 'questão' : 'questões'}</span>
          </span>
          ${scoreChip}
        </div>

        <!-- Ações -->
        <div class="mt-4 flex items-center justify-start">
          <button
            class="start-quiz-btn inline-flex items-center gap-2 rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
            data-quiz-id="${quiz.id}">
            ${primaryBtnIcon}<span>${primaryBtnText}</span>
          </button>
        </div>
      </div>
    `;
    }).join('');

    // Injeta os cards no container.
    listEl.innerHTML = quizzesHtml;

    // Eventos: iniciar/refazer quiz.
    listEl.querySelectorAll('.start-quiz-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizId = (btn as HTMLElement).dataset.quizId!;
        // Garante que não reabra o resultado anterior ao entrar no play.
        this.resetQuizRuntimeState();
        this.onStartQuiz(quizId);
      });
    });

    // Eventos: excluir quiz.
    listEl.querySelectorAll('.delete-quiz-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizId = (btn as HTMLElement).dataset.quizId!;
        this.onDeleteQuiz(quizId);
      });
    });
  }
}