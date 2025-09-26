import { ValidationResult } from '@/types';

const REQUIRED_COLUMNS = ['valor', 'data', 'produto', 'cliente'];
const ALTERNATIVE_COLUMN_NAMES = {
  valor: ['preco', 'price', 'total', 'amount', 'vlr'],
  data: ['date', 'data_venda', 'created_at', 'timestamp'],
  produto: ['product', 'item', 'produto_nome', 'nome_produto'],
  cliente: ['customer', 'client', 'cliente_nome', 'nome_cliente', 'comprador']
};

export function validateCSVColumns(columns: string[]): ValidationResult {
  const availableColumns = columns.map(col => col.toLowerCase().trim());
  const missingColumns: string[] = [];
  
  // Verifica se as colunas obrigatórias existem (com variações de nome)
  for (const requiredCol of REQUIRED_COLUMNS) {
    const alternatives = ALTERNATIVE_COLUMN_NAMES[requiredCol as keyof typeof ALTERNATIVE_COLUMN_NAMES];
    const allPossibleNames = [requiredCol, ...alternatives];
    
    const found = allPossibleNames.some(name => 
      availableColumns.some(col => col.includes(name) || name.includes(col))
    );
    
    if (!found) {
      missingColumns.push(requiredCol);
    }
  }
  
  const isValid = missingColumns.length === 0;
  
  let message = '';
  if (isValid) {
    message = 'CSV válido! Colunas suficientes encontradas para gerar insights.';
  } else {
    message = `Colunas insuficientes para gerar insights. Faltam: ${missingColumns.join(', ')}. 
    Certifique-se de que seu CSV contém colunas com nomes similares a: valor, data, produto, cliente.`;
  }
  
  return {
    isValid,
    missingColumns,
    availableColumns: columns,
    message
  };
}

export function normalizeColumnName(columnName: string): string {
  const lowerName = columnName.toLowerCase().trim();
  
  // Mapeia nomes alternativos para nomes padrão
  for (const [standard, alternatives] of Object.entries(ALTERNATIVE_COLUMN_NAMES)) {
    if (alternatives.some(alt => lowerName.includes(alt) || alt.includes(lowerName))) {
      return standard;
    }
  }
  
  return lowerName;
}
