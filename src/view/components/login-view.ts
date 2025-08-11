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
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-md px-4 py-10">
      <h2 class="mb-6 text-center text-2xl font-semibold text-gray-900">FOCO —Login</h2>

      <form id="login-form" class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label for="login-email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input id="login-email" type="email" required
                 class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                 placeholder="seu@email.com" />
        </div>

        <div>
          <label for="login-senha" class="mb-1 block text-sm font-medium text-gray-700">Senha</label>
          <input id="login-senha" type="password" required
                 class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                 placeholder="••••••••" />
        </div>

        <div id="login-error" class="hidden rounded-md bg-red-50 p-3 text-sm text-red-700"></div>

        <div class="flex items-center justify-between gap-3">
          <button type="submit" id="login-submit"
                  class="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Entrar
          </button>
          <button type="button" id="login-register"
                  class="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Registrar
          </button>
        </div>
      </form>
    </div>
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
        errorEl.classList.remove('hidden');
    }

    public clearError() {
        const errorEl = this.element.querySelector('#login-error') as HTMLElement;
        errorEl.classList.add('hidden');
    }

    public showError(message: string) {
        const errorEl = this.element.querySelector('#login-error') as HTMLElement;
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
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
