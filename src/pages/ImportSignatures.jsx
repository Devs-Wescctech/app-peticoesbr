import { base44 } from "@/api";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Users,
  FileSpreadsheet
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ImportSignatures() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPetition, setSelectedPetition] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({ success: 0, failed: 0, errors: [] });
  const [csvData, setCsvData] = useState([]);

  const { data: petitions = [] } = useQuery({
    queryKey: ['petitions'],
    queryFn: () => base44.entities.Petition.list(),
    initialData: [],
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      parseCSV(file);
    } else {
      alert('Por favor, selecione um arquivo CSV válido');
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index]?.trim() || '';
        });
        return obj;
      });

      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!selectedPetition || csvData.length === 0) {
      alert('Selecione uma petição e um arquivo CSV válido');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults({ success: 0, failed: 0, errors: [] });

    let success = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      
      // Mapeia campos do CSV para o formato da entidade
      const signatureData = {
        petition_id: selectedPetition,
        name: row.nome || row.name || '',
        email: row.email || row['e-mail'] || '',
        phone: row.telefone || row.phone || row.celular || '',
        city: row.cidade || row.city || '',
        state: row.estado || row.state || row.uf || '',
        cpf: row.cpf || '',
        comment: row.comentario || row.comment || row.mensagem || ''
      };

      // Validação básica
      if (!signatureData.name || !signatureData.email) {
        failed++;
        errors.push({
          line: i + 2,
          error: 'Nome ou email ausente',
          data: row
        });
        continue;
      }

      try {
        await base44.entities.Signature.create(signatureData);
        success++;
      } catch (error) {
        failed++;
        errors.push({
          line: i + 2,
          error: error.message,
          data: row
        });
      }

      setProgress(((i + 1) / csvData.length) * 100);
      setResults({ success, failed, errors });
    }

    queryClient.invalidateQueries({ queryKey: ['signatures'] });
    setIsProcessing(false);
  };

  const downloadTemplate = () => {
    const template = 'nome,email,telefone,cidade,estado,cpf,comentario\nJoão Silva,joao@email.com,11999999999,São Paulo,SP,12345678900,Apoio esta causa!\nMaria Santos,maria@email.com,11988888888,Rio de Janeiro,RJ,98765432100,';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-assinaturas.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/30">
                  Importação em Massa
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                Importar Assinaturas
              </h1>
              <p className="text-lg text-white/90">
                Adicione assinaturas em massa via arquivo CSV
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(createPageUrl("PetitionsList"))}
              className="bg-white text-indigo-600 hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-8 relative z-10 pb-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-600" />
                  Configuração da Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Download Template */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">Template CSV</h3>
                      <p className="text-sm text-blue-700 mb-3">
                        Baixe o template para garantir que seu CSV está no formato correto
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={downloadTemplate}
                        className="border-blue-300 text-blue-600 hover:bg-blue-100"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Template
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Petition Selection */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    Selecione a Petição *
                  </Label>
                  <Select value={selectedPetition} onValueChange={setSelectedPetition}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Escolha uma petição" />
                    </SelectTrigger>
                    <SelectContent>
                      {petitions.map((petition) => (
                        <SelectItem key={petition.id} value={petition.id}>
                          {petition.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File Upload */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    Arquivo CSV *
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-indigo-600" />
                      </div>
                      <p className="text-gray-900 font-semibold mb-1">
                        Clique para selecionar o arquivo CSV
                      </p>
                      <p className="text-sm text-gray-600">
                        ou arraste e solte aqui
                      </p>
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-900">{selectedFile.name}</p>
                        <p className="text-sm text-green-700">
                          {csvData.length} linhas detectadas
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CSV Format Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    📋 Formato Esperado do CSV:
                  </p>
                  <div className="text-xs text-gray-700 space-y-1 font-mono">
                    <p>• <strong>nome</strong> (obrigatório): Nome completo</p>
                    <p>• <strong>email</strong> (obrigatório): Email válido</p>
                    <p>• <strong>telefone</strong> (opcional): Telefone com DDD</p>
                    <p>• <strong>cidade</strong> (opcional): Nome da cidade</p>
                    <p>• <strong>estado</strong> (opcional): UF (ex: SP, RJ)</p>
                    <p>• <strong>cpf</strong> (opcional): CPF sem pontuação</p>
                    <p>• <strong>comentario</strong> (opcional): Mensagem do apoiador</p>
                  </div>
                </div>

                {/* Import Button */}
                <Button
                  onClick={handleImport}
                  disabled={isProcessing || !selectedPetition || csvData.length === 0}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 h-12 text-lg font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Importando... ({results.success + results.failed}/{csvData.length})
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Importar Assinaturas
                    </>
                  )}
                </Button>

                {/* Progress */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progresso</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Errors Display */}
            {results.errors.length > 0 && (
              <Card className="border-none shadow-xl mt-6 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Erros Encontrados ({results.errors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto space-y-2">
                  {results.errors.map((err, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 text-sm border border-red-200">
                      <p className="font-semibold text-red-900">Linha {err.line}</p>
                      <p className="text-red-700 mb-1">{err.error}</p>
                      <p className="text-xs text-gray-600 font-mono">
                        {JSON.stringify(err.data, null, 2)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{csvData.length}</p>
                    <p className="text-sm text-white/80">Linhas no CSV</p>
                  </div>
                </div>

                {selectedPetition && (
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-white/80 mb-1">Petição selecionada:</p>
                    <p className="text-sm font-semibold">
                      {petitions.find(p => p.id === selectedPetition)?.title}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {(results.success > 0 || results.failed > 0) && (
              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base">Resultado da Importação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">Sucesso</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{results.success}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium">Falhas</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{results.failed}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  Dicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Use o template fornecido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Certifique-se que todos os emails são válidos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Telefones devem incluir DDD</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Remova duplicatas antes de importar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <span>A importação não pode ser desfeita</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}