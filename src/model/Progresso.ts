export interface Progresso {
  id: string;
  usuario_id: string;
  data: string;
  horas_estudadas: number;
}

export interface NovoProgresso {
  usuario_id: string;
  data: string;
  horas_estudadas: number;
}
