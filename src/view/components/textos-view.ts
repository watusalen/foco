import { TextoComConversas } from "../utils/texto-utils";

/**
 * TextosView
 * 
 * Responsável por exibir e gerenciar textos e resumos gerados pela IA.
 * Permite visualizar, continuar conversas e salvar textos importantes.
 * 
 * Elementos esperados no DOM:
 * - #textos-screen: container principal da tela de textos
 */
export class TextosView {
    /** Elemento principal da tela de textos */
    public element: HTMLElement;

    /**
     * @param onBack Função chamada ao voltar para o dashboard
     * @param onGenerateTexto Função chamada para gerar novo texto
     * @param onContinueConversation Função chamada para continuar conversa
     * @param onSaveTexto Função chamada para salvar texto
     * @param onDeleteTexto Função chamada para excluir texto
     */
    constructor(
        onBack: () => void,
        onGenerateTexto: () => void,
        onContinueConversation: (textoId: string, prompt: string) => void,
        onSaveTexto: (textoId: string) => void,
        onDeleteTexto: (textoId: string) => void
    ) {
        this.element = document.getElementById("textos-screen")! as HTMLElement;

        this.element.innerHTML = `
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <header class="mb-6 flex items-center justify-between gap-4">
        <button id="textos-back"
          class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
          ← Voltar
        </button>
        <h2 class="text-xl font-semibold text-gray-900">Textos e Resumos</h2>
        <button id="textos-generate"
          class="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          🤖 Gerar com IA
        </button>
      </header>

      <div class="mb-6 rounded-md bg-blue-50 p-4 text-blue-800">
        💡 <strong>Seus textos são gerados pela IA!</strong><br />
        Gere resumos, explicações e continue conversando sobre qualquer assunto.
      </div>

      <div id="textos-list" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <p class="text-gray-600">Carregando textos...</p>
      </div>
    </div>
  </div>
`;

        // Event listeners
        const backBtn = this.element.querySelector('#textos-back') as HTMLButtonElement;
        const generateBtn = this.element.querySelector('#textos-generate') as HTMLButtonElement;

        backBtn.addEventListener('click', onBack);
        generateBtn.addEventListener('click', onGenerateTexto);

        // Store callbacks for dynamic content
        this.onContinueConversation = onContinueConversation;
        this.onSaveTexto = onSaveTexto;
        this.onDeleteTexto = onDeleteTexto;
    }

    private onContinueConversation: (textoId: string, prompt: string) => void;
    private onSaveTexto: (textoId: string) => void;
    private onDeleteTexto: (textoId: string) => void;

