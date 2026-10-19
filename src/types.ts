export type Papel = 'colaborador' | 'operacoes'
export interface Usuario { id: string; nome: string; iniciais: string; papel: Papel }
export interface Equipamento {
  id: string; nome: string; categoria: string; patrimonio: string
  situacao: 'disponivel' | 'emprestado' | 'manutencao'
  observacoes?: string | null; comigo?: boolean; devolverAte?: string; emAtraso?: boolean
}
export interface Emprestimo {
  id: string; equipamento: Equipamento; retirado_em: string; devolver_ate: string
  emAtraso: boolean; usuario?: { nome: string }
}
export interface Operacoes {
  emprestimos: Emprestimo[]
  indicadores: { abertos: number; atrasados: number; disponiveis: number; manutencao: number }
}
export interface Cadastro { nome: string; categoria: string; patrimonio: string; observacoes: string; situacao: 'disponivel' | 'manutencao' }
