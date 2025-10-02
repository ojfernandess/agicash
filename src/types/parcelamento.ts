// Tipos para funcionalidade de parcelamento

export interface Parcela {
  id: string;
  emprestimo_id: string;
  numero_parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  data_pagamento: string | null;
  valor_pago: number;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  juros_aplicados: number;
  multa_aplicada: number;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParcelaDetalhada extends Parcela {
  cliente_id: string;
  cliente_nome: string;
  cliente_cpf: string;
  valor_emprestimo: number;
  taxa_juros_diaria_atraso: number;
  dias_atraso: number;
  valor_total_devido: number;
}

export interface EmprestimoComParcelamento {
  id: string;
  cliente_id: string;
  valor_emprestimo: number;
  valor_principal: number; // Adicionado para compatibilidade
  data_emprestimo: string;
  data_vencimento: string;
  taxa_juros: number;
  taxa_juros_mensal: number; // Adicionado para compatibilidade
  valor_total: number;
  status: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  data_ultimo_calculo: string | null;
  dias_atraso: number | null;
  juros_diarios_calculados: number | null;
  taxa_juros_diaria_atraso: number | null;
  // Novos campos para parcelamento
  parcelado: boolean;
  numero_parcelas: number | null;
  valor_parcela: number | null;
  intervalo_pagamento: number | null;
  data_primeira_parcela: string | null;
  observacoes_parcelamento: string | null;
  // Relacionamentos
  parcelas?: Parcela[];
  clientes?: {
    id: string;
    nome: string;
    cpf: string;
    email: string;
    telefone: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

export interface ConfiguracaoParcelamento {
  parcelado: boolean;
  numero_parcelas: number;
  valor_parcela: number;
  intervalo_pagamento: number; // dias entre parcelas
  data_primeira_parcela: string;
  observacoes_parcelamento?: string;
}

export interface FormularioEmprestimo {
  cliente_id: string;
  valor_emprestimo: number;
  data_emprestimo: string;
  data_vencimento: string;
  taxa_juros: number;
  taxa_juros_diaria_atraso: number;
  observacoes?: string;
  // Configurações de parcelamento
  parcelamento: ConfiguracaoParcelamento;
}

export interface EstatisticasParcelamento {
  total_parcelas: number;
  parcelas_pagas: number;
  parcelas_pendentes: number;
  parcelas_atrasadas: number;
  valor_total_pago: number;
  valor_total_pendente: number;
  valor_total_atrasado: number;
  proximo_vencimento: string | null;
}
