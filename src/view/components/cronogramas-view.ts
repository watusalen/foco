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
            <div class="cronogramas-container">
                <header class="page-header">
                    <button id="cronogramas-back" class="back-btn">← Voltar</button>
                    <h2>Cronogramas de Estudo</h2>
                    <button id="cronogramas-generate" class="add-btn">🤖 Gerar com IA</button>
                </header>
                
                <div class="cronogramas-info">
                    <p class="info-text">
                        💡 <strong>Seus cronogramas são criados pela IA!</strong><br>
                        Clique em "Gerar com IA" para criar um cronograma personalizado baseado em seus objetivos.
                    </p>
                </div>
                
                <div id="cronogramas-list" class="cronogramas-list">
                    <p>Carregando cronogramas...</p>
                </div>
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
                <div class="empty-state">
                    <div class="empty-icon">🤖</div>
                    <h3>Ainda não há cronogramas</h3>
                    <p>Clique em "Gerar com IA" para criar seu primeiro cronograma personalizado!</p>
                </div>
            `;
            return;
        }

        const cronogramasHtml = cronogramas.map(cronograma => {
            const hoje = new Date();
            const inicio = new Date(cronograma.dataInicio);
            const fim = new Date(cronograma.dataFim);
            const status = hoje < inicio ? 'futuro' : hoje > fim ? 'expirado' : 'ativo';
            const statusText = status === 'futuro' ? 'Não iniciado' : status === 'ativo' ? 'Em andamento' : 'Finalizado';
            
            const diasRestantes = Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            const diasRestantesText = status === 'ativo' ? 
                (diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Último dia') : 
                '';

            const atividadesCount = cronograma.atividades ? cronograma.atividades.length : 0;

            return `
                <div class="cronograma-card ${status}">
                    <div class="cronograma-header">
                        <h4>🤖 ${cronograma.titulo}</h4>
                        <div class="cronograma-actions">
                            <button class="view-btn" data-cronograma-id="${cronograma.id}" title="Ver atividades">👁️</button>
                            <button class="delete-btn" data-cronograma-id="${cronograma.id}" title="Excluir cronograma">🗑️</button>
                        </div>
                    </div>
                    ${cronograma.descricao ? `<p class="cronograma-description">${cronograma.descricao}</p>` : ''}
                    <div class="cronograma-dates">
                        <span class="date-info">
                            📅 ${new Date(cronograma.dataInicio).toLocaleDateString('pt-BR')} - 
                            ${new Date(cronograma.dataFim).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    <div class="cronograma-meta">
                        <span class="activities-count">📋 ${atividadesCount} atividades</span>
                    </div>
                    <div class="cronograma-status">
                        <span class="status-badge ${status}">${statusText}</span>
                        ${diasRestantesText ? `<span class="days-remaining">${diasRestantesText}</span>` : ''}
                    </div>
                    <div class="ai-badge">
                        <span class="ai-label">Gerado pela IA</span>
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
