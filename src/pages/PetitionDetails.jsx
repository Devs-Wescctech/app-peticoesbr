import { base44 } from "@/api";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Users, 
  Target, 
  Calendar,
  TrendingUp,
  Share2,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Hash,
  MessageSquare,
  Download,
  Sparkles,
  FileText,
  Trash2,
  Edit,
  Copy
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "../components/ConfirmDialog";

export default function PetitionDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const petitionId = urlParams.get('id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: petition, isLoading } = useQuery({
    queryKey: ['petition', petitionId],
    queryFn: async () => {
      const petitions = await base44.entities.Petition.list();
      return petitions.find(p => p.id === petitionId);
    },
    enabled: !!petitionId,
  });

  const { data: signatures = [] } = useQuery({
    queryKey: ['signatures', petitionId],
    queryFn: async () => {
      const allSignatures = await base44.entities.Signature.list('-created_date');
      return allSignatures.filter(s => s.petition_id === petitionId);
    },
    enabled: !!petitionId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Petition.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
      navigate(createPageUrl("PetitionsList"));
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(petitionId);
  };

  if (isLoading || !petition) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const signatureCount = signatures.length;
  const progress = Math.min((signatureCount / petition.goal) * 100, 100);
  
  // Gera a URL pública correta - CORRIGIDO
  const publicUrl = petition.slug 
    ? `${window.location.origin}${createPageUrl(`p?s=${petition.slug}`)}`
    : `${window.location.origin}${createPageUrl(`PetitionLanding?id=${petition.id}`)}`;

  // Analytics
  const signaturesByDay = signatures.reduce((acc, sig) => {
    const date = new Date(sig.created_date).toLocaleDateString('pt-BR');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const last7Days = Object.entries(signaturesByDay)
    .slice(-7)
    .map(([date, count]) => ({ date, count }));

  const citiesCount = signatures.reduce((acc, sig) => {
    if (sig.city) {
      acc[sig.city] = (acc[sig.city] || 0) + 1;
    }
    return acc;
  }, {});

  const topCities = Object.entries(citiesCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const downloadCSV = () => {
    const csvData = signatures.map(sig => ({
      'Nome': sig.name,
      'Email': sig.email,
      'Telefone': sig.phone || '',
      'Cidade': sig.city || '',
      'Estado': sig.state || '',
      'CPF': sig.cpf || '',
      'Comentário': sig.comment || '',
      'Data': new Date(sig.created_date).toLocaleDateString('pt-BR')
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${petition.title.replace(/[^a-z0-9]/gi, '_')}_assinaturas.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    alert('Link copiado para a área de transferência!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: petition.title,
          text: petition.description,
          url: publicUrl,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(publicUrl);
      alert('Link copiado para a área de transferência!');
    }
  };

  const statusColors = {
    'active': 'bg-green-500 text-white',
    'draft': 'bg-gray-300 text-gray-700',
    'pending': 'bg-yellow-500 text-gray-700',
    'rejected': 'bg-red-500 text-white',
    'completed': 'bg-blue-500 text-white',
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
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <Badge className={`${statusColors[petition.status]} border-0`}>
                  {petition.status}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                {petition.title}
              </h1>
              <p className="text-lg text-white/90">
                Acompanhe o desempenho e gerencie sua petição
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(createPageUrl(`CreatePetition?edit=${petitionId}`))}
                className="bg-white/90 text-indigo-600 hover:bg-white shadow-2xl font-semibold"
              >
                <Edit className="w-5 h-5 mr-2" />
                Editar
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={deleteMutation.isPending}
                className="bg-red-500 text-white hover:bg-red-600 shadow-2xl font-semibold"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Excluir
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(createPageUrl("PetitionsList"))}
                className="bg-white text-indigo-600 hover:bg-white/90 shadow-2xl font-semibold"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Dashboard da Petição
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-3xl font-bold text-gray-900">{signatureCount}</p>
                    <p className="text-sm text-gray-600">Assinaturas</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-3xl font-bold text-gray-900">{petition.goal}</p>
                    <p className="text-sm text-gray-600">Meta</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-pink-600" />
                    <p className="text-3xl font-bold text-gray-900">{progress.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">Progresso</p>
                  </div>
                </div>

                <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>

                {/* Últimos 7 dias */}
                {last7Days.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Assinaturas nos Últimos 7 Dias</h4>
                    <div className="flex items-end justify-between gap-2 h-32">
                      {last7Days.map((day, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div 
                            className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t"
                            style={{ height: `${(day.count / Math.max(...last7Days.map(d => d.count))) * 100}%` }}
                          />
                          <span className="text-xs text-gray-600">{day.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Cities */}
            {topCities.length > 0 && (
              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Cidades com Mais Assinaturas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {topCities.map(([city, count], index) => (
                      <div key={city} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-gray-900">{city}</span>
                            <span className="text-sm text-gray-600">{count} assinaturas</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                              style={{ width: `${(count / signatureCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle>Sobre Esta Petição</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {petition.description}
                </p>
              </CardContent>
            </Card>

            {/* Recent Signatures */}
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Assinaturas Recentes ({signatureCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {signatures.slice(0, 20).map((signature) => (
                    <div
                      key={signature.id}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                        {signature.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{signature.name}</p>
                        
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                          {signature.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {signature.email}
                            </span>
                          )}
                          {signature.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {signature.city}
                            </span>
                          )}
                          {signature.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {signature.phone}
                            </span>
                          )}
                          {signature.state && (
                            <span className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {signature.state}
                            </span>
                          )}
                        </div>

                        {signature.comment && (
                          <p className="text-sm text-gray-700 mt-2 italic flex items-start gap-1">
                            <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                            "{signature.comment}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(signature.created_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {signatureCount === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Ainda não há assinaturas
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{signatureCount}</p>
                    <p className="text-sm text-white/80">Apoiadores</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{petition.goal}</p>
                    <p className="text-sm text-white/80">Meta</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {new Date(petition.created_date).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-white/80">Data de criação</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-md"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar Petição
                </Button>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full font-medium border-2 hover:bg-gray-50">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Landing Page
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="w-full font-medium border-2 hover:bg-gray-50"
                  onClick={downloadCSV}
                  disabled={signatureCount === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar CSV ({signatureCount})
                </Button>
              </CardContent>
            </Card>

            {/* Landing Page URL */}
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-sm">Link para Compartilhar</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between">
                  <p className="text-xs text-gray-600 break-all mr-2">
                    {publicUrl}
                  </p>
                  <Button variant="ghost" size="sm" onClick={copyLink} className="shrink-0">
                    <Copy className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Petição"
        description={`Tem certeza que deseja excluir a petição "${petition.title}"? Esta ação não pode ser desfeita e todas as assinaturas serão perdidas.`}
        confirmText="Excluir Permanentemente"
        variant="destructive"
      />
    </div>
  );
}
