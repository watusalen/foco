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
  ) {}

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
    // Remove palavras de comando comuns
    const palavrasParaRemover = [
      'gere', 'crie', 'faça', 'escreva', 'explique', 'resuma', 'resumo', 'texto',
      'sobre', 'acerca', 'de', 'da', 'do', 'das', 'dos', 'um', 'uma', 'o', 'a'
    ];
    
    let titulo = prompt.toLowerCase();
    
    // Remove palavras de comando
    palavrasParaRemover.forEach(palavra => {
      titulo = titulo.replace(new RegExp(`\\b${palavra}\\b`, 'g'), '');
    });
    
    // Limpa espaços extras
    titulo = titulo.replace(/\s+/g, ' ').trim();
    
    // Capitaliza primeira letra de cada palavra importante
    titulo = titulo.split(' ')
      .filter(palavra => palavra.length > 2)
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
    
    // Adiciona prefixo baseado no tipo
    const prefixo = tipo === 'resumo' ? 'Resumo: ' : 'Texto: ';
    
    // Limita o tamanho
    const tituloFinal = titulo.length > 50 ? titulo.substring(0, 50) + '...' : titulo;
    
    return prefixo + (tituloFinal || 'Conteúdo Gerado');
  }

  /**
   * Simula geração de contexto para conversa
   */
  static gerarContextoConversa(textoOriginal: string, conversasAnteriores: Conversa[]): string {
    let contexto = `Texto original: "${textoOriginal.substring(0, 200)}..."`;
    
    if (conversasAnteriores.length > 0) {
      contexto += '\n\nInterações anteriores:\n';
      conversasAnteriores.slice(-3).forEach((conversa, index) => {
        contexto += `${index + 1}. Pergunta: "${conversa.prompt}"\n`;
        contexto += `   Resposta: "${conversa.resposta.substring(0, 100)}..."\n`;
      });
    }
    
    return contexto;
  }
}
