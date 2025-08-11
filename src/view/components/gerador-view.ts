/**
 * GeradorView
 * 
 * Responsável por exibir e gerenciar a tela do gerador de conteúdo.
 * Permite gerar questões e conteúdo usando IA.
 * 
 * Elementos esperados no DOM:
 * - #gerador-screen: container principal da tela do gerador
 */
export class GeradorView {
    /** Elemento principal da tela do gerador */
    public element: HTMLElement;
    private onQuizGenerated: () => void;
    private onCronogramaGenerated: () => void;

    /**
     * @param onBack Função chamada ao voltar para o dashboard
     * @param onGenerate Função chamada ao gerar conteúdo
     * @param onQuizGenerated Função chamada quando quiz é gerado (redireciona para quizzes)
     * @param onCronogramaGenerated Função chamada quando cronograma é gerado (redireciona para cronogramas)
     */
    constructor(
        onBack: () => void,
        onGenerate: (prompt: string, tipo: string) => void,
        onQuizGenerated: () => void,
        onCronogramaGenerated: () => void
    ) {
        this.element = document.getElementById("gerador-screen")! as HTMLElement;

        this.element.innerHTML = `
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <header class="flex items-center gap-3 mb-6">
        <button id="gerador-back"
          class="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
          ← Voltar
        </button>
        <h2 class="text-xl font-semibold text-gray-900">Gerador de Conteúdo</h2>
      </header>

      <div class="space-y-6">
        <!-- Tipo -->
        <div>
          <label for="gerador-tipo" class="block text-sm font-medium text-gray-700">Tipo de conteúdo:</label>
          <select id="gerador-tipo"
            class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="quiz">Questões de Quiz</option>
            <option value="texto">Texto/Resumo</option>
            <option value="cronograma">Cronograma de Estudos</option>
          </select>
        </div>

        <!-- Prompt -->
        <div>
          <label for="gerador-prompt" class="block text-sm font-medium text-gray-700">Prompt/Tema:</label>
          <textarea id="gerador-prompt" rows="4"
            placeholder="Descreva o que você quer gerar..."
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>

          <div class="mt-2 text-sm text-gray-600" id="prompt-examples">
            <small><strong>Exemplos:</strong></small>
            <ul id="examples-list" class="list-disc pl-5 mt-1">
              <li>Questões sobre programação em JavaScript</li>
              <li>Resumo sobre inteligência artificial</li>
            </ul>
          </div>
        </div>

        <!-- Erro -->
        <div id="gerador-error" class="hidden rounded-md bg-red-50 p-3 text-sm text-red-700"></div>

        <!-- Botão -->
        <button id="gerador-submit"
          class="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          🤖 Gerar Conteúdo
        </button>
      </div>

      <!-- Resultado -->
      <div id="gerador-result" class="mt-8 hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 class="mb-3 text-base font-semibold text-gray-900">Resultado:</h3>
        <div id="gerador-output"></div>
      </div>
    </div>
  </div>
`;


        // Event listeners
        const backBtn = this.element.querySelector('#gerador-back') as HTMLButtonElement;
        const submitBtn = this.element.querySelector('#gerador-submit') as HTMLButtonElement;
        const tipoSelect = this.element.querySelector('#gerador-tipo') as HTMLSelectElement;

        backBtn.addEventListener('click', onBack);

        // Atualiza exemplos baseado no tipo selecionado
        tipoSelect.addEventListener('change', () => {
            this.updateExamples(tipoSelect.value);
        });

        submitBtn.addEventListener('click', () => {
            this.clearError();

            const tipo = tipoSelect.value;
            const prompt = (this.element.querySelector('#gerador-prompt') as HTMLTextAreaElement).value.trim();

            if (!prompt) {
                this.setError("Por favor, informe o prompt/tema.");
                return;
            }

            this.setLoading(true);
            onGenerate(prompt, tipo);
        });

        // Store callbacks
        this.onQuizGenerated = onQuizGenerated;
        this.onCronogramaGenerated = onCronogramaGenerated;

        // Initialize examples
        this.updateExamples('quiz');
    }

    public setError(msg: string) {
        const errorEl = this.element.querySelector('#gerador-error') as HTMLElement;
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    }

    public clearError() {
        const errorEl = this.element.querySelector('#gerador-error') as HTMLElement;
        errorEl.classList.add('hidden');
    }

    public setLoading(loading: boolean) {
        const submitBtn = this.element.querySelector('#gerador-submit') as HTMLButtonElement;
        submitBtn.disabled = loading;
        submitBtn.textContent = loading ? '⏳ Gerando...' : '🤖 Gerar Conteúdo';
    }

