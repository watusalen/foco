/**
 * CronogramasView — Tela principal de listagem de cronogramas de estudo.
 *
 * Funções principais:
 *  - Exibir todos os cronogramas do usuário.
 *  - Permitir gerar um novo cronograma via IA.
 *  - Navegar para os detalhes de um cronograma.
 *  - Excluir um cronograma existente.
 *
 * Paleta de cores utilizada:
 *  - Tons de azul (sky) para elementos primários e botões principais.
 *  - Tons de cinza e verde para estados de status.
 *
 * Elementos esperados no DOM:
 *  - #cronogramas-screen: container principal da tela.
 *
 * Callbacks fornecidos no construtor:
 *  - onBack(): volta para a tela anterior.
 *  - onGenerateCronograma(): aciona a geração automática de um novo cronograma.
 *  - onViewCronograma(id: string): abre os detalhes do cronograma especificado.
 *  - onDeleteCronograma(id: string): remove o cronograma especificado.
 */
export class CronogramasView {
  /** Elemento raiz da tela de cronogramas. */
  public element: HTMLElement;

  /** Ícones SVG reutilizáveis para manter consistência visual na interface. */
  private readonly icons = {
    /** Ícone de voltar */
    back: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M10.5 19.5L3 12l7.5-7.5M3 12h18"></path>
</svg>`.trim(),

    /** Ícone de varinha mágica (IA) */
    wand: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M4 20L16.5 7.5"></path>
  <rect x="16" y="4" width="4" height="4" rx="1" transform="rotate(45 18 6)"></rect>
  <path d="M12 3l.4 1.2L13.6 5 12.4 5.4 12 6.6 11.6 5.4 10.4 5l1.2-.8z"></path>
  <path d="M20 10l.3.9.7.7-.9.3-.3.9-.3-.9-.9-.3.7-.7z"></path>
</svg>`.trim(),

    /** Ícone de lixeira */
    trash: `
<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 6h18" />
  <path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" />
  <path d="M19 6l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  <path d="M10 11v6M14 11v6" />
</svg>`.trim(),

    /** Ícone de calendário */
    calendar: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <rect x="3" y="4" width="18" height="18" rx="2"></rect>
  <path d="M16 2v4M8 2v4M3 10h18"></path>
</svg>`.trim(),
  };

  /**
   * Construtor da tela de cronogramas.
   *
   * @param onBack Função chamada ao clicar no botão de voltar.
   * @param onGenerateCronograma Função chamada ao clicar no botão "Gerar com IA".
   * @param onViewCronograma Função chamada ao clicar no botão "Ver atividades" de um cronograma.
   * @param onDeleteCronograma Função chamada ao clicar no botão de excluir um cronograma.
   */
  constructor(
    onBack: () => void,
    onGenerateCronograma: () => void,
    onViewCronograma: (id: string) => void,
    onDeleteCronograma: (id: string) => void
  ) {
    // Seleciona o container principal da tela
    this.element = document.getElementById("cronogramas-screen")! as HTMLElement;

    // HTML inicial fixo da tela
    this.element.innerHTML = `
  <div class="min-h-screen bg-gradient-to-b from-white to-sky-50/40">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <!-- Header consistente -->
      <header class="mb-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <button id="cronogramas-back"
          class="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300">
          ${this.icons.back}<span>Voltar</span>
        </button>

        <h2 class="justify-self-center text-xl font-semibold text-gray-900">
          Cronogramas de Estudo
        </h2>

        <button id="cronogramas-generate"
          class="justify-self-end inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700">
          ${this.icons.wand}<span>Gerar com IA</span>
        </button>
      </header>

      <!-- Banner informativo (sky) -->
      <div class="mb-6 rounded-md border border-sky-200 bg-sky-50 p-4 text-sky-900">
        <div class="flex items-center gap-2 font-medium">
          <span class="rounded-md bg-sky-100 p-1.5 text-sky-700">${this.icons.wand}</span>
          <strong>Seus cronogramas são criados pela IA!</strong>
        </div>
        <p class="mt-1 text-sm">Gere trilhas com atividades e acompanhe seu progresso.</p>
      </div>

      <!-- Lista de cronogramas -->
      <div id="cronogramas-list" class="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
        <p class="text-gray-600">Carregando cronogramas...</p>
      </div>
    </div>
  </div>
`;

    // Eventos de botões fixos
    (this.element.querySelector('#cronogramas-back') as HTMLButtonElement)
      .addEventListener('click', onBack);

    (this.element.querySelector('#cronogramas-generate') as HTMLButtonElement)
      .addEventListener('click', onGenerateCronograma);

    // Armazenar callbacks para uso posterior
    this.onViewCronograma = onViewCronograma;
    this.onDeleteCronograma = onDeleteCronograma;
  }

  /** Callback de visualização de um cronograma. */
  private onViewCronograma: (id: string) => void;

  /** Callback de exclusão de um cronograma. */
  private onDeleteCronograma: (id: string) => void;

  /**
   * Atualiza a lista de cronogramas na interface.
   *
   * @param cronogramas Lista de cronogramas a serem exibidos.
   */
  public updateCronogramasList(cronogramas: Array<{
    id: string,
    titulo: string,
    descricao?: string,
    dataInicio: string,
    dataFim: string,
    ativo?: boolean,
    atividades?: any[]
  }>) {
    const listEl = this.element.querySelector('#cronogramas-list') as HTMLElement;

    // Layout: 1 coluna centralizada
    listEl.className = 'grid grid-cols-1 gap-4 max-w-3xl mx-auto';

    // Estado vazio
    if (cronogramas.length === 0) {
      listEl.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-sky-200 bg-sky-50/40 p-6 text-center">
        <div class="inline-flex items-center gap-2 text-sky-700">
          <span class="rounded-md bg-sky-100 p-1.5">${this.icons.calendar}</span>
          <h3 class="text-lg font-medium text-gray-900">Ainda não há cronogramas</h3>
        </div>
        <p class="text-sm text-gray-700">Clique em "Gerar com IA" para criar seu primeiro cronograma personalizado!</p>
      </div>
    `;
      return;
    }

