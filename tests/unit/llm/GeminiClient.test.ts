import { GeminiClient } from '../../../src/llm/GeminiClient';
import { MetaUsuario, PlanoCompleto, QuizGerado, CronogramaGerado, MetaGerada } from '../../../src/llm/types';

// Mock do Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn()
    })
  }))
}));

describe('GeminiClient', () => {
  let geminiClient: GeminiClient;
  let mockModel: any;
  let mockGenerateContent: jest.Mock;

  beforeEach(() => {
    // Reset dos mocks
    jest.clearAllMocks();
    
    // Setup do mock
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const mockGenAI = new GoogleGenerativeAI();
    mockModel = mockGenAI.getGenerativeModel();
    mockGenerateContent = mockModel.generateContent;

    // Instanciar cliente
    geminiClient = new GeminiClient('fake-api-key');
    
    // Injetar o mock no cliente
    (geminiClient as any).model = mockModel;
  });

  describe('Instanciação', () => {
    test('deve criar instância válida do GeminiClient', () => {
      expect(geminiClient).toBeInstanceOf(GeminiClient);
    });

    test('deve ter todos os métodos públicos disponíveis', () => {
      expect(typeof geminiClient.gerarPlanoCompleto).toBe('function');
      expect(typeof geminiClient.gerarQuiz).toBe('function');
      expect(typeof geminiClient.gerarCronograma).toBe('function');
      expect(typeof geminiClient.gerarMeta).toBe('function');
      expect(typeof geminiClient.generateContent).toBe('function');
      expect(typeof geminiClient.setGenerationConfig).toBe('function');
      expect(typeof geminiClient.testConnection).toBe('function');
    });
  });

  describe('generateContent()', () => {
    test('deve gerar conteúdo de texto simples', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'Resposta do modelo'
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const resultado = await geminiClient.generateContent('Teste prompt');

      expect(resultado).toBe('Resposta do modelo');
      expect(mockGenerateContent).toHaveBeenCalledWith('Teste prompt');
    });

    test('deve lançar erro quando resposta é vazia', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => ''
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await expect(geminiClient.generateContent('Teste'))
        .rejects.toThrow('Resposta vazia do modelo');
    });

    test('deve tratar erro da API', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(geminiClient.generateContent('Teste'))
        .rejects.toThrow('Falha na geração de conteúdo: API Error');
    });
  });

  describe('generateJSONContent()', () => {
    test('deve parsear JSON simples corretamente', async () => {
      const mockJson = { teste: 'valor', numero: 123 };
      const mockResponse = {
        response: Promise.resolve({
          text: () => JSON.stringify(mockJson)
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const resultado = await (geminiClient as any).generateJSONContent('Teste prompt');

      expect(resultado).toEqual(mockJson);
    });

    test('deve limpar formatação markdown do JSON', async () => {
      const mockJson = { teste: 'valor' };
      const jsonWithMarkdown = `\`\`\`json\n${JSON.stringify(mockJson)}\n\`\`\``;
      
      const mockResponse = {
        response: Promise.resolve({
          text: () => jsonWithMarkdown
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const resultado = await (geminiClient as any).generateJSONContent('Teste prompt');

      expect(resultado).toEqual(mockJson);
    });

    test('deve lançar erro para JSON inválido', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => '{ json inválido }'
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      await expect((geminiClient as any).generateJSONContent('Teste'))
        .rejects.toThrow('Falha na geração de JSON');
    });
  });

  describe('gerarQuiz()', () => {
    test('deve gerar quiz com parâmetros padrão', async () => {
      const mockQuiz: QuizGerado = {
        titulo: 'Quiz: JavaScript',
        tema: 'JavaScript',
        dificuldade: 'medio',
        questoes: [
          {
            enunciado: 'O que é JavaScript?',
            alternativa_a: 'Uma linguagem de programação',
            alternativa_b: 'Um banco de dados',
            alternativa_c: 'Um servidor web',
            alternativa_d: 'Um sistema operacional',
            correta: 'A'
          }
        ]
      };

      const mockResponse = {
        response: Promise.resolve({
          text: () => JSON.stringify(mockQuiz)
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const resultado = await geminiClient.gerarQuiz('JavaScript');

      expect(resultado).toEqual(mockQuiz);
      expect(resultado.tema).toBe('JavaScript');
      expect(resultado.dificuldade).toBe('medio');
      expect(resultado.questoes).toHaveLength(1);
      expect(resultado.questoes[0].correta).toMatch(/^[ABCD]$/);
    });

    test('deve gerar quiz com parâmetros customizados', async () => {
      const mockQuiz: QuizGerado = {
        titulo: 'Quiz: React',
        tema: 'React',
        dificuldade: 'dificil',
        questoes: [
          {
            enunciado: 'Como funciona o useEffect?',
            alternativa_a: 'Hook de estado',
            alternativa_b: 'Hook de efeito',
            alternativa_c: 'Hook de contexto',
            alternativa_d: 'Hook de reducer',
            correta: 'B'
          },
          {
            enunciado: 'O que é JSX?',
            alternativa_a: 'JavaScript XML',
            alternativa_b: 'Java Syntax',
            alternativa_c: 'JSON Extended',
            alternativa_d: 'JavaScript Express',
            correta: 'A'
          }
        ]
      };

      const mockResponse = {
        response: Promise.resolve({
          text: () => JSON.stringify(mockQuiz)
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const resultado = await geminiClient.gerarQuiz('React', 2, 'dificil');

      expect(resultado.questoes).toHaveLength(2);
      expect(resultado.dificuldade).toBe('dificil');
    });
  });

  describe('gerarCronograma()', () => {
    test('deve gerar cronograma completo', async () => {
      const mockCronograma: CronogramaGerado = {
        titulo: 'Cronograma: Aprender TypeScript',
        objetivo: 'Aprender TypeScript',
        duracaoTotal: '4 semanas',
        atividades: [
          {
            titulo: 'Fundamentos do TypeScript',
            descricao: 'Estudar tipos básicos e configuração',
            ordem: 1,
            estimativaHoras: 8,
            prioridade: 'alta'
          },
          {
            titulo: 'Interfaces e Classes',
            descricao: 'Praticar POO em TypeScript',
            ordem: 2,
            estimativaHoras: 6,
            prioridade: 'media'
          }
        ]
      };

      const mockResponse = {
        response: Promise.resolve({
          text: () => JSON.stringify(mockCronograma)
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const resultado = await geminiClient.gerarCronograma('Aprender TypeScript', '2 horas por dia', '30 dias');

      expect(resultado).toEqual(mockCronograma);
      expect(resultado.atividades).toHaveLength(2);
      expect(resultado.atividades[0].ordem).toBe(1);
      expect(resultado.atividades[1].ordem).toBe(2);
      expect(resultado.atividades.every(a => ['baixa', 'media', 'alta'].includes(a.prioridade))).toBe(true);
    });
  });

  describe('gerarMeta()', () => {
    test('deve gerar meta SMART', async () => {
      const mockMeta: MetaGerada = {
        titulo: 'Dominar React em 2 meses',
        descricao: 'Aprender React do básico ao avançado, incluindo hooks, context e testing',
        valorEsperado: 90,
        unidadeMedida: '% de conhecimento aplicado',
        prazoFinal: '2024-10-15'
      };

      const mockResponse = {
        response: Promise.resolve({
          text: () => JSON.stringify(mockMeta)
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const resultado = await geminiClient.gerarMeta('Aprender React', '60 dias');

      expect(resultado).toEqual(mockMeta);
      expect(resultado.valorEsperado).toBeGreaterThan(0);
      expect(resultado.unidadeMedida).toBeTruthy();
      expect(resultado.prazoFinal).toBeTruthy();
    });
  });

  describe('gerarPlanoCompleto()', () => {
    test('deve gerar plano completo com meta, cronograma e quizzes', async () => {
      const mockPlano: PlanoCompleto = {
        meta: {
          titulo: 'Dominar Node.js em 45 dias',
          descricao: 'Aprender desenvolvimento backend com Node.js, Express e bancos de dados',
          valorEsperado: 85,
          unidadeMedida: '% de proficiência',
          prazoFinal: '2024-11-30'
        },
        cronograma: {
          titulo: 'Cronograma: Node.js',
          objetivo: 'Dominar Node.js',
          duracaoTotal: '6 semanas',
          atividades: [
            {
              titulo: 'Fundamentos Node.js',
              descricao: 'Conceitos básicos e configuração',
              ordem: 1,
              estimativaHoras: 10,
              prioridade: 'alta'
            }
          ]
        },
        quizzes: [
          {
            titulo: 'Quiz: Fundamentos Node.js',
            tema: 'Node.js Básico',
            dificuldade: 'facil',
            questoes: [
              {
                enunciado: 'O que é Node.js?',
                alternativa_a: 'Runtime JavaScript',
                alternativa_b: 'Banco de dados',
                alternativa_c: 'Framework CSS',
                alternativa_d: 'Editor de código',
                correta: 'A'
              }
            ]
          }
        ]
      };

      const mockResponse = {
        response: Promise.resolve({
          text: () => JSON.stringify(mockPlano)
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const metaUsuario: MetaUsuario = {
        objetivo: 'Dominar Node.js',
        tempoDisponivel: '3 horas por dia',
        prazo: '45 dias',
        nivel: 'intermediario'
      };

      const resultado = await geminiClient.gerarPlanoCompleto(metaUsuario);

      expect(resultado).toEqual(mockPlano);
      expect(resultado.meta).toBeDefined();
      expect(resultado.cronograma).toBeDefined();
      expect(resultado.quizzes).toBeDefined();
      expect(resultado.quizzes).toHaveLength(1);
      expect(resultado.cronograma.atividades).toHaveLength(1);
    });
  });

  describe('testConnection()', () => {
    test('deve retornar true para conexão bem-sucedida', async () => {
      const mockResponse = {
        response: Promise.resolve({
          text: () => 'OK'
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const resultado = await geminiClient.testConnection();

      expect(resultado).toBe(true);
      expect(mockGenerateContent).toHaveBeenCalledWith('Teste de conexão. Responda apenas "OK".');
    });

    test('deve retornar false para falha na conexão', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Connection failed'));

      const resultado = await geminiClient.testConnection();

      expect(resultado).toBe(false);
    });
  });

  describe('setGenerationConfig()', () => {
    test('deve permitir configurar parâmetros de geração', () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const mockGenAI = new GoogleGenerativeAI();
      const spy = jest.spyOn(mockGenAI, 'getGenerativeModel');
      
      // Injetar o mock
      (geminiClient as any).genAI = mockGenAI;

      geminiClient.setGenerationConfig({ 
        temperature: 0.5, 
        maxOutputTokens: 2048 
      });

      expect(spy).toHaveBeenCalledWith({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.5,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048
        }
      });
    });
  });

  describe('Validações de Estrutura JSON', () => {
    test('quiz gerado deve ter estrutura correta', async () => {
      const mockQuiz: QuizGerado = {
        titulo: 'Quiz: Teste',
        tema: 'Teste',
        dificuldade: 'medio',
        questoes: [
          {
            enunciado: 'Pergunta teste?',
            alternativa_a: 'A',
            alternativa_b: 'B',
            alternativa_c: 'C',
            alternativa_d: 'D',
            correta: 'A'
          }
        ]
      };

      const mockResponse = {
        response: Promise.resolve({
          text: () => JSON.stringify(mockQuiz)
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const resultado = await geminiClient.gerarQuiz('Teste');

      // Validar estrutura do quiz
      expect(resultado).toHaveProperty('titulo');
      expect(resultado).toHaveProperty('tema');
      expect(resultado).toHaveProperty('dificuldade');
      expect(resultado).toHaveProperty('questoes');
      expect(Array.isArray(resultado.questoes)).toBe(true);
      
      // Validar estrutura das questões
      resultado.questoes.forEach(questao => {
        expect(questao).toHaveProperty('enunciado');
        expect(questao).toHaveProperty('alternativa_a');
        expect(questao).toHaveProperty('alternativa_b');
        expect(questao).toHaveProperty('alternativa_c');
        expect(questao).toHaveProperty('alternativa_d');
        expect(questao).toHaveProperty('correta');
        expect(['A', 'B', 'C', 'D']).toContain(questao.correta);
      });
    });

    test('cronograma gerado deve ter estrutura correta', async () => {
      const mockCronograma: CronogramaGerado = {
        titulo: 'Cronograma: Teste',
        objetivo: 'Objetivo teste',
        duracaoTotal: '2 semanas',
        atividades: [
          {
            titulo: 'Atividade 1',
            descricao: 'Descrição da atividade',
            ordem: 1,
            estimativaHoras: 5,
            prioridade: 'alta'
          }
        ]
      };

      const mockResponse = {
        response: Promise.resolve({
          text: () => JSON.stringify(mockCronograma)
        })
      };
      mockGenerateContent.mockResolvedValue(mockResponse);

      const resultado = await geminiClient.gerarCronograma('Objetivo teste', '1 hora por dia');

      // Validar estrutura do cronograma
      expect(resultado).toHaveProperty('titulo');
      expect(resultado).toHaveProperty('objetivo');
      expect(resultado).toHaveProperty('duracaoTotal');
      expect(resultado).toHaveProperty('atividades');
      expect(Array.isArray(resultado.atividades)).toBe(true);
      
      // Validar estrutura das atividades
      resultado.atividades.forEach(atividade => {
        expect(atividade).toHaveProperty('titulo');
        expect(atividade).toHaveProperty('descricao');
        expect(atividade).toHaveProperty('ordem');
        expect(atividade).toHaveProperty('estimativaHoras');
        expect(atividade).toHaveProperty('prioridade');
        expect(['baixa', 'media', 'alta']).toContain(atividade.prioridade);
        expect(typeof atividade.ordem).toBe('number');
        expect(typeof atividade.estimativaHoras).toBe('number');
      });
    });
  });
});
