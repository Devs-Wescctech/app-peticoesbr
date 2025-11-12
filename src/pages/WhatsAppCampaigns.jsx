import { base44 } from "@/api";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MessageCircle,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Search,
  Sparkles,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import CampaignLogsModal from "../components/CampaignLogsModal";

export default function WhatsAppCampaigns() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedCampaignName, setSelectedCampaignName] = useState("");
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns', 'whatsapp'],
    queryFn: async () => {
      const allCampaigns = await base44.entities.Campaign.list('-created_date');
      return allCampaigns.filter(c => c.type === 'whatsapp');
    },
    initialData: [],
  });

  const { data: petitions = [] } = useQuery({
    queryKey: ['petitions'],
    queryFn: () => base44.entities.Petition.list(),
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Campaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  const handleViewLogs = (campaign) => {
    setSelectedCampaignId(campaign.id);
    setSelectedCampaignName(campaign.name);
    setIsLogsModalOpen(true);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginação
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  const statusColors = {
    rascunho: "bg-gray-100 text-gray-800",
    agendada: "bg-blue-100 text-blue-800",
    enviando: "bg-yellow-100 text-yellow-800",
    concluida: "bg-green-100 text-green-800",
    pausada: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    todas: "Todas",
    rascunho: "Rascunho",
    agendada: "Agendada",
    enviando: "Enviando",
    concluida: "Concluída",
    pausada: "Pausada",
  };

  const statusCounts = {
    todas: campaigns.length,
    rascunho: campaigns.filter(c => c.status === 'rascunho').length,
    agendada: campaigns.filter(c => c.status === 'agendada').length,
    enviando: campaigns.filter(c => c.status === 'enviando').length,
    concluida: campaigns.filter(c => c.status === 'concluida').length,
    pausada: campaigns.filter(c => c.status === 'pausada').length,
  };

  const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0);
  const totalSuccess = campaigns.reduce((sum, c) => sum + (c.success_count || 0), 0);
  const totalFailed = campaigns.reduce((sum, c) => sum + (c.failed_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/30">
                  {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'Campanha' : 'Campanhas'}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                Campanhas WhatsApp
              </h1>
              <p className="text-lg text-white/90">
                Gerencie suas campanhas de envio em massa
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate(createPageUrl("CreateWhatsAppCampaign"))}
              className="bg-white text-green-600 hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Campanha
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 opacity-80" />
                <div>
                  <p className="text-2xl font-bold">{totalSent}</p>
                  <p className="text-xs text-white/80">Total Enviado</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalSuccess}</p>
                  <p className="text-xs text-gray-600">Bem-sucedidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalFailed}</p>
                  <p className="text-xs text-gray-600">Falharam</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                  <p className="text-xs text-gray-600">Campanhas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 shadow-xl border-none bg-white/80 backdrop-blur-xl mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            
            {/* Modern Tab Filters com cores verdes */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {Object.entries(statusCounts).map(([status, count]) => {
                const isActive = statusFilter === status;
                return (
                  <Button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    variant="ghost"
                    size="sm"
                    className={`rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-green-600 text-white shadow-lg"
                        : "text-gray-600 hover:bg-white/50"
                    }`}
                  >
                    {statusLabels[status]}
                    <Badge 
                      variant="secondary" 
                      className={`ml-2 ${
                        isActive 
                          ? 'bg-white/30 text-white border-white/30' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentCampaigns.map((campaign) => {
            const petition = petitions.find(p => p.id === campaign.petition_id);
            const successRate = campaign.sent_count > 0 
              ? ((campaign.success_count / campaign.sent_count) * 100).toFixed(1)
              : 0;

            return (
              <Card key={campaign.id} className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{campaign.name}</CardTitle>
                      <Badge className={statusColors[campaign.status]}>
                        {statusLabels[campaign.status]}
                      </Badge>
                    </div>
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Petição:</p>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {petition?.title || 'N/A'}
                    </p>
                  </div>

                  {campaign.scheduled_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(campaign.scheduled_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{campaign.sent_count || 0}</p>
                      <p className="text-xs text-gray-600">Enviados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{campaign.success_count || 0}</p>
                      <p className="text-xs text-gray-600">Sucesso</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">{campaign.failed_count || 0}</p>
                      <p className="text-xs text-gray-600">Erros</p>
                    </div>
                  </div>

                  {campaign.sent_count > 0 && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Taxa de Sucesso</span>
                          {campaign.failed_count > 0 && (
                            <span className="text-red-600 font-semibold">
                              ({campaign.failed_count} {campaign.failed_count === 1 ? 'erro' : 'erros'})
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">{successRate}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2"
                      onClick={() => navigate(createPageUrl(`CreateWhatsAppCampaign?id=${campaign.id}`))}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleViewLogs(campaign)}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Logs
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-2 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        setCampaignToDelete(campaign);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-xl ${currentPage === page ? "bg-gradient-to-r from-green-500 to-emerald-600" : ""}`}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {filteredCampaigns.length === 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-16 text-center">
              <MessageCircle className="w-20 h-20 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Nenhuma campanha encontrada' : 'Nenhuma Campanha Criada'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Tente ajustar os filtros de busca' : 'Crie sua primeira campanha de WhatsApp'}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => navigate(createPageUrl("CreateWhatsAppCampaign"))}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-semibold shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Campanha
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Campaign Logs Modal */}
      <CampaignLogsModal
        campaignId={selectedCampaignId}
        campaignName={selectedCampaignName}
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        type="whatsapp"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 space-y-3">
              <p>
                Tem certeza que deseja excluir a campanha <span className="font-semibold text-gray-900">"{campaignToDelete?.name}"</span>?
              </p>
              <p className="text-sm bg-red-50 border border-red-200 rounded-lg p-3 text-red-800">
                ⚠️ Esta ação não pode ser desfeita. Todos os dados desta campanha serão perdidos permanentemente.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (campaignToDelete) {
                  deleteMutation.mutate(campaignToDelete.id);
                  setCampaignToDelete(null);
                }
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              Excluir Campanha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}