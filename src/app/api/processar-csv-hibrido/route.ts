import { NextRequest, NextResponse } from 'next/server';
import { LLMResponse } from '@/types';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { csvData, columns } = await request.json();

    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return NextResponse.json(
        { error: 'Dados CSV inválidos ou vazios' },
        { status: 400 }
      );
    }

    console.log('1. Processamento local (ETL) - muito rápido');
    const processedData = processDataLocally(csvData, columns);
    
    console.log('2. Enviar KPIs para LLM gerar insights');
    const insights = await generateInsightsWithLLM(processedData.kpis, csvData.length);
    
    console.log('3. Combinar dados processados + insights da LLM');
    const result: LLMResponse = {
      dadosEstruturados: processedData.dadosEstruturados,
      kpis: processedData.kpis,
      resumo: insights,
      colunasDisponiveis: columns
    };
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro no processamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para processar dados localmente (ETL)
function processDataLocally(csvData: any[], columns: string[]) {
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
    }
  };
}

// Função para gerar insights com LLM
async function generateInsightsWithLLM(kpis: any, totalRegistros: number): Promise<string> {
  const prompt = `Você é um analista de vendas experiente. Analise os seguintes KPIs e forneça insights estratégicos em português:

DADOS ANALISADOS:
- Total de registros: ${totalRegistros}
- Total de vendas: R$ ${kpis.totalVendas.toFixed(2)}
- Ticket médio: R$ ${kpis.ticketMedio.toFixed(2)}
- Produto mais vendido: ${kpis.produtoMaisVendido}
- Cliente mais frequente: ${kpis.clienteMaisFrequente}
- Crescimento no período: ${kpis.crescimentoPercentual.toFixed(1)}%
- Número de produtos únicos: ${kpis.vendasPorProduto.length}
- Período analisado: ${kpis.vendasPorMes.length} meses

INSTRUÇÕES:
1. Forneça insights estratégicos sobre o desempenho das vendas
2. Identifique oportunidades de melhoria
3. Sugira ações práticas baseadas nos dados
4. Seja conciso mas informativo (máximo 200 palavras)
5. Use linguagem profissional mas acessível

Retorne apenas o texto dos insights, sem formatação adicional.`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Dashboard Vendas IA'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3.1:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API OpenRouter: ${response.status}`);
    }

    const data = await response.json();
    console.log('Resposta da LLM:', data);
    console.log('Insights gerados:', data.choices[0].message.content.trim());
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Erro ao gerar insights:', error);
    // Fallback para insights básicos
    return `Análise baseada em ${totalRegistros} vendas: Total de R$ ${kpis.totalVendas.toFixed(2)} com ticket médio de R$ ${kpis.ticketMedio.toFixed(2)}. 
    Produto mais vendido: ${kpis.produtoMaisVendido}. Cliente mais frequente: ${kpis.clienteMaisFrequente}. 
    ${kpis.vendasPorMes.length > 0 ? `Crescimento no período: ${kpis.crescimentoPercentual.toFixed(1)}%.` : ''}`;
  }
}
