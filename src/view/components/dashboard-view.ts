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
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <header class="flex items-center justify-between gap-4 mb-6">
        <h2 class="text-xl font-semibold text-gray-900">🎯 Foco - Dashboard</h2>
        <button id="dashboard-logout"
          class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Sair
        </button>
      </header>

      <nav class="mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <button class="nav-btn rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50" data-screen="metas-screen">📋 Metas</button>
        <button class="nav-btn rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50" data-screen="quizzes-screen">🧠 Quizzes</button>
        <button class="nav-btn rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50" data-screen="cronogramas-screen">📅 Cronogramas</button>
        <button class="nav-btn rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50" data-screen="textos-screen">📄 Textos</button>
        <button class="nav-btn rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50" data-screen="gerador-screen">🤖 Gerador</button>
      </nav>

      <main class="space-y-8">
        <section class="stats-section">
          <h3 class="mb-3 text-base font-semibold text-gray-900">📊 Estatísticas</h3>
          <div id="dashboard-stats" class="stats-grid grid gap-4 sm:grid-cols-3">
            <div class="stat-card rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
              <div class="stat-number text-2xl font-bold text-gray-900">0</div>
              <div class="stat-label text-sm text-gray-600">Metas Ativas</div>
            </div>
            <div class="stat-card rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
              <div class="stat-number text-2xl font-bold text-gray-900">0</div>
              <div class="stat-label text-sm text-gray-600">Horas Estudadas</div>
            </div>
            <div class="stat-card rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
              <div class="stat-number text-2xl font-bold text-gray-900">0</div>
              <div class="stat-label text-sm text-gray-600">Quizzes Feitos</div>
            </div>
          </div>
        </section>

        <section class="recent-section">
          <h3 class="mb-3 text-base font-semibold text-gray-900">📈 Atividade Recente</h3>
          <div id="dashboard-recent" class="recent-list">
            <div class="empty-state flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <div class="text-3xl">📚</div>
              <small class="text-sm text-gray-600">Nenhuma atividade recente</small>
            </div>
          </div>
        </section>
      </main>
    </div>
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
