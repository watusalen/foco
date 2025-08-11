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
            <div class="confirm-overlay">
                <div class="confirm-dialog">
                    <div id="confirm-message" class="confirm-message"></div>
                    <div class="confirm-buttons">
                        <button id="confirm-yes" class="confirm-btn primary">Confirmar</button>
                        <button id="confirm-no" class="confirm-btn secondary">Cancelar</button>
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
