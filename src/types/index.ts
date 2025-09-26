export interface CSVData {
  [key: string]: string | number;
}

export interface KPIData {
  totalVendas: number;
  ticketMedio: number;
  produtoMaisVendido: string;
  clienteMaisFrequente: string;
  vendasPorMes: { mes: string; valor: number }[];
  vendasPorProduto: { produto: string; quantidade: number; valor: number }[];
  crescimentoPercentual: number;
}

export interface LLMResponse {
  dadosEstruturados: CSVData[];
  kpis: KPIData;
  resumo: string;
  colunasDisponiveis: string[];
}

export interface ValidationResult {
  isValid: boolean;
  missingColumns: string[];
  availableColumns: string[];
  message: string;
}
