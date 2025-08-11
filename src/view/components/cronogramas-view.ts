/**
 * CronogramasView
 * 
 * Responsável por exibir e gerenciar a tela de cronogramas.
 * Permite visualizar e criar cronogramas de estudo.
 * 
 * Elementos esperados no DOM:
 * - #cronogramas-screen: container principal da tela de cronogramas
 */
export class CronogramasView {
    /** Elemento principal da tela de cronogramas */
    public element: HTMLElement;

    /**
     * @param onBack Função chamada ao voltar para o dashboard
     * @param onGenerateCronograma Função chamada para gerar cronograma via IA
     * @param onViewCronograma Função chamada para visualizar cronograma e suas atividades
     * @param onDeleteCronograma Função chamada ao excluir cronograma
     */
    constructor(
        onBack: () => void,
        onGenerateCronograma: () => void,
        onViewCronograma: (id: string) => void,
        onDeleteCronograma: (id: string) => void
    ) {
        this.element = document.getElementById("cronogramas-screen")! as HTMLElement;

        this.element.innerHTML = `
<header class="mb-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">
  <button id="cronogramas-back"
    class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
    ← Voltar
  </button>

  <h2 class="justify-self-center text-xl font-semibold text-gray-900">
    Cronogramas de Estudo
  </h2>

  <button id="cronogramas-generate"
    class="justify-self-end inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
    🤖 Gerar com IA
  </button>
</header>

<div id="cronogramas-list" class="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
  </div>
`;

        // Event listeners
        const backBtn = this.element.querySelector('#cronogramas-back') as HTMLButtonElement;
        const generateBtn = this.element.querySelector('#cronogramas-generate') as HTMLButtonElement;

        backBtn.addEventListener('click', onBack);
        generateBtn.addEventListener('click', onGenerateCronograma);

        // Store callbacks for dynamic content
        this.onViewCronograma = onViewCronograma;
        this.onDeleteCronograma = onDeleteCronograma;
    }

    private onViewCronograma: (id: string) => void;
    private onDeleteCronograma: (id: string) => void;

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

        if (cronogramas.length === 0) {
            listEl.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-6 text-center">
      <div class="text-4xl">🤖</div>
      <h3 class="text-lg font-medium text-gray-900">Ainda não há cronogramas</h3>
      <p class="text-sm text-gray-600">Clique em "Gerar com IA" para criar seu primeiro cronograma personalizado!</p>
    </div>
  `;
            return;
        }

        const badgeByStatus: Record<string, string> = {
            futuro: 'bg-blue-100 text-blue-800',
            ativo: 'bg-emerald-100 text-emerald-800',
            expirado: 'bg-gray-200 text-gray-800'
        };

        const cronogramasHtml = cronogramas.map(cronograma => {
            const hoje = new Date();
            const inicio = new Date(cronograma.dataInicio);
            const fim = new Date(cronograma.dataFim);
            const status = hoje < inicio ? 'futuro' : hoje > fim ? 'expirado' : 'ativo';
            const statusText = status === 'futuro' ? 'Não iniciado' : status === 'ativo' ? 'Em andamento' : 'Finalizado';
            const diasRestantes = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            const diasRestantesText = status === 'ativo'
                ? (diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Último dia')
                : '';
            const atividadesCount = cronograma.atividades ? cronograma.atividades.length : 0;

            return `
    <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div class="flex items-start justify-between gap-2">
        <h4 class="text-base font-semibold text-gray-900">🤖 ${cronograma.titulo}</h4>
        <div class="flex items-center gap-2">
          <button class="view-btn inline-flex items-center justify-center rounded-md border border-gray-200 px-2 py-1 hover:bg-gray-50"
            data-cronograma-id="${cronograma.id}" title="Ver atividades">👁️</button>
          <button class="delete-btn inline-flex items-center justify-center rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
            data-cronograma-id="${cronograma.id}" title="Excluir cronograma">🗑️</button>
        </div>
      </div>
      ${cronograma.descricao ? `<p class="mt-1 text-sm text-gray-600">${cronograma.descricao}</p>` : ''}
      <div class="mt-3 text-sm text-gray-700">
        📅 ${inicio.toLocaleDateString('pt-BR')} – ${fim.toLocaleDateString('pt-BR')}
      </div>
      <div class="mt-2 text-sm text-gray-700">
        📋 ${atividadesCount} atividades
      </div>
      <div class="mt-3 flex items-center gap-2 flex-wrap">
        <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeByStatus[status]}">${statusText}</span>
        ${diasRestantesText ? `<span class="text-gray-600 text-xs">${diasRestantesText}</span>` : ''}
      </div>
      <div class="mt-3">
        <span class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">Gerado pela IA</span>
      </div>
    </div>
  `;
        }).join('');

        listEl.innerHTML = cronogramasHtml;

        // Add event listeners for view and delete buttons
        listEl.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cronogramaId = (btn as HTMLElement).dataset.cronogramaId!;
                this.onViewCronograma(cronogramaId);
            });
        });

        listEl.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cronogramaId = (btn as HTMLElement).dataset.cronogramaId!;
                this.onDeleteCronograma(cronogramaId);
            });
        });
    }
}
