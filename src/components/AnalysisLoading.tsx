'use client';

import { useState, useEffect } from 'react';
import { Loader2, Brain, BarChart3, TrendingUp, CheckCircle } from 'lucide-react';

interface AnalysisLoadingProps {
  onComplete: () => void;
  isComplete: boolean;
}

const ANALYSIS_STEPS = [
  { id: 'preparing', label: 'Preparando dados...', progress: 10 },
  { id: 'sending', label: 'Enviando para IA...', progress: 25 },
  { id: 'processing', label: 'IA analisando dados...', progress: 50 },
  { id: 'calculating', label: 'Calculando KPIs...', progress: 75 },
  { id: 'finalizing', label: 'Finalizando análise...', progress: 90 },
  { id: 'complete', label: 'Análise concluída!', progress: 100 }
];

export default function AnalysisLoading({ onComplete, isComplete }: AnalysisLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = prev + 1;
        // Para na penúltima etapa (90%) até a API responder
        if (nextStep >= ANALYSIS_STEPS.length - 2) {
          clearInterval(interval);
          return ANALYSIS_STEPS.length - 2;
        }
        return nextStep;
      });
    }, 2000); // Muda de etapa a cada 2 segundos

    return () => clearInterval(interval);
  }, []);

  // Quando a análise estiver completa, finalizar
  useEffect(() => {
    if (isComplete) {
      setCurrentStep(ANALYSIS_STEPS.length - 1);
      setProgress(100);
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [isComplete, onComplete]);

  useEffect(() => {
    const targetProgress = ANALYSIS_STEPS[currentStep]?.progress || 0;
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= targetProgress) {
          clearInterval(progressInterval);
          return targetProgress;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [currentStep]);

  const currentStepData = ANALYSIS_STEPS[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          {/* Ícone animado */}
          <div className="mb-6">
            {currentStep < ANALYSIS_STEPS.length - 1 ? (
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                <Brain className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            ) : (
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            )}
          </div>

          {/* Título */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Analisando seus dados
          </h3>
          <p className="text-gray-600 mb-6">
            Nossa IA está processando seus dados de vendas...
          </p>

          {/* Barra de progresso */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{currentStepData?.label}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Etapas */}
          <div className="space-y-2">
            {ANALYSIS_STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center space-x-3 text-sm ${
                  index <= currentStep 
                    ? 'text-blue-600' 
                    : 'text-gray-400'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  index < currentStep 
                    ? 'bg-green-500 text-white' 
                    : index === currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : index === currentStep ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                <span>{step.label}</span>
              </div>
            ))}
          </div>

          {/* Dicas */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Gerando insights personalizados</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Calculando KPIs, tendências e padrões nos seus dados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
