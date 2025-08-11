/**
 * DashboardView
 * 
 * Responsável por exibir a tela principal do dashboard.
 * Mostra estatísticas, navegação e resumos de dados.
 * 
 * Elementos esperados no DOM:
 * - #dashboard-screen: container principal da tela de dashboard
 */
export class DashboardView {
    /** Elemento principal da tela de dashboard */
    public element: HTMLElement;

    /**
     * @param onNavigate Função chamada para navegar para outras telas
     * @param onLogout Função chamada ao fazer logout
     */
    constructor(onNavigate: (screen: string) => void, onLogout: () => void) {
        this.element = document.getElementById("dashboard-screen")! as HTMLElement;
        
        this.element.innerHTML = `
            <div class="dashboard-container">
                <header class="dashboard-header">
                    <h2>🎯 Foco - Dashboard</h2>
                    <button id="dashboard-logout" class="logout-btn">Sair</button>
                </header>

                <nav class="dashboard-nav">
                    <button class="nav-btn" data-screen="metas-screen">📋 Metas</button>
                    <button class="nav-btn" data-screen="quizzes-screen">🧠 Quizzes</button>
                    <button class="nav-btn" data-screen="cronogramas-screen">📅 Cronogramas</button>
                    <button class="nav-btn" data-screen="textos-screen">📄 Textos</button>
                    <button class="nav-btn" data-screen="gerador-screen">🤖 Gerador</button>
                </nav>

                <main class="dashboard-content">
                    <section class="stats-section">
                        <h3>📊 Estatísticas</h3>
                        <div id="dashboard-stats" class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-number">0</div>
                                <div class="stat-label">Metas Ativas</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">0</div>
                                <div class="stat-label">Horas Estudadas</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">0</div>
                                <div class="stat-label">Quizzes Feitos</div>
                            </div>
                        </div>
                    </section>

                    <section class="recent-section">
                        <h3>📈 Atividade Recente</h3>
                        <div id="dashboard-recent" class="recent-list">
                            <div class="empty-state">
                                <div>📚</div>
                                <small>Nenhuma atividade recente</small>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        `;

        // Event listeners para navegação
        const navButtons = this.element.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = (btn as HTMLElement).dataset.screen;
                if (screen) onNavigate(screen);
            });
        });

        // Event listener para logout
        const logoutBtn = this.element.querySelector('#dashboard-logout') as HTMLButtonElement;
        logoutBtn.addEventListener('click', onLogout);
    }

    public updateStats(stats: { metas: number; horas: number; quizzes: number }) {
        const statCards = this.element.querySelectorAll('.stat-number');
        if (statCards[0]) statCards[0].textContent = stats.metas.toString();
        if (statCards[1]) statCards[1].textContent = stats.horas.toString();
        if (statCards[2]) statCards[2].textContent = stats.quizzes.toString();
    }

    public updateRecent(content: string) {
        const recentEl = this.element.querySelector('#dashboard-recent') as HTMLElement;
        recentEl.innerHTML = content;
    }
}
