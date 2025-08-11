import { TextoRepository } from '../../repository/TextoRepository';
import { ConversaRepository } from '../../repository/ConversaRepository';
import { Texto, NovoTexto } from '../../model/Texto';
import { Conversa } from '../../model/Conversa';

/**
 * Interface para texto com conversas
 */
export interface TextoComConversas {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: 'texto' | 'resumo';
  prompt_original: string;
  salvo: boolean;
  criado_em: string;
  conversas?: Conversa[];
}

/**
 * Interface para dados de criação de texto
 */
export interface DadosTexto {
  titulo: string;
  conteudo: string;
  tipo: 'texto' | 'resumo';
  prompt_original: string;
}

/**
 * Classe utilitária para operações com textos e conversas
 */
export class TextoUtils {
  constructor(
    private textoRepo: TextoRepository,
    private conversaRepo: ConversaRepository
  ) { }

  /**
   * Busca textos de um usuário com suas conversas
   */
  async buscarTextosComConversas(userId: string): Promise<TextoComConversas[]> {
    try {
      const textosComConversas = await this.textoRepo.findByUserIdWithConversas(userId);

      return textosComConversas.map(texto => ({
        id: texto.id,
        titulo: texto.titulo,
        conteudo: texto.conteudo,
        tipo: texto.tipo,
        prompt_original: texto.prompt_original,
        salvo: texto.salvo,
        criado_em: texto.criado_em,
        conversas: texto.conversas || []
      }));
    } catch (error) {
      console.error('Erro ao buscar textos com conversas:', error);
      throw error;
    }
  }

  /**
   * Busca um texto específico com suas conversas
   */
  async buscarTextoComConversas(textoId: string): Promise<TextoComConversas | null> {
    try {
      const textoComConversas = await this.textoRepo.findByIdWithConversas(textoId);

      if (!textoComConversas) {
        return null;
      }

      return {
        id: textoComConversas.id,
        titulo: textoComConversas.titulo,
        conteudo: textoComConversas.conteudo,
        tipo: textoComConversas.tipo,
        prompt_original: textoComConversas.prompt_original,
        salvo: textoComConversas.salvo,
        criado_em: textoComConversas.criado_em,
        conversas: textoComConversas.conversas || []
      };
    } catch (error) {
      console.error('Erro ao buscar texto com conversas:', error);
      throw error;
    }
  }

  /**
   * Cria um novo texto
   */
  async criarTexto(
    userId: string,
    dados: DadosTexto
  ): Promise<TextoComConversas> {
    try {
      const novoTexto = await this.textoRepo.create({
        usuario_id: userId,
        titulo: dados.titulo,
        conteudo: dados.conteudo,
        tipo: dados.tipo,
        prompt_original: dados.prompt_original,
        salvo: false
      });

      return {
        id: novoTexto.id,
        titulo: novoTexto.titulo,
        conteudo: novoTexto.conteudo,
        tipo: novoTexto.tipo,
        prompt_original: novoTexto.prompt_original,
        salvo: novoTexto.salvo,
        criado_em: novoTexto.criado_em,
        conversas: []
      };
    } catch (error) {
      console.error('Erro ao criar texto:', error);
      throw error;
    }
  }

  /**
   * Adiciona uma nova conversa a um texto
   */
  async adicionarConversa(
    textoId: string,
    prompt: string,
    resposta: string
  ): Promise<Conversa> {
    try {
      const novaConversa = await this.conversaRepo.create({
        texto_id: textoId,
        prompt,
        resposta
      });

      return novaConversa;
    } catch (error) {
      console.error('Erro ao adicionar conversa:', error);
      throw error;
    }
  }

  /**
   * Alterna status de salvo de um texto
   */
  async alternarSalvo(textoId: string): Promise<TextoComConversas | null> {
    try {
      const textoAtualizado = await this.textoRepo.toggleSaved(textoId);

      if (!textoAtualizado) {
        return null;
      }

      // Retorna o texto com conversas
      return await this.buscarTextoComConversas(textoId);
    } catch (error) {
      console.error('Erro ao alterar status de salvo:', error);
      throw error;
    }
  }

  /**
   * Exclui um texto e suas conversas relacionadas
   */
  async excluirTexto(textoId: string): Promise<boolean> {
    try {
      // Primeiro exclui todas as conversas do texto
      const conversas = await this.conversaRepo.findByTextoId(textoId);

      for (const conversa of conversas) {
        await this.conversaRepo.deleteById(conversa.id);
      }

      // Depois exclui o texto
      const sucesso = await this.textoRepo.deleteById(textoId);
      return sucesso;
    } catch (error) {
      console.error('Erro ao excluir texto:', error);
      throw error;
    }
  }

  /**
   * Busca apenas textos salvos
   */
  async buscarTextosSalvos(userId: string): Promise<TextoComConversas[]> {
    try {
      const textosSalvos = await this.textoRepo.findSavedByUserId(userId);

      const textosComConversas = await Promise.all(
        textosSalvos.map(async (texto) => {
          const conversas = await this.conversaRepo.findByTextoId(texto.id);
          return {
            id: texto.id,
            titulo: texto.titulo,
            conteudo: texto.conteudo,
            tipo: texto.tipo,
            prompt_original: texto.prompt_original,
            salvo: texto.salvo,
            criado_em: texto.criado_em,
            conversas
          };
        })
      );

      return textosComConversas;
    } catch (error) {
      console.error('Erro ao buscar textos salvos:', error);
      throw error;
    }
  }

  /**
   * Extrai título inteligentemente do prompt
   */
  static extrairTituloDoPrompt(prompt: string, tipo: 'texto' | 'resumo'): string {
    // remove HTML e normaliza acentos
    const plain = prompt.replace(/<[^>]*>/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const stop = new Set([
      'gere', 'crie', 'faca', 'escreva', 'explique', 'resuma', 'resumo', 'texto', 'sobre', 'acerca', 'de', 'da', 'do', 'das', 'dos', 'um', 'uma', 'o', 'a',
      'para', 'por', 'no', 'na', 'nos', 'nas', 'em', 'e'
    ]);

    const words = plain
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter(w => w.length > 2 && !stop.has(w));

    let titulo = words.map(w => w[0].toUpperCase() + w.slice(1)).join(' ').trim();
    if (!titulo) titulo = 'Conteudo Gerado';

    const prefixo = tipo === 'resumo' ? 'Resumo: ' : 'Texto: ';
    const limite = 50;
    if (titulo.length > limite) titulo = titulo.slice(0, limite).trim() + '...';

    return prefixo + titulo;
  }


  /**
   * Simula geração de contexto para conversa
   */
  static gerarContextoConversa(textoOriginal: string, conversasAnteriores: Conversa[]): string {
    const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '');
    const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n) + '...' : s);

    let contexto = `Texto original: "${cut(stripHtml(textoOriginal), 300)}"`;

    if (conversasAnteriores.length > 0) {
      const ultimas = conversasAnteriores.slice(-3);
      contexto += '\n\nInterações anteriores:\n';
      ultimas.forEach((c, i) => {
        contexto += `${i + 1}. Pergunta: "${cut(stripHtml(c.prompt), 160)}"\n`;
        contexto += `   Resposta: "${cut(stripHtml(c.resposta), 220)}"\n`;
      });
    }
    return contexto;
  }

}
