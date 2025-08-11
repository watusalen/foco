import { ScreenRouter } from "./utils/screen-router";
import { LoginView } from "./components/login-view";
import { DashboardView } from "./components/dashboard-view";
import { MetasView } from "./components/metas-view";
import { QuizzesView } from "./components/quizzes-view";
import { CronogramasView } from "./components/cronogramas-view";
import { GeradorView } from "./components/gerador-view";
import { ConfirmView } from "./components/confirm-view";

/**
 * Estado da aplicação Foco
 */
interface AppState {
    userId?: string;
    userName?: string;
    currentMeta?: string;
    currentQuiz?: string;
}

/**
 * Classe principal responsável por gerenciar a navegação, estado e coordenação
 * entre as telas da aplicação Foco.
 */
export class MainView {
    /** Estado atual da aplicação */
    private state: AppState = {};
    /** Gerenciador de telas */
    private router: ScreenRouter;
    
    // Views/Componentes
    private loginView: LoginView;
    private dashboardView: DashboardView;
    private metasView: MetasView;
    private quizzesView: QuizzesView;
    private cronogramasView: CronogramasView;
    private geradorView: GeradorView;
    private confirmView: ConfirmView;
    
    // Armazenamento local para simulação
    private cronogramas: Array<{ id: string, titulo: string, descricao: string, dataInicio: string, dataFim: string }> = [];

    /**
     * Inicializa todas as views, o roteador de telas e define o fluxo inicial.
     */
    constructor() {
        // Inicializa as views e define os callbacks de navegação e operações
        this.loginView = new LoginView(
            (email, senha) => this.onLogin(email, senha),
            () => this.onRegister()
        );
        
        this.dashboardView = new DashboardView(
            (screen) => this.onNavigate(screen),
            () => this.onLogout()
        );
        
        this.metasView = new MetasView(
            () => this.router.show("dashboard-screen"),
            (titulo, descricao, dataLimite) => this.onCreateMeta(titulo, descricao, dataLimite),
            (id) => this.onEditMeta(id),
            (id) => this.onDeleteMeta(id)
        );
        
        this.quizzesView = new QuizzesView(
            () => this.router.show("dashboard-screen"),
            (quizId) => this.onStartQuiz(quizId)
        );
        
        this.cronogramasView = new CronogramasView(
            () => this.router.show("dashboard-screen"),
            (titulo, descricao, dataInicio, dataFim) => this.onCreateCronograma(titulo, descricao, dataInicio, dataFim),
            (id, titulo, descricao, dataInicio, dataFim) => this.onEditCronograma(id, titulo, descricao, dataInicio, dataFim),
            (id) => this.onDeleteCronograma(id)
        );
        
        this.geradorView = new GeradorView(
            () => this.router.show("dashboard-screen"),
            (prompt, tipo) => this.onGenerate(prompt, tipo),
            () => this.router.show("quizzes-screen")
        );
        
        this.confirmView = new ConfirmView();

        // Lista de todas as telas para o roteador
        const allScreens: HTMLElement[] = [
            this.loginView.element,
            this.dashboardView.element,
            this.metasView.element,
            this.quizzesView.element,
            this.cronogramasView.element,
            this.geradorView.element,
            this.confirmView.element,
        ];
        this.router = new ScreenRouter(allScreens);

        // Exibe a tela inicial
        this.router.show("login-screen");
    }

    /**
     * Manipula o login do usuário
     */
    private onLogin(email: string, senha: string): void {
        // TODO: Implementar autenticação real
        console.log("Login:", { email, senha });
        
        // Simula login bem-sucedido
        setTimeout(() => {
            this.state.userId = "user-123";
            this.state.userName = email.split("@")[0];
            this.loadDashboard();
        }, 1000);
    }

    /**
     * Manipula o registro de novo usuário
     */
    private onRegister(): void {
        // TODO: Implementar tela de registro
        console.log("Registro");
        this.loginView.setError("Funcionalidade de registro em desenvolvimento.");
    }

