/**
 * MetasView — Tela de listagem e gerenciamento de metas de estudo (versão mínima).
 *
 * Funções atuais:
 *  - Exibir um cabeçalho padronizado com botão de voltar.
 *  - Exibir aviso de que a funcionalidade está em desenvolvimento.
 *  - Exibir estado vazio quando não há metas.
 *
 * Observações:
 *  - Por enquanto, não há implementação para criar, editar ou excluir metas.
 *  - O botão "Criar com IA" está presente, mas desativado (disabled).
 *  - Essa versão serve apenas como placeholder enquanto a funcionalidade real não é implementada.
 *
 * Elementos esperados no DOM:
 *  - #metas-screen: container principal desta tela.
 *
 * Parâmetros do construtor:
 *  - onBack(): função chamada ao clicar no botão de voltar.
 *  - _onCreateMeta(): função para criar meta (não utilizada ainda).
 *  - _onEditMeta(): função para editar meta (não utilizada ainda).
 *  - _onDeleteMeta(): função para excluir meta (não utilizada ainda).
 */
export class MetasView {
  /** Elemento raiz da tela de metas. */
  public element: HTMLElement;

  /** Ícones SVG utilizados na interface para manter consistência visual. */
  private readonly icons = {
    /** Ícone de voltar (seta para esquerda). */
    back: `
<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M10.5 19.5L3 12l7.5-7.5M3 12h18"></path>
</svg>`.trim(),

    /** Ícone de alerta (triângulo com exclamação). */
    alert: `
<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path>
  <path d="M12 9v4.5M12 18h.01"></path>
</svg>`.trim(),
  };

  /**
   * Construtor da tela de metas.
   *
   * @param onBack Função chamada ao clicar no botão de voltar.
   * @param _onCreateMeta Callback para criar meta (ainda não implementado).
   * @param _onEditMeta Callback para editar meta (ainda não implementado).
   * @param _onDeleteMeta Callback para excluir meta (ainda não implementado).
   */
  constructor(
    onBack: () => void,
    _onCreateMeta?: (titulo: string, descricao: string, dataLimite: string) => void,
    _onEditMeta?: (id: string) => void,
    _onDeleteMeta?: (id: string) => void
  ) {
    // Obtém o container principal da tela
    this.element = document.getElementById("metas-screen")!;

    // HTML inicial fixo da tela
    this.element.innerHTML = `
  <div class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-4xl px-4 py-6">
      <!-- Cabeçalho -->
      <header class="mb-6 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <button id="metas-back"
          class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
          ${this.icons.back}<span>Voltar</span>
        </button>

        <h2 class="justify-self-center text-xl font-semibold text-gray-900">
          Metas de Estudo
        </h2>

        <!-- Botão desativado para futura criação com IA -->
        <button id="metas-add" disabled
          class="justify-self-end inline-flex items-center gap-2 rounded-md bg-gray-300 px-3 py-2 text-sm font-medium text-white opacity-60 cursor-not-allowed">
          <span class="text-base"> </span><span>Criar com IA</span>
        </button>
      </header>

      <!-- Banner de aviso: funcionalidade em desenvolvimento -->
      <div class="mb-8 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <div class="flex items-start gap-3">
          ${this.icons.alert}
          <div>
            <h3 class="font-medium">Funcionalidade em desenvolvimento</h3>
            <p>Em breve você poderá definir metas, prazos e acompanhar o progresso. Enquanto isso, aproveite Cronogramas, Textos e Quizzes.</p>
          </div>
        </div>
      </div>

      <!-- Estado vazio: sem metas cadastradas -->
      <div class="rounded-lg border border-dashed border-gray-300 bg-white/60 p-10 text-center">
        <h3 class="text-lg font-semibold text-gray-900">Ainda não há metas</h3>
        <p class="mt-2 text-sm text-gray-600">Em breve você poderá criar metas de estudo e acompanhar o progresso.</p>
      </div>
    </div>
  </div>
`;

    // Evento do botão de voltar
    (this.element.querySelector('#metas-back') as HTMLButtonElement)
      .addEventListener('click', onBack);
  }

  /**
   * Atualiza a lista de metas na interface.
   *
   * Atualmente não possui implementação pois a tela é estática.
   * Método mantido apenas por compatibilidade com outras views.
   */
  public updateMetasList(): void {
    /* intencionalmente vazio */
  }
}
