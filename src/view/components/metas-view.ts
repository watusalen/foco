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
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <header class="flex items-center gap-3 mb-6">
        <button id="metas-back"
          class="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
          ← Voltar
        </button>
        <h2 class="text-xl font-semibold text-gray-900">Metas de Estudo</h2>
        <button id="metas-add" disabled
          class="inline-flex items-center gap-2 rounded-md bg-gray-300 px-3 py-2 text-sm font-medium text-white opacity-60 cursor-not-allowed">
          🚧 Em Desenvolvimento
        </button>
      </header>

      <!-- Aviso de desenvolvimento -->
      <div class="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <div class="flex items-start gap-3">
          <div class="text-xl">🚧</div>
          <div>
            <h3 class="font-medium">Funcionalidade em Desenvolvimento</h3>
            <p>Por enquanto, foque nos Cronogramas, Textos e Quizzes!</p>
          </div>
        </div>
      </div>

      <!-- Form (invisível por padrão) -->
      <div id="metas-form" class="hidden">
        <h3 class="mb-3 text-base font-semibold text-gray-900">Nova Meta</h3>
        <form id="meta-form" class="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <label for="meta-titulo" class="mb-1 block text-sm font-medium text-gray-700">Título da meta</label>
            <input id="meta-titulo" type="text" required
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>

          <div>
            <label for="meta-descricao" class="mb-1 block text-sm font-medium text-gray-700">Descrição (opcional)</label>
            <textarea id="meta-descricao"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
          </div>

          <div>
            <label for="meta-data-limite" class="mb-1 block text-sm font-medium text-gray-700">Data limite (opcional)</label>
            <input id="meta-data-limite" type="date"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>

          <div id="meta-form-error" class="hidden rounded-md bg-red-50 p-3 text-sm text-red-700"></div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="submit" id="meta-save"
              class="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              Salvar
            </button>
            <button type="button" id="meta-cancel"
              class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <!-- Lista / placeholder -->
      <div id="metas-list" class="grid gap-4">
        <p class="text-gray-600">Carregando metas...</p>
      </div>
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
        errorEl.classList.remove('hidden');
    }

    public clearFormError() {
        const errorEl = this.element.querySelector('#meta-form-error') as HTMLElement;
        errorEl.classList.add('hidden');
    }

    public updateMetasList(metas: Array<{ id: string, titulo: string, descricao?: string, dataLimite?: string, atingida?: boolean }>) {
        const listEl = this.element.querySelector('#metas-list') as HTMLElement;
        listEl.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-6 text-center">
      <div class="text-3xl">🚧</div>
      <h3 class="text-lg font-medium text-gray-900">Lista de Metas</h3>
      <p class="text-sm text-gray-600">Aqui você poderá visualizar e gerenciar suas metas de estudo.</p>
      <p class="text-xs text-gray-500"><em>Funcionalidade em desenvolvimento...</em></p>
    </div>
  `;
    }
}
