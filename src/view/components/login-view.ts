/**
 * LoginView
 * 
 * Responsável por exibir a tela de login/autenticação.
 * Permite ao usuário informar email e senha, valida a entrada
 * e aciona callbacks para login ou registro.
 * 
 * Elementos esperados no DOM:
 * - #login-screen: container principal da tela de login
 */
export class LoginView {
    /** Elemento principal da tela de login */
    public element: HTMLElement;

    /**
     * @param onLogin Função chamada ao fazer login, recebe email e senha
     * @param onRegister Função chamada ao clicar em registrar
     */
    constructor(onLogin: (email: string, senha: string) => void, onRegister: () => void) {
        this.element = document.getElementById("login-screen")! as HTMLElement;
        
        this.element.innerHTML = `
            <div class="login-container">
                <h2>Foco - Login</h2>
                <form id="login-form">
                    <div class="input-group">
                        <input id="login-email" type="email" placeholder="Email" required />
                    </div>
                    <div class="input-group">
                        <input id="login-senha" type="password" placeholder="Senha" required />
                    </div>
                    <div id="login-error" class="error-msg hidden"></div>
                    <div class="button-group">
                        <button type="submit" id="login-submit">Entrar</button>
                        <button type="button" id="login-register">Registrar</button>
                    </div>
                </form>
            </div>
        `;

        const form = this.element.querySelector('#login-form') as HTMLFormElement;
        const emailInput = this.element.querySelector('#login-email') as HTMLInputElement;
        const senhaInput = this.element.querySelector('#login-senha') as HTMLInputElement;
        const registerBtn = this.element.querySelector('#login-register') as HTMLButtonElement;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.clearError();
            const email = emailInput.value.trim();
            const senha = senhaInput.value.trim();
            
            if (!email || !senha) {
                this.setError("Email e senha são obrigatórios.");
                return;
            }
            
            onLogin(email, senha);
        });

        registerBtn.addEventListener('click', () => {
            this.clearError();
            onRegister();
        });
    }

    public setError(msg: string) {
        const errorEl = this.element.querySelector('#login-error') as HTMLElement;
        errorEl.textContent = msg;
        errorEl.style.display = '';
    }

    public clearError() {
        const errorEl = this.element.querySelector('#login-error') as HTMLElement;
        errorEl.style.display = 'none';
    }

    public showError(message: string) {
        const errorEl = this.element.querySelector('#login-error') as HTMLElement;
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    public showLoading(message: string) {
        const submitBtn = this.element.querySelector('#login-submit') as HTMLButtonElement;
        submitBtn.disabled = true;
        submitBtn.textContent = message;
    }

    public hideLoading() {
        const submitBtn = this.element.querySelector('#login-submit') as HTMLButtonElement;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Entrar';
    }

    public clear() {
        const form = this.element.querySelector('#login-form') as HTMLFormElement;
        form.reset();
        this.clearError();
        this.hideLoading();
    }
}
