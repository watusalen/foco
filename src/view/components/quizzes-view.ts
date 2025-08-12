/**
 * QuizzesView
 *
 * Tela de quizzes: 2 colunas, cards refinados, varinha no gerar, e reset de estado
 */
export class QuizzesView {
  public element: HTMLElement;

  private onBack: () => void;
  private onGenerateQuiz: () => void;
  private onStartQuiz: (quizId: string) => void;
  private onDeleteQuiz: (quizId: string) => void;

  // Ícones SVG
  private readonly icons = {
    back: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M10.5 19.5L3 12l7.5-7.5M3 12h18"></path>
</svg>`.trim(),
    wand: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M4 20L16.5 7.5"></path>
  <rect x="16" y="4" width="4" height="4" rx="1" transform="rotate(45 18 6)"></rect>
  <path d="M12 3l.4 1.2L13.6 5 12.4 5.4 12 6.6 11.6 5.4 10.4 5l1.2-.8z"></path>
  <path d="M20 10l.3.9.7.7-.9.3-.3.9-.3-.9-.9-.3.7-.7z"></path>
</svg>`.trim(),
    list: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M8 6h13M8 12h13M8 18h13"></path>
  <circle cx="3" cy="6" r="1.5"></circle>
  <circle cx="3" cy="12" r="1.5"></circle>
  <circle cx="3" cy="18" r="1.5"></circle>
</svg>`.trim(),
    play: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
  <path d="M8 5v14l11-7z"></path>
</svg>`.trim(),
    refresh: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M21 12a9 9 0 1 1-3-6.7"></path>
  <path d="M21 3v6h-6"></path>
</svg>`.trim(),
    trash: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <polyline points="3 6 5 6 21 6"></polyline>
  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
  <path d="M10 11v6M14 11v6"></path>
  <path d="M8 6l1-2h6l1 2"></path>
</svg>`.trim(),
  };

  constructor(
    onBack: () => void,
    onGenerateQuiz: () => void,
    onStartQuiz: (quizId: string) => void,
    onDeleteQuiz: (quizId: string) => void
  ) {
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

    const backBtn = this.element.querySelector('#quizzes-back') as HTMLButtonElement;
    const generateBtn = this.element.querySelector('#quizzes-generate') as HTMLButtonElement;

    backBtn.addEventListener('click', onBack);
    generateBtn.addEventListener('click', () => {
      this.resetQuizRuntimeState();
      onGenerateQuiz();
    });

    this.onBack = onBack;
    this.onGenerateQuiz = onGenerateQuiz;
    this.onStartQuiz = onStartQuiz;
    this.onDeleteQuiz = onDeleteQuiz;

    // Evita reabrir tela de finalização ao entrar na página
    this.resetQuizRuntimeState();
  }

  /** Limpa overlays e qualquer flag/resultado persistido do quiz anterior */
  private resetQuizRuntimeState() {
    // Remove overlays/artefatos
    [
      '.quiz-result-overlay',
      '.quiz-finish-overlay',
      '.quiz-complete-screen',
      '.quiz-result-card',
      '.quiz-modal-overlay'
    ].forEach(sel => document.querySelectorAll(sel).forEach(n => n.remove()));

    // Limpa localStorage de estado do quiz
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i)!;
        if (k && k.startsWith('quiz:')) localStorage.removeItem(k);
      }
      ['currentQuizState', 'currentQuizResult', 'lastQuizResult', 'quiz:lastSession', 'quiz:lastResult']
        .forEach(k => localStorage.removeItem(k));
    } catch {}

    // Reset visual se a play screen existir
    const quizPlayScreen = document.getElementById('quiz-play-screen');
    if (quizPlayScreen) {
      const questionContainer = quizPlayScreen.querySelector('#question-container') as HTMLElement;
      const resultContainer = quizPlayScreen.querySelector('#quiz-result') as HTMLElement;
      if (questionContainer) questionContainer.classList.remove('hidden');
      if (resultContainer) resultContainer.classList.add('hidden');
    }
  }

  public updateQuizzesList(
    quizzes: Array<{ id: string; titulo: string; questoes?: number; acertos?: number | null; totalRespostas?: number | null }>
  ) {
    const listEl = this.element.querySelector('#quizzes-list') as HTMLElement;
    listEl.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto w-full';

    if (quizzes.length === 0) {
      listEl.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-violet-200 bg-violet-50/40 p-6 text-center">
        <h3 class="text-lg font-medium text-gray-900">Nenhum quiz disponível</h3>
        <p class="text-sm text-gray-700">Clique em “Gerar com IA” para criar seu primeiro quiz.</p>
      </div>
    `;
      return;
    }

    const quizzesHtml = quizzes.map(quiz => {
      const qtd = quiz.questoes ?? 0;

      const scoreChip = (() => {
        const acertos = quiz.acertos;
        const totalQuestoes = quiz.questoes ?? 0;
        if (acertos == null || totalQuestoes === 0) {
          return `
          <span class="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-800">
            <span class="h-2 w-2 rounded-full bg-slate-400"></span>
            Novo
          </span>`;
        }
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

      const primaryBtnIcon = quiz.acertos != null ? this.icons.refresh : this.icons.play;
      const primaryBtnText = quiz.acertos != null ? 'Refazer Quiz' : 'Iniciar Quiz';

      return `
      <div class="quiz-card rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <!-- Header: título + delete -->
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

    listEl.innerHTML = quizzesHtml;

    // listeners
    listEl.querySelectorAll('.start-quiz-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizId = (btn as HTMLElement).dataset.quizId!;
        this.resetQuizRuntimeState(); // garante que não reabra o resultado anterior
        this.onStartQuiz(quizId);
      });
    });

    listEl.querySelectorAll('.delete-quiz-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const quizId = (btn as HTMLElement).dataset.quizId!;
        this.onDeleteQuiz(quizId);
      });
    });
  }

}