    /**
     * Manipula o logout do usuário
     */
    private onLogout(): void {
        this.confirmView.show(
            "Tem certeza que deseja sair?",
            () => {
                this.state = {};
                this.loginView.clear();
                this.router.show("login-screen");
            }
        );
    }

    /**
     * Carrega e exibe o dashboard
     */
    private loadDashboard(): void {
        this.router.show("dashboard-screen");
        
        // TODO: Carregar dados reais
        this.dashboardView.updateStats({
            metas: 5,
            horas: 24,
            quizzes: 3
        });
        
        this.dashboardView.updateRecent(`
            <div>Última atividade: Quiz de Matemática concluído</div>
            <div>Meta "Estudar TypeScript" criada</div>
            <div>2 horas de estudo registradas hoje</div>
        `);
    }

    /**
     * Manipula navegação entre telas
     */
    private onNavigate(screen: string): void {
        switch (screen) {
            case "metas-screen":
                this.loadMetas();
                break;
            case "quizzes-screen":
                this.loadQuizzes();
                break;
            case "cronogramas-screen":
                this.loadCronogramas();
                break;
            case "gerador-screen":
                this.router.show("gerador-screen");
                break;
            default:
                console.warn("Tela não reconhecida:", screen);
        }
    }

    /**
     * Carrega e exibe a tela de metas
     */
    private loadMetas(): void {
        this.router.show("metas-screen");
        
        // TODO: Carregar metas reais do banco
        const metas = [
            { 
                id: "1", 
                titulo: "Estudar TypeScript", 
                descricao: "Completar curso básico", 
                dataLimite: "2025-12-31",
                atingida: false 
            },
            { 
                id: "2", 
                titulo: "Fazer 10 quizzes", 
                descricao: "Praticar conhecimentos", 
                atingida: true 
            }
        ];
        
        this.metasView.updateMetasList(metas);
    }

    /**
     * Carrega e exibe a tela de quizzes
     */
    private loadQuizzes(): void {
        this.router.show("quizzes-screen");
        
        // TODO: Carregar quizzes reais do banco
        const quizzes = [
            { id: "1", titulo: "JavaScript Básico", questoes: 10 },
            { id: "2", titulo: "TypeScript Avançado", questoes: 15 },
            { id: "3", titulo: "React Fundamentals", questoes: 8 }
        ];
        
        this.quizzesView.updateQuizzesList(quizzes);
    }

    /**
     * Manipula criação de nova meta
     */
    private onCreateMeta(titulo: string, descricao: string, dataLimite: string): void {
        // TODO: Salvar meta no banco
        console.log("Nova meta:", { titulo, descricao, dataLimite });
        
        // Simula salvamento e recarrega lista
        setTimeout(() => {
            this.loadMetas();
        }, 500);
    }

    /**
     * Manipula edição de meta
     */
    private onEditMeta(id: string): void {
        // TODO: Implementar edição de meta
        console.log("Editar meta:", id);
        this.metasView.setFormError("Funcionalidade de edição em desenvolvimento.");
    }

    /**
     * Manipula exclusão de meta
     */
    private onDeleteMeta(id: string): void {
        this.confirmView.show(
            "Tem certeza que deseja excluir esta meta?",
            () => {
                // TODO: Excluir meta do banco
                console.log("Excluir meta:", id);
                this.loadMetas();
            }
        );
    }

    /**
     * Manipula início de quiz
     */
    private onStartQuiz(quizId: string): void {
        // TODO: Implementar tela de quiz ativo
        console.log("Iniciar quiz:", quizId);
        this.confirmView.show(
            "Funcionalidade de quiz em desenvolvimento. Voltar ao dashboard?",
            () => this.router.show("dashboard-screen")
        );
    }