    // Cores dos chips de status
    const chipByStatus: Record<string, string> = {
      futuro: 'bg-sky-100 text-sky-800',
      ativo: 'bg-emerald-100 text-emerald-800',
      expirado: 'bg-gray-200 text-gray-800'
    };

    // Monta cards de cronogramas
    const cronogramasHtml = cronogramas.map(c => {
      const hoje = new Date();
      const inicio = new Date(c.dataInicio);
      const fim = new Date(c.dataFim);

      // Determina status
      const status = hoje < inicio ? 'futuro' : hoje > fim ? 'expirado' : 'ativo';
      const statusText = status === 'futuro' ? 'Não iniciado' : status === 'ativo' ? 'Em andamento' : 'Finalizado';

      // Calcula dias restantes
      const diasRestantes = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      const diasRestantesText = status === 'ativo'
        ? (diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Último dia')
        : '';

      // Conta atividades
      const atividadesCount = c.atividades ? c.atividades.length : 0;

      // Remove prefixo "cronograma:" se houver
      const tituloLimpado = c.titulo.replace(/^cronograma:\s*/i, '').trim();

      return `
      <div class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <!-- Cabeçalho -->
        <div class="mb-2 flex items-start justify-between gap-3">
          <div>
            <h4 class="text-lg font-semibold text-gray-900 leading-snug">${tituloLimpado}</h4>
            ${c.descricao ? `<p class="mt-1 text-sm text-gray-600">${c.descricao}</p>` : ''}
          </div>
          <button
            class="delete-btn inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600"
            data-cronograma-id="${c.id}" title="Excluir cronograma" aria-label="Excluir cronograma">
            ${this.icons.trash}
          </button>
        </div>

        <!-- Info -->
        <div class="mt-3 grid gap-2 text-sm">
          <div class="text-gray-800 inline-flex items-center gap-2">
            <span class="text-sky-700">${this.icons.calendar}</span>
            <span><strong class="font-medium">Período:</strong>
            ${inicio.toLocaleDateString('pt-BR')} – ${fim.toLocaleDateString('pt-BR')}</span>
          </div>
          <div class="text-gray-800 flex items-center gap-2 flex-wrap">
            <strong class="font-medium">Status:</strong>
            <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${chipByStatus[status]}">${statusText}</span>
            ${diasRestantesText ? `<span class="text-gray-600">• ${diasRestantesText}</span>` : ''}
          </div>
          <div class="text-gray-800">
            <strong class="font-medium">Atividades:</strong>
            ${atividadesCount} no total
          </div>
        </div>

        <!-- Rodapé -->
        <div class="mt-4 flex items-center justify-between">
          <button
            class="view-btn inline-flex items-center rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
            data-cronograma-id="${c.id}" title="Ver atividades">
            Ver atividades
          </button>
          <span class="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
            <span class="text-[13px]">${this.icons.wand}</span><span>Gerado pela IA</span>
          </span>
        </div>
      </div>
    `;
    }).join('');

    // Renderiza na tela
    listEl.innerHTML = cronogramasHtml;

    // Eventos de botões dinâmicos
    listEl.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.cronogramaId!;
        this.onViewCronograma(id);
      });
    });
    listEl.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.cronogramaId!;
        this.onDeleteCronograma(id);
      });
    });
  }
}
