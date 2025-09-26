'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { CSVData, ValidationResult } from '@/types';
import { validateCSVColumns } from '@/lib/validation';

interface CSVUploadProps {
  onDataProcessed: (data: CSVData[], validation: ValidationResult) => void;
  onStartAnalysis: (data: CSVData[], columns: string[]) => void;
  onProcessing: (isProcessing: boolean) => void;
}

export default function CSVUpload({ onDataProcessed, onStartAnalysis, onProcessing }: CSVUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [csvData, setCsvData] = useState<CSVData[]>([]);

  const processCSV = useCallback((csvText: string) => {
    onProcessing(true);
    
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVData[];
        const columns = results.meta.fields || [];
        
        const validationResult = validateCSVColumns(columns);
        setValidation(validationResult);
        setCsvData(data);
        
        onDataProcessed(data, validationResult);
        onProcessing(false);
      },
      error: (error: any) => {
        console.error('Erro ao processar CSV:', error);
        onProcessing(false);
      }
    });
  }, [onDataProcessed, onProcessing]);

  const handleFile = useCallback((file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Por favor, selecione um arquivo CSV válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      processCSV(csvText);
    };
    reader.readAsText(file);
  }, [processCSV]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleStartAnalysis = useCallback(() => {
    if (validation?.isValid && csvData.length > 0) {
      onStartAnalysis(csvData, validation.availableColumns);
    }
  }, [validation, csvData, onStartAnalysis]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <Upload className="w-8 h-8 text-gray-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Faça upload do seu arquivo CSV
            </h3>
            <p className="text-gray-600 mt-2">
              Arraste e solte seu arquivo aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Formatos aceitos: .csv
            </p>
          </div>
        </div>
      </div>

      {validation && (
        <div className={`mt-4 p-4 rounded-lg flex items-start space-x-3 ${
          validation.isValid 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {validation.isValid ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`font-medium ${
              validation.isValid ? 'text-green-800' : 'text-red-800'
            }`}>
              {validation.isValid ? 'CSV Válido!' : 'CSV Inválido'}
            </p>
            <p className={`text-sm mt-1 ${
              validation.isValid ? 'text-green-700' : 'text-red-700'
            }`}>
              {validation.message}
            </p>
            {!validation.isValid && (
              <div className="mt-2">
                <p className="text-sm text-red-700 font-medium">
                  Colunas encontradas: {validation.availableColumns.join(', ')}
                </p>
                <p className="text-sm text-red-700">
                  Colunas necessárias: valor, data, produto, cliente
                </p>
              </div>
            )}
          </div>
          {validation.isValid && (
            <button
              onClick={handleStartAnalysis}
              className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Iniciar Análise
            </button>
          )}
        </div>
      )}
    </div>
  );
}
