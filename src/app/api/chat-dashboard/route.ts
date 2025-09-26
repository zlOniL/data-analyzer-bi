import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { dashboardData, dashboardType, userMessage, chatHistory } = await request.json();

    if (!dashboardData || !dashboardType) {
      return NextResponse.json(
        { error: 'Dados do dashboard são obrigatórios' },
        { status: 400 }
      );
    }

    // Construir contexto do dashboard
    const dashboardContext = buildDashboardContext(dashboardData, dashboardType);
    
    // Construir histórico de conversa
    const messages = buildChatMessages(dashboardContext, userMessage, chatHistory);

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
        messages: messages,
        temperature: 0.3,
        max_tokens: 400
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API OpenRouter: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();

    return NextResponse.json({
      message: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro no chat:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function buildDashboardContext(dashboardData: any, dashboardType: string): string {
  switch (dashboardType) {
    case 'vendas-por-mes':
      return `Dashboard: Vendas por Mês
Dados: ${JSON.stringify(dashboardData)}
Análise: Este gráfico mostra a evolução das vendas ao longo do tempo.`;
    
    case 'vendas-por-produto':
      return `Dashboard: Vendas por Produto
Dados: ${JSON.stringify(dashboardData)}
Análise: Este gráfico mostra a performance de cada produto em termos de quantidade e valor.`;
    
    case 'kpis-gerais':
      return `Dashboard: KPIs Gerais
Dados: ${JSON.stringify(dashboardData)}
Análise: Este dashboard apresenta os principais indicadores de performance das vendas.`;
    
    case 'crescimento':
      return `Dashboard: Crescimento
Dados: ${JSON.stringify(dashboardData)}
Análise: Este indicador mostra a variação percentual no período analisado.`;
    
    default:
      return `Dashboard: ${dashboardType}
Dados: ${JSON.stringify(dashboardData)}`;
  }
}

function buildChatMessages(context: string, userMessage: string, chatHistory: any[] = []): any[] {
  const systemMessage = {
    role: 'system',
    content: `Você é um analista de vendas especializado. Analise os dados do dashboard fornecido e responda às perguntas do usuário de forma clara, profissional e objetiva.

Contexto do Dashboard:
${context}

Instruções:
1. Seja específico sobre os dados apresentados
2. Foque nos pontos-chave e insights mais relevantes
3. Responda de forma concisa, em no máximo 3 a 5 frases
4. Use linguagem profissional mas acessível
5. Se não souber algo, admita e sugira como investigar
6. Responda em português`
  };

  const messages = [systemMessage];

  // Adicionar histórico de conversa
  if (chatHistory && chatHistory.length > 0) {
    messages.push(...chatHistory);
  }

  // Adicionar mensagem atual do usuário
  if (userMessage) {
    messages.push({
      role: 'user',
      content: userMessage
    });
  } else {
    // Primeira mensagem - gerar insights iniciais
    messages.push({
      role: 'user',
      content: 'Analise este dashboard e forneça insights sobre o desempenho apresentado.'
    });
  }

  return messages;
}
