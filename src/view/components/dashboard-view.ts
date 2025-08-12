/**
 * Tipo para os callbacks de navegação
 */
type NavigationCallback = (screen: string) => void;

/**
 * Tipo para o callback de logout
 */
type LogoutCallback = () => void;

/**
 * DashboardView - Tela principal do sistema com navegação e estatísticas
 * 
 * Esta classe gerencia a interface principal do dashboard, incluindo:
 * - Navegação por cards coloridos para cada seção
 * - Estatísticas em tempo real (metas, horas, quizzes)
 * - Atividades recentes do usuário
 * - Design system com paleta temática consistente
 * 
 * @example
 * ```typescript
 * const dashboard = new DashboardView(
 *   (screen) => router.navigate(screen),
 *   () => authService.logout()
 * );
 * 
 * // Atualizar estatísticas
 * dashboard.updateStats({ metas: 5, horas: 120, quizzes: 15 });
 * 
 * // Atualizar atividades recentes
 * dashboard.updateRecent('<div>Quiz finalizado</div>');
 * ```
 * 
 * @since 1.0.0
 * @author Matusalen C. Alves
 */

export interface DashboardStats {
  quizzes: number;
  textos: number;
  cronogramas: number;
}

export class DashboardView {
  /** Elemento DOM principal do dashboard */
  public element: HTMLElement;

  /** 
   * Biblioteca de ícones SVG reutilizáveis baseados no Heroicons
   * Cada ícone segue o padrão de acessibilidade com aria-hidden="true"
   */
  private readonly icons = {
    /** Ícone de logout - porta de saída com seta */
    logout: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
  <path d="M10 17l5-5-5-5"></path>
  <path d="M15 12H3"></path>
</svg>`.trim(),
    /** Ícone de target/metas - círculo com ponto central */
    target: `
<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="8"></circle>
  <circle cx="12" cy="12" r="3"></circle>
</svg>`.trim(),
    /** Ícone de cérebro para quizzes - representação estilizada */
    brain: `
<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M8.5 8A2.5 2.5 0 1 1 6 5.5 3.5 3.5 0 0 0 2.5 9v2A3.5 3.5 0 0 0 6 14.5V15A2.5 2.5 0 1 0 8.5 17"></path>
  <path d="M15.5 8A2.5 2.5 0 1 0 18 5.5 3.5 3.5 0 0 1 21.5 9v2A3.5 3.5 0 0 1 18 14.5V15A2.5 2.5 0 1 1 15.5 17"></path>
</svg>`.trim(),
    /** Ícone de calendário para cronogramas */
    calendar: `
<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="3" y="4" width="18" height="18" rx="2"></rect>
  <path d="M16 2v4M8 2v4M3 10h18"></path>
</svg>`.trim(),
    /** Ícone de documento para textos */
    document: `
<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <path d="M14 2v6h6"></path>
  <path d="M8 13h8M8 17h5M8 9h3"></path>
</svg>`.trim(),
    /** Ícone de gráfico para estatísticas */
    chart: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 3v18h18"></path>
  <path d="M7 15l3-3 3 2 4-6"></path>
</svg>`.trim(),
    /** Ícone de relógio para horas estudadas */
    clock: `
<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="9"></circle>
  <path d="M12 7v6l4 2"></path>
</svg>`.trim(),
    /** Ícone de troféu para conquistas/quizzes */
    trophy: `
<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M8 21h8"></path>
  <path d="M12 17a5 5 0 0 1-5-5V3h10v9a5 5 0 0 1-5 5Z"></path>
  <path d="M5 6H3a2 2 0 0 0 2 2h0"></path>
  <path d="M19 6h2a2 2 0 0 1-2 2h0"></path>
</svg>`.trim(),
    /** Ícone de varinha mágica para gerador de IA */
    wand: `
<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M4 20L16.5 7.5"></path>
  <rect x="16" y="4" width="4" height="4" rx="1" transform="rotate(45 18 6)"></rect>
  <path d="M12 3l.4 1.2L13.6 5 12.4 5.4 12 6.6 11.6 5.4 10.4 5l1.2-.8z"></path>
  <path d="M20 10l.3.9.7.7-.9.3-.3.9-.3-.9-.9-.3.7-.7z"></path>
</svg>`.trim(),
  };

