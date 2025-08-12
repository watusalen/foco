/** Registro de progresso */
export interface Progresso {
  id: string;             // ID único (UUID)
  usuario_id: string;     // ID do usuário dono
  data: string;           // Data do registro (ISO 8601)
  horas_estudadas: number;// Quantidade de horas estudadas
}

/** Dados para criar um novo registro de progresso */
export interface NovoProgresso {
  usuario_id: string;     // ID do usuário dono
  data: string;           // Data do registro (ISO 8601)
  horas_estudadas: number;// Quantidade de horas estudadas
}
