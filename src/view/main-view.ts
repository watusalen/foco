import { ScreenRouter } from "./utils/screen-router";
import { LoginView } from "./components/login-view";
import { RegisterView } from "./components/register-view";
import { DashboardView } from "./components/dashboard-view";
import { MetasView } from "./components/metas-view";
import { QuizzesView } from "./components/quizzes-view";
import { QuizPlayView } from "./components/quiz-play-view";
import { CronogramasView } from "./components/cronogramas-view";
import { CronogramaDetailView } from "./components/cronograma-detail-view";
import { TextosView } from "./components/textos-view";
import { GeradorView } from "./components/gerador-view";
import { ConfirmView } from "./components/confirm-view";
import { AuthService } from "../supabase/auth";
import { CronogramaUtils, CronogramaComDatas } from "./utils/cronograma-utils";
import { TextoUtils, TextoComConversas } from "./utils/texto-utils";
import { CronogramaRepository } from "../repository/CronogramaRepository";
import { AtividadeRepository } from "../repository/AtividadeRepository";
import { TextoRepository } from "../repository/TextoRepository";
import { ConversaRepository } from "../repository/ConversaRepository";
import { MetaRepository } from "../repository/MetaRepository";
import { QuizRepository } from "../repository/QuizRepository";
import { QuestaoRepository } from "../repository/QuestaoRepository";
import { RespostaRepository } from "../repository/RespostaRepository";
import { supabase } from "../supabase/client";
import { GeminiClient } from "../llm/GeminiClient";
import { MetaUsuario, CronogramaGerado, QuizGerado } from "../llm/types";

/**
 * Estado da aplicação Foco
 */
interface AppState {
    userId?: string;
    userName?: string;
    currentMeta?: string;
    currentQuiz?: string;
    currentCronogramaId?: string;
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
    private registerView: RegisterView;
    private dashboardView: DashboardView;
    private metasView: MetasView;
    private quizzesView: QuizzesView;
    private quizPlayView: QuizPlayView;
    private cronogramasView: CronogramasView;
    private cronogramaDetailView: CronogramaDetailView;
    private textosView: TextosView;
    private geradorView: GeradorView;
    private confirmView: ConfirmView;

    // Serviços
    private authService: AuthService;
    private cronogramaUtils: CronogramaUtils;
    private textoUtils: TextoUtils;
    private geminiClient: GeminiClient;

    // Repositories
    private cronogramaRepository: CronogramaRepository;
    private atividadeRepository: AtividadeRepository;
    private textoRepository: TextoRepository;
    private conversaRepository: ConversaRepository;
    private metaRepository: MetaRepository;
    private quizRepository: QuizRepository;
    private questaoRepository: QuestaoRepository;
    private respostaRepository: RespostaRepository;

    // Armazenamento de dados carregados do banco
    private cronogramas: CronogramaComDatas[] = [];
    private textos: TextoComConversas[] = [];

