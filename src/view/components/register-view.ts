/**
 * RegisterView
 * 
 * Responsável pela tela de registro/cadastro.
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
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-md px-4 py-10">
      <div class="text-center mb-6">
        <h1 class="text-3xl flex items-center justify-center gap-2">
  <svg class="inline-block w-[1em] h-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
    <defs>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4f46e5"/>
        <stop offset="100%" stop-color="#6366f1"/>
      </linearGradient>
    </defs>
    <rect width="180" height="180" rx="36" fill="url(#grad2)"/>
    <circle cx="90" cy="90" r="55" fill="none" stroke="white" stroke-width="8"/>
    <circle cx="90" cy="90" r="35" fill="none" stroke="white" stroke-width="6"/>
    <circle cx="90" cy="90" r="12" fill="white"/>
  </svg>
  FOCO
</h1>
        <h2 class="text-2xl font-semibold text-gray-900">Criar Nova Conta</h2>
        <p class="text-sm text-gray-600">Junte-se ao sistema de estudos mais inteligente</p>
      </div>

      <form id="register-form" class="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label for="register-nome" class="mb-1 block text-sm font-medium text-gray-700">Nome Completo</label>
          <input id="register-nome" type="text" required
                 class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                 placeholder="Digite seu nome completo" />
        </div>

        <div>
          <label for="register-email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input id="register-email" type="email" required
                 class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                 placeholder="Digite seu email" />
        </div>

        <div>
          <label for="register-senha" class="mb-1 block text-sm font-medium text-gray-700">Senha</label>
          <input id="register-senha" type="password" required
                 class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                 placeholder="Senha (mínimo 6 caracteres)" />
        </div>

        <div>
          <label for="register-confirmar-senha" class="mb-1 block text-sm font-medium text-gray-700">Confirmar senha</label>
          <input id="register-confirmar-senha" type="password" required
                 class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                 placeholder="Repita a senha" />
        </div>

        <div id="register-error" class="hidden rounded-md p-3 text-sm"></div>

        <div class="flex items-center justify-between gap-3">
          <button type="submit" id="register-submit"
                  class="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            Criar Conta
          </button>
          <button type="button" id="register-back"
                  class="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Voltar ao Login
          </button>
        </div>
      </form>
    </div>
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