/**
 * Classe responsável por gerenciar a visibilidade de múltiplas telas (seções) no DOM.
 * 
 * Recebe um array de HTMLElements (cada um representando uma tela) e fornece métodos para:
 * - Exibir apenas uma tela pelo seu id, ocultando todas as outras.
 * - Ocultar todas as telas.
 * - Recuperar um elemento de tela pelo id.
 */
export class ScreenRouter {
  private screensMap: Map<string, HTMLElement>;
  private onBeforeNavigate?: () => void;

  /**
   * Cria uma instância do ScreenRouter.
   * 
   * @param screens Array de HTMLElements, cada um deve possuir um atributo `id` único.
   *                Todas as telas passadas aqui serão gerenciadas pelo router.
   * @param onBeforeNavigate Callback opcional executado antes de cada navegação
   * @throws {Error} Se algum elemento não possuir atributo `id`.
   */
  constructor(screens: HTMLElement[], onBeforeNavigate?: () => void) {
    this.screensMap = new Map();
    this.onBeforeNavigate = onBeforeNavigate;

    for (const screenEl of screens) {
      const id = screenEl.id;
      if (!id) {
        throw new Error("ScreenRouter: cada elemento deve ter um atributo 'id'.");
      }
      this.screensMap.set(id, screenEl);
    }
  }

  /**
   * Oculta todas as telas e exibe apenas aquela cujo `id` corresponde a `screenId`.
   * Adiciona a classe CSS "hidden" em todas as outras e remove da tela a ser exibida.
   *
   * @param screenId Id do elemento (ex: <section>) que deve ficar visível.
   */
  public show(screenId: string): void {
    // Executa callback antes de navegar (para fechar diálogos, etc.)
    if (this.onBeforeNavigate) {
      this.onBeforeNavigate();
    }

    for (const [id, el] of this.screensMap.entries()) {
      if (id === screenId) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }
  }

  /**
   * Oculta todas as telas gerenciadas, adicionando a classe "hidden" em cada uma.
   */
  public hideAll(): void {
    for (const el of this.screensMap.values()) {
      el.classList.add("hidden");
    }
  }

  /**
   * Retorna o HTMLElement da tela pelo `id`, caso precise manipulá-la diretamente.
   * 
   * @param screenId Id da tela desejada.
   * @returns O elemento correspondente ou `undefined` se não encontrado.
   */
  public getScreen(screenId: string): HTMLElement | undefined {
    return this.screensMap.get(screenId);
  }
}
