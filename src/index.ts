/**
 * Ponto de entrada da aplicação FOCO.
 * 
 * Inicializa a interface principal (`MainView`) assim que o DOM estiver carregado,
 * conectando a camada de visualização ao restante do sistema.
 */
import { MainView } from "./view/main-view";

window.addEventListener("DOMContentLoaded", () => {
  new MainView();
});