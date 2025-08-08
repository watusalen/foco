import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import { MetaUsuario, PlanoCompleto, QuizGerado, CronogramaGerado, MetaGerada } from './types';

/**
 * Cliente Agente Inteligente para geração automatizada via Google Gemini
 */
export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      }
    });
  }

  /**
   * MÉTODO PRINCIPAL: Gera plano completo baseado na meta do usuário
   */
  async gerarPlanoCompleto(metaUsuario: MetaUsuario): Promise<PlanoCompleto> {
    const prompt = `
Você é um agente especialista em planejamento e educação. Baseado na meta do usuário, gere um plano completo para ajudá-lo.

META DO USUÁRIO:
- Objetivo: ${metaUsuario.objetivo}
- Tempo disponível: ${metaUsuario.tempoDisponivel}
- Prazo: ${metaUsuario.prazo || 'Não especificado'}
- Nível: ${metaUsuario.nivel || 'intermediario'}

GERE UM PLANO COMPLETO com:
1. Uma meta específica, mensurável e com prazo
2. Um cronograma detalhado de atividades
3. 3 quizzes para validar o aprendizado

Estrutura JSON esperada:
{
  "meta": {
    "titulo": "Meta específica e clara",
    "descricao": "Descrição detalhada do que será alcançado",
    "valorEsperado": 100,
    "unidadeMedida": "% de domínio do assunto",
    "prazoFinal": "Data específica"
  },
  "cronograma": {
    "titulo": "Cronograma para [objetivo]",
    "objetivo": "Repetir o objetivo principal",
    "duracaoTotal": "X semanas/meses",
    "atividades": [
      {
        "titulo": "Nome da atividade",
        "descricao": "O que fazer nesta atividade",
        "ordem": 1,
        "estimativaHoras": 4,
        "prioridade": "alta"
      }
    ]
  },
  "quizzes": [
    {
      "titulo": "Quiz de [tema]",
      "tema": "Tema específico",
      "dificuldade": "facil",
      "questoes": [
        {
          "enunciado": "Pergunta sobre o tema",
          "alternativa_a": "Opção A",
          "alternativa_b": "Opção B", 
          "alternativa_c": "Opção C",
          "alternativa_d": "Opção D",
          "correta": "A"
        }
      ]
    }
  ]
}`;

    return this.generateJSONContent<PlanoCompleto>(prompt);
  }

  /**
   * Gerar quiz específico sobre um tema
   */
  async gerarQuiz(tema: string, numeroQuestoes: number = 5, dificuldade: 'facil' | 'medio' | 'dificil' = 'medio'): Promise<QuizGerado> {
    const prompt = `
Gere um quiz educativo sobre: ${tema}

ESPECIFICAÇÕES:
- ${numeroQuestoes} questões de múltipla escolha
- Dificuldade: ${dificuldade}
- Questões práticas e relevantes
- Alternativas bem distribuídas
- Resposta correta clara

JSON esperado:
{
  "titulo": "Quiz: ${tema}",
  "tema": "${tema}",
  "dificuldade": "${dificuldade}",
  "questoes": [
    {
      "enunciado": "Pergunta clara e objetiva",
      "alternativa_a": "Primeira opção",
      "alternativa_b": "Segunda opção",
      "alternativa_c": "Terceira opção", 
      "alternativa_d": "Quarta opção",
      "correta": "A"
    }
  ]
}`;

    return this.generateJSONContent<QuizGerado>(prompt);
  }

  /**
   * Gerar cronograma de estudos
   */
  async gerarCronograma(objetivo: string, tempoDisponivel: string, prazo?: string): Promise<CronogramaGerado> {
    const prompt = `
Crie um cronograma detalhado de estudos para:

OBJETIVO: ${objetivo}
TEMPO DISPONÍVEL: ${tempoDisponivel}
PRAZO: ${prazo || 'Flexível'}

O cronograma deve ser prático, realizável e progressivo.

JSON esperado:
{
  "titulo": "Cronograma: ${objetivo}",
  "objetivo": "${objetivo}",
  "duracaoTotal": "Duração estimada total",
  "atividades": [
    {
      "titulo": "Nome da atividade",
      "descricao": "Descrição detalhada do que fazer",
      "ordem": 1,
      "estimativaHoras": 2,
      "prioridade": "alta"
    }
  ]
}`;

    return this.generateJSONContent<CronogramaGerado>(prompt);
  }

  /**
   * Gerar meta específica e mensurável
   */
  async gerarMeta(objetivo: string, prazo?: string): Promise<MetaGerada> {
    const prompt = `
Transforme este objetivo em uma meta específica, mensurável, atingível, relevante e temporal (SMART):

OBJETIVO: ${objetivo}
PRAZO SUGERIDO: ${prazo || 'A definir'}

A meta deve ser clara e ter critérios de sucesso bem definidos.

JSON esperado:
{
  "titulo": "Meta específica e clara",
  "descricao": "Descrição detalhada do que será alcançado e como medir",
  "valorEsperado": 100,
  "unidadeMedida": "Unidade de medida apropriada",
  "prazoFinal": "Data específica de conclusão"
}`;

    return this.generateJSONContent<MetaGerada>(prompt);
  }

  /**
   * Gerar conteúdo usando o modelo Gemini
   */
  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error('Resposta vazia do modelo');
      }
      
      return text;
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      throw new Error(`Falha na geração de conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Gerar conteúdo JSON estruturado
   */
  async generateJSONContent<T>(prompt: string): Promise<T> {
    try {
      const jsonPrompt = `${prompt}

IMPORTANTE: Responda APENAS com um JSON válido, sem explicações adicionais ou formatação markdown. O JSON deve seguir exatamente a estrutura solicitada.`;

      const content = await this.generateContent(jsonPrompt);
      
      // Limpar possível formatação markdown
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      return JSON.parse(cleanContent) as T;
    } catch (error) {
      console.error('Erro ao gerar JSON:', error);
      throw new Error(`Falha na geração de JSON: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Configurar parâmetros de geração customizados
   */
  setGenerationConfig(config: Partial<GenerationConfig>): void {
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
        ...config
      }
    });
  }

  /**
   * Testar conexão com a API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.generateContent('Teste de conexão. Responda apenas "OK".');
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      return false;
    }
  }
}