    /**
     * Inicializa todas as views, o roteador de telas e define o fluxo inicial.
     */
    constructor() {
        // Inicializa os serviços
        this.authService = new AuthService();

        // Inicializa repositories e utils
        this.cronogramaRepository = new CronogramaRepository(supabase);
        this.atividadeRepository = new AtividadeRepository(supabase);
        this.textoRepository = new TextoRepository(supabase);
        this.conversaRepository = new ConversaRepository(supabase);
        this.metaRepository = new MetaRepository(supabase);
        this.quizRepository = new QuizRepository(supabase);
        this.questaoRepository = new QuestaoRepository(supabase);
        this.respostaRepository = new RespostaRepository(supabase);

        this.cronogramaUtils = new CronogramaUtils(this.cronogramaRepository, this.atividadeRepository);
        this.textoUtils = new TextoUtils(this.textoRepository, this.conversaRepository);

        // Inicializa o cliente de IA Gemini
        const geminiApiKey = process.env.GEMINI_API_KEY!;
        this.geminiClient = new GeminiClient(geminiApiKey);

        // Inicializa as views e define os callbacks de navegação e operações
        this.loginView = new LoginView(
            (email, senha) => this.onLogin(email, senha),
            () => this.onShowRegister()
        );

        this.registerView = new RegisterView(
            (nome, email, senha) => this.onRegister(nome, email, senha),
            () => this.onBackToLogin()
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
            () => this.onGenerateQuiz(),
            (quizId) => this.onStartQuiz(quizId),
            (quizId) => this.onDeleteQuiz(quizId)
        );

        this.quizPlayView = new QuizPlayView(
            () => this.loadQuizzes(),
            (questaoId, resposta) => this.onSubmitQuizAnswer(questaoId, resposta),
            (score) => this.onFinishQuiz(score)
        );

        this.cronogramasView = new CronogramasView(
            () => this.router.show("dashboard-screen"),
            () => this.onGenerateCronograma(),
            (id) => this.onViewCronograma(id),
            (id) => this.onDeleteCronograma(id)
        );

        this.cronogramaDetailView = new CronogramaDetailView(
            () => this.loadCronogramas(),
            (atividadeId) => this.onDeleteAtividade(atividadeId)
        );

        this.textosView = new TextosView(
            () => this.router.show("dashboard-screen"),
            () => this.onGenerateTexto(),
            (textoId, prompt) => this.onContinueConversation(textoId, prompt),
            (textoId) => this.onToggleSaveTexto(textoId),
            (textoId) => this.onDeleteTexto(textoId)
        );

        this.geradorView = new GeradorView(
            () => this.router.show("dashboard-screen"),
            (prompt, tipo) => this.onGenerate(prompt, tipo),
            () => this.loadQuizzes(), // Usa loadQuizzes para recarregar os dados
            () => this.loadCronogramas() // Usa loadCronogramas ao invés de só mudar tela
        );

        this.confirmView = new ConfirmView();

        // Lista de todas as telas para o roteador
        const allScreens: HTMLElement[] = [
            this.loginView.element,
            this.registerView.element,
            this.dashboardView.element,
            this.metasView.element,
            this.quizzesView.element,
            this.quizPlayView.element,
            this.cronogramasView.element,
            this.cronogramaDetailView.element,
            this.textosView.element,
            this.geradorView.element,
            this.confirmView.element,
        ];
        this.router = new ScreenRouter(allScreens, () => this.closeAllDialogs());

        // Verifica se o usuário já está logado
        this.checkSession();
    }

    /**
     * Verifica se há uma sessão ativa do usuário
     */
    private async checkSession(): Promise<void> {
        try {
            const user = await this.authService.getCurrentUser();

            if (user) {
                // Usuário já está logado
                this.state.userId = user.id;
                this.state.userName = user.email?.split("@")[0] || "Usuário";
                await this.loadDashboard();
            } else {
                // Usuário não está logado
                this.router.show("login-screen");
            }
        } catch (error) {
            console.error("Erro ao verificar sessão:", error);
            // Em caso de erro, mostra a tela de login
            this.router.show("login-screen");
        }
    }

    /**
     * Manipula o login do usuário
     */
    private async onLogin(email: string, senha: string): Promise<void> {
        try {
            // Mostra feedback de loading
            this.loginView.showLoading("Fazendo login...");

            // Tenta fazer login com Supabase
            const result = await this.authService.signIn(email, senha);

            if (result.user) {
                // Login bem-sucedido
                this.state.userId = result.user.id;
                this.state.userName = result.user.email?.split("@")[0] || "Usuário";

                console.log("Login realizado com sucesso:", {
                    userId: this.state.userId,
                    userName: this.state.userName
                });

                this.loginView.hideLoading();
                await this.loadDashboard();
            }
        } catch (error) {
            console.error("Erro no login:", error);

            // Restaura o botão e mostra erro
            this.loginView.hideLoading();

            // Mostra erro para o usuário
            const errorMessage = error instanceof Error ?
                error.message :
                "Erro desconhecido ao fazer login";

            this.loginView.showError(errorMessage);
        }
    }

    /**
     * Mostra a tela de registro
     */
    private onShowRegister(): void {
        this.registerView.clear();
        this.router.show("register-screen");
    }

    /**
     * Volta para a tela de login
     */
    private onBackToLogin(): void {
        this.loginView.clear();
        this.router.show("login-screen");
    }

    /**
     * Manipula o registro de novo usuário
     */
    private async onRegister(nome: string, email: string, senha: string): Promise<void> {
        try {
            this.registerView.showLoading("Criando conta...");

            // Registra o usuário no Supabase
            const result = await this.authService.signUp(email, senha, nome);

            if (result.user) {
                this.registerView.hideLoading();
                this.registerView.showSuccess("Conta criada com sucesso! Verifique seu email para confirmar a conta.");

                // Volta para o login após 3 segundos
                setTimeout(() => {
                    this.onBackToLogin();
                }, 3000);
            }
        } catch (error) {
            console.error("Erro no registro:", error);
            this.registerView.hideLoading();

            const errorMessage = error instanceof Error ?
                error.message :
                "Erro desconhecido ao criar conta";

            this.registerView.showError(errorMessage);
        }
    }

