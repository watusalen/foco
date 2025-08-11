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
            <div class="textos-container">
                <header class="page-header">
                    <button id="textos-back" class="back-btn">← Voltar</button>
                    <h2>Textos e Resumos</h2>
                    <button id="textos-generate" class="add-btn">🤖 Gerar com IA</button>
                </header>
                
                <div class="textos-info">
                    <p class="info-text">
                        💡 <strong>Seus textos são gerados pela IA!</strong><br>
                        Gere resumos, explicações e continue conversando sobre qualquer assunto.
                    </p>
                </div>
                
                <div id="textos-list" class="textos-list">
                    <p>Carregando textos...</p>
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
        conversas?: Array<{
            id: string,
            prompt: string,
            resposta: string,
            criado_em: string
        }>
    }>) {
        const listEl = this.element.querySelector('#textos-list') as HTMLElement;
        
        if (textos.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>Ainda não há textos gerados</h3>
                    <p>Clique em "🤖 Gerar Texto" para criar seu primeiro texto ou resumo!</p>
                </div>
            `;
            return;
        }

        const textosHtml = textos.map(texto => {
            const dataFormatada = new Date(texto.criado_em).toLocaleDateString('pt-BR');
            const horaFormatada = new Date(texto.criado_em).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const tipoIcon = texto.tipo === 'resumo' ? '📋' : '📝';
            const salvoIcon = texto.salvo ? '⭐' : '';
            const conversasCount = texto.conversas ? texto.conversas.length : 0;
            
            // Resumo do conteúdo (primeiras 150 chars)
            const preview = texto.conteudo.length > 150 ? 
                texto.conteudo.substring(0, 150) + '...' : 
                texto.conteudo;

            return `
                <div class="texto-card" data-texto-id="${texto.id}">
                    <div class="texto-header">
                        <div class="texto-info">
                            <h4>${tipoIcon} ${texto.titulo} ${salvoIcon}</h4>
                            <span class="texto-meta">
                                ${dataFormatada} às ${horaFormatada}
                                ${conversasCount > 0 ? ` • ${conversasCount} interações` : ''}
                            </span>
                        </div>
                        <div class="texto-actions">
                            <button class="continue-btn" data-texto-id="${texto.id}" title="Continuar conversa">💬</button>
                            <button class="save-btn ${texto.salvo ? 'saved' : ''}" data-texto-id="${texto.id}" title="${texto.salvo ? 'Remover dos salvos' : 'Salvar texto'}">
                                ${texto.salvo ? '⭐' : '☆'}
                            </button>
                            <button class="delete-btn" data-texto-id="${texto.id}" title="Excluir texto">🗑️</button>
                        </div>
                    </div>
                    
                    <div class="texto-preview">
                        <p>${preview}</p>
                    </div>
                    
                    <div class="texto-badge">
                        <span class="ai-label">🤖 Gerado pela IA</span>
                    </div>
                    
                    <div class="texto-expand" data-texto-id="${texto.id}">
                        <button class="expand-btn">Ver completo ▼</button>
                    </div>
                </div>
            `;
        }).join('');

        listEl.innerHTML = textosHtml;

        // Add event listeners
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
        // Remove qualquer diálogo existente primeiro
        this.closeAllDialogs();

        const dialog = document.createElement('div');
        dialog.className = 'continue-dialog-overlay';
        dialog.id = `continue-dialog-${textoId}`; // ID específico para este diálogo
        dialog.innerHTML = `
            <div class="continue-dialog">
                <div class="dialog-header">
                    <h3>💬 Continuar Conversa</h3>
                    <button class="dialog-close" title="Fechar">×</button>
                </div>
                <p>O que mais você gostaria de saber sobre este assunto?</p>
                <textarea id="continue-prompt" placeholder="Digite sua pergunta ou comentário..." rows="4"></textarea>
                <div class="dialog-buttons">
                    <button id="continue-send" class="btn primary">Enviar</button>
                    <button id="continue-cancel" class="btn secondary">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const sendBtn = dialog.querySelector('#continue-send') as HTMLButtonElement;
        const cancelBtn = dialog.querySelector('#continue-cancel') as HTMLButtonElement;
        const closeBtn = dialog.querySelector('.dialog-close') as HTMLButtonElement;
        const promptInput = dialog.querySelector('#continue-prompt') as HTMLTextAreaElement;

        const closeDialog = () => {
            if (dialog.parentNode) {
                document.body.removeChild(dialog);
            }
        };

        sendBtn.addEventListener('click', () => {
            const prompt = promptInput.value.trim();
            if (prompt) {
                this.onContinueConversation(textoId, prompt);
                closeDialog();
            }
        });

        cancelBtn.addEventListener('click', closeDialog);
        closeBtn.addEventListener('click', closeDialog);

        // Close on overlay click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                closeDialog();
            }
        });

        // Close on Escape key
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeDialog();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Focus on textarea
        promptInput.focus();
    }

    private showTextoDetail(texto: any) {
        const modal = document.createElement('div');
        modal.className = 'texto-modal-overlay';
        
        const conversasHtml = texto.conversas && texto.conversas.length > 0 ? 
            texto.conversas.map((conversa: any, index: number) => `
                <div class="conversa-item">
                    <div class="conversa-prompt">
                        <strong>Você (${new Date(conversa.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}):</strong>
                        <p>${conversa.prompt}</p>
                    </div>
                    <div class="conversa-resposta">
                        <strong>IA:</strong>
                        <div class="ai-response">${conversa.resposta}</div>
                    </div>
                </div>
            `).join('') : 
            '<p class="no-conversations">Nenhuma conversa adicional ainda.</p>';

        modal.innerHTML = `
            <div class="texto-modal">
                <div class="modal-header">
                    <h3>${texto.tipo === 'resumo' ? '📋' : '📝'} ${texto.titulo}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-content">
                    <div class="texto-original">
                        <h4>Texto Original</h4>
                        <div class="texto-content">${texto.conteudo}</div>
                    </div>
                    
                    ${texto.conversas && texto.conversas.length > 0 ? `
                        <div class="conversas-section">
                            <h4>💬 Conversas (${texto.conversas.length})</h4>
                            <div class="conversas-list">
                                ${conversasHtml}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="modal-actions">
                        <button class="continue-here-btn" data-texto-id="${texto.id}">💬 Continuar Conversa</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.modal-close') as HTMLButtonElement;
        const continueBtn = modal.querySelector('.continue-here-btn') as HTMLButtonElement;

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        continueBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
            this.showContinueDialog(texto.id);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
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
        // Scroll to top and highlight the new texto
        this.element.scrollIntoView({ behavior: 'smooth' });
        
        // You could add a temporary highlight effect here
        setTimeout(() => {
            const textoCard = this.element.querySelector(`[data-texto-id="${texto.id}"]`);
            if (textoCard) {
                textoCard.classList.add('new-texto-highlight');
                setTimeout(() => {
                    textoCard.classList.remove('new-texto-highlight');
                }, 3000);
            }
        }, 500);
    }
}