  /**
   * Construtor do DashboardView
   * 
   * Inicializa a interface do dashboard com navegação, estatísticas e 
   * configuração de event listeners para interação do usuário.
   * 
   * @param onNavigate - Callback chamado ao navegar para outras telas
   * @param onLogout - Callback chamado ao fazer logout do sistema
   * 
   * @example
   * ```typescript
   * const dashboard = new DashboardView(
   *   (screen) => console.log(`Navegando para: ${screen}`),
   *   () => console.log('Fazendo logout...')
   * );
   * ```
   */
  constructor(onNavigate: NavigationCallback, onLogout: LogoutCallback) {
    this.element = document.getElementById("dashboard-screen")! as HTMLElement;

    this.element.innerHTML = `
  <div class="min-h-screen bg-gradient-to-b from-white to-indigo-50/40">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <!-- Header -->
      <header class="mb-6 grid grid-cols-[1fr_auto] items-center gap-4">
        <h2 class="text-xl font-semibold bg-clip-text text-black">
          FOCO — Dashboard
        </h2>
        <button id="dashboard-logout"
          class="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300">
          ${this.icons.logout}<span>Sair</span>
        </button>
      </header>

      <!-- Navegação em cards coloridos -->
      <nav class="mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <button class="nav-card group rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-left shadow-sm hover:shadow-md hover:bg-emerald-50 hover:border-emerald-200 transition"
                data-screen="metas-screen">
          <div class="flex items-center gap-2">
            <span class="rounded-md bg-emerald-100 p-2 text-emerald-700">${this.icons.target}</span>
            <span class="text-sm font-medium text-emerald-900">Metas</span>
          </div>
        </button>

        <button class="nav-card group rounded-xl border border-violet-100 bg-violet-50/60 p-3 text-left shadow-sm hover:shadow-md hover:bg-violet-50 hover:border-violet-200 transition"
                data-screen="quizzes-screen">
          <div class="flex items-center gap-2">
            <span class="rounded-md bg-violet-100 p-2 text-violet-700">${this.icons.brain}</span>
            <span class="text-sm font-medium text-violet-900">Quizzes</span>
          </div>
        </button>

        <button class="nav-card group rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-left shadow-sm hover:shadow-md hover:bg-sky-50 hover:border-sky-200 transition"
                data-screen="cronogramas-screen">
          <div class="flex items-center gap-2">
            <span class="rounded-md bg-sky-100 p-2 text-sky-700">${this.icons.calendar}</span>
            <span class="text-sm font-medium text-sky-900">Cronogramas</span>
          </div>
        </button>

        <button class="nav-card group rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-left shadow-sm hover:shadow-md hover:bg-amber-50 hover:border-amber-200 transition"
                data-screen="textos-screen">
          <div class="flex items-center gap-2">
            <span class="rounded-md bg-amber-100 p-2 text-amber-700">${this.icons.document}</span>
            <span class="text-sm font-medium text-amber-900">Textos</span>
          </div>
        </button>

        <button class="nav-card group rounded-xl border border-fuchsia-100 bg-fuchsia-50/60 p-3 text-left shadow-sm hover:shadow-md hover:bg-fuchsia-50 hover:border-fuchsia-200 transition"
                data-screen="gerador-screen">
          <div class="flex items-center gap-2">
            <span class="rounded-md bg-fuchsia-100 p-2 text-fuchsia-700">${this.icons.wand}</span>
            <span class="text-sm font-medium text-fuchsia-900">Gerador</span>
          </div>
        </button>
      </nav>

      <main class="space-y-8">
        <!-- Estatísticas com faixa colorida -->
        <section class="stats-section">
          <h3 class="mb-3 inline-flex items-center gap-2 text-base font-semibold text-gray-900">
            <span class="text-indigo-600">${this.icons.chart}</span><span>Estatísticas</span>
          </h3>

            <div id="dashboard-stats" class="grid gap-4 sm:grid-cols-3">
              <!-- Quizzes -->
              <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div class="h-1 w-full rounded-t-xl bg-violet-500"></div>
                <div class="mt-3 flex items-center justify-between">
                  <span class="text-sm text-gray-600">Quizzes</span>
                  <span class="rounded-md bg-violet-50 p-2 text-violet-700">${this.icons.brain}</span>
                </div>
                <div class="mt-2 text-2xl font-semibold text-gray-900 stat-number" data-stat="quizzes">0</div>
              </div>

              <!-- Textos -->
              <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div class="h-1 w-full rounded-t-xl bg-amber-500"></div>
                <div class="mt-3 flex items-center justify-between">
                  <span class="text-sm text-gray-600">Textos</span>
                  <span class="rounded-md bg-amber-50 p-2 text-amber-700">${this.icons.document}</span>
                </div>
                <div class="mt-2 text-2xl font-semibold text-gray-900 stat-number" data-stat="textos">0</div>
              </div>

              <!-- Cronogramas -->
              <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div class="h-1 w-full rounded-t-xl bg-sky-500"></div>
                <div class="mt-3 flex items-center justify-between">
                  <span class="text-sm text-gray-600">Cronogramas</span>
                  <span class="rounded-md bg-sky-50 p-2 text-sky-700">${this.icons.calendar}</span>
                </div>
                <div class="mt-2 text-2xl font-semibold text-gray-900 stat-number" data-stat="cronogramas">0</div>
              </div>
            </div>
                    </section>
        <!-- Atividade recente -->
        <section class="recent-section">
          <h3 class="mb-3 inline-flex items-center gap-2 text-base font-semibold text-gray-900">
            <span class="text-indigo-600">${this.icons.chart}</span><span>Atividade Recente</span>
          </h3>
          <div id="dashboard-recent" class="space-y-3">
            <div class="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-center">
              <small class="text-sm text-gray-700">Nenhuma atividade recente</small>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
`;

    // Configuração de event listeners para navegação
    const navButtons = this.element.querySelectorAll('.nav-card, .nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const screen = (btn as HTMLElement).dataset.screen;
        if (screen) onNavigate(screen);
      });
    });

    // Configuração do botão de logout
    (this.element.querySelector('#dashboard-logout') as HTMLButtonElement)
      .addEventListener('click', onLogout);
  }

  /**
   * Atualiza as estatísticas exibidas no dashboard
   * 
   * Recebe um objeto com as métricas atuais e atualiza os elementos
   * visuais correspondentes nos cards de estatísticas.
   * 
   * @param stats - Objeto contendo as estatísticas a serem exibidas
   * 
   * @example
   * ```typescript
   * dashboard.updateStats({
   *   metas: 5,
   *   horas: 120,
   *   quizzes: 15
   * });
   * ```
   */
  public updateStats(stats: Partial<DashboardStats>) {
  const set = (key: keyof DashboardStats, value?: number) => {
    const el = this.element.querySelector<HTMLElement>(`.stat-number[data-stat="${key}"]`);
    if (el) el.textContent = String(value ?? 0);
  };
  set('quizzes', stats.quizzes);
  set('textos', stats.textos);
  set('cronogramas', stats.cronogramas);
}
  /**
   * Atualiza a seção de atividades recentes
   * 
   * Substitui o conteúdo da seção de atividades recentes com novo HTML.
   * Se o conteúdo estiver vazio, exibe uma mensagem padrão de estado vazio.
   * 
   * @param content - HTML string com o conteúdo das atividades recentes
   *                  Pode ser uma string vazia para mostrar estado vazio
   * 
   * @example
   * ```typescript
   * // Adicionar atividade
   * dashboard.updateRecent(`
   *   <div class="activity-item">
   *     <span>Quiz "JavaScript Básico" finalizado</span>
   *     <small>há 2 minutos</small>
   *   </div>
   * `);
   * 
   * // Limpar atividades (mostra estado vazio)
   * dashboard.updateRecent('');
   * ```
   */
  public updateRecent(content: string) {
    const recentEl = this.element.querySelector('#dashboard-recent') as HTMLElement;
    const empty = `
      <div class="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-center">
        <small class="text-sm text-gray-700">Nenhuma atividade recente</small>
      </div>
    `;
    recentEl.innerHTML = (content && content.trim().length > 0) ? content : empty;
  }
}