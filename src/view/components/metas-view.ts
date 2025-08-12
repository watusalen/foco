/**
 * MetasView (mínima)
 * Só exibe: header padronizado, aviso e estado vazio.
 */
export class MetasView {
  public element: HTMLElement;

  private readonly icons = {
    back: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M10.5 19.5L3 12l7.5-7.5M3 12h18"></path>
</svg>`.trim(),
    alert: `
<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path>
  <path d="M12 9v4.5M12 18h.01"></path>
</svg>`.trim(),
  };

  constructor(
    onBack: () => void,
    _onCreateMeta?: (titulo: string, descricao: string, dataLimite: string) => void,
    _onEditMeta?: (id: string) => void,
    _onDeleteMeta?: (id: string) => void
  ) {
    this.element = document.getElementById("metas-screen")!;

    this.element.innerHTML = `
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <header class="mb-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <button id="metas-back"
          class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
          ${this.icons.back}<span>Voltar</span>
        </button>

        <h2 class="justify-self-center text-xl font-semibold text-gray-900">
          Metas de Estudo
        </h2>

        <button id="metas-add" disabled
          class="justify-self-end inline-flex items-center gap-2 rounded-md bg-gray-300 px-3 py-2 text-sm font-medium text-white opacity-60 cursor-not-allowed">
          <span class="text-base"> </span><span>Criar com IA</span>
        </button>
      </header>

      <div class="mb-8 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <div class="flex items-start gap-3">
          ${this.icons.alert}
          <div>
            <h3 class="font-medium">Funcionalidade em desenvolvimento</h3>
            <p>Em breve você poderá definir metas, prazos e acompanhar o progresso. Enquanto isso, aproveite Cronogramas, Textos e Quizzes.</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-dashed border-gray-300 bg-white/60 p-10 text-center">
        <h3 class="text-lg font-semibold text-gray-900">Ainda não há metas</h3>
        <p class="mt-2 text-sm text-gray-600">Em breve você poderá criar metas de estudo e acompanhar o progresso.</p>
      </div>
    </div>
  </div>
`;

    (this.element.querySelector('#metas-back') as HTMLButtonElement)
      .addEventListener('click', onBack);
  }

  // Mantido apenas por compatibilidade — não faz nada além de manter o vazio.
  public updateMetasList(): void {
    /* intencionalmente vazio */
  }
}
