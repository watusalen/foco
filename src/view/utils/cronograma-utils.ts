import { CronogramaRepository } from '../../repository/CronogramaRepository';
import { AtividadeRepository } from '../../repository/AtividadeRepository';
import { Atividade } from '../../model/Atividade';

/**
 * Cronograma com datas calculadas a partir das atividades.
 */
export interface CronogramaComDatas {
  id: string;
  titulo: string;
  descricao?: string;
  dataInicio: string; // data de criação do cronograma
  dataFim: string;    // maior data_fim das atividades ou dataInicio
  ativo?: boolean;
  atividades?: Atividade[];
}

/**
 * Dados para criar um novo cronograma com atividades.
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
 * Utilitário para operações com cronogramas.
 */
export class CronogramaUtils {
  constructor(
    private cronogramaRepo: CronogramaRepository,
    private atividadeRepo: AtividadeRepository
  ) {}

  /**
   * Busca cronogramas de um usuário com as datas calculadas.
   * @param userId ID do usuário.
   * @returns Lista de cronogramas com datas calculadas.
   */
  async buscarCronogramasComDatas(userId: string): Promise<CronogramaComDatas[]> {
    try {
      const cronogramasComAtividades = await this.cronogramaRepo.findByUserIdWithActivities(userId);
      return cronogramasComAtividades.map(cronograma => this.calcularDatasCronograma(cronograma));
    } catch (error) {
      console.error('Erro ao buscar cronogramas com datas:', error);
      throw error;
    }
  }

  /**
   * Busca um cronograma específico com datas calculadas.
   * @param cronogramaId ID do cronograma.
   * @returns Cronograma com datas calculadas ou null se não encontrado.
   */
  async buscarCronogramaComDatas(cronogramaId: string): Promise<CronogramaComDatas | null> {
    try {
      const cronogramaComAtividades = await this.cronogramaRepo.findByIdWithActivities(cronogramaId);
      if (!cronogramaComAtividades) return null;
      return this.calcularDatasCronograma(cronogramaComAtividades);
    } catch (error) {
      console.error('Erro ao buscar cronograma com datas:', error);
      throw error;
    }
  }

  /**
   * Cria um novo cronograma com atividades.
   * @param userId ID do usuário dono do cronograma.
   * @param dados Dados para criação do cronograma e suas atividades.
   * @returns Cronograma criado com datas calculadas.
   */
  async criarCronogramaComAtividades(
    userId: string,
    dados: DadosCronograma
  ): Promise<CronogramaComDatas> {
    try {
      const novoCronograma = await this.cronogramaRepo.create({
        usuario_id: userId,
        titulo: dados.titulo,
        descricao: dados.descricao,
      });

      if (dados.atividades && dados.atividades.length > 0) {
        for (const atividade of dados.atividades) {
          await this.atividadeRepo.create({
            cronograma_id: novoCronograma.id,
            titulo: atividade.titulo,
            descricao: atividade.descricao,
            data_inicio: atividade.data_inicio,
            data_fim: atividade.data_fim,
            status: 'pendente',
          });
        }
      }

      return await this.buscarCronogramaComDatas(novoCronograma.id) as CronogramaComDatas;
    } catch (error) {
      console.error('Erro ao criar cronograma com atividades:', error);
      throw error;
    }
  }

  /**
   * Atualiza um cronograma existente.
   * @param cronogramaId ID do cronograma.
   * @param titulo Novo título.
   * @param descricao Nova descrição.
   * @returns Cronograma atualizado com datas calculadas ou null se não encontrado.
   */
  async atualizarCronograma(
    cronogramaId: string,
    titulo: string,
    descricao: string
  ): Promise<CronogramaComDatas | null> {
    try {
      const atualizado = await this.cronogramaRepo.updateById(cronogramaId, { titulo, descricao });
      if (!atualizado) return null;
      return await this.buscarCronogramaComDatas(cronogramaId);
    } catch (error) {
      console.error('Erro ao atualizar cronograma:', error);
      throw error;
    }
  }

  /**
   * Exclui um cronograma e todas suas atividades relacionadas.
   * @param cronogramaId ID do cronograma.
   * @returns true se excluído com sucesso, false caso contrário.
   */
  async excluirCronograma(cronogramaId: string): Promise<boolean> {
    try {
      const atividades = await this.atividadeRepo.findByCronogramaId(cronogramaId);
      for (const atividade of atividades) {
        await this.atividadeRepo.deleteById(atividade.id);
      }
      return await this.cronogramaRepo.deleteById(cronogramaId);
    } catch (error) {
      console.error('Erro ao excluir cronograma:', error);
      throw error;
    }
  }

  /**
   * Valida se uma data está no formato YYYY-MM-DD.
   * @param data Data em string.
   * @returns true se formato válido.
   */
  static validarFormatoData(data: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(data);
  }

  private static dateAtLocalStart(data: string) {
    const [y, m, d] = data.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  private static dateAtLocalEnd(data: string) {
    const [y, m, d] = data.split('-').map(Number);
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  }

  /**
   * Calcula o status do cronograma com base nas datas.
   * @param dataInicio Data de início.
   * @param dataFim Data de fim.
   * @returns 'futuro' | 'ativo' | 'expirado'
   */
  static calcularStatusCronograma(
    dataInicio: string,
    dataFim: string
  ): 'futuro' | 'ativo' | 'expirado' {
    const hoje = new Date();
    const inicio = this.dateAtLocalStart(dataInicio);
    const fim = this.dateAtLocalEnd(dataFim);

    if (hoje < inicio) return 'futuro';
    if (hoje > fim) return 'expirado';
    return 'ativo';
  }

  /**
   * Calcula o número de dias restantes até o fim do cronograma.
   * @param dataFim Data de fim.
   * @returns Dias restantes (inteiro).
   */
  static calcularDiasRestantes(dataFim: string): number {
    const hoje = new Date();
    const fim = this.dateAtLocalEnd(dataFim);
    return Math.ceil((fim.getTime() - hoje.getTime()) / 86400000);
  }

  /**
   * Calcula as datas (início, fim) e status do cronograma a partir de suas atividades.
   * @param crono Objeto com cronograma e atividades.
   * @returns Cronograma com datas calculadas e status.
   */
  private calcularDatasCronograma(crono: any): CronogramaComDatas {
    const { atividades = [], ...c } = crono;
    const dataInicio = (c.criado_em as string).split('T')[0];

    let dataFim = dataInicio;
    if (atividades.length > 0) {
      dataFim = atividades
        .map((a: Atividade) => a.data_fim)
        .reduce((max: string, cur: string) => (cur > max ? cur : max));
    }

    const status = CronogramaUtils.calcularStatusCronograma(dataInicio, dataFim);

    return {
      id: c.id,
      titulo: c.titulo,
      descricao: c.descricao,
      dataInicio,
      dataFim,
      ativo: status === 'ativo',
      atividades,
    };
  }
}
