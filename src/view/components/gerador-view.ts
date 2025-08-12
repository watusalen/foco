/**
 * GeradorView
 *
 * Tela do gerador com paleta fuchsia, ícones SVG e UX polida
 */
export class GeradorView {
  public element: HTMLElement;
  private onQuizGenerated: () => void;
  private onCronogramaGenerated: () => void;

  // Ícones SVG
  private readonly icons = {
    back: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M10.5 19.5L3 12l7.5-7.5M3 12h18"></path>
</svg>`.trim(),
    wand: `
<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M4 20L16.5 7.5"></path>
  <rect x="16" y="4" width="4" height="4" rx="1" transform="rotate(45 18 6)"></rect>
  <path d="M12 3l.4 1.2L13.6 5 12.4 5.4 12 6.6 11.6 5.4 10.4 5l1.2-.8z"></path>
  <path d="M20 10l.3.9.7.7-.9.3-.3.9-.3-.9-.9-.3.7-.7z"></path>
</svg>`.trim(),
    lightbulb: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M9 18h6"></path>
  <path d="M7 10a5 5 0 1 1 10 0c0 2.2-1.2 3.3-2.1 4.2-.6.6-.9 1.4-.9 2.3v.5H10v-.5c0-.9-.3-1.7-.9-2.3C8.2 13.3 7 12.2 7 10Z"></path>
</svg>`.trim(),
    spinner: `
<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" aria-hidden="true">
  <circle cx="12" cy="12" r="9" class="opacity-25"></circle>
  <path d="M21 12a9 9 0 0 1-9 9" class="opacity-75"></path>
</svg>`.trim(),
    check: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M20 6L9 17l-5-5"></path>
</svg>`.trim(),
  };

  constructor(
    onBack: () => void,
    onGenerate: (prompt: string, tipo: string) => void,
    onQuizGenerated: () => void,
    onCronogramaGenerated: () => void
  ) {
    this.element = document.getElementById("gerador-screen")! as HTMLElement;

    this.element.innerHTML = `
  <div class="min-h-screen bg-gradient-to-b from-fuchsia-50/50 to-white">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <!-- Header consistente -->
      <header class="mb-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <button id="gerador-back"
          class="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
          ${this.icons.back}<span>Voltar</span>
        </button>

        <h2 class="justify-self-center text-xl font-semibold text-fuchsia-900">
          Gerador de Conteúdo
        </h2>

        <span class="justify-self-end inline-flex items-center gap-1.5 rounded-md bg-fuchsia-100 px-2 py-1 text-xs font-medium text-fuchsia-800">
          ${this.icons.wand}<span>IA ativa</span>
        </span>
      </header>

      <!-- Dica -->
      <div class="mb-6 rounded-md border border-fuchsia-200 bg-fuchsia-50 p-4 text-fuchsia-900">
        <div class="flex items-start gap-2">
          <span class="mt-0.5 text-fuchsia-700">${this.icons.lightbulb}</span>
          <div class="text-sm">
            <strong class="font-medium">Dica:</strong>
            Seja específico no tema e no nível de dificuldade (ex.: “5 questões intermediárias sobre <em>fotossíntese</em> focando em <em>fase clara</em>”).
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <!-- Tipo -->
        <div>
          <label for="gerador-tipo" class="block text-sm font-medium text-gray-800">Tipo de conteúdo</label>
          <div class="relative">
            <select id="gerador-tipo"
              class="appearance-none mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-9 text-sm shadow-sm
                     focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500 hover:border-gray-400 transition-colors">
              <option value="quiz">Questões de Quiz</option>
              <option value="texto">Texto/Resumo</option>
              <option value="cronograma">Cronograma de Estudos</option>
            </select>
            <svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6"></path>
            </svg>
          </div>
        </div>

        <!-- Prompt -->
        <div>
          <label for="gerador-prompt" class="block text-sm font-medium text-gray-800">Prompt/Tema</label>
          <textarea id="gerador-prompt" rows="4"
            placeholder="Descreva o que você quer gerar…"
            class="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500"></textarea>

          <!-- Exemplos -->
          <div class="mt-2 text-sm text-gray-700" id="prompt-examples">
            <small class="block font-medium text-gray-800">Exemplos:</small>
            <ul id="examples-list" class="mt-1 grid gap-1">
              <!-- preenchido dinamicamente -->
            </ul>
          </div>
        </div>

        <!-- Erro -->
        <div id="gerador-error" class="hidden rounded-md bg-rose-50 p-3 text-sm text-rose-700" aria-live="polite"></div>

        <!-- CTA -->
        <button id="gerador-submit"
          class="inline-flex items-center gap-2 rounded-md bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:bg-fuchsia-700
                 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2">
          ${this.icons.wand}<span>Gerar com IA</span>
        </button>
      </div>

      <!-- Resultado -->
      <div id="gerador-result" class="mt-8 hidden rounded-xl border border-fuchsia-200 bg-white p-5 shadow-sm" aria-live="polite">
        <h3 class="mb-3 text-base font-semibold text-gray-900">Resultado</h3>
        <div id="gerador-output"></div>
      </div>
    </div>
  </div>
`;

    // Listeners
    (this.element.querySelector('#gerador-back') as HTMLButtonElement).addEventListener('click', onBack);

    const submitBtn = this.element.querySelector('#gerador-submit') as HTMLButtonElement;
    const tipoSelect = this.element.querySelector('#gerador-tipo') as HTMLSelectElement;

    tipoSelect.addEventListener('change', () => this.updateExamples(tipoSelect.value));

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

    // Init
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
    submitBtn.innerHTML = loading
      ? `${this.icons.spinner}<span>Gerando…</span>`
      : `${this.icons.wand}<span>Gerar com IA</span>`;
  }

  private updateExamples(tipo: string) {
    const examplesList = this.element.querySelector('#examples-list') as HTMLElement;

    const examples = {
      quiz: [
        '5 questões intermediárias sobre “História do Brasil – Era Vargas”',
        '10 questões fáceis de “Programação JavaScript”',
        '7 questões avançadas sobre “Termodinâmica (2ª lei)”'
      ],
      texto: [
        'Resumo de 4 parágrafos sobre “Inteligência Artificial”',
        'Explicação didática sobre “Fotossíntese – Fase Clara”',
        'Texto comparativo: “Keynes vs. Friedman (política econômica)”'
      ],
      cronograma: [
        'Cronograma de 4 semanas para “Aprender React do zero”',
        'Plano de estudo de 6 semanas para “ENEM – Ciências Humanas”',
        'Trilha de 3 semanas para “Fundamentos de Estatística”'
      ]
    };

    examplesList.innerHTML = (examples as any)[tipo]
      .map((e: string) => `
        <li class="inline-flex items-center gap-2 rounded-md border border-fuchsia-200 bg-fuchsia-50 px-2 py-1 text-fuchsia-900">
          <span class="h-1.5 w-1.5 rounded-full bg-fuchsia-500"></span>
          ${e}
        </li>
      `)
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
        <h4 class="mb-1 inline-flex items-center gap-2 text-base font-semibold text-green-900">
          ${this.icons.check}<span>Quiz gerado com sucesso</span>
        </h4>
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
      <div class="rounded-lg border border-green-200 bg-green-50 p-5 shadow-sm">
        <h4 class="mb-1 inline-flex items-center gap-2 text-base font-semibold text-green-900">
          ${this.icons.check}<span>Texto gerado com sucesso</span>
        </h4>
        <p class="text-sm text-gray-700"><strong>Título:</strong> ${textoTitle}</p>
        <p class="text-sm text-gray-700">O texto foi criado e está disponível na seção de Textos.</p>
        <button id="go-to-textos"
          class="mt-4 inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
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
      <div class="rounded-lg border border-green-200 bg-green-50 p-5 shadow-sm">
        <h4 class="mb-1 inline-flex items-center gap-2 text-base font-semibold text-green-900">
          ${this.icons.check}<span>Cronograma gerado com sucesso</span>
        </h4>
        <p class="text-sm text-gray-700"><strong>Título:</strong> ${cronogramaTitle}</p>
        <p class="text-sm text-gray-700"><strong>Atividades criadas:</strong> ${atividadesCount}</p>
        <p class="text-sm text-gray-700">O cronograma completo foi criado e está disponível na seção de Cronogramas.</p>
        <button id="go-to-cronogramas"
          class="mt-4 inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
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

  /** Pré-seleciona o tipo de conteúdo */
  public preSelectType(tipo: 'quiz' | 'texto' | 'cronograma') {
    const selectElement = this.element.querySelector('#gerador-tipo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = tipo;
      this.updateExamples(tipo);
    }
  }

  /** Limpa o formulário */
  public clearForm() {
    const promptInput = this.element.querySelector('#gerador-prompt') as HTMLTextAreaElement;
    const resultEl = this.element.querySelector('#gerador-result') as HTMLElement;

    if (promptInput) promptInput.value = '';
    if (resultEl) resultEl.classList.add('hidden');
    this.setLoading(false);
  }
}
