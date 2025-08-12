/**
 * ConfirmView
 * 
 * Responsável por exibir diálogos de confirmação.
 * Substitui o uso de alert() e confirm() nativos do browser.
 * 
 * Elementos esperados no DOM:
 * - #confirm-screen: container principal da tela de confirmação
 */
export class ConfirmView {
    /** Elemento principal da tela de confirmação */
    public element: HTMLElement;
    private onConfirm: (() => void | Promise<void>) | null = null;
    private onCancel: (() => void | Promise<void>) | null = null;

    constructor() {
        this.element = document.getElementById("confirm-screen")! as HTMLElement;

        this.element.innerHTML = `
  <div class="confirm-overlay fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center">
    <div class="confirm-dialog w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5
                transition transform">
      <div id="confirm-message" class="confirm-message text-base text-gray-800 mb-4">
        Tem certeza?
      </div>
      <div class="confirm-buttons flex items-center justify-end gap-3">
        <button id="confirm-no"
          class="confirm-btn secondary inline-flex items-center rounded-md border border-gray-300 bg-white
                 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2
                 focus:ring-gray-600 focus:ring-offset-2">
          Cancelar
        </button>
<button id="confirm-yes"
  class="confirm-btn inline-flex items-center rounded-md bg-rose-600 px-4 py-2 text-sm
         font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2
         focus:ring-rose-600 focus:ring-offset-2 disabled:opacity-60">
  Confirmar
</button>
      </div>
    </div>
  </div>
`;

        // Event listeners
        const yesBtn = this.element.querySelector('#confirm-yes') as HTMLButtonElement;
        const noBtn = this.element.querySelector('#confirm-no') as HTMLButtonElement;

        yesBtn.addEventListener('click', async () => {
            if (this.onConfirm) {
                // Mostra loading no botão
                const originalText = yesBtn.textContent;
                yesBtn.disabled = true;
                yesBtn.textContent = "Processando...";

                try {
                    await this.onConfirm();
                    this.hide();
                } catch (error) {
                    console.error("Erro ao executar confirmação:", error);
                    // Restaura o botão em caso de erro
                    yesBtn.disabled = false;
                    yesBtn.textContent = originalText;
                }
            } else {
                this.hide();
            }
        });

        noBtn.addEventListener('click', async () => {
            this.hide();
            if (this.onCancel) {
                try {
                    await this.onCancel();
                } catch (error) {
                    console.error("Erro ao executar cancelamento:", error);
                }
            }
        });

        // Click no overlay para cancelar
        this.element.addEventListener('click', async (e) => {
            if (e.target === this.element) {
                this.hide();
                if (this.onCancel) {
                    try {
                        await this.onCancel();
                    } catch (error) {
                        console.error("Erro ao executar cancelamento:", error);
                    }
                }
            }
        });
    }

    /**
     * Mostra o diálogo de confirmação
     * @param message Mensagem a ser exibida
     * @param onConfirm Callback chamado ao confirmar
     * @param onCancel Callback chamado ao cancelar (opcional)
     */
    public show(message: string, onConfirm: () => void | Promise<void>, onCancel?: () => void | Promise<void>) {
        const messageEl = this.element.querySelector('#confirm-message') as HTMLElement;
        messageEl.textContent = message;

        this.onConfirm = onConfirm;
        this.onCancel = onCancel || null;

        this.element.classList.remove('hidden');
    }

    /**
     * Oculta o diálogo de confirmação
     */
    public hide() {
        this.element.classList.add('hidden');

        // Reseta os botões
        const yesBtn = this.element.querySelector('#confirm-yes') as HTMLButtonElement;
        yesBtn.disabled = false;
        yesBtn.textContent = "Confirmar";

        this.onConfirm = null;
        this.onCancel = null;
    }
}
