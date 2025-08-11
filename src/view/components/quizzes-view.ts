/**
 * QuizzesView
 * 
 * Responsável por exibir e gerenciar a tela de quizzes.
 * Permite visualizar quizzes disponíveis e iniciar sessões.
 * 
 * Elementos esperados no DOM:
 * - #quizzes-screen: container principal da tela de quizzes
 */
export class QuizzesView {
    /** Elemento principal da tela de quizzes */
    public element: HTMLElement;

    private onBack: () => void;
    private onGenerateQuiz: () => void;
    private onStartQuiz: (quizId: string) => void;
    private onDeleteQuiz: (quizId: string) => void;

    /**
     * @param onBack Função chamada ao voltar para o dashboard
     * @param onGenerateQuiz Função chamada para gerar quiz com IA
     * @param onStartQuiz Função chamada ao iniciar um quiz
     * @param onDeleteQuiz Função chamada ao excluir um quiz
     */
    constructor(
        onBack: () => void,
        onGenerateQuiz: () => void,
        onStartQuiz: (quizId: string) => void,
        onDeleteQuiz: (quizId: string) => void
    ) {
        this.element = document.getElementById("quizzes-screen")! as HTMLElement;

        this.element.innerHTML = `
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <header class="mb-6 flex items-center justify-between gap-4">
        <button id="quizzes-back"
          class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
          ← Voltar
        </button>
        <h2 class="text-xl font-semibold text-gray-900">Quizzes</h2>
        <button id="quizzes-generate"
          class="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          🤖 Gerar com IA
        </button>
      </header>

      <div class="mb-6 rounded-md bg-blue-50 p-4 text-blue-800">
        💡 <strong>Seus quizzes são criados pela IA!</strong><br />
        Clique em "Gerar com IA" para criar um quiz personalizado sobre qualquer tema.
      </div>

      <div id="quizzes-list" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <p class="text-gray-600">Carregando quizzes...</p>
      </div>
    </div>
  </div>
`;

        // Event listeners
        const backBtn = this.element.querySelector('#quizzes-back') as HTMLButtonElement;
        const generateBtn = this.element.querySelector('#quizzes-generate') as HTMLButtonElement;

        backBtn.addEventListener('click', onBack);
        generateBtn.addEventListener('click', onGenerateQuiz);

        // Store callbacks for dynamic content
        this.onBack = onBack;
        this.onGenerateQuiz = onGenerateQuiz;
        this.onStartQuiz = onStartQuiz;
        this.onDeleteQuiz = onDeleteQuiz;
    }

    public updateQuizzesList(quizzes: Array<{ id: string, titulo: string, questoes?: number, ultimaPorcentagem?: number | null }>) {
        const listEl = this.element.querySelector('#quizzes-list') as HTMLElement;

        if (quizzes.length === 0) {
            listEl.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-6 text-center">
        <div class="text-3xl">📝</div>
        <p class="text-sm text-gray-600">Nenhum quiz disponível.</p>
      </div>
    `;
            return;
        }

        const quizzesHtml = quizzes.map(quiz => {
            const porcentagemInfo = quiz.ultimaPorcentagem !== null && quiz.ultimaPorcentagem !== undefined
                ? `<span class="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">🎯 ${quiz.ultimaPorcentagem}%</span>`
                : `<span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">📝 Novo</span>`;

            return `
      <div class="quiz-card rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="quiz-header mb-2 flex items-start justify-between gap-3">
          <h4 class="text-base font-semibold text-gray-900">${quiz.titulo}</h4>
          <div class="quiz-stats flex items-center gap-2">
            <span class="quiz-info text-xs text-gray-700">${quiz.questoes || 0} questões</span>
            ${porcentagemInfo}
          </div>
        </div>

        <div class="quiz-actions mt-3 flex items-center justify-between">
          <button class="start-quiz-btn inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            data-quiz-id="${quiz.id}">
            ${quiz.ultimaPorcentagem !== null && quiz.ultimaPorcentagem !== undefined ? 'Refazer Quiz' : 'Iniciar Quiz'}
          </button>
          <button class="delete-quiz-btn inline-flex items-center justify-center rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
            data-quiz-id="${quiz.id}" title="Excluir quiz">🗑️</button>
        </div>
      </div>
    `;
        }).join('');

        listEl.innerHTML = quizzesHtml;

        // listeners
        listEl.querySelectorAll('.start-quiz-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const quizId = (btn as HTMLElement).dataset.quizId!;
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
