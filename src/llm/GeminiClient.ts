import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import { MetaUsuario, PlanoCompleto, QuizGerado, CronogramaGerado, MetaGerada } from './types';

/**
 * # GeminiClient
 *
 * Cliente fino para geração **estruturada** de conteúdo educacional usando **Google Gemini**.
 * Centraliza prompts e parsing de JSON (com limpeza de blocos ` ```json ` caso o modelo insista).
 *
 * @example
 * const gemini = new GeminiClient(process.env.GEMINI_API_KEY!);
 * const ok = await gemini.testConnection(); // true/false
 *
 * // Plano completo a partir da meta do usuário
 * const plano = await gemini.gerarPlanoCompleto({
 *   objetivo: 'Aprender React',
 *   tempoDisponivel: '2h/dia',
 *   prazo: '6 semanas',
 *   nivel: 'iniciante'
 * });
 */
export class GeminiClient {
  /** Instância do SDK do Gemini (Google). */
  private genAI: GoogleGenerativeAI;

  /** Modelo configurado (padrão: `gemini-1.5-flash`). */
  private model: GenerativeModel;

  /**
   * Cria um cliente já pronto para gerar conteúdo.
   *
   * @param apiKey Chave de API do Google Gemini.
   * @throws Se a `apiKey` for vazia/indefinida, as chamadas subsequentes irão falhar.
   */
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096
      }
    });
  }

  /**
   * Gera um **quiz** sobre um tema específico.
   *
   * @param tema Tema do quiz (ex.: "Termodinâmica", "JS Async/Await").
   * @param numeroQuestoes Quantidade de questões (padrão: 5).
   * @param dificuldade Nível: 'facil' | 'medio' | 'dificil' (padrão: 'medio').
   * @returns Objeto `QuizGerado` tipado.
   * @throws {Error} Em caso de JSON inválido ou erro do modelo.
   */
  async gerarQuiz(
    tema: string,
    numeroQuestoes: number = 5,
    dificuldade: 'facil' | 'medio' | 'dificil' = 'medio'
  ): Promise<QuizGerado> {
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
   * Gera um **cronograma** de estudos prático e progressivo.
   *
   * @param objetivo Objetivo do estudo (ex.: "Aprender React").
   * @param tempoDisponivel Ex.: "2h/dia", "10h/semana".
   * @param prazo Data limite ou "Flexível".
   * @returns Objeto `CronogramaGerado` tipado.
   * @throws {Error} Em caso de JSON inválido ou erro do modelo.
   */
  async gerarCronograma(
    objetivo: string,
    tempoDisponivel: string,
    prazo?: string
  ): Promise<CronogramaGerado> {
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
   * Invoca o modelo com um prompt **arbitrário** e retorna o texto puro.
   *
   * @param prompt Texto do prompt.
   * @returns Texto retornado pelo modelo (sem pós-processamento).
   * @throws {Error} Em falhas de rede/modelo ou resposta vazia.
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
      throw new Error(
        `Falha na geração de conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Gera conteúdo **estruturado em JSON** e faz o parse tipado.
   *
   * - Acrescenta instrução para **retornar apenas JSON**.
   * - Remove blocos Markdown (```json … ```).
   *
   * @template T Tipo esperado do JSON de saída.
   * @param prompt Prompt base (sem a parte do "IMPORTANTE", o método adiciona).
   * @returns Objeto tipado `T`.
   * @throws {Error} Se o JSON for inválido ou a geração falhar.
   *
   * @example
   * const quiz = await client.generateJSONContent<QuizGerado>('Gere um quiz X no formato {...}');
   */
  async generateJSONContent<T>(prompt: string): Promise<T> {
    try {
      const jsonPrompt = `${prompt}

IMPORTANTE: Responda APENAS com um JSON válido, sem explicações adicionais ou formatação markdown. O JSON deve seguir exatamente a estrutura solicitada.`;

      const content = await this.generateContent(jsonPrompt);

      // Limpa cercas de markdown comuns
      const cleanContent = content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      return JSON.parse(cleanContent) as T;
    } catch (error) {
      console.error('Erro ao gerar JSON:', error);
      throw new Error(
        `Falha na geração de JSON: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Sobrescreve parcialmente a configuração de geração do modelo.
   *
   * @param config Campos a alterar (ex.: `{ temperature: 0.3 }`).
   * @example
   * client.setGenerationConfig({ temperature: 0.2, maxOutputTokens: 2048 });
   *
   * @note Reinstancia o `GenerativeModel` com as novas configs.
   */
  setGenerationConfig(config: Partial<GenerationConfig>): void {
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
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
   * Faz uma chamada mínima para verificar conectividade/credenciais.
   *
   * @returns `true` em caso de sucesso; `false` em qualquer falha.
   * @example
   * const ok = await client.testConnection();
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
