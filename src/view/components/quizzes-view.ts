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
            <div class="quizzes-container">
                <header class="page-header">
                    <button id="quizzes-back" class="back-btn">← Voltar</button>
                    <h2>Quizzes</h2>
                    <button id="quizzes-generate" class="add-btn">🤖 Gerar com IA</button>
                </header>
                
                <div class="quizzes-info">
                    <p class="info-text">
                        💡 <strong>Seus quizzes são criados pela IA!</strong><br>
                        Clique em "Gerar com IA" para criar um quiz personalizado sobre qualquer tema.
                    </p>
                </div>
                
                <div id="quizzes-list" class="quizzes-list">
                    <p>Carregando quizzes...</p>
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

    public updateQuizzesList(quizzes: Array<{id: string, titulo: string, questoes?: number, ultimaPorcentagem?: number | null}>) {
        const listEl = this.element.querySelector('#quizzes-list') as HTMLElement;
        
        if (quizzes.length === 0) {
            listEl.innerHTML = '<p class="empty-message">Nenhum quiz disponível.</p>';
            return;
        }

        const quizzesHtml = quizzes.map(quiz => {
            const porcentagemInfo = quiz.ultimaPorcentagem !== null ? 
                `<span class="quiz-score">🎯 ${quiz.ultimaPorcentagem}%</span>` : 
                '<span class="quiz-new">📝 Novo</span>';
                
            return `
                <div class="quiz-card">
                    <div class="quiz-header">
                        <h4>${quiz.titulo}</h4>
                        <div class="quiz-stats">
                            <span class="quiz-info">${quiz.questoes || 0} questões</span>
                            ${porcentagemInfo}
                        </div>
                    </div>
                    <div class="quiz-actions">
                        <button class="start-quiz-btn" data-quiz-id="${quiz.id}">
                            ${quiz.ultimaPorcentagem !== null ? 'Refazer Quiz' : 'Iniciar Quiz'}
                        </button>
                        <button class="delete-quiz-btn" data-quiz-id="${quiz.id}" title="Excluir quiz">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        listEl.innerHTML = quizzesHtml;

        // Add event listeners for start buttons
        listEl.querySelectorAll('.start-quiz-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const quizId = (btn as HTMLElement).dataset.quizId!;
                this.onStartQuiz(quizId);
            });
        });

        // Add event listeners for delete buttons
        listEl.querySelectorAll('.delete-quiz-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const quizId = (btn as HTMLElement).dataset.quizId!;
                this.onDeleteQuiz(quizId);
            });
        });
    }
}
