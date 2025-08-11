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

    /**
     * @param onBack Função chamada ao voltar para o dashboard
     * @param onStartQuiz Função chamada ao iniciar um quiz
     */
    constructor(
        onBack: () => void,
        onStartQuiz: (quizId: string) => void
    ) {
        this.element = document.getElementById("quizzes-screen")! as HTMLElement;
        
        this.element.innerHTML = `
            <div class="quizzes-container">
                <header class="page-header">
                    <button id="quizzes-back" class="back-btn">← Voltar</button>
                    <h2>Quizzes</h2>
                </header>
                
                <div id="quizzes-list" class="quizzes-list">
                    <p>Carregando quizzes...</p>
                </div>
            </div>
        `;

        // Event listeners
        const backBtn = this.element.querySelector('#quizzes-back') as HTMLButtonElement;
        backBtn.addEventListener('click', onBack);

        // Store callback for dynamic content
        this.onStartQuiz = onStartQuiz;
    }

    private onStartQuiz: (quizId: string) => void;

    public updateQuizzesList(quizzes: Array<{id: string, titulo: string, questoes?: number}>) {
        const listEl = this.element.querySelector('#quizzes-list') as HTMLElement;
        
        if (quizzes.length === 0) {
            listEl.innerHTML = '<p class="empty-message">Nenhum quiz disponível.</p>';
            return;
        }

        const quizzesHtml = quizzes.map(quiz => `
            <div class="quiz-card">
                <div class="quiz-header">
                    <h4>${quiz.titulo}</h4>
                    <span class="quiz-info">${quiz.questoes || 0} questões</span>
                </div>
                <div class="quiz-actions">
                    <button class="start-quiz-btn" data-quiz-id="${quiz.id}">Iniciar Quiz</button>
                </div>
            </div>
        `).join('');

        listEl.innerHTML = quizzesHtml;

        // Add event listeners for start buttons
        listEl.querySelectorAll('.start-quiz-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const quizId = (btn as HTMLElement).dataset.quizId!;
                this.onStartQuiz(quizId);
            });
        });
    }
}
