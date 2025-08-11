/**
 * MetasView
 * 
 * Responsável por exibir e gerenciar a tela de metas.
 * Permite criar, visualizar e gerenciar metas de estudo.
 * 
 * Elementos esperados no DOM:
 * - #metas-screen: container principal da tela de metas
 */
export class MetasView {
    /** Elemento principal da tela de metas */
    public element: HTMLElement;

    /**
     * @param onBack Função chamada ao voltar para o dashboard
     * @param onCreateMeta Função chamada ao criar uma nova meta
     * @param onEditMeta Função chamada ao editar uma meta
     * @param onDeleteMeta Função chamada ao excluir uma meta
     */
    constructor(
        onBack: () => void,
        onCreateMeta: (titulo: string, descricao: string, dataLimite: string) => void,
        onEditMeta: (id: string) => void,
        onDeleteMeta: (id: string) => void
    ) {
        this.element = document.getElementById("metas-screen")! as HTMLElement;
        
        this.element.innerHTML = `
            <div class="metas-container">
                <header class="page-header">
                    <button id="metas-back" class="back-btn">← Voltar</button>
                    <h2>Metas de Estudo</h2>
                    <button id="metas-add" class="add-btn" disabled style="opacity: 0.6;">🚧 Em Desenvolvimento</button>
                </header>
                
                <div class="development-notice">
                    <div class="notice-icon">🚧</div>
                    <div class="notice-content">
                        <h3>Funcionalidade em Desenvolvimento</h3>
                        <p>A página de Metas está sendo desenvolvida e estará disponível em breve. Por enquanto, você pode focar nos Cronogramas, Textos e Quizzes!</p>
                    </div>
                </div>
                
                <div id="metas-form" class="meta-form hidden">
                    <h3>Nova Meta</h3>
                    <form id="meta-form">
                        <div class="input-group">
                            <input id="meta-titulo" type="text" placeholder="Título da meta" required />
                        </div>
                        <div class="input-group">
                            <textarea id="meta-descricao" placeholder="Descrição (opcional)"></textarea>
                        </div>
                        <div class="input-group">
                            <input id="meta-data-limite" type="date" />
                            <label for="meta-data-limite">Data limite (opcional)</label>
                        </div>
                        <div id="meta-form-error" class="error-msg" style="display:none"></div>
                        <div class="button-group">
                            <button type="submit" id="meta-save">Salvar</button>
                            <button type="button" id="meta-cancel">Cancelar</button>
                        </div>
                    </form>
                </div>
                
                <div id="metas-list" class="metas-list">
                    <p>Carregando metas...</p>
                </div>
            </div>
        `;

        // Event listeners
        const backBtn = this.element.querySelector('#metas-back') as HTMLButtonElement;
        const addBtn = this.element.querySelector('#metas-add') as HTMLButtonElement;
        const form = this.element.querySelector('#meta-form') as HTMLFormElement;
        const cancelBtn = this.element.querySelector('#meta-cancel') as HTMLButtonElement;
        const formContainer = this.element.querySelector('#metas-form') as HTMLElement;

        backBtn.addEventListener('click', onBack);
        
        addBtn.addEventListener('click', () => {
            alert('🚧 Esta funcionalidade está em desenvolvimento e estará disponível em breve!\n\nPor enquanto, aproveite os Cronogramas, Textos e Quizzes! 📚');
        });
        
        cancelBtn.addEventListener('click', () => {
            formContainer.classList.add('hidden');
            form.reset();
            this.clearFormError();
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.clearFormError();
            
            const titulo = (this.element.querySelector('#meta-titulo') as HTMLInputElement).value.trim();
            const descricao = (this.element.querySelector('#meta-descricao') as HTMLTextAreaElement).value.trim();
            const dataLimite = (this.element.querySelector('#meta-data-limite') as HTMLInputElement).value;
            
            if (!titulo) {
                this.setFormError("Título é obrigatório.");
                return;
            }
            
            onCreateMeta(titulo, descricao, dataLimite);
            formContainer.classList.add('hidden');
            form.reset();
        });

        // Store callbacks for dynamic content
        this.onEditMeta = onEditMeta;
        this.onDeleteMeta = onDeleteMeta;
    }

    private onEditMeta: (id: string) => void;
    private onDeleteMeta: (id: string) => void;

    public setFormError(msg: string) {
        const errorEl = this.element.querySelector('#meta-form-error') as HTMLElement;
        errorEl.textContent = msg;
        errorEl.style.display = '';
    }

    public clearFormError() {
        const errorEl = this.element.querySelector('#meta-form-error') as HTMLElement;
        errorEl.style.display = 'none';
    }

    public updateMetasList(metas: Array<{id: string, titulo: string, descricao?: string, dataLimite?: string, atingida?: boolean}>) {
        const listEl = this.element.querySelector('#metas-list') as HTMLElement;
        
        // Mostra mensagem de desenvolvimento em vez da lista real
        listEl.innerHTML = `
            <div class="development-placeholder">
                <div class="placeholder-icon">�</div>
                <h3>Lista de Metas</h3>
                <p>Aqui você poderá visualizar e gerenciar suas metas de estudo.</p>
                <p><em>Funcionalidade em desenvolvimento...</em></p>
            </div>
        `;
    }
}
