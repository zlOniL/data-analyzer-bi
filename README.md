# 🧠 Dashboard de Vendas com IA

Um dashboard inteligente que analisa dados de vendas via CSV e gera insights usando inteligência artificial.

## 🎯 Funcionalidades

- **Upload de CSV**: Interface drag-and-drop para upload de arquivos CSV
- **Validação Inteligente**: Verifica se o CSV possui colunas suficientes para análise
- **Análise com IA**: Usa DeepSeek v3.1 via OpenRouter para processar dados
- **KPIs Automáticos**: Calcula métricas como total de vendas, ticket médio, produtos mais vendidos
- **Visualizações**: Gráficos interativos com Recharts
- **Insights Textuais**: Resumos explicativos gerados pela IA

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos e visualizações
- **PapaParse** - Parsing de arquivos CSV
- **OpenRouter API** - Acesso à LLM DeepSeek v3.1
- **Lucide React** - Ícones

## 📋 Requisitos do CSV

O arquivo CSV deve conter pelo menos estas colunas (com nomes similares):
- **valor/preco/price** - Valor da venda
- **data/date** - Data da venda
- **produto/product** - Nome do produto
- **cliente/customer** - Nome do cliente

### Exemplo de CSV válido:
```csv
cliente,produto,valor,data
João Silva,Notebook Dell,2500.00,2024-01-15
Maria Santos,Smartphone Samsung,1200.00,2024-01-16
```

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd dashboard-vendas
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a API key do OpenRouter:
```bash
# Crie um arquivo .env.local
echo "OPENROUTER_API_KEY=sua_api_key_aqui" > .env.local
```

4. Execute o projeto:
```bash
npm run dev
```

5. Acesse: `http://localhost:3000`

## 🔧 Configuração da API

1. Acesse [OpenRouter](https://openrouter.ai/)
2. Crie uma conta e obtenha sua API key
3. Adicione a key no arquivo `.env.local`:
```
OPENROUTER_API_KEY=sk-or-v1-sua_key_aqui
```

## 📊 KPIs Gerados

A IA calcula automaticamente:

- **Total de Vendas**: Soma de todos os valores
- **Ticket Médio**: Valor médio por venda
- **Produto Mais Vendido**: Produto com maior quantidade
- **Cliente Mais Frequente**: Cliente com mais compras
- **Vendas por Mês**: Evolução temporal
- **Vendas por Produto**: Distribuição por produto
- **Crescimento Percentual**: Variação no período

## 🎨 Interface

- **Upload Drag & Drop**: Interface intuitiva para upload
- **Validação Visual**: Feedback imediato sobre a validade do CSV
- **Dashboard Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Gráficos Interativos**: Visualizações com hover e tooltips
- **Loading States**: Indicadores de carregamento durante processamento

## 🚀 Deploy

O projeto está otimizado para deploy na Vercel:

```bash
npm run build
```

### Variáveis de Ambiente na Vercel:
- `OPENROUTER_API_KEY`: Sua chave da API OpenRouter

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/processar-csv/    # API Route para processar CSV
│   ├── globals.css           # Estilos globais
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Página inicial
├── components/
│   ├── CSVUpload.tsx         # Componente de upload
│   └── Dashboard.tsx         # Componente do dashboard
├── lib/
│   └── validation.ts         # Lógica de validação
└── types/
    └── index.ts              # Definições de tipos
```

## 🔒 Segurança

- API keys são mantidas no servidor (API Routes)
- Validação de tipos em todas as entradas
- Sanitização de dados CSV
- Rate limiting implícito via OpenRouter

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
