/**
 * RegisterView
 * 
 * Responsável                         <input id="register-senha" type="password" placeholder="Crie uma senha (mínimo 6 caracteres)" required />
                    </div>
                    <div class="input-group">
                        <label for="register-senha-confirma">Confirmar Senha</label>
                        <input id="register-senha-confirma" type="password" placeholder="Confirme sua senha" required />
                    </div>
                    <div id="register-error" class="error-msg hidden"></div>
                    <div class="button-group" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem;">
                        <button type="submit" id="register-submit" class="btn">Criar Conta</button>
                        <button type="button" id="register-voltar" class="btn" style="background: linear-gradient(135deg, var(--gray-500), var(--gray-600));">Voltar ao Login</button>r a tela de registro/cadastro.
 * Permite ao usuário criar uma nova conta com validação
 * e feedback visual adequado.
 * 
 * Elementos esperados no DOM:
 * - #register-screen: container principal da tela de registro
 */
export class RegisterView {
    /** Elemento principal da tela de registro */
    public element: HTMLElement;

    /**
     * @param onRegister Função chamada ao registrar, recebe nome, email e senha
     * @param onBackToLogin Função chamada ao voltar para login
     */
    constructor(
        onRegister: (nome: string, email: string, senha: string) => void, 
        onBackToLogin: () => void
    ) {
        this.element = document.getElementById("register-screen")! as HTMLElement;
        
        this.element.innerHTML = `
            <div class="screen-container">
                <div class="text-center">
                    <h1 class="font-bold text-primary" style="margin-bottom: 1rem; font-size: 2.5rem;">🎯 Foco</h1>
                    <h2 style="margin-bottom: 2rem; color: var(--gray-700); font-weight: 600;">Criar Nova Conta</h2>
                    <p style="color: var(--gray-600); margin-bottom: 2rem;">Junte-se ao sistema de estudos mais inteligente</p>
                </div>
                <form id="register-form">
                    <div class="input-group">
                        <label for="register-nome">Nome Completo</label>
                        <input id="register-nome" type="text" placeholder="Digite seu nome completo" required />
                    </div>
                    <div class="input-group">
                        <label for="register-email">Email</label>
                        <input id="register-email" type="email" placeholder="Digite seu email" required />
                    </div>
                    <div class="input-group">
                        <label for="register-senha">Senha</label>
                        <input id="register-senha" type="password" placeholder="Senha (mínimo 6 caracteres)" required />
                    </div>
                    <div class="input-group">
                        <input id="register-confirmar-senha" type="password" placeholder="Confirmar senha" required />
                    </div>
                    <div id="register-error" class="error-msg" style="display:none"></div>
                    <div class="button-group">
                        <button type="submit" id="register-submit">Criar Conta</button>
                        <button type="button" id="register-back">Voltar ao Login</button>
                    </div>
                </form>
            </div>
        `;

        const form = this.element.querySelector('#register-form') as HTMLFormElement;
        const nomeInput = this.element.querySelector('#register-nome') as HTMLInputElement;
        const emailInput = this.element.querySelector('#register-email') as HTMLInputElement;
        const senhaInput = this.element.querySelector('#register-senha') as HTMLInputElement;
        const confirmarSenhaInput = this.element.querySelector('#register-confirmar-senha') as HTMLInputElement;
        const backBtn = this.element.querySelector('#register-back') as HTMLButtonElement;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.clearError();
            
            const nome = nomeInput.value.trim();
            const email = emailInput.value.trim();
            const senha = senhaInput.value.trim();
            const confirmarSenha = confirmarSenhaInput.value.trim();

            // Validações
            if (!nome || !email || !senha || !confirmarSenha) {
                this.showError("Todos os campos são obrigatórios.");
                return;
            }

            if (senha.length < 6) {
                this.showError("Senha deve ter pelo menos 6 caracteres.");
                return;
            }

            if (senha !== confirmarSenha) {
                this.showError("Senhas não coincidem.");
                return;
            }

            if (!this.isValidEmail(email)) {
                this.showError("Email inválido.");
                return;
            }

            onRegister(nome, email, senha);
        });

        backBtn.addEventListener('click', onBackToLogin);
    }

    /**
     * Valida formato do email
     */
    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Mostra mensagem de erro
     */
    public showError(message: string): void {
        const errorEl = this.element.querySelector('#register-error') as HTMLElement;
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    /**
     * Limpa mensagem de erro
     */
    public clearError(): void {
        const errorEl = this.element.querySelector('#register-error') as HTMLElement;
        errorEl.style.display = 'none';
    }

    /**
     * Mostra estado de loading
     */
    public showLoading(message: string): void {
        const submitBtn = this.element.querySelector('#register-submit') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.textContent = message;
    }

    /**
     * Remove estado de loading
     */
    public hideLoading(): void {
        const submitBtn = this.element.querySelector('#register-submit') as HTMLButtonElement;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Criar Conta';
    }

    /**
     * Limpa o formulário
     */
    public clear(): void {
        const form = this.element.querySelector('#register-form') as HTMLFormElement;
        form.reset();
        this.clearError();
        this.hideLoading();
    }

    /**
     * Mostra mensagem de sucesso
     */
    public showSuccess(message: string): void {
        const errorEl = this.element.querySelector('#register-error') as HTMLElement;
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        errorEl.style.color = '#28a745';
    }
}