    /**
     * Manipula o logout do usuário
     */
    private async onLogout(): Promise<void> {
        this.confirmView.show(
            "Tem certeza que deseja sair?",
            async () => {
                try {
                    // Faz logout no Supabase
                    await this.authService.signOut();

                    // Limpa o estado da aplicação
                    this.state = {};

                    // Limpa todos os formulários
                    this.loginView.clear();
                    this.registerView.clear();

                    // Volta para a tela de login
                    this.router.show("login-screen");

                    console.log("Logout realizado com sucesso");
                } catch (error) {
                    console.error("Erro no logout:", error);
                    // Mesmo com erro, limpa o estado local
                    this.state = {};
                    this.loginView.clear();
                    this.router.show("login-screen");
                }
            }
        );
    }

    /**
     * Fecha todos os diálogos abertos antes de navegar
     */
    private closeAllDialogs(): void {
        // Fecha diálogos de continuação de texto
        this.textosView.closeAllDialogs();

        // Remove outros overlays que possam estar abertos
        const overlays = document.querySelectorAll('.continue-dialog-overlay, .texto-modal-overlay');
        overlays.forEach(overlay => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
    }

    /**
     * Carrega e exibe o dashboard
     */
    private async loadDashboard(): Promise<void> {
        this.closeAllDialogs(); // Fecha diálogos ao navegar
        this.router.show("dashboard-screen");

        try {
            if (!this.state.userId) {
                console.error("Usuário não está logado");
                return;
            }

            // Carrega dados reais do banco de dados
            const [cronogramas, textos] = await Promise.all([
                this.cronogramaUtils.buscarCronogramasComDatas(this.state.userId),
                this.textoUtils.buscarTextosComConversas(this.state.userId)
            ]);

            // Calcula estatísticas reais
            const totalMetas = cronogramas.length;
            const totalTextos = textos.length;
            const horasEstudo = cronogramas.reduce((total, cronograma) => {
                return total + (cronograma.atividades?.length || 0) * 2; // Estimativa de 2h por atividade
            }, 0);

            // Dashboard atualizado - estatísticas estão integradas na própria view
            console.log(`Dashboard carregado: ${totalMetas} metas, ${horasEstudo} horas de estudo, ${totalTextos} textos`);

        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
        }
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
            case "textos-screen":
                this.loadTextos();
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
    private async loadMetas(): Promise<void> {
        this.closeAllDialogs(); // Fecha diálogos ao navegar
        this.router.show("metas-screen");

        try {
            if (!this.state.userId) {
                console.error("Usuário não está logado");
                return;
            }

            // Carrega metas reais do banco de dados
            const metas = await this.metaRepository.findByUserId(this.state.userId);

            this.metasView.updateMetasList(metas);

        } catch (error) {
            console.error("Erro ao carregar metas:", error);
            // Em caso de erro, mostra lista vazia
            this.metasView.updateMetasList([]);
        }
    }

    /**
     * Carrega e exibe a tela de quizzes
     */
    private async loadQuizzes(): Promise<void> {
        this.closeAllDialogs(); // Fecha diálogos ao navegar
        this.router.show("quizzes-screen");

        try {
            if (!this.state.userId) {
                console.error("Usuário não está logado");
                return;
            }

            // Carrega quizzes reais do banco de dados com suas questões
            const quizzesComQuestoes = await this.quizRepository.findByUserIdWithQuestoes(this.state.userId);

            // Mapeia os dados para o formato esperado pela view incluindo porcentagem
            const quizzes = await Promise.all(quizzesComQuestoes.map(async quiz => {
                const totalQuestoes = quiz.questoes ? quiz.questoes.length : 0;
                let ultimaPorcentagem = null;

                // Busca respostas do usuário para este quiz específico
                if (totalQuestoes > 0) {
                    try {
                        const respostasDoQuiz = await this.respostaRepository.findByUserInQuiz(this.state.userId!, quiz.id);

                        // Se o usuário respondeu todas as questões, calcula porcentagem
                        if (respostasDoQuiz.length === totalQuestoes) {
                            const acertos = respostasDoQuiz.filter(r => r.correta).length;
                            ultimaPorcentagem = Math.round((acertos / totalQuestoes) * 100);
                        }
                    } catch (error) {
                        console.log("Erro ao buscar respostas do quiz:", error);
                        // Continua sem porcentagem em caso de erro
                    }
                }

                return {
                    id: quiz.id,
                    titulo: quiz.titulo,
                    questoes: totalQuestoes,
                    ultimaPorcentagem: ultimaPorcentagem
                };
            }));

            console.log("📊 Quizzes carregados com porcentagens:", quizzes);

            this.quizzesView.updateQuizzesList(quizzes);

        } catch (error) {
            console.error("Erro ao carregar quizzes:", error);
            // Em caso de erro, mostra lista vazia
            this.quizzesView.updateQuizzesList([]);
        }
    }

    /**
     * Manipula criação de nova meta
     */
    private async onCreateMeta(titulo: string, descricao: string, dataLimite: string): Promise<void> {
        try {
            if (!this.state.userId) {
                console.error("Usuário não está logado");
                return;
            }

            // Cria meta real no banco de dados
            const novaMeta = await this.metaRepository.create({
                usuario_id: this.state.userId,
                titulo: titulo,
                descricao: descricao,
                data_limite: dataLimite
            });

            console.log("Nova meta criada:", novaMeta);

            // Recarrega a lista de metas
            await this.loadMetas();

        } catch (error) {
            console.error("Erro ao criar meta:", error);
            this.metasView.setFormError("Erro ao criar meta. Tente novamente.");
        }
    }    /**
     * Manipula edição de meta
     */
    private onEditMeta(id: string): void {
        // Implementa edição de meta
        console.log("Editar meta:", id);
        this.metasView.setFormError("Funcionalidade de edição em desenvolvimento.");
    }

    /**
     * Manipula exclusão de meta
     */
    private onDeleteMeta(id: string): void {
        this.confirmView.show(
            "Tem certeza que deseja excluir esta meta?",
            async () => {
                try {
                    // Exclui meta real do banco
                    await this.metaRepository.deleteById(id);
                    console.log("Meta excluída:", id);

                    // Recarrega a lista de metas
                    await this.loadMetas();

                } catch (error) {
                    console.error("Erro ao excluir meta:", error);
                }
            }
        );
    }

    /**
     * Manipula início de quiz
     */
    private async onStartQuiz(quizId: string): Promise<void> {
        try {
            if (!this.state.userId) {
                console.error("Usuário não está logado");
                return;
            }

            console.log("🎯 Iniciando quiz:", quizId);

            // Busca o quiz com suas questões
            const quizComQuestoes = await this.quizRepository.findByIdWithQuestoes(quizId);

            if (!quizComQuestoes) {
                console.error("Quiz não encontrado");
                this.confirmView.show(
                    "Quiz não encontrado. Voltar aos quizzes?",
                    () => this.loadQuizzes()
                );
                return;
            }

            // Mostra a tela de execução do quiz
            this.router.show("quiz-play-screen");

            // Inicia o quiz na view
            this.quizPlayView.startQuiz(
                { titulo: quizComQuestoes.titulo },
                quizComQuestoes.questoes || []
            );

        } catch (error) {
            console.error("❌ Erro ao iniciar quiz:", error);
            this.confirmView.show(
                "Erro ao carregar o quiz. Tentar novamente?",
                () => this.onStartQuiz(quizId)
            );
        }
    }

    /**
     * Manipula submissão de resposta do quiz
     */
    private async onSubmitQuizAnswer(questaoId: string, resposta: 'A' | 'B' | 'C' | 'D'): Promise<void> {
        try {
            if (!this.state.userId) {
                console.error("Usuário não está logado");
                return;
            }

            // Busca a questão para verificar se a resposta está correta
            const questao = await this.questaoRepository.findById(questaoId);
            if (!questao) {
                console.error("Questão não encontrada");
                return;
            }

            const isCorrect = questao.correta === resposta;

            // Salva a resposta no banco
            await this.respostaRepository.create({
                questao_id: questaoId,
                usuario_id: this.state.userId,
                resposta_dada: resposta,
                correta: isCorrect
            });

            // Atualiza o score na view
            this.quizPlayView.updateScore(isCorrect);

            console.log(`📝 Resposta registrada: ${resposta} (${isCorrect ? 'Correta' : 'Incorreta'})`);

        } catch (error) {
            console.error("❌ Erro ao submeter resposta:", error);
        }
    }

    /**
     * Manipula finalização do quiz
     */
    private onFinishQuiz(score: number): void {
        console.log(`🎯 Quiz finalizado! Pontuação: ${score}`);
        // Aqui poderia salvar estatísticas do quiz, atualizar progressos, etc.
    }

    /**
     * Manipula exclusão de quiz
     */
    private async onDeleteQuiz(quizId: string): Promise<void> {
        try {
            if (!this.state.userId) {
                console.error("Usuário não está logado");
                return;
            }

            // Busca o quiz para mostrar o título na confirmação
            const quiz = await this.quizRepository.findById(quizId);
            if (!quiz) {
                console.error("Quiz não encontrado");
                return;
            }

            // Mostra tela de confirmação
            this.confirmView.show(
                `Tem certeza que deseja excluir este quiz?`,
                async () => {
                    await this.performQuizDeletion(quizId);
                }
            );

        } catch (error) {
            console.error("❌ Erro ao preparar exclusão do quiz:", error);
        }
    }

    /**
     * Executa a exclusão do quiz
     */
    private async performQuizDeletion(quizId: string): Promise<void> {
        try {
            console.log("🗑️ Excluindo quiz:", quizId);

            // Primeiro busca todas as questões do quiz
            const questoes = await this.questaoRepository.findByQuizId(quizId);
            
            // Para cada questão, exclui todas as respostas relacionadas
            for (const questao of questoes) {
                await this.respostaRepository.deleteWhere({ questao_id: questao.id } as any);
            }

            // Em seguida exclui todas as questões do quiz
            await this.questaoRepository.deleteWhere({ quiz_id: quizId } as any);

            // Por fim exclui o quiz
            await this.quizRepository.deleteById(quizId);

            console.log("✅ Quiz excluído com sucesso");

            // Recarrega a lista de quizzes
            this.loadQuizzes();

        } catch (error) {
            console.error("❌ Erro ao excluir quiz:", error);
            this.confirmView.show(
                "Erro ao excluir o quiz. Tentar novamente?",
                () => this.performQuizDeletion(quizId)
            );
        }
    }

    /**
     * Manipula geração de conteúdo
     */
    private async onGenerate(prompt: string, tipo: string): Promise<void> {
        console.log("Gerar conteúdo:", { prompt, tipo });

        if (tipo === 'quiz') {
            // Gera quiz real com IA
            try {
                if (!this.state.userId) {
                    this.geradorView.setError("Usuário não está logado");
                    return;
                }

                console.log("🤖 Gerando quiz com IA real para:", prompt);

                // Chama a IA REAL do Gemini para gerar quiz
                const quizGerado = await this.geminiClient.gerarQuiz(prompt, 5, 'medio');

                console.log("✅ Quiz gerado pela IA:", quizGerado);

                // Salva o quiz no banco de dados
                const novoQuiz = await this.quizRepository.create({
                    usuario_id: this.state.userId,
                    titulo: quizGerado.titulo
                });

                console.log("✅ Quiz salvo no banco:", novoQuiz);

                // Salva as questões do quiz
                for (const questao of quizGerado.questoes) {
                    await this.questaoRepository.create({
                        quiz_id: novoQuiz.id,
                        enunciado: questao.enunciado,
                        alternativa_a: questao.alternativa_a,
                        alternativa_b: questao.alternativa_b,
                        alternativa_c: questao.alternativa_c,
                        alternativa_d: questao.alternativa_d,
                        correta: questao.correta
                    });
                }

                console.log("✅ Questões salvas no banco");

                this.geradorView.showQuizGenerated(quizGerado.titulo);

            } catch (error) {
                console.error("❌ Erro ao gerar quiz:", error);
                this.geradorView.setError("Erro ao gerar quiz. Tente novamente.");
                this.geradorView.setLoading(false);
            }
        } else if (tipo === 'cronograma') {
            // Gera cronograma real com atividades
            try {
                if (!this.state.userId) {
                    this.geradorView.setError("Usuário não está logado");
                    return;
                }

                // Gera cronograma com IA real
                await this.generateCronogramaWithIA(prompt);

            } catch (error) {
                console.error("Erro ao gerar cronograma:", error);
                this.geradorView.setError("Erro ao gerar cronograma. Tente novamente.");
                this.geradorView.setLoading(false);
            }
        } else if (tipo === 'texto') {
            // Gera texto real com IA
            try {
                if (!this.state.userId) {
                    this.geradorView.setError("Usuário não está logado");
                    return;
                }

                // Gera texto com IA real
                await this.generateTextoWithIA(prompt);

            } catch (error) {
                console.error("Erro ao gerar texto:", error);
                this.geradorView.setError("Erro ao gerar texto. Tente novamente.");
                this.geradorView.setLoading(false);
            }
        }
    }

    /**
     * Gera texto com IA e salva no banco
     */
    private async generateTextoWithIA(prompt: string): Promise<void> {
        try {
            console.log("🤖 Gerando texto com IA real para:", prompt);

            // Monta prompt específico para geração de texto educativo
            const promptCompleto = `
Você é um assistente educacional inteligente. Gere um texto educativo e informativo baseado no tema: "${prompt}"

INSTRUÇÕES:
- Crie um título atrativo e descritivo
- Desenvolva um conteúdo completo e bem estruturado
- Use linguagem clara e didática
- Inclua informações relevantes e exemplos
- Formate com parágrafos bem organizados

Responda em formato JSON:
{
  "titulo": "Título do texto",
  "conteudo": "Conteúdo completo do texto com parágrafos separados por \\n\\n"
}
            `;

            // Chama a IA REAL do Gemini
            const response = await this.geminiClient.generateJSONContent<{ titulo: string, conteudo: string }>(promptCompleto);

            // Cria o texto no banco
            const textoCriado = await this.textoUtils.criarTexto(
                this.state.userId!,
                {
                    titulo: response.titulo,
                    conteudo: response.conteudo,
                    tipo: 'texto',
                    prompt_original: prompt
                }
            );

            console.log("✅ Texto gerado pela IA e salvo:", textoCriado);

            // Mostra sucesso na interface e vai para a tela de textos
            this.geradorView.showTextoGenerated(
                textoCriado.titulo,
                () => this.loadTextos()
            );

        } catch (error) {
            console.error("❌ Erro na geração do texto:", error);
            throw error;
        }
    }

    /**
     * Gera cronograma com atividades usando IA REAL
     */
    private async generateCronogramaWithIA(prompt: string): Promise<void> {
        try {
            console.log("🤖 Gerando cronograma com IA real para:", prompt);

            // Chama a IA REAL do Gemini para gerar cronograma
            const cronogramaGerado = await this.geminiClient.gerarCronograma(
                prompt,
                "Disponível diariamente", // tempo padrão
                "30 dias" // prazo padrão
            );

            // Converte o formato da IA para o formato do banco
            const hoje = new Date();
            const dataInicio = hoje.toISOString().split('T')[0];
            const dataFim = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 dias à frente

            const cronogramaParaBanco = {
                titulo: cronogramaGerado.titulo,
                descricao: cronogramaGerado.objetivo,
                dataInicio: dataInicio,
                dataFim: dataFim,
                atividades: cronogramaGerado.atividades?.map((ativ, index) => {
                    const atividadeInicio = new Date(hoje.getTime() + index * 7 * 24 * 60 * 60 * 1000); // Espaçamento semanal
                    const atividadeFim = new Date(atividadeInicio.getTime() + 6 * 24 * 60 * 60 * 1000); // 7 dias de duração

                    return {
                        titulo: ativ.titulo,
                        descricao: ativ.descricao,
                        data_inicio: atividadeInicio.toISOString().split('T')[0],
                        data_fim: atividadeFim.toISOString().split('T')[0]
                    };
                }) || []
            };

            // Cria o cronograma no banco com suas atividades
            const cronogramaCriado = await this.cronogramaUtils.criarCronogramaComAtividades(
                this.state.userId!,
                cronogramaParaBanco
            );

            console.log("✅ Cronograma gerado pela IA e salvo:", cronogramaCriado);

            // Atualiza a lista local de cronogramas imediatamente
            await this.loadCronogramasData();

            // Mostra sucesso na interface
            this.geradorView.showCronogramaGenerated(
                cronogramaCriado.titulo,
                cronogramaCriado.atividades?.length || 0
            );

        } catch (error) {
            console.error("❌ Erro na geração do cronograma:", error);
            throw error;
        }
    }

    private async loadCronogramas(): Promise<void> {
        this.closeAllDialogs(); // Fecha diálogos ao navegar
        this.router.show("cronogramas-screen");

        try {
            if (!this.state.userId) {
                console.error("Usuário não está logado");
                return;
            }

            // Busca cronogramas do banco de dados
            this.cronogramas = await this.cronogramaUtils.buscarCronogramasComDatas(this.state.userId);
            this.cronogramasView.updateCronogramasList(this.cronogramas);

        } catch (error) {
            console.error("Erro ao carregar cronogramas:", error);
            // Em caso de erro, mantém lista vazia
            this.cronogramas = [];
            this.cronogramasView.updateCronogramasList(this.cronogramas);
        }
    }

    /**
     * Carrega e exibe a tela de textos
     */
    private async loadTextos(): Promise<void> {
        this.closeAllDialogs(); // Fecha diálogos ao navegar
        this.router.show("textos-screen");

        try {
            if (!this.state.userId) {
                console.error("Usuário não está logado");
                return;
            }

            // Busca textos do banco de dados usando o textoUtils
            this.textos = await this.textoUtils.buscarTextosComConversas(this.state.userId);

            // Passa os dados para a view
            await this.textosView.loadTextos(this.textos);

        } catch (error) {
            console.error("Erro ao carregar textos:", error);
        }
    }

    /**
     * Manipula visualização de cronograma com suas atividades
     */
    private async onViewCronograma(id: string): Promise<void> {
        try {
            // Salva o ID do cronograma atual no estado
            this.state.currentCronogramaId = id;
            
            this.router.show("cronograma-detail-screen");

            // Busca os detalhes do cronograma com atividades
            const cronogramaComDetalhes = await this.cronogramaUtils.buscarCronogramaComDatas(id);

            if (cronogramaComDetalhes) {
                this.cronogramaDetailView.showCronogramaDetails(cronogramaComDetalhes);
            } else {
                this.cronogramaDetailView.showError("Cronograma não encontrado.");
            }

        } catch (error) {
            console.error("Erro ao carregar detalhes do cronograma:", error);
            this.cronogramaDetailView.showError("Erro ao carregar os detalhes do cronograma.");
        }
    }

    /**
     * Manipula geração de cronograma via IA
     */
    private onGenerateCronograma(): void {
        // Redireciona para a tela de gerador de IA
        this.router.show("gerador-screen");
        this.geradorView.preSelectType('cronograma');
        this.geradorView.clearForm();
    }

    /**
     * Manipula criação de novo cronograma (usado pela IA)
     */
    private async onCreateCronograma(titulo: string, descricao: string, dataInicio: string, dataFim: string): Promise<void> {
        try {
            if (!this.state.userId) {
                console.error("Usuário não está logado");
                return;
            }

            // Cria o cronograma no banco de dados
            const novoCronograma = await this.cronogramaUtils.criarCronogramaComAtividades(
                this.state.userId,
                {
                    titulo,
                    descricao,
                    dataInicio,
                    dataFim
                }
            );

            console.log("Novo cronograma criado:", novoCronograma);

            // Recarrega a lista do banco
            await this.loadCronogramasData();

        } catch (error) {
            console.error("Erro ao criar cronograma:", error);
        }
    }

    /**
     * Manipula exclusão de cronograma
     */
    private onDeleteCronograma(id: string): void {
        this.confirmView.show(
            "Tem certeza que deseja excluir este cronograma?",
            async () => {
                try {
                    const sucesso = await this.cronogramaUtils.excluirCronograma(id);

                    if (sucesso) {
                        console.log("Cronograma excluído:", id);

                        // Recarrega a lista do banco
                        await this.loadCronogramasData();
                    } else {
                        console.error("Falha ao excluir cronograma:", id);
                    }

                } catch (error) {
                    console.error("Erro ao excluir cronograma:", error);
                }
            }
        );
    }

    /**
     * Manipula exclusão de atividade
     */
    private async onDeleteAtividade(atividadeId: string): Promise<void> {
        try {
            if (!this.state.userId) {
                console.error("Usuário não está logado");
                return;
            }

            // Busca a atividade para mostrar o título na confirmação
            const atividade = await this.atividadeRepository.findById(atividadeId);
            if (!atividade) {
                console.error("Atividade não encontrada");
                return;
            }

            // Mostra tela de confirmação
            this.confirmView.show(
                `Tem certeza que deseja excluir esta atividade?`,
                async () => {
                    await this.performAtividadeDeletion(atividadeId);
                }
            );

        } catch (error) {
            console.error("❌ Erro ao preparar exclusão da atividade:", error);
        }
    }

    /**
     * Executa a exclusão da atividade
     */
    private async performAtividadeDeletion(atividadeId: string): Promise<void> {
        try {
            console.log("🗑️ Excluindo atividade:", atividadeId);

            // Exclui a atividade usando o repositório
            await this.atividadeRepository.deleteById(atividadeId);

            console.log("✅ Atividade excluída com sucesso");

            // Recarrega apenas o cronograma atual em vez de recarregar a página
            await this.reloadCurrentCronograma();

        } catch (error) {
            console.error("❌ Erro ao excluir atividade:", error);
            this.confirmView.show(
                "Erro ao excluir a atividade. Tentar novamente?",
                () => this.performAtividadeDeletion(atividadeId)
            );
        }
    }

    /**
     * Recarrega o cronograma atualmente sendo visualizado
     */
    private async reloadCurrentCronograma(): Promise<void> {
        try {
            if (!this.state.currentCronogramaId) {
                console.warn("Nenhum cronograma atual identificado, redirecionando para página inicial");
                this.router.show("cronogramas-screen");
                await this.loadCronogramasData();
                return;
            }

            // Recarrega os detalhes do cronograma atual
            const cronogramaComDetalhes = await this.cronogramaUtils.buscarCronogramaComDatas(this.state.currentCronogramaId);

            if (cronogramaComDetalhes) {
                this.cronogramaDetailView.showCronogramaDetails(cronogramaComDetalhes);
            } else {
                // Se o cronograma não existe mais, volta para a lista
                console.warn("Cronograma atual não encontrado, voltando para lista");
                this.router.show("cronogramas-screen");
                await this.loadCronogramasData();
            }

        } catch (error) {
            console.error("Erro ao recarregar cronograma atual:", error);
            // Em caso de erro, volta para a lista de cronogramas
            this.router.show("cronogramas-screen");
            await this.loadCronogramasData();
        }
    }

    /**
     * Recarrega apenas os dados dos cronogramas (sem mudar tela)
     */
    private async loadCronogramasData(): Promise<void> {
        try {
            if (!this.state.userId) {
                return;
            }

            this.cronogramas = await this.cronogramaUtils.buscarCronogramasComDatas(this.state.userId);
            this.cronogramasView.updateCronogramasList(this.cronogramas);

        } catch (error) {
            console.error("Erro ao recarregar cronogramas:", error);
        }
    }

    /**
     * Manipula geração de texto via IA
     */
    private onGenerateTexto(): void {
        // Redireciona para a tela de gerador de IA
        this.router.show("gerador-screen");
        this.geradorView.preSelectType('texto');
        this.geradorView.clearForm();
    }

    /**
     * Manipula geração de quiz via IA
     */
    private onGenerateQuiz(): void {
        // Redireciona para a tela de gerador de IA
        this.router.show("gerador-screen");
        this.geradorView.preSelectType('quiz');
        this.geradorView.clearForm();
    }

    /**
     * Manipula continuação de conversa sobre um texto
     */
    private async onContinueConversation(textoId: string, prompt: string): Promise<void> {
        try {
            if (!this.state.userId) {
                console.error("Usuário não está logado");
                return;
            }

            // Busca o texto original
            const textoOriginal = await this.textoRepository.findById(textoId);
            if (!textoOriginal) {
                console.error("Texto não encontrado");
                return;
            }

            // Busca conversas existentes para este texto
            const conversas = await this.conversaRepository.findByTextoId(textoId);

            // Monta o contexto da conversa
            let contexto = `Texto original: ${textoOriginal.conteudo}\n\n`;
            if (conversas.length > 0) {
                contexto += "Conversa anterior:\n";
                conversas.forEach((conversa: any, index: number) => {
                    contexto += `${index + 1}. Usuário: ${conversa.prompt}\n`;
                    contexto += `   IA: ${conversa.resposta}\n\n`;
                });
            }
            contexto += `Nova pergunta: ${prompt}\n\nResponda de forma útil e contextualizada.`;

            // Gera resposta usando Gemini
            const resposta = await this.geminiClient.generateContent(contexto);

            // Salva a nova conversa
            const novaConversa = {
                texto_id: textoId,
                prompt: prompt,
                resposta: resposta
            };

            await this.conversaRepository.create(novaConversa);

            // Recarrega a visualização de textos para mostrar a nova conversa
            await this.loadTextos();

        } catch (error) {
            console.error("Erro ao continuar conversa:", error);
        }
    }

    /**
     * Manipula toggle de salvar/não salvar texto
     */
    private async onToggleSaveTexto(textoId: string): Promise<void> {
        try {
            // Busca o texto atual
            const texto = await this.textoRepository.findById(textoId);
            if (!texto) {
                console.error("Texto não encontrado");
                return;
            }

            // Inverte o status de salvo
            const novoStatus = !texto.salvo;

            // Atualiza no banco de dados
            await this.textoRepository.updateById(textoId, {
                salvo: novoStatus
            });

            // Recarrega a lista de textos para refletir a mudança
            await this.loadTextos();

        } catch (error) {
            console.error("Erro ao salvar/desalvar texto:", error);
        }
    }

    /**
     * Manipula exclusão de texto
     */
    private onDeleteTexto(textoId: string): void {
        this.confirmView.show(
            "Tem certeza que deseja excluir este texto?",
            async () => {
                try {
                    // Excluir primeiro todas as conversas relacionadas
                    const conversas = await this.conversaRepository.findByTextoId(textoId);
                    for (const conversa of conversas) {
                        await this.conversaRepository.deleteById(conversa.id);
                    }

                    // Excluir o texto
                    await this.textoRepository.deleteById(textoId);

                    // Recarrega a lista de textos
                    await this.loadTextos();

                } catch (error) {
                    console.error("Erro ao excluir texto:", error);
                }
            }
        );
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
    new MainView();
});