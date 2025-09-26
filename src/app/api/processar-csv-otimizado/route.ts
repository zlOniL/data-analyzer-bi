import { NextRequest, NextResponse } from 'next/server';
import { LLMResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { csvData, columns } = await request.json();

    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return NextResponse.json(
        { error: 'Dados CSV inválidos ou vazios' },
        { status: 400 }
      );
    }

    // Processamento local completo (muito mais rápido)
    const result = processDataCompletely(csvData, columns);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro no processamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function processDataCompletely(csvData: any[], columns: string[]): LLMResponse {
  // Extrair dados
  const values = csvData.map(row => parseFloat(row.valor || row.preco || row.price || 0)).filter(v => !isNaN(v));
  const produtos = csvData.map(row => row.produto || row.product || '').filter(p => p);
  const clientes = csvData.map(row => row.cliente || row.customer || '').filter(c => c);
  const datas = csvData.map(row => row.data || row.date || '').filter(d => d);

  // Calcular KPIs básicos
  const totalVendas = values.reduce((sum, val) => sum + val, 0);
  const ticketMedio = values.length > 0 ? totalVendas / values.length : 0;

  // Produto mais vendido
  const produtoCounts = produtos.reduce((acc, produto) => {
    acc[produto] = (acc[produto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const produtoMaisVendido = Object.entries(produtoCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '';

  // Cliente mais frequente
  const clienteCounts = clientes.reduce((acc, cliente) => {
    acc[cliente] = (acc[cliente] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const clienteMaisFrequente = Object.entries(clienteCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '';

  // Vendas por produto
  const vendasPorProduto = Object.entries(produtoCounts).map(([produto, quantidade]) => {
    const valorTotal = csvData
      .filter(row => (row.produto || row.product) === produto)
      .reduce((sum, row) => sum + parseFloat(row.valor || row.preco || row.price || 0), 0);
    
    return {
      produto,
      quantidade: quantidade as number,
      valor: valorTotal
    };
  });

  // Vendas por mês (se datas disponíveis)
  let vendasPorMes: { mes: string; valor: number }[] = [];
  if (datas.length > 0) {
    const vendasPorMesMap = csvData.reduce((acc, row) => {
      const data = row.data || row.date;
      if (data) {
        const mes = data.substring(0, 7); // YYYY-MM
        const valor = parseFloat(row.valor || row.preco || row.price || 0);
        acc[mes] = (acc[mes] || 0) + valor;
      }
      return acc;
    }, {} as Record<string, number>);

    vendasPorMes = Object.entries(vendasPorMesMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, valor]) => ({ mes, valor: valor as number }));
  }

  // Crescimento percentual
  let crescimentoPercentual = 0;
  if (vendasPorMes.length >= 2) {
    const primeiroMes = vendasPorMes[0].valor;
    const ultimoMes = vendasPorMes[vendasPorMes.length - 1].valor;
    crescimentoPercentual = primeiroMes > 0 ? ((ultimoMes - primeiroMes) / primeiroMes) * 100 : 0;
  }

  // Gerar resumo
  const resumo = `Análise de ${csvData.length} vendas: Total de R$ ${totalVendas.toFixed(2)} com ticket médio de R$ ${ticketMedio.toFixed(2)}. 
  Produto mais vendido: ${produtoMaisVendido}. Cliente mais frequente: ${clienteMaisFrequente}. 
  ${vendasPorMes.length > 0 ? `Crescimento no período: ${crescimentoPercentual.toFixed(1)}%.` : ''}`;

  return {
    dadosEstruturados: csvData.slice(0, 10), // Apenas primeiros 10 para exibição
    kpis: {
      totalVendas,
      ticketMedio,
      produtoMaisVendido,
      clienteMaisFrequente,
      vendasPorMes,
      vendasPorProduto,
      crescimentoPercentual
    },
    resumo,
    colunasDisponiveis: columns
  };
}