    public updateTextosList(textos: Array<{
        id: string,
        titulo: string,
        conteudo: string,
        tipo: 'texto' | 'resumo',
        criado_em: string,
        salvo?: boolean,
        conversas?: Array<{ id: string, prompt: string, resposta: string, criado_em: string }>
    }>) {
        const listEl = this.element.querySelector('#textos-list') as HTMLElement;

        if (textos.length === 0) {
            listEl.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-6 text-center">
        <div class="text-3xl">📝</div>
        <h3 class="text-lg font-medium text-gray-900">Ainda não há textos gerados</h3>
        <p class="text-sm text-gray-600">Clique em "🤖 Gerar Texto" para criar seu primeiro texto ou resumo!</p>
      </div>
    `;
            return;
        }

        const textosHtml = textos.map(texto => {
            const data = new Date(texto.criado_em);
            const dataFormatada = data.toLocaleDateString('pt-BR');
            const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const tipoIcon = texto.tipo === 'resumo' ? '📋' : '📝';
            const salvoIcon = texto.salvo ? '⭐' : '';
            const conversasCount = texto.conversas ? texto.conversas.length : 0;
            const preview = texto.conteudo.length > 150 ? (texto.conteudo.substring(0, 150) + '...') : texto.conteudo;

            return `
      <div class="texto-card rounded-lg border border-gray-200 bg-white p-4 shadow-sm" data-texto-id="${texto.id}">
        <div class="texto-header mb-2 flex items-start justify-between gap-3">
          <div class="texto-info">
            <h4 class="text-base font-semibold text-gray-900">${tipoIcon} ${texto.titulo} ${salvoIcon}</h4>
            <span class="texto-meta block text-xs text-gray-600">
              ${dataFormatada} às ${horaFormatada}
              ${conversasCount > 0 ? ` • ${conversasCount} interações` : ''}
            </span>
          </div>
          <div class="texto-actions flex items-center gap-2">
            <button class="continue-btn inline-flex items-center justify-center rounded-md border border-gray-200 px-2 py-1 hover:bg-gray-50"
              data-texto-id="${texto.id}" title="Continuar conversa">💬</button>
            <button class="save-btn ${texto.salvo ? 'saved' : ''} inline-flex items-center justify-center rounded-md border ${texto.salvo ? 'border-yellow-300 text-yellow-600 bg-yellow-50' : 'border-gray-200'} px-2 py-1 hover:bg-gray-50"
              data-texto-id="${texto.id}" title="${texto.salvo ? 'Remover dos salvos' : 'Salvar texto'}">
              ${texto.salvo ? '⭐' : '☆'}
            </button>
            <button class="delete-btn inline-flex items-center justify-center rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
              data-texto-id="${texto.id}" title="Excluir texto">🗑️</button>
          </div>
        </div>

        <div class="texto-preview text-sm text-gray-700">
          <p>${preview}</p>
        </div>

        <div class="texto-badge mt-3">
          <span class="ai-label inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">🤖 Gerado pela IA</span>
        </div>

        <div class="texto-expand mt-3" data-texto-id="${texto.id}">
          <button class="expand-btn text-sm text-indigo-700 hover:underline">Ver completo ▼</button>
        </div>
      </div>
    `;
        }).join('');

        listEl.innerHTML = textosHtml;

        // listeners
        this.addEventListeners(textos);
    }


    private addEventListeners(textos: any[]) {
        const listEl = this.element.querySelector('#textos-list') as HTMLElement;

        // Continue conversation buttons
        listEl.querySelectorAll('.continue-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const textoId = (btn as HTMLElement).dataset.textoId!;
                this.showContinueDialog(textoId);
            });
        });

        // Save/unsave buttons
        listEl.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const textoId = (btn as HTMLElement).dataset.textoId!;
                this.onSaveTexto(textoId);
            });
        });

        // Delete buttons
        listEl.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const textoId = (btn as HTMLElement).dataset.textoId!;
                this.onDeleteTexto(textoId);
            });
        });

        // Expand buttons - Volta ao comportamento original: apenas mostra texto completo
        listEl.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const textoId = (btn.closest('.texto-expand') as HTMLElement).dataset.textoId!;
                const texto = textos.find(t => t.id === textoId);
                if (texto) {
                    this.showTextoDetail(texto);
                }
            });
        });
    }

    /**
     * Fecha todos os diálogos de continuação abertos
     */
    public closeAllDialogs(): void {
        // Remove diálogos de continuação
        const dialogs = document.querySelectorAll('.continue-dialog-overlay');
        dialogs.forEach(dialog => {
            if (dialog.parentNode) {
                document.body.removeChild(dialog);
            }
        });

        // Remove modals de texto completo
        const modals = document.querySelectorAll('.texto-modal-overlay');
        modals.forEach(modal => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        });
    }

    private showContinueDialog(textoId: string) {
        this.closeAllDialogs();

        const dialog = document.createElement('div');
        dialog.className = 'continue-dialog-overlay fixed inset-0 z-50 bg-black/50 flex items-center justify-center';
        dialog.id = `continue-dialog-${textoId}`;
        dialog.innerHTML = `
    <div class="continue-dialog w-full max-w-lg rounded-xl bg-white p-5 shadow-lg">
      <div class="dialog-header mb-3 flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-900">💬 Continuar Conversa</h3>
        <button class="dialog-close inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100" title="Fechar">×</button>
      </div>
      <p class="text-sm text-gray-700 mb-2">O que mais você gostaria de saber sobre este assunto?</p>
      <textarea id="continue-prompt" rows="4" placeholder="Digite sua pergunta ou comentário..."
        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
      <div class="dialog-buttons mt-4 flex items-center justify-end gap-2">
        <button id="continue-cancel" class="btn secondary inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
        <button id="continue-send" class="btn primary inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Enviar</button>
      </div>
    </div>
  `;

        document.body.appendChild(dialog);

        const sendBtn = dialog.querySelector('#continue-send') as HTMLButtonElement;
        const cancelBtn = dialog.querySelector('#continue-cancel') as HTMLButtonElement;
        const closeBtn = dialog.querySelector('.dialog-close') as HTMLButtonElement;
        const promptInput = dialog.querySelector('#continue-prompt') as HTMLTextAreaElement;

        const closeDialog = () => { if (dialog.parentNode) document.body.removeChild(dialog); };

        sendBtn.addEventListener('click', () => {
            const prompt = promptInput.value.trim();
            if (prompt) {
                this.onContinueConversation(textoId, prompt);
                closeDialog();
            }
        });

        cancelBtn.addEventListener('click', closeDialog);
        closeBtn.addEventListener('click', closeDialog);

        dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });

        const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') { closeDialog(); document.removeEventListener('keydown', handleEscape); } };
        document.addEventListener('keydown', handleEscape);

        promptInput.focus();
    }

    private showTextoDetail(texto: any) {
        const modal = document.createElement('div');
        modal.className = 'texto-modal-overlay fixed inset-0 z-50 bg-black/50 flex items-center justify-center';

        const conversasHtml = texto.conversas && texto.conversas.length > 0
            ? texto.conversas.map((conversa: any) => `
        <div class="conversa-item rounded-md border border-gray-200 p-3">
          <div class="conversa-prompt text-sm text-gray-800">
            <strong>Você (${new Date(conversa.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}):</strong>
            <p>${conversa.prompt}</p>
          </div>
          <div class="conversa-resposta mt-2 text-sm text-gray-800">
            <strong>IA:</strong>
            <div class="ai-response mt-1 rounded-md bg-gray-50 p-2">${conversa.resposta}</div>
          </div>
        </div>
      `).join('')
            : '<p class="no-conversations text-sm text-gray-600">Nenhuma conversa adicional ainda.</p>';

        modal.innerHTML = `
    <div class="texto-modal w-full max-w-3xl rounded-xl bg-white p-5 shadow-lg">
      <div class="modal-header mb-3 flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-900">${texto.tipo === 'resumo' ? '📋' : '📝'} ${texto.titulo}</h3>
        <button class="modal-close inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100">×</button>
      </div>

      <div class="modal-content space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        <div class="texto-original">
          <h4 class="text-sm font-semibold text-gray-900 mb-1">Texto Original</h4>
          <div class="texto-content whitespace-pre-wrap text-sm text-gray-800">${texto.conteudo}</div>
        </div>

        ${texto.conversas && texto.conversas.length > 0 ? `
          <div class="conversas-section">
            <h4 class="text-sm font-semibold text-gray-900 mb-2">💬 Conversas (${texto.conversas.length})</h4>
            <div class="conversas-list grid gap-3">
              ${conversasHtml}
            </div>
          </div>
        ` : ''}

        <div class="modal-actions flex items-center justify-end">
          <button class="continue-here-btn inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700" data-texto-id="${texto.id}">
            💬 Continuar Conversa
          </button>
        </div>
      </div>
    </div>
  `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close') as HTMLButtonElement;
        const continueBtn = modal.querySelector('.continue-here-btn') as HTMLButtonElement;

        const close = () => { if (modal.parentNode) document.body.removeChild(modal); };

        closeBtn.addEventListener('click', close);
        continueBtn.addEventListener('click', () => { close(); this.showContinueDialog(texto.id); });
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    }


    /**
     * Carrega textos do usuário
     */
    public async loadTextos(textos?: TextoComConversas[]): Promise<void> {
        try {
            // Se não recebeu dados, mostra lista vazia (estrutura está preparada para implementação futura)
            const textosParaExibir = textos || [];
            this.updateTextosList(textosParaExibir);
        } catch (error) {
            console.error("Erro ao carregar textos:", error);
            this.updateTextosList([]);
        }
    }

    public showNewTextoGenerated(texto: { id: string, titulo: string, conteudo: string }) {
        this.element.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            const card = this.element.querySelector(`[data-texto-id="${texto.id}"]`) as HTMLElement | null;
            if (card) {
                card.classList.add('ring-2', 'ring-indigo-400', 'transition');
                setTimeout(() => {
                    card.classList.remove('ring-2', 'ring-indigo-400');
                }, 2000);
            }
        }, 300);
    }

}
