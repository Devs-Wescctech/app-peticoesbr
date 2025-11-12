import { base44 } from "@/api";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Link2,
  Plus,
  ExternalLink,
  Trash2,
  Loader2,
  Copy,
  CheckCircle,
  Eye,
  Users,
  Target,
  ChevronLeft,
  ChevronRight,
  Save,
  Rocket,
  Sparkles,
  CheckCircle2,
  FileEdit,
  Upload // Added Upload icon
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LinkTreePages() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPetitions, setSelectedPetitions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("todas");
  const itemsPerPage = 6;
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    avatar_url: "", // Added avatar_url field
    background_color: "#6366f1",
    status: "rascunho",
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false); // Added uploadingAvatar state

  const { data: pages = [] } = useQuery({
    queryKey: ['linktree-pages'],
    queryFn: () => base44.entities.LinkTreePage.list('-created_date'),
    initialData: [],
  });

  const { data: petitions = [] } = useQuery({
    queryKey: ['petitions'],
    queryFn: () => base44.entities.Petition.list(),
    initialData: [],
  });

  const { data: signatures = [] } = useQuery({
    queryKey: ['signatures'],
    queryFn: () => base44.entities.Signature.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.LinkTreePage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree-pages'] });
      setIsDialogOpen(false);
      // Reset formData including avatar_url
      setFormData({ title: "", slug: "", description: "", avatar_url: "", background_color: "#6366f1", status: "rascunho" });
      setSelectedPetitions([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LinkTreePage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linktree-pages'] });
    },
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setUploadingAvatar(false);
  };

  const handleSubmit = (status) => {
    const slug = formData.slug || formData.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    createMutation.mutate({
      ...formData,
      slug,
      status,
      petition_ids: selectedPetitions,
    });
  };

  const togglePetition = (petitionId) => {
    setSelectedPetitions(prev =>
      prev.includes(petitionId)
        ? prev.filter(id => id !== petitionId)
        : [...prev, petitionId]
    );
  };

  const copyLink = (slug) => {
    const url = `${window.location.origin}${createPageUrl(`LinkTreeView?slug=${slug}`)}`;
    navigator.clipboard.writeText(url);
  };

  const getSignaturesForPetition = (petitionId) => {
    return signatures.filter(s => s.petition_id === petitionId).length;
  };

  // Filtros
  const filteredPages = pages.filter(page => {
    const matchesStatus = statusFilter === "todas" || page.status === statusFilter;
    return matchesStatus;
  });

  const statusCounts = {
    todas: pages.length,
    publicada: pages.filter(p => p.status === 'publicada').length,
    rascunho: pages.filter(p => p.status === 'rascunho').length,
  };

  // Paginação
  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPages = filteredPages.slice(startIndex, endIndex);

  // Preview data
  const previewPetitions = petitions.filter(p => selectedPetitions.includes(p.id));

  const statusConfig = {
    todas: {
      label: "Todas",
      icon: Sparkles,
      color: "indigo",
      activeClass: "bg-indigo-500 text-white",
      inactiveClass: "text-gray-600 hover:text-indigo-600"
    },
    publicada: {
      label: "Publicadas",
      icon: CheckCircle2,
      color: "green",
      activeClass: "bg-green-500 text-white",
      inactiveClass: "text-gray-600 hover:text-green-600"
    },
    rascunho: {
      label: "Rascunhos",
      icon: FileEdit,
      color: "amber",
      activeClass: "bg-amber-500 text-white",
      inactiveClass: "text-gray-600 hover:text-amber-600"
    },
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
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/30">
                  {filteredPages.length} {filteredPages.length === 1 ? 'Página' : 'Páginas'}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                Páginas Linktree
              </h1>
              <p className="text-lg text-white/90">
                Agrupe suas petições em páginas personalizadas
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Página
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden border-0 p-0 gap-0">
                {/* Header Moderno com Gradiente */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8">
                  <div className="absolute inset-0 bg-grid-white/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                        <Link2 className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/30">
                        Nova Página
                      </Badge>
                    </div>
                    <DialogTitle className="text-3xl font-black text-white mb-2">
                      Criar Página Linktree
                    </DialogTitle>
                    <DialogDescription className="text-white/90 text-base">
                      Agrupe suas petições em uma página personalizada e compartilhe com seu público
                    </DialogDescription>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 p-8 overflow-y-auto max-h-[calc(90vh-200px)] bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20">
                  {/* Formulário */}
                  <div>
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="title">Título da Página *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Ex: Minhas Causas Ambientais"
                          required
                          className="mt-1"
                        />
                      </div>

                      {/* Avatar Upload */}
                      <div>
                        <Label>Avatar/Logo da Página</Label>
                        <div className="mt-2 border-2 border-dashed border-indigo-300 rounded-xl p-4 hover:border-indigo-400 transition-colors bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                          {formData.avatar_url ? (
                            <div className="text-center">
                              <div className="w-24 h-24 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-white mb-3">
                                <img
                                  src={formData.avatar_url}
                                  alt="Avatar"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setFormData({ ...formData, avatar_url: '' })}
                                className="font-medium"
                              >
                                Alterar Avatar
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                <Link2 className="w-10 h-10 text-indigo-600" />
                              </div>
                              <p className="text-xs text-gray-600 mb-3 font-medium">
                                Imagem de perfil da página
                              </p>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                                id="avatar-upload"
                                disabled={uploadingAvatar}
                              />
                              <label htmlFor="avatar-upload">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={uploadingAvatar}
                                  className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-semibold"
                                  asChild
                                >
                                  <span>
                                    {uploadingAvatar ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Enviando...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Escolher Avatar
                                      </>
                                    )}
                                  </span>
                                </Button>
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="slug">URL Personalizada</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="causas-ambientais"
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Deixe em branco para gerar automaticamente
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Descreva sua página..."
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="color">Cor de Fundo</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="color"
                            type="color"
                            value={formData.background_color}
                            onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                            className="w-20 h-10"
                          />
                          <Input
                            value={formData.background_color}
                            onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                            placeholder="#6366f1"
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold mb-3 block">
                          Selecione as Petições *
                        </Label>
                        <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                          {petitions.map((petition) => (
                            <div
                              key={petition.id}
                              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <Checkbox
                                id={petition.id}
                                checked={selectedPetitions.includes(petition.id)}
                                onCheckedChange={() => togglePetition(petition.id)}
                              />
                              <Label
                                htmlFor={petition.id}
                                className="flex-1 cursor-pointer"
                              >
                                {petition.title}
                              </Label>
                            </div>
                          ))}
                          {petitions.length === 0 && (
                            <p className="text-center text-gray-500 py-4">
                              Nenhuma petição disponível
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSubmit('rascunho')}
                          disabled={createMutation.isPending || !formData.title || selectedPetitions.length === 0}
                          className="flex-1 font-semibold border-2 hover:bg-gray-50"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Rascunho
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleSubmit('publicada')}
                          disabled={createMutation.isPending || !formData.title || selectedPetitions.length === 0}
                          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          {createMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Publicando...
                            </>
                          ) : (
                            <>
                              <Rocket className="w-4 h-4 mr-2" />
                              Publicar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Preview da Página</h3>
                    </div>

                    <div
                      className="rounded-2xl p-8 min-h-[600px]"
                      style={{
                        background: `linear-gradient(135deg, ${formData.background_color} 0%, ${formData.background_color}dd 50%, ${formData.background_color}aa 100%)`
                      }}
                    >
                      {/* Header Preview with Avatar */}
                      <div className="text-center mb-8">
                        <div className="relative inline-block mb-6">
                          <div className="absolute -inset-3 bg-white/30 rounded-full blur-xl" />
                          <div className="relative w-24 h-24 mx-auto rounded-full shadow-2xl border-4 border-white/50 backdrop-blur-sm overflow-hidden bg-white">
                            {formData.avatar_url ? (
                              <img
                                src={formData.avatar_url}
                                alt="Avatar Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
                                <Link2 className="w-12 h-12" style={{ color: formData.background_color }} />
                              </div>
                            )}
                          </div>
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-2">
                          {formData.title || 'Título da Página'}
                        </h1>
                        {formData.description && (
                          <p className="text-lg text-white/90">
                            {formData.description}
                          </p>
                        )}
                      </div>

                      {/* Petitions Preview */}
                      <div className="space-y-3">
                        {previewPetitions.length === 0 ? (
                          <Card className="bg-white/95 backdrop-blur-sm border-none shadow-xl p-8 text-center">
                            <p className="text-gray-600">
                              Selecione petições para ver o preview
                            </p>
                          </Card>
                        ) : (
                          previewPetitions.map((petition) => {
                            const signatureCount = getSignaturesForPetition(petition.id);
                            const progress = Math.min((signatureCount / petition.goal) * 100, 100);

                            return (
                              <Card key={petition.id} className="bg-white/95 backdrop-blur-sm border-none shadow-xl overflow-hidden">
                                <div className="p-5">
                                  {petition.banner_url && (
                                    <div className="mb-3 -mx-5 -mt-5">
                                      <img
                                        src={petition.banner_url}
                                        alt={petition.title}
                                        className="w-full h-24 object-cover"
                                      />
                                    </div>
                                  )}

                                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                                    {petition.title}
                                  </h3>
                                  <p className="text-gray-600 text-sm line-clamp-1 mb-3">
                                    {petition.description}
                                  </p>

                                  <div className="flex items-center gap-3 text-sm mb-2">
                                    <div className="flex items-center gap-1 text-gray-700">
                                      <Users className="w-4 h-4" />
                                      <span className="font-semibold">
                                        {signatureCount.toLocaleString('pt-BR')}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-600">
                                      <Target className="w-4 h-4" />
                                      <span>
                                        Meta: {petition.goal.toLocaleString('pt-BR')}
                                      </span>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="ml-auto"
                                      style={{
                                        backgroundColor: `${formData.background_color}20`,
                                        color: formData.background_color
                                      }}
                                    >
                                      {progress.toFixed(0)}%
                                    </Badge>
                                  </div>

                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{
                                        width: `${progress}%`,
                                        backgroundColor: formData.background_color
                                      }}
                                    />
                                  </div>
                                </div>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        {/* Filters Card */}
        <Card className="p-6 shadow-xl border-none bg-white/80 backdrop-blur-xl mb-8">
          <div className="relative">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {Object.entries(statusCounts).map(([status, count]) => {
                const config = statusConfig[status];
                const isActive = statusFilter === status;
                const Icon = config.icon;

                return (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 relative ${
                      isActive
                        ? config.activeClass + " shadow-lg"
                        : config.inactiveClass + " hover:bg-white/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{config.label}</span>
                    <Badge
                      variant="secondary"
                      className={`${
                        isActive
                          ? 'bg-white/30 text-white border-white/30'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentPages.map((page) => {
            const pageUrl = `${window.location.origin}${createPageUrl(`LinkTreeView?slug=${page.slug}`)}`;
            const pagePetitions = petitions.filter(p => page.petition_ids?.includes(p.id));

            const statusColors = {
              publicada: "bg-green-100 text-green-800",
              rascunho: "bg-yellow-100 text-yellow-800",
            };

            return (
              <Card key={page.id} className="border-none shadow-lg hover:shadow-xl transition-all bg-white">
                <div
                  className="h-24 rounded-t-lg relative"
                  style={{ background: `linear-gradient(135deg, ${page.background_color} 0%, ${page.background_color}dd 100%)` }}
                >
                  <div className="absolute top-4 right-4">
                    <Badge className={statusColors[page.status]}>
                      {page.status}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="-mt-8">
                  <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mb-3">
                    {page.avatar_url ? ( // Display avatar if available
                      <img src={page.avatar_url} alt="Page Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <Link2 className="w-8 h-8" style={{ color: page.background_color }} />
                    )}
                  </div>
                  <CardTitle className="text-xl">{page.title}</CardTitle>
                  {page.description && (
                    <p className="text-sm text-gray-600 mt-2">{page.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Petições incluídas: ({pagePetitions.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pagePetitions.slice(0, 3).map((petition) => (
                          <Badge key={petition.id} variant="secondary" className="text-xs">
                            {petition.title.slice(0, 25)}...
                          </Badge>
                        ))}
                        {pagePetitions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{pagePetitions.length - 3} mais
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <a href={pageUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="default" className="w-full justify-start gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-md">
                          <ExternalLink className="w-4 h-4" />
                          Ver Página
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 font-medium hover:bg-gray-50 border-2"
                        onClick={() => copyLink(page.slug)}
                      >
                        <Copy className="w-4 h-4" />
                        Copiar Link
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 border-2 font-medium"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta página?')) {
                            deleteMutation.mutate(page.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
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
                  className={`rounded-xl ${currentPage === page ? "bg-gradient-to-r from-indigo-500 to-purple-600" : ""}`}
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

        {filteredPages.length === 0 && pages.length > 0 && (
          <div className="text-center py-16">
            <Link2 className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma página encontrada
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros de status
            </p>
          </div>
        )}

        {pages.length === 0 && (
          <Card className="border-none shadow-lg bg-white">
            <CardContent className="p-16 text-center">
              <Link2 className="w-20 h-20 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma Página Criada
              </h3>
              <p className="text-gray-600 mb-6">
                Crie sua primeira página Linktree para agrupar suas petições
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Página
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
