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
        <h2 id="cronograma-detail-title" class="text-xl font-semibold text-gray-900">
          Detalhes do Cronograma
        </h2>
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
        const titleEl = this.element.querySelector('#cronograma-detail-title') as HTMLElement;
        const contentEl = this.element.querySelector('#cronograma-detail-content') as HTMLElement;

        titleEl.textContent = `🤖 ${cronograma.titulo}`;

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

        const cardByStatus: Record<string, string> = {
            completed: 'border-emerald-200',
            'in-progress': 'border-amber-200',
            overdue: 'border-red-200',
            pending: 'border-gray-200'
        };

        const badgeByStatus: Record<string, string> = {
            completed: 'bg-emerald-100 text-emerald-800',
            'in-progress': 'bg-amber-100 text-amber-800',
            overdue: 'bg-red-100 text-red-800',
            pending: 'bg-gray-100 text-gray-800'
        };

        const atividadesHtml = (cronograma.atividades && cronograma.atividades.length > 0)
            ? cronograma.atividades.map((atividade, index) => {
                if (!atividade.data_inicio || !atividade.data_fim) return '';

                const atividadeInicio = new Date(atividade.data_inicio);
                const atividadeFim = new Date(atividade.data_fim);
                const atividadeStatusCalc = hoje < atividadeInicio ? 'future' : hoje > atividadeFim ? 'overdue' : 'current';

                const statusIcon = atividade.status === 'concluida' ? '✅'
                    : atividade.status === 'em_andamento' ? '🔄'
                        : atividadeStatusCalc === 'overdue' ? '⚠️' : '⏳';

                const statusClass = atividade.status === 'concluida' ? 'completed'
                    : atividade.status === 'em_andamento' ? 'in-progress'
                        : atividadeStatusCalc === 'overdue' ? 'overdue' : 'pending';

                const cardBorder = cardByStatus[statusClass] ?? 'border-gray-200';
                const badgeClass = badgeByStatus[statusClass] ?? 'bg-gray-100 text-gray-800';

                return `
        <div class="atividade-card rounded-xl border ${cardBorder} bg-white shadow-sm p-4">
          <div class="atividade-header flex items-start gap-3">
            <span class="atividade-number shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">${index + 1}</span>
            <div class="flex-1">
              <div class="flex items-start justify-between gap-3">
                <h4 class="text-base font-semibold text-gray-900">${atividade.titulo}</h4>
                <div class="atividade-actions flex items-center gap-2">
                  <span class="atividade-status-icon text-lg" title="Status">${statusIcon}</span>
                  <button class="delete-atividade-btn inline-flex items-center justify-center rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
                          data-atividade-id="${atividade.id}" title="Excluir atividade">🗑️</button>
                </div>
              </div>
              ${atividade.descricao ? `<p class="atividade-description mt-1 text-sm text-gray-600">${atividade.descricao}</p>` : ''}
              <div class="atividade-dates mt-2 text-sm text-gray-700">
                <span class="date-range">📅 ${atividadeInicio.toLocaleDateString('pt-BR')} – ${atividadeFim.toLocaleDateString('pt-BR')}</span>
              </div>
              <div class="atividade-status mt-3">
                <span class="status-badge inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}">
                  ${atividade.status === 'concluida' ? 'Concluída'
                        : atividade.status === 'em_andamento' ? 'Em andamento'
                            : atividadeStatusCalc === 'overdue' ? 'Atrasada'
                                : atividadeStatusCalc === 'current' ? 'Atual' : 'Futura'}
                </span>
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
      ${cronograma.descricao ? `<p class="cronograma-description text-gray-700">${cronograma.descricao}</p>` : ''}
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
        <span class="ai-label inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">🤖 Gerado pela IA</span>
      </div>
    </div>
  </div>

  <div class="atividades-section">
    <h3 class="mt-6 mb-3 text-base font-semibold text-gray-900">📋 Atividades do Cronograma</h3>
    <div class="atividades-list grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      ${atividadesHtml}
    </div>
  </div>
`;

        // listeners permanecem iguais
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