    private updateExamples(tipo: string) {
        const examplesList = this.element.querySelector('#examples-list') as HTMLElement;

        const examples = {
            quiz: [
                'Digite o tema do seu quiz',
                'Exemplo: "Programação JavaScript"',
                'Exemplo: "História do Brasil"'
            ],
            texto: [
                'Digite o assunto para seu texto',
                'Exemplo: "Inteligência artificial"',
                'Exemplo: "Fotossíntese"'
            ],
            cronograma: [
                'Digite seu objetivo de estudo',
                'Exemplo: "Aprender React"',
                'Exemplo: "Estudar para concurso"'
            ]
        };

        examplesList.innerHTML = examples[tipo as keyof typeof examples]
            .map(example => `<li>${example}</li>`)
            .join('');
    }

    public showResult(content: string) {
        const resultEl = this.element.querySelector('#gerador-result') as HTMLElement;
        const outputEl = this.element.querySelector('#gerador-output') as HTMLElement;

        outputEl.innerHTML = content;
        resultEl.classList.remove('hidden');
        this.setLoading(false);
    }

    public showQuizGenerated(quizTitle: string) {
        const outputEl = this.element.querySelector('#gerador-output') as HTMLElement;

        outputEl.innerHTML = `
        <div class="rounded-lg border border-green-200 bg-green-50 p-5 shadow-sm">
            <h4 class="text-lg font-semibold text-green-800 mb-2">✅ Quiz Gerado com Sucesso!</h4>
            <p class="text-sm text-gray-700"><strong>Título:</strong> ${quizTitle}</p>
            <p class="text-sm text-gray-700">O quiz foi criado e está disponível na seção de Quizzes.</p>
            <button id="go-to-quizzes"
                class="mt-4 inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                Ir para Quizzes
            </button>
        </div>
    `;

        this.element.querySelector('#gerador-result')!.classList.remove('hidden');
        this.setLoading(false);

        outputEl.querySelector('#go-to-quizzes')!.addEventListener('click', () => {
            this.onQuizGenerated();
        });
    }

    public showTextoGenerated(textoTitle: string, onGoToTextos: () => void) {
        const outputEl = this.element.querySelector('#gerador-output') as HTMLElement;

        outputEl.innerHTML = `
        <div class="rounded-lg border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <h4 class="text-lg font-semibold text-blue-800 mb-2">✅ Texto Gerado com Sucesso!</h4>
            <p class="text-sm text-gray-700"><strong>Título:</strong> ${textoTitle}</p>
            <p class="text-sm text-gray-700">O texto foi criado e está disponível na seção de Textos.</p>
            <button id="go-to-textos"
                class="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Ver Texto
            </button>
        </div>
    `;

        this.element.querySelector('#gerador-result')!.classList.remove('hidden');
        this.setLoading(false);

        outputEl.querySelector('#go-to-textos')!.addEventListener('click', () => {
            onGoToTextos();
        });
    }

    public showCronogramaGenerated(cronogramaTitle: string, atividadesCount: number) {
        const outputEl = this.element.querySelector('#gerador-output') as HTMLElement;

        outputEl.innerHTML = `
        <div class="rounded-lg border border-purple-200 bg-purple-50 p-5 shadow-sm">
            <h4 class="text-lg font-semibold text-purple-800 mb-2">✅ Cronograma Gerado com Sucesso!</h4>
            <p class="text-sm text-gray-700"><strong>Título:</strong> ${cronogramaTitle}</p>
            <p class="text-sm text-gray-700"><strong>Atividades criadas:</strong> ${atividadesCount}</p>
            <p class="text-sm text-gray-700">O cronograma completo foi criado e está disponível na seção de Cronogramas.</p>
            <button id="go-to-cronogramas"
                class="mt-4 inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
                Ver Cronograma
            </button>
        </div>
    `;

        this.element.querySelector('#gerador-result')!.classList.remove('hidden');
        this.setLoading(false);

        outputEl.querySelector('#go-to-cronogramas')!.addEventListener('click', () => {
            this.onCronogramaGenerated();
        });
    }

    /**
     * Pré-seleciona o tipo de conteúdo
     */
    public preSelectType(tipo: 'quiz' | 'texto' | 'cronograma') {
        const selectElement = this.element.querySelector('#gerador-tipo') as HTMLSelectElement;
        if (selectElement) {
            selectElement.value = tipo;
            this.updateExamples(tipo);
        }
    }

    /**
     * Limpa o formulário
     */
    public clearForm() {
        const promptInput = this.element.querySelector('#gerador-prompt') as HTMLTextAreaElement;
        const resultEl = this.element.querySelector('#gerador-result') as HTMLElement;

        if (promptInput) promptInput.value = '';
        if (resultEl) resultEl.style.display = 'none';
        this.setLoading(false);
    }
}
