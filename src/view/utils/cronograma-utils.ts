import { CronogramaRepository } from '../../repository/CronogramaRepository';
import { AtividadeRepository } from '../../repository/AtividadeRepository';
import { Cronograma } from '../../model/Cronograma';
import { Atividade } from '../../model/Atividade';

/**
 * Interface para cronograma com datas calculadas
 */
export interface CronogramaComDatas {
  id: string;
  titulo: string;
  descricao?: string;
  dataInicio: string; // cronograma.criado_em
  dataFim: string;    // MAX(atividade.data_fim) ou criado_em se não houver atividades
  ativo?: boolean;
  atividades?: Atividade[];
}

/**
 * Interface para dados de criação de cronograma
 */
export interface DadosCronograma {
  titulo: string;
  descricao?: string;
  dataInicio: string;
  dataFim: string;
  atividades?: Array<{
    titulo: string;
    descricao?: string;
    data_inicio: string;
    data_fim: string;
  }>;
}

/**
 * Classe utilitária para operações com cronogramas
 */
export class CronogramaUtils {
  constructor(
    private cronogramaRepo: CronogramaRepository,
    private atividadeRepo: AtividadeRepository
  ) {}

  /**
   * Busca cronogramas de um usuário com datas calculadas
   */
  async buscarCronogramasComDatas(userId: string): Promise<CronogramaComDatas[]> {
    try {
      // Busca cronogramas com suas atividades
      const cronogramasComAtividades = await this.cronogramaRepo.findByUserIdWithActivities(userId);
      
      return cronogramasComAtividades.map(cronograma => this.calcularDatasCronograma(cronograma));
    } catch (error) {
      console.error('Erro ao buscar cronogramas com datas:', error);
      throw error;
    }
  }

  /**
   * Busca um cronograma específico com datas calculadas
   */
  async buscarCronogramaComDatas(cronogramaId: string): Promise<CronogramaComDatas | null> {
    try {
      const cronogramaComAtividades = await this.cronogramaRepo.findByIdWithActivities(cronogramaId);
      
      if (!cronogramaComAtividades) {
        return null;
      }

      return this.calcularDatasCronograma(cronogramaComAtividades);
    } catch (error) {
      console.error('Erro ao buscar cronograma com datas:', error);
      throw error;
    }
  }

  /**
   * Calcula as datas de um cronograma baseado em suas atividades
   */
  private calcularDatasCronograma(cronogramaComAtividades: any): CronogramaComDatas {
    const { atividades, ...cronograma } = cronogramaComAtividades;
    
    // dataInicio = cronograma.criado_em
    const dataInicio = cronograma.criado_em.split('T')[0]; // Remove horário, mantém apenas data
    
    // dataFim = MAX(atividade.data_fim) ou criado_em se não houver atividades
    let dataFim = dataInicio;
    
    if (atividades && atividades.length > 0) {
      const datasFim = atividades.map((atividade: any) => atividade.data_fim);
      dataFim = datasFim.reduce((max: string, current: string) => {
        return current > max ? current : max;
      });
    }

    return {
      id: cronograma.id,
      titulo: cronograma.titulo,
      descricao: cronograma.descricao,
      dataInicio,
      dataFim,
      atividades: atividades || []
    };
  }

  /**
   * Cria um novo cronograma com atividades
   */
  async criarCronogramaComAtividades(
    userId: string, 
    dados: DadosCronograma
  ): Promise<CronogramaComDatas> {
    try {
      // Cria o cronograma primeiro
      const novoCronograma = await this.cronogramaRepo.create({
        usuario_id: userId,
        titulo: dados.titulo,
        descricao: dados.descricao,
        // criado_em será automaticamente definido pelo banco como dataInicio
      });

      // Se há atividades para criar
      if (dados.atividades && dados.atividades.length > 0) {
        for (const atividade of dados.atividades) {
          await this.atividadeRepo.create({
            cronograma_id: novoCronograma.id,
            titulo: atividade.titulo,
            descricao: atividade.descricao,
            data_inicio: atividade.data_inicio,
            data_fim: atividade.data_fim,
            status: 'pendente'
          });
        }
      }

      // Retorna o cronograma com datas calculadas
      return await this.buscarCronogramaComDatas(novoCronograma.id) as CronogramaComDatas;
    } catch (error) {
      console.error('Erro ao criar cronograma com atividades:', error);
      throw error;
    }
  }

  /**
   * Atualiza um cronograma existente
   */
  async atualizarCronograma(
    cronogramaId: string,
    titulo: string,
    descricao: string
  ): Promise<CronogramaComDatas | null> {
    try {
      const cronogramaAtualizado = await this.cronogramaRepo.updateById(cronogramaId, {
        titulo,
        descricao
      });

      if (!cronogramaAtualizado) {
        return null;
      }

      // Retorna o cronograma com datas calculadas
      return await this.buscarCronogramaComDatas(cronogramaId);
    } catch (error) {
      console.error('Erro ao atualizar cronograma:', error);
      throw error;
    }
  }

  /**
   * Exclui um cronograma e suas atividades relacionadas
   */
  async excluirCronograma(cronogramaId: string): Promise<boolean> {
    try {
      // Primeiro exclui todas as atividades do cronograma
      const atividades = await this.atividadeRepo.findByCronogramaId(cronogramaId);
      
      for (const atividade of atividades) {
        await this.atividadeRepo.deleteById(atividade.id);
      }

      // Depois exclui o cronograma
      const sucesso = await this.cronogramaRepo.deleteById(cronogramaId);
      return sucesso;
    } catch (error) {
      console.error('Erro ao excluir cronograma:', error);
      throw error;
    }
  }

  /**
   * Verifica se uma data está no formato correto (YYYY-MM-DD)
   */
  static validarFormatoData(data: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(data) && !isNaN(Date.parse(data));
  }

  /**
   * Converte data do formato ISO para formato brasileiro
   */
  static formatarDataBR(data: string): string {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  /**
   * Calcula o status de um cronograma baseado nas datas
   */
  static calcularStatusCronograma(dataInicio: string, dataFim: string): 'futuro' | 'ativo' | 'expirado' {
    const hoje = new Date();
    const inicio = new Date(dataInicio + 'T00:00:00');
    const fim = new Date(dataFim + 'T23:59:59');
    
    if (hoje < inicio) return 'futuro';
    if (hoje > fim) return 'expirado';
    return 'ativo';
  }

  /**
   * Calcula dias restantes para um cronograma
   */
  static calcularDiasRestantes(dataFim: string): number {
    const hoje = new Date();
    const fim = new Date(dataFim + 'T23:59:59');
    return Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }
}
