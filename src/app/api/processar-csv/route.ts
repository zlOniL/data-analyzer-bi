import { NextRequest, NextResponse } from 'next/server';
import { LLMResponse } from '@/types';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Função para processar dados localmente (muito mais rápido)
function processDataLocally(csvData: any[], columns: string[]) {
  const sample = csvData.slice(0, 5); // Apenas 5 registros para a LLM
  
  // Calcular estatísticas básicas localmente
  const values = csvData.map(row => parseFloat(row.valor || row.preco || row.price || 0)).filter(v => !isNaN(v));
  const totalVendas = values.reduce((sum, val) => sum + val, 0);
  const ticketMedio = values.length > 0 ? totalVendas / values.length : 0;
  
  // Contar produtos e clientes
  const produtos = csvData.map(row => row.produto || row.product || '').filter(p => p);
  const clientes = csvData.map(row => row.cliente || row.customer || '').filter(c => c);
  
  const produtoCounts = produtos.reduce((acc, produto) => {
    acc[produto] = (acc[produto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const clienteCounts = clientes.reduce((acc, cliente) => {
    acc[cliente] = (acc[cliente] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const produtoMaisVendido = Object.entries(produtoCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '';
  const clienteMaisFrequente = Object.entries(clienteCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '';
  
  return {
    sample,
    summary: {
      totalRegistros: csvData.length,
      totalVendas,
      ticketMedio,
      produtoMaisVendido,
      clienteMaisFrequente,
      produtosUnicos: Object.keys(produtoCounts).length,
      clientesUnicos: Object.keys(clienteCounts).length
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const { csvData, columns } = await request.json();

    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return NextResponse.json(
        { error: 'Dados CSV inválidos ou vazios' },
        { status: 400 }
      );
    }

    // Processar dados localmente primeiro (muito mais rápido)
    const processedData = processDataLocally(csvData, columns);
    
    // Prompt otimizado e conciso
    const prompt = `Analise estes dados de vendas e retorne JSON com KPIs:

DADOS: ${JSON.stringify(processedData.summary)}
COLUNAS: ${columns.join(', ')}

Calcule: totalVendas, ticketMedio, produtoMaisVendido, clienteMaisFrequente, vendasPorMes, vendasPorProduto, crescimentoPercentual.

Retorne APENAS JSON válido:
{
  "dadosEstruturados": ${JSON.stringify(processedData.sample)},
  "kpis": {...},
  "resumo": "texto em português",
  "colunasDisponiveis": ${JSON.stringify(columns)}
}`;
    
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
        temperature: 0.1,
        max_tokens: 2000 // Reduzido para resposta mais rápida
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API OpenRouter: ${response.status}`);
    }

    const data = await response.json();
    const llmResponse = data.choices[0].message.content;
    
    // Tenta fazer parse do JSON retornado pela LLM
    let parsedResponse: LLMResponse;
    try {
      // Remove possíveis markdown code blocks
      const cleanResponse = llmResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta da LLM:', parseError);
      // Fallback: usar dados processados localmente
      parsedResponse = {
        dadosEstruturados: processedData.sample,
        kpis: {
          totalVendas: processedData.summary.totalVendas,
          ticketMedio: processedData.summary.ticketMedio,
          produtoMaisVendido: processedData.summary.produtoMaisVendido,
          clienteMaisFrequente: processedData.summary.clienteMaisFrequente,
          vendasPorMes: [],
          vendasPorProduto: [],
          crescimentoPercentual: 0
        },
        resumo: `Análise baseada em ${processedData.summary.totalRegistros} registros. Total de vendas: R$ ${processedData.summary.totalVendas.toFixed(2)}, Ticket médio: R$ ${processedData.summary.ticketMedio.toFixed(2)}.`,
        colunasDisponiveis: columns
      };
    }

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Erro no processamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
