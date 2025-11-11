import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
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
  Users,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ImportContactsModal({ isOpen, onClose, petitions }) {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPetition, setSelectedPetition] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState({ success: 0, failed: 0, errors: [] });
  const [csvData, setCsvData] = useState([]);

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

  const handleClose = () => {
    setSelectedFile(null);
    setSelectedPetition("");
    setCsvData([]);
    setResults({ success: 0, failed: 0, errors: [] });
    setProgress(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Upload className="w-5 h-5 text-indigo-600" />
            Importar Contatos via CSV
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Download Template */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">Template CSV</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Baixe o template para garantir o formato correto
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadTemplate}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100 font-semibold"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Petition Selection */}
            <div>
              <Label className="text-base font-semibold mb-2 block">
                Selecione a Petição *
              </Label>
              <Select value={selectedPetition} onValueChange={setSelectedPetition}>
                <SelectTrigger className="h-12 border-2">
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
              <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-all duration-300 bg-gradient-to-br from-gray-50 to-indigo-50/30">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload-modal"
                />
                <label htmlFor="csv-upload-modal" className="cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Upload className="w-8 h-8 text-white" />
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
                <Card className="mt-4 border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">{selectedFile.name}</p>
                      <p className="text-sm text-green-700">
                        {csvData.length} linhas detectadas
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* CSV Format Info */}
            <Card className="bg-gray-50 border-2 border-gray-200">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Formato Esperado do CSV:
                </p>
                <div className="text-xs text-gray-700 space-y-1.5 font-mono bg-white p-3 rounded-lg">
                  <p>• <strong>nome</strong> (obrigatório): Nome completo</p>
                  <p>• <strong>email</strong> (obrigatório): Email válido</p>
                  <p>• <strong>telefone</strong> (opcional): Telefone com DDD</p>
                  <p>• <strong>cidade</strong> (opcional): Nome da cidade</p>
                  <p>• <strong>estado</strong> (opcional): UF (ex: SP, RJ)</p>
                  <p>• <strong>cpf</strong> (opcional): CPF sem pontuação</p>
                  <p>• <strong>comentario</strong> (opcional): Mensagem</p>
                </div>
              </CardContent>
            </Card>

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={isProcessing || !selectedPetition || csvData.length === 0}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 h-14 text-lg font-bold shadow-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Importando... ({results.success + results.failed}/{csvData.length})
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Importar {csvData.length} Contatos
                </>
              )}
            </Button>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-gray-700">
                  <span>Progresso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            )}

            {/* Errors Display */}
            {results.errors.length > 0 && (
              <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-red-900">
                      Erros Encontrados ({results.errors.length})
                    </h3>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {results.errors.slice(0, 5).map((err, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3 text-sm border border-red-200">
                        <p className="font-semibold text-red-900">Linha {err.line}</p>
                        <p className="text-red-700 text-xs">{err.error}</p>
                      </div>
                    ))}
                    {results.errors.length > 5 && (
                      <p className="text-xs text-center text-red-700">
                        + {results.errors.length - 5} erros adicionais
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-black">{csvData.length}</p>
                    <p className="text-sm text-white/80">Linhas no CSV</p>
                  </div>
                </div>

                {selectedPetition && (
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                    <p className="text-xs text-white/80 mb-1">Petição:</p>
                    <p className="text-sm font-semibold line-clamp-2">
                      {petitions.find(p => p.id === selectedPetition)?.title}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            {(results.success > 0 || results.failed > 0) && (
              <Card className="border-none shadow-lg">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 mb-2">Resultado</h3>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-900">Sucesso</span>
                    </div>
                    <span className="text-xl font-black text-green-600">{results.success}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-semibold text-red-900">Falhas</span>
                    </div>
                    <span className="text-xl font-black text-red-600">{results.failed}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
              <CardContent className="p-4">
                <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Dicas
                </h3>
                <ul className="text-xs text-amber-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 shrink-0" />
                    <span>Use o template fornecido</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 shrink-0" />
                    <span>Valide todos os emails</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 shrink-0" />
                    <span>Telefones com DDD</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-1.5 shrink-0" />
                    <span>Remova duplicatas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3 bg-gray-50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
            className="font-semibold border-2"
          >
            Fechar
          </Button>
          {(results.success > 0 || results.failed > 0) && !isProcessing && (
            <Button
              onClick={handleClose}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-semibold"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Concluir
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}