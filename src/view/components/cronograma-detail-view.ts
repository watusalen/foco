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
            <div class="cronograma-detail-container">
                <header class="page-header">
                    <button id="cronograma-detail-back" class="back-btn">← Voltar aos Cronogramas</button>
                    <h2 id="cronograma-detail-title">Detalhes do Cronograma</h2>
                </header>
                
                <div id="cronograma-detail-content" class="cronograma-detail-content">
                    <p>Carregando detalhes...</p>
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
        const diasRestantesText = status === 'ativo' ? 
            (diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Último dia') : 
            '';

        const atividadesHtml = cronograma.atividades && cronograma.atividades.length > 0 ? 
            cronograma.atividades.map((atividade, index) => {
                if (!atividade.data_inicio || !atividade.data_fim) {
                    return ''; // Skip atividades sem datas
                }
                
                const atividadeInicio = new Date(atividade.data_inicio);
                const atividadeFim = new Date(atividade.data_fim);
                const atividadeStatus = hoje < atividadeInicio ? 'future' : hoje > atividadeFim ? 'overdue' : 'current';
                
                const statusIcon = atividade.status === 'concluida' ? '✅' : 
                                  atividade.status === 'em_andamento' ? '🔄' : 
                                  atividadeStatus === 'overdue' ? '⚠️' : '⏳';
                
                const statusClass = atividade.status === 'concluida' ? 'completed' : 
                                   atividade.status === 'em_andamento' ? 'in-progress' : 
                                   atividadeStatus === 'overdue' ? 'overdue' : 'pending';

                return `
                    <div class="atividade-card ${statusClass}">
                        <div class="atividade-header">
                            <span class="atividade-number">${index + 1}</span>
                            <h4>${atividade.titulo}</h4>
                            <div class="atividade-actions">
                                <span class="atividade-status-icon">${statusIcon}</span>
                                <button class="delete-atividade-btn" data-atividade-id="${atividade.id}" title="Excluir atividade">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        ${atividade.descricao ? `<p class="atividade-description">${atividade.descricao}</p>` : ''}
                        <div class="atividade-dates">
                            <span class="date-range">
                                📅 ${atividadeInicio.toLocaleDateString('pt-BR')} - ${atividadeFim.toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                        <div class="atividade-status">
                            <span class="status-badge ${statusClass}">
                                ${atividade.status === 'concluida' ? 'Concluída' : 
                                  atividade.status === 'em_andamento' ? 'Em andamento' : 
                                  atividadeStatus === 'overdue' ? 'Atrasada' : 
                                  atividadeStatus === 'current' ? 'Atual' : 'Futura'}
                            </span>
                        </div>
                    </div>
                `;
            }).filter(html => html !== '').join('') :
            '<p class="no-activities">Nenhuma atividade encontrada para este cronograma.</p>';

        contentEl.innerHTML = `
            <div class="cronograma-overview">
                <div class="cronograma-info">
                    ${cronograma.descricao ? `<p class="cronograma-description">${cronograma.descricao}</p>` : ''}
                    <div class="cronograma-timeline">
                        <div class="timeline-item">
                            <strong>Período:</strong> 
                            ${inicio.toLocaleDateString('pt-BR')} - ${fim.toLocaleDateString('pt-BR')}
                        </div>
                        <div class="timeline-item">
                            <strong>Status:</strong> 
                            <span class="status-badge ${status}">${statusText}</span>
                            ${diasRestantesText ? ` • ${diasRestantesText}` : ''}
                        </div>
                        <div class="timeline-item">
                            <strong>Atividades:</strong> 
                            ${cronograma.atividades ? cronograma.atividades.length : 0} no total
                        </div>
                    </div>
                    <div class="ai-badge">
                        <span class="ai-label">🤖 Gerado pela IA</span>
                    </div>
                </div>
            </div>
            
            <div class="atividades-section">
                <h3>📋 Atividades do Cronograma</h3>
                <div class="atividades-list">
                    ${atividadesHtml}
                </div>
            </div>
        `;
        
        // Add event listeners for delete buttons
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
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Erro ao carregar cronograma</h3>
                <p>${message}</p>
            </div>
        `;
    }
}
