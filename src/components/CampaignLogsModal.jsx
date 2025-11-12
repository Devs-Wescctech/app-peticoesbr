import { base44 } from "@/api";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Mail, 
  BarChart3,
  Download,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CampaignLogsModal({ campaignId, isOpen, onClose, campaignName, type = 'whatsapp' }) {
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['campaign-logs', campaignId],
    queryFn: async () => {
      const allLogs = await base44.entities.CampaignLog.list('-created_date');
      return allLogs.filter(log => log.campaign_id === campaignId);
    },
    enabled: isOpen && !!campaignId,
  });

  const successLogs = logs.filter(l => l.status === 'success');
  const errorLogs = logs.filter(l => l.status === 'error');
  const successRate = logs.length > 0 ? ((successLogs.length / logs.length) * 100).toFixed(1) : 0;

  // Filtros
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.recipient_contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (logId) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const handleExport = () => {
    const csv = [
      ['Nome', 'Contato', 'Status', 'Código', 'Data', 'Erro'],
      ...logs.map(log => [
        log.recipient_name,
        log.recipient_contact,
        log.status === 'success' ? 'Sucesso' : 'Erro',
        log.response_status,
        new Date(log.created_date).toLocaleString('pt-BR'),
        log.error_message || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${campaignName}-${new Date().toISOString()}.csv`;
    a.click();
  };

  const handleRetryFailed = async () => {
    alert('Funcionalidade de reenvio em desenvolvimento! Em breve você poderá reenviar para os contatos que falharam.');
  };

  // Define colors based on campaign type
  const colors = type === 'whatsapp' 
    ? {
        gradient: 'from-green-600 via-emerald-600 to-teal-600',
        icon: MessageCircle,
        iconBg: 'bg-green-600',
        buttonBg: 'from-green-500 to-emerald-600',
        buttonHover: 'from-green-600 to-emerald-700',
        activeFilter: 'bg-green-600'
      }
    : {
        gradient: 'from-blue-600 via-indigo-600 to-purple-600',
        icon: Mail,
        iconBg: 'bg-blue-600',
        buttonBg: 'from-blue-500 to-indigo-600',
        buttonHover: 'from-blue-600 to-indigo-700',
        activeFilter: 'bg-blue-600'
      };

  const TypeIcon = colors.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header com Gradiente */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${colors.gradient}`}>
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          <div className="relative p-6 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-white">
                  Logs da Campanha
                </DialogTitle>
                <p className="text-white/90 text-sm">{campaignName}</p>
              </div>
              <div className={`p-2 ${colors.iconBg} rounded-lg`}>
                <TypeIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-xs text-white/80 font-medium">Sucessos</span>
                </div>
                <p className="text-2xl font-bold text-white">{successLogs.length}</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-white" />
                  <span className="text-xs text-white/80 font-medium">Erros</span>
                </div>
                <p className="text-2xl font-bold text-white">{errorLogs.length}</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-white" />
                  <span className="text-xs text-white/80 font-medium">Taxa</span>
                </div>
                <p className="text-2xl font-bold text-white">{successRate}%</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="text-xs text-white/80 font-medium">Total</span>
                </div>
                <p className="text-2xl font-bold text-white">{logs.length}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                disabled={logs.length === 0}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar CSV
              </Button>
              
              {errorLogs.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRetryFailed}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reenviar Falhas
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou contato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            
            <div className="flex gap-1 bg-white rounded-lg border p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('all')}
                className={`text-xs ${statusFilter === 'all' ? colors.activeFilter + ' text-white' : ''}`}
              >
                Todos
                <Badge variant="secondary" className="ml-1 text-xs">
                  {logs.length}
                </Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('success')}
                className={`text-xs ${statusFilter === 'success' ? 'bg-green-600 text-white' : ''}`}
              >
                Sucesso
                <Badge variant="secondary" className="ml-1 text-xs">
                  {successLogs.length}
                </Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('error')}
                className={`text-xs ${statusFilter === 'error' ? 'bg-red-600 text-white' : ''}`}
              >
                Erros
                <Badge variant="secondary" className="ml-1 text-xs">
                  {errorLogs.length}
                </Badge>
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <ScrollArea className="h-[calc(90vh-340px)]">
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className={`w-12 h-12 animate-spin mb-4 ${type === 'whatsapp' ? 'text-green-600' : 'text-blue-600'}`} />
                <p className="text-gray-600">Carregando logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {searchTerm ? <Search className="w-8 h-8 text-gray-400" /> : <Clock className="w-8 h-8 text-gray-400" />}
                </div>
                <p className="text-gray-600 font-medium mb-1">
                  {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum log encontrado'}
                </p>
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'Tente ajustar sua busca' : 'Os logs aparecerão aqui após os envios'}
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline Line */}
                <div className={`absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b ${
                  type === 'whatsapp' 
                    ? 'from-green-200 via-emerald-200 to-teal-200' 
                    : 'from-blue-200 via-indigo-200 to-purple-200'
                }`} />

                <div className="space-y-4">
                  {filteredLogs.map((log, index) => {
                    const isExpanded = expandedLogs.has(log.id);
                    const isSuccess = log.status === 'success';

                    return (
                      <div key={log.id} className="relative pl-16">
                        {/* Timeline Dot */}
                        <div className={`absolute left-4 top-4 w-5 h-5 rounded-full border-4 border-white shadow-lg ${
                          isSuccess 
                            ? 'bg-gradient-to-br from-green-400 to-green-600' 
                            : 'bg-gradient-to-br from-red-400 to-red-600'
                        }`} />

                        {/* Log Card */}
                        <Card className={`border-2 transition-all duration-300 ${
                          isSuccess
                            ? 'border-green-200 hover:border-green-300 bg-green-50/50'
                            : 'border-red-200 hover:border-red-300 bg-red-50/50'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <h4 className="font-bold text-gray-900">{log.recipient_name}</h4>
                                  <Badge className={`${
                                    isSuccess
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : 'bg-red-100 text-red-800 border-red-200'
                                  } border`}>
                                    {isSuccess ? (
                                      <><CheckCircle className="w-3 h-3 mr-1" /> Sucesso</>
                                    ) : (
                                      <><XCircle className="w-3 h-3 mr-1" /> Erro</>
                                    )}
                                  </Badge>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {log.response_status}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                                  {type === 'whatsapp' ? (
                                    <MessageCircle className="w-4 h-4" />
                                  ) : (
                                    <Mail className="w-4 h-4" />
                                  )}
                                  {log.recipient_contact}
                                </p>
                                
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(log.created_date).toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>

                              {(log.response_body || log.error_message) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleExpand(log.id)}
                                  className="shrink-0"
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="mt-4 space-y-3 animate-in slide-in-from-top duration-300">
                                {log.error_message && (
                                  <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      Mensagem de Erro:
                                    </p>
                                    <p className="text-sm text-red-700 font-mono">
                                      {log.error_message}
                                    </p>
                                  </div>
                                )}

                                {log.response_body && (
                                  <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                      <BarChart3 className="w-3 h-3" />
                                      Resposta da API:
                                    </p>
                                    <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words font-mono max-h-40 overflow-auto">
                                      {log.response_body}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Mostrando {filteredLogs.length} de {logs.length} logs
          </p>
          <Button
            onClick={onClose}
            className={`bg-gradient-to-r ${colors.buttonBg} hover:${colors.buttonHover}`}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}