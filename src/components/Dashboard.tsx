'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Package, Bot } from 'lucide-react';
import { LLMResponse } from '@/types';
import AIDashboardModal from './AIDashboardModal';

interface DashboardProps {
  data: LLMResponse;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard({ data }: DashboardProps) {
  const { kpis, resumo } = data;
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const openAIModal = (dashboardType: string) => {
    setActiveModal(dashboardType);
  };

  const closeAIModal = () => {
    setActiveModal(null);
  };

  const renderAIButton = (dashboardType: string) => (
    <button
      onClick={() => openAIModal(dashboardType)}
      className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
    >
      <Bot className="w-4 h-4" />
      <span>IA</span>
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Resumo Textual */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Insights Gerados pela IA
        </h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">{resumo}</p>
        </div>
      </div>

      {/* Cards de KPIs */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
            Indicadores Principais
          </h2>
          {renderAIButton('kpis-gerais')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.totalVendas > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.totalVendas)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
          )}

          {kpis.ticketMedio > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(kpis.ticketMedio)}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          )}

          {kpis.produtoMaisVendido && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Produto Mais Vendido</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{kpis.produtoMaisVendido}</p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          )}

          {kpis.clienteMaisFrequente && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cliente Mais Frequente</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{kpis.clienteMaisFrequente}</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          )}
          { kpis.crescimentoPercentual !== 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Crescimento</p>
                  <p className={`text-2xl font-bold ${kpis.crescimentoPercentual > 0 ? 'text-green-600' : 'text-red-600'}`}>{kpis.crescimentoPercentual > 0 ? '+' : ''}{kpis.crescimentoPercentual.toFixed(1)}%</p>
                </div>
                <TrendingUp className={`w-8 h-8 ${kpis.crescimentoPercentual > 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <p className="text-gray-600 mt-2 text-sm">
                {kpis.crescimentoPercentual > 0 ? 'Crescimento' : 'Declínio'} no período analisado
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendas por Mês */}
        {kpis.vendasPorMes && kpis.vendasPorMes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Vendas por Mês
              </h3>
              {renderAIButton('vendas-por-mes')}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kpis.vendasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Vendas']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Vendas por Produto */}
        {kpis.vendasPorProduto && kpis.vendasPorProduto.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2 text-purple-600" />
                Vendas por Produto
              </h3>
              {renderAIButton('vendas-por-produto')}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis.vendasPorProduto}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="produto" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
                  labelFormatter={(label) => `Produto: ${label}`}
                />
                <Bar 
                  dataKey="valor" 
                  fill="#8884D8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Modais de IA */}
      {activeModal === 'kpis-gerais' && (
        <AIDashboardModal
          isOpen={true}
          onClose={closeAIModal}
          dashboardType="kpis-gerais"
          dashboardData={kpis}
          dashboardComponent={
            <div className="grid grid-cols-2 gap-4">
              {kpis.totalVendas > 0 && (
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(kpis.totalVendas)}</p>
                    </div>
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              )}
              {kpis.ticketMedio > 0 && (
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(kpis.ticketMedio)}</p>
                    </div>
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              )}
              {kpis.produtoMaisVendido && (
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Produto Mais Vendido</p>
                      <p className="text-lg font-bold text-gray-900 truncate">{kpis.produtoMaisVendido}</p>
                    </div>
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              )}
              {kpis.clienteMaisFrequente && (
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cliente Mais Frequente</p>
                      <p className="text-lg font-bold text-gray-900 truncate">{kpis.clienteMaisFrequente}</p>
                    </div>
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              )}
            </div>
          }
        />
      )}

      {activeModal === 'vendas-por-mes' && (
        <AIDashboardModal
          isOpen={true}
          onClose={closeAIModal}
          dashboardType="vendas-por-mes"
          dashboardData={kpis.vendasPorMes}
          dashboardComponent={
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kpis.vendasPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mes" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Vendas']}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          }
        />
      )}

      {activeModal === 'vendas-por-produto' && (
        <AIDashboardModal
          isOpen={true}
          onClose={closeAIModal}
          dashboardType="vendas-por-produto"
          dashboardData={kpis.vendasPorProduto}
          dashboardComponent={
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis.vendasPorProduto}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="produto" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
                  labelFormatter={(label) => `Produto: ${label}`}
                />
                <Bar 
                  dataKey="valor" 
                  fill="#8884D8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          }
        />
      )}
    </div>
  );
}
