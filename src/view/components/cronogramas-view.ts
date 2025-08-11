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
    
    /** Cronograma sendo editado atualmente */
    private editingCronograma: any = null;

    /**
     * @param onBack Função chamada ao voltar para o dashboard
     * @param onCreateCronograma Função chamada ao criar cronograma
     * @param onEditCronograma Função chamada ao editar cronograma (recebe dados atualizados)
     * @param onDeleteCronograma Função chamada ao excluir cronograma
     */
    constructor(
        onBack: () => void,
        onCreateCronograma: (titulo: string, descricao: string, dataInicio: string, dataFim: string) => void,
        onEditCronograma: (id: string, titulo: string, descricao: string, dataInicio: string, dataFim: string) => void,
        onDeleteCronograma: (id: string) => void
    ) {
        this.element = document.getElementById("cronogramas-screen")! as HTMLElement;
        
        this.element.innerHTML = `
            <div class="cronogramas-container">
                <header class="page-header">
                    <button id="cronogramas-back" class="back-btn">← Voltar</button>
                    <h2>Cronogramas de Estudo</h2>
                    <button id="cronogramas-add" class="add-btn">+ Novo Cronograma</button>
                </header>
                
                <div id="cronogramas-form" class="cronograma-form hidden">
                    <h3>Novo Cronograma</h3>
                    <form id="cronograma-form">
                        <div class="input-group">
                            <input id="cronograma-titulo" type="text" placeholder="Título do cronograma" required />
                        </div>
                        <div class="input-group">
                            <textarea id="cronograma-descricao" placeholder="Descrição (opcional)" rows="3"></textarea>
                        </div>
                        <div class="date-range">
                            <div class="input-group">
                                <input id="cronograma-data-inicio" type="date" required />
                                <label for="cronograma-data-inicio">Data de início</label>
                            </div>
                            <div class="input-group">
                                <input id="cronograma-data-fim" type="date" required />
                                <label for="cronograma-data-fim">Data de fim</label>
                            </div>
                        </div>
                        <div id="cronograma-form-error" class="error-msg" style="display:none"></div>
                        <div class="button-group">
                            <button type="submit" id="cronograma-save">Salvar</button>
                            <button type="button" id="cronograma-cancel">Cancelar</button>
                        </div>
                    </form>
                </div>
                
                <div id="cronogramas-list" class="cronogramas-list">
                    <p>Carregando cronogramas...</p>
                </div>
            </div>
        `;

        // Event listeners
        const backBtn = this.element.querySelector('#cronogramas-back') as HTMLButtonElement;
        const addBtn = this.element.querySelector('#cronogramas-add') as HTMLButtonElement;
        const form = this.element.querySelector('#cronograma-form') as HTMLFormElement;
        const cancelBtn = this.element.querySelector('#cronograma-cancel') as HTMLButtonElement;
        const formContainer = this.element.querySelector('#cronogramas-form') as HTMLElement;

        backBtn.addEventListener('click', onBack);
        
        addBtn.addEventListener('click', () => {
            formContainer.classList.remove('hidden');
            // Set default dates
            const today = new Date().toISOString().split('T')[0];
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            (this.element.querySelector('#cronograma-data-inicio') as HTMLInputElement).value = today;
            (this.element.querySelector('#cronograma-data-fim') as HTMLInputElement).value = nextWeek;
        });
        
        cancelBtn.addEventListener('click', () => {
            this.cancelEdit();
            this.clearFormError();
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.clearFormError();
            
            const titulo = (this.element.querySelector('#cronograma-titulo') as HTMLInputElement).value.trim();
            const descricao = (this.element.querySelector('#cronograma-descricao') as HTMLTextAreaElement).value.trim();
            const dataInicio = (this.element.querySelector('#cronograma-data-inicio') as HTMLInputElement).value;
            const dataFim = (this.element.querySelector('#cronograma-data-fim') as HTMLInputElement).value;
            
            if (!titulo) {
                this.setFormError("Título é obrigatório.");
                return;
            }
            
            if (!dataInicio || !dataFim) {
                this.setFormError("Datas de início e fim são obrigatórias.");
                return;
            }
            
            if (new Date(dataInicio) >= new Date(dataFim)) {
                this.setFormError("Data de início deve ser anterior à data de fim.");
                return;
            }
            
            // Verifica se está editando ou criando
            if (this.editingCronograma) {
                this.onEditCronograma(this.editingCronograma.id, titulo, descricao, dataInicio, dataFim);
                this.editingCronograma = null;
                const formTitle = this.element.querySelector("#cronogramas-form h3") as HTMLElement;
                if (formTitle) formTitle.textContent = "Novo Cronograma";
            } else {
                onCreateCronograma(titulo, descricao, dataInicio, dataFim);
            }
            
            formContainer.classList.add('hidden');
            form.reset();
        });

        // Store callbacks for dynamic content
        this.onEditCronograma = onEditCronograma;
        this.onDeleteCronograma = onDeleteCronograma;
    }

    private onEditCronograma: (id: string, titulo: string, descricao: string, dataInicio: string, dataFim: string) => void;
    private onDeleteCronograma: (id: string) => void;

    public setFormError(msg: string) {
        const errorEl = this.element.querySelector('#cronograma-form-error') as HTMLElement;
        errorEl.textContent = msg;
        errorEl.style.display = '';
    }

    public clearFormError() {
        const errorEl = this.element.querySelector('#cronograma-form-error') as HTMLElement;
        errorEl.style.display = 'none';
    }

    /**
     * Inicia a edição de um cronograma
     */
    public startEditCronograma(cronograma: any): void {
        this.editingCronograma = cronograma;
        
        // Preenche o formulário com os dados existentes
        const tituloInput = this.element.querySelector("#cronograma-titulo") as HTMLInputElement;
        const descricaoInput = this.element.querySelector("#cronograma-descricao") as HTMLTextAreaElement;
        const dataInicioInput = this.element.querySelector("#cronograma-data-inicio") as HTMLInputElement;
        const dataFimInput = this.element.querySelector("#cronograma-data-fim") as HTMLInputElement;
        
        if (tituloInput) tituloInput.value = cronograma.titulo;
        if (descricaoInput) descricaoInput.value = cronograma.descricao || "";
        if (dataInicioInput) dataInicioInput.value = cronograma.dataInicio;
        if (dataFimInput) dataFimInput.value = cronograma.dataFim;
        
        // Atualiza o título do formulário
        const formTitle = this.element.querySelector("#cronogramas-form h3") as HTMLElement;
        if (formTitle) formTitle.textContent = "Editar Cronograma";
        
        // Mostra o formulário
        const formContainer = this.element.querySelector("#cronogramas-form") as HTMLElement;
        formContainer.classList.remove('hidden');
    }

    /**
     * Cancela a edição atual
     */
    public cancelEdit(): void {
        this.editingCronograma = null;
        const formTitle = this.element.querySelector("#cronogramas-form h3") as HTMLElement;
        if (formTitle) formTitle.textContent = "Novo Cronograma";
        
        const formContainer = this.element.querySelector("#cronogramas-form") as HTMLElement;
        formContainer.classList.add('hidden');
        
        const form = this.element.querySelector("#cronograma-form") as HTMLFormElement;
        form.reset();
    }

    public updateCronogramasList(cronogramas: Array<{
        id: string, 
        titulo: string, 
        descricao?: string, 
        dataInicio: string, 
        dataFim: string,
        ativo?: boolean
    }>) {
        const listEl = this.element.querySelector('#cronogramas-list') as HTMLElement;
        
        if (cronogramas.length === 0) {
            listEl.innerHTML = '<p class="empty-message">Nenhum cronograma cadastrado ainda.</p>';
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

            return `
                <div class="cronograma-card ${status}">
                    <div class="cronograma-header">
                        <h4>${cronograma.titulo}</h4>
                        <div class="cronograma-actions">
                            <button class="edit-btn" data-cronograma-id="${cronograma.id}">✏️</button>
                            <button class="delete-btn" data-cronograma-id="${cronograma.id}">🗑️</button>
                        </div>
                    </div>
                    ${cronograma.descricao ? `<p class="cronograma-description">${cronograma.descricao}</p>` : ''}
                    <div class="cronograma-dates">
                        <span class="date-info">
                            📅 ${new Date(cronograma.dataInicio).toLocaleDateString('pt-BR')} - 
                            ${new Date(cronograma.dataFim).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    <div class="cronograma-status">
                        <span class="status-badge ${status}">${statusText}</span>
                        ${diasRestantesText ? `<span class="days-remaining">${diasRestantesText}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        listEl.innerHTML = cronogramasHtml;

        // Add event listeners for edit/delete buttons
        listEl.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cronogramaId = (btn as HTMLElement).dataset.cronogramaId!;
                const cronograma = cronogramas.find(c => c.id === cronogramaId);
                if (cronograma) {
                    this.startEditCronograma(cronograma);
                }
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