    /**
     * Manipula geração de conteúdo
     */
    private onGenerate(prompt: string, tipo: string): void {
        console.log("Gerar conteúdo:", { prompt, tipo });
        
        if (tipo === 'quiz') {
            // Simula geração de quiz
            setTimeout(() => {
                const quizTitle = `Quiz: ${prompt.substring(0, 30)}...`;
                this.geradorView.showQuizGenerated(quizTitle);
            }, 2000);
        } else {
            // Simula geração de texto
            setTimeout(() => {
                this.geradorView.showResult(`
                    <h4>Texto gerado sobre: ${prompt}</h4>
                    <div class="generated-content">
                        <p>Este é um exemplo de texto gerado por IA. Em uma implementação real, 
                        aqui seria exibido o conteúdo gerado baseado no prompt fornecido.</p>
                        
                        <h5>Pontos principais:</h5>
                        <ul>
                            <li>Conceito fundamental sobre o tema</li>
                            <li>Aplicações práticas</li>
                            <li>Exemplos relevantes</li>
                            <li>Conclusões importantes</li>
                        </ul>
                        
                        <p><strong>Resumo:</strong> Conteúdo educativo personalizado baseado 
                        no prompt "${prompt}".</p>
                    </div>
                `);
            }, 2000);
        }
    }

    /**
     * Carrega e exibe a tela de cronogramas
     */
    private loadCronogramas(): void {
        this.router.show("cronogramas-screen");
        
        // Inicializa com dados de exemplo se não houver cronogramas
        if (this.cronogramas.length === 0) {
            this.cronogramas = [
                { 
                    id: "1", 
                    titulo: "Estudo de TypeScript", 
                    descricao: "Cronograma intensivo para aprender TypeScript", 
                    dataInicio: "2025-08-01",
                    dataFim: "2025-08-31"
                },
                { 
                    id: "2", 
                    titulo: "Preparação para Prova", 
                    descricao: "Revisão de conteúdos para avaliação final", 
                    dataInicio: "2025-07-01",
                    dataFim: "2025-07-15"
                }
            ];
        }
        
        this.cronogramasView.updateCronogramasList(this.cronogramas);
    }

    /**
     * Manipula criação de novo cronograma
     */
    private onCreateCronograma(titulo: string, descricao: string, dataInicio: string, dataFim: string): void {
        const novoCronograma = {
            id: Date.now().toString(), // ID simples baseado em timestamp
            titulo,
            descricao,
            dataInicio,
            dataFim
        };
        
        this.cronogramas.push(novoCronograma);
        console.log("Novo cronograma criado:", novoCronograma);
        
        // Recarrega a lista
        this.cronogramasView.updateCronogramasList(this.cronogramas);
    }

    /**
     * Manipula edição de cronograma
     */
    private onEditCronograma(id: string, titulo: string, descricao: string, dataInicio: string, dataFim: string): void {
        const index = this.cronogramas.findIndex(c => c.id === id);
        
        if (index !== -1) {
            this.cronogramas[index] = { id, titulo, descricao, dataInicio, dataFim };
            console.log("Cronograma editado:", this.cronogramas[index]);
            
            // Recarrega a lista
            this.cronogramasView.updateCronogramasList(this.cronogramas);
        } else {
            console.error("Cronograma não encontrado para edição:", id);
        }
    }

    /**
     * Manipula exclusão de cronograma
     */
    private onDeleteCronograma(id: string): void {
        this.confirmView.show(
            "Tem certeza que deseja excluir este cronograma?",
            () => {
                const index = this.cronogramas.findIndex(c => c.id === id);
                
                if (index !== -1) {
                    const cronogramaRemovido = this.cronogramas.splice(index, 1)[0];
                    console.log("Cronograma excluído:", cronogramaRemovido);
                    
                    // Recarrega a lista
                    this.cronogramasView.updateCronogramasList(this.cronogramas);
                } else {
                    console.error("Cronograma não encontrado para exclusão:", id);
                }
            }
        );
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
    new MainView();
});