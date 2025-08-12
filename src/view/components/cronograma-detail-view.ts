import { Atividade } from '../../model/Atividade';

/**
 * CronogramaDetailView
 *
 * Responsável por exibir os detalhes de um cronograma específico
 * incluindo todas as suas atividades.
 *
 * Elementos esperados no DOM:
 * - #cronograma-detail-screen: container principal da tela de detalhes
 */
export class CronogramaDetailView {
  /** Elemento principal da tela de detalhes */
  public element: HTMLElement;

  private onDeleteAtividade: (atividadeId: string) => void;

  /**
   * @param onBack Função chamada ao voltar para a lista de cronogramas
   * @param onDeleteAtividade Função chamada ao excluir uma atividade
   */
  constructor(onBack: () => void, onDeleteAtividade: (atividadeId: string) => void) {
    this.element = document.getElementById("cronograma-detail-screen")! as HTMLElement;

    this.element.innerHTML = `
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <header class="flex items-center gap-3 mb-6">
        <button id="cronograma-detail-back"
          class="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
          ← Voltar aos Cronogramas
        </button>
      </header>

      <div id="cronograma-detail-content" class="space-y-8"></div>
    </div>
  </div>
`;

    // Event listeners
    const backBtn = this.element.querySelector('#cronograma-detail-back') as HTMLButtonElement;
    backBtn.addEventListener('click', onBack);

    // Store callback for dynamic content
    this.onDeleteAtividade = onDeleteAtividade;
  }

  /**
   * Atualiza a tela com os detalhes do cronograma
   */
  public showCronogramaDetails(cronograma: {
    id: string,
    titulo: string,
    descricao?: string,
    dataInicio: string,
    dataFim: string,
    atividades?: Atividade[]
  }) {
    const contentEl = this.element.querySelector('#cronograma-detail-content') as HTMLElement;

    const hoje = new Date();
    const inicio = new Date(cronograma.dataInicio);
    const fim = new Date(cronograma.dataFim);
    const status = hoje < inicio ? 'futuro' : hoje > fim ? 'expirado' : 'ativo';
    const statusText = status === 'futuro' ? 'Não iniciado' : status === 'ativo' ? 'Em andamento' : 'Finalizado';

    const diasRestantes = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const diasRestantesText = status === 'ativo'
      ? (diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Último dia')
      : '';

    const chipByStatus: Record<string, string> = {
      futuro: 'bg-blue-100 text-blue-800',
      ativo: 'bg-emerald-100 text-emerald-800',
      expirado: 'bg-gray-200 text-gray-800'
    };

    const atividadesHtml = (cronograma.atividades && cronograma.atividades.length > 0)
      ? cronograma.atividades.map((atividade, index) => {
        if (!atividade.data_inicio || !atividade.data_fim) return '';

        const atividadeInicio = new Date(atividade.data_inicio);
        const atividadeFim = new Date(atividade.data_fim);

        // current | future | overdue (pelo calendário)
        const calc =
          hoje < atividadeInicio ? 'future' :
          hoje > atividadeFim ? 'overdue' : 'current';

        // Estilo e label do chip (prioriza 'concluída' e 'em_andamento')
        const badge = (() => {
          if (atividade.status === 'concluida') {
            return { wrap: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-600', label: 'Concluída' };
          }
          if (atividade.status === 'em_andamento') {
            return { wrap: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-600', label: 'Em andamento' };
          }
          if (calc === 'current') {
            return { wrap: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-600', label: 'Atual' };
          }
          if (calc === 'future') {
            return { wrap: 'bg-slate-100 text-slate-800', dot: 'bg-slate-400', label: 'Futura' };
          }
          return { wrap: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500', label: 'Atrasada' };
        })();

        return `
  <div class="atividade-card rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-start gap-3">
      <span class="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
        ${index + 1}
      </span>

      <div class="flex-1">
        <!-- Título + status + excluir -->
        <div class="flex items-start justify-between gap-3">
          <h4 class="text-base font-semibold text-gray-900">${atividade.titulo}</h4>

          <div class="flex items-center gap-2">
            <!-- Chip de status -->
            <span class="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${badge.wrap}">
              <span class="h-2 w-2 rounded-full ${badge.dot}"></span>
              ${badge.label}
            </span>

            <!-- Botão excluir -->
            <button
              class="delete-atividade-btn group inline-flex items-center justify-center rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"
              data-atividade-id="${atividade.id}"
              title="Excluir atividade"
              aria-label="Excluir atividade">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="1.8"
                   stroke-linecap="round" stroke-linejoin="round"
                   class="h-4 w-4">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                <path d="M10 11v6M14 11v6"></path>
                <path d="M8 6l1-2h6l1 2"></path>
              </svg>
            </button>
          </div>
        </div>

        ${atividade.descricao ? `
          <p class="mt-1 text-sm text-gray-600">${atividade.descricao}</p>
        ` : ''}

        <!-- Datas -->
        <div class="mt-2 flex items-center gap-2 text-sm text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="1.8"
               stroke-linecap="round" stroke-linejoin="round"
               class="h-4 w-4 text-gray-500" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
            <path d="M16 2v4M8 2v4M3 10h18"></path>
          </svg>
          <span>${atividadeInicio.toLocaleDateString('pt-BR')} – ${atividadeFim.toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  </div>
`;
      }).filter(Boolean).join('')
      : '<p class="no-activities text-sm text-gray-600">Nenhuma atividade encontrada para este cronograma.</p>';

    contentEl.innerHTML = `
  <div class="cronograma-overview">
    <div class="cronograma-info rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 class="text-lg md:text-xl font-semibold text-gray-900">${cronograma.titulo}</h2>
      ${cronograma.descricao ? `<p class="mt-1 text-gray-700">${cronograma.descricao}</p>` : ''}
      <div class="cronograma-timeline mt-4 grid gap-2 text-sm">
        <div class="timeline-item text-gray-800">
          <strong class="font-medium">Período:</strong>
          ${inicio.toLocaleDateString('pt-BR')} – ${fim.toLocaleDateString('pt-BR')}
        </div>
        <div class="timeline-item text-gray-800 flex items-center gap-2 flex-wrap">
          <strong class="font-medium">Status:</strong>
          <span class="status-badge inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${chipByStatus[status]}">${statusText}</span>
          ${diasRestantesText ? `<span class="text-gray-600">• ${diasRestantesText}</span>` : ''}
        </div>
        <div class="timeline-item text-gray-800">
          <strong class="font-medium">Atividades:</strong>
          ${cronograma.atividades ? cronograma.atividades.length : 0} no total
        </div>
      </div>
      <div class="ai-badge mt-4">
        <span class="ai-label inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">Gerado pela IA</span>
      </div>
    </div>
  </div>

  <div class="atividades-section">
    <h3 class="mt-6 mb-3 flex items-center gap-2 text-base font-semibold text-gray-900">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="1.8"
           stroke-linecap="round" stroke-linejoin="round"
           class="h-5 w-5 text-gray-900" aria-hidden="true">
        <rect x="6" y="5" width="12" height="16" rx="2"></rect>
        <rect x="9" y="2" width="6" height="3" rx="1.5"></rect>
      </svg>
      Atividades do Cronograma
    </h3>
    <div class="atividades-list grid grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
      ${atividadesHtml}
    </div>
  </div>
`;

    // listeners
    const deleteButtons = contentEl.querySelectorAll('.delete-atividade-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const atividadeId = (btn as HTMLElement).dataset.atividadeId!;
        this.onDeleteAtividade(atividadeId);
      });
    });
  }

  /**
   * Mostra mensagem de erro ao carregar cronograma
   */
  public showError(message: string) {
    const contentEl = this.element.querySelector('#cronograma-detail-content') as HTMLElement;
    contentEl.innerHTML = `
    <div class="flex flex-col items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <div class="text-3xl">❌</div>
      <h3 class="text-lg font-semibold text-red-800">Erro ao carregar cronograma</h3>
      <p class="text-sm text-red-700">${message}</p>
    </div>
  `;
  }
}
