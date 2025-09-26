'use client';

import { useState } from 'react';
import { Loader2, FileText, BarChart3 } from 'lucide-react';
import CSVUpload from '@/components/CSVUpload';
import Dashboard from '@/components/Dashboard';
import AnalysisLoading from '@/components/AnalysisLoading';
import { CSVData, ValidationResult, LLMResponse } from '@/types';

export default function Home() {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [llmResponse, setLlmResponse] = useState<LLMResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDataProcessed = (data: CSVData[], validationResult: ValidationResult) => {
    setCsvData(data);
    setValidation(validationResult);
    setError(null);
    setLlmResponse(null);
  };

  const handleStartAnalysis = async (data: CSVData[], columns: string[]) => {
    setIsAnalyzing(true);
    setIsAnalysisComplete(false);
    setError(null);

    try {
      const response = await fetch('/api/processar-csv-hibrido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData: data,
          columns: columns
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar dados com IA');
      }

      const result: LLMResponse = await response.json();
      setLlmResponse(result);
      setIsAnalysisComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setIsAnalyzing(false);
    }
  };

  const handleProcessing = (processing: boolean) => {
    setIsProcessing(processing);
  };

  const resetDashboard = () => {
    setCsvData([]);
    setValidation(null);
    setLlmResponse(null);
    setError(null);
    setIsProcessing(false);
    setIsAnalyzing(false);
    setIsAnalysisComplete(false);
  };

  const handleAnalysisComplete = () => {
    setIsAnalyzing(false);
    setIsAnalysisComplete(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧠 Dashboard de Vendas com IA
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Faça upload do seu arquivo CSV de vendas e receba insights inteligentes 
            gerados por inteligência artificial
          </p>
        </div>

        {/* Upload Section */}
        {!llmResponse && !isAnalyzing && (
          <div className="mb-8">
            <CSVUpload 
              onDataProcessed={handleDataProcessed}
              onStartAnalysis={handleStartAnalysis}
              onProcessing={handleProcessing}
            />
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Processando arquivo CSV...
                </h3>
                <p className="text-gray-600">
                  Validando dados e preparando para análise
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Loading */}
        {isAnalyzing && (
          <AnalysisLoading 
            onComplete={handleAnalysisComplete} 
            isComplete={isAnalysisComplete}
          />
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Erro no Processamento
                </h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={resetDashboard}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard */}
        {llmResponse && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                Dashboard de Insights
              </h2>
              <button
                onClick={resetDashboard}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Novo Upload
              </button>
            </div>
            
            <Dashboard data={llmResponse} />
          </div>
        )}

        {/* Info Section */}
        {!llmResponse && !isProcessing && !isAnalyzing && !error && (
          <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Como funciona?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">1. Upload do CSV</h4>
                <p className="text-sm text-gray-600">
                  Faça upload do seu arquivo CSV com dados de vendas
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">2. Análise com IA</h4>
                <p className="text-sm text-gray-600">
                  Nossa IA analisa os dados e calcula KPIs automaticamente
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">3. Insights Visuais</h4>
                <p className="text-sm text-gray-600">
                  Visualize gráficos e insights personalizados dos seus dados
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
