import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Loader2,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Phone,
  Hash,
  MessageSquare,
  Mail,
  Map,
  Eye,
  Save,
  Rocket,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api";

async function uploadToStorage(file, prefix = "banners") {
  const result = await base44.integrations.Core.UploadFile({ file });
  return { url: result.file_url, path: result.file_url };
}

export default function CreatePetition() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const editingId = urlParams.get('edit') || urlParams.get('id');

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    banner_url: "",
    logo_url: "",
    primary_color: "#6366f1",
    share_text: "",
    goal: 1000,
    status: "rascunho",
    slug: "",
    collect_email: false,
    collect_phone: false,
    collect_city: true,
    collect_state: false,
    collect_cpf: false,
    collect_comment: true,
    lgpd_text: "Ao assinar, você concorda em receber atualizações sobre esta petição",
  });

  const { data: existingPetition, isLoading: loadingPetition } = useQuery({
    queryKey: ['petition', editingId],
    queryFn: async () => {
      if (!editingId) return null;
      const petitions = await base44.entities.Petition.list();
      return petitions.find(p => p.id === editingId);
    },
    enabled: !!editingId,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (existingPetition) {
      setFormData({
        title: existingPetition.title || "",
        description: existingPetition.description || "",
        banner_url: existingPetition.banner_url || "",
        logo_url: existingPetition.logo_url || "",
        primary_color: existingPetition.primary_color || "#6366f1",
        share_text: existingPetition.share_text || "",
        goal: existingPetition.goal || 1000,
        status: existingPetition.status || "rascunho",
        slug: existingPetition.slug || "",
        collect_email: !!existingPetition.collect_email,
        collect_phone: !!existingPetition.collect_phone,
        collect_city: !!existingPetition.collect_city,
        collect_state: !!existingPetition.collect_state,
        collect_cpf: !!existingPetition.collect_cpf,
        collect_comment: !!existingPetition.collect_comment,
        lgpd_text: existingPetition.lgpd_text || "Ao assinar, você concorda em receber atualizações sobre esta petição",
      });
    }
  }, [existingPetition]);

  const SHARE_TEXT_TEMPLATES = [
    'Acabei de assinar esta petição e você também deveria! Juntos podemos fazer a diferença. {link}',
    '🔥 Esta causa precisa do seu apoio! Assine agora: {link}',
    '⚡ Cada assinatura conta! Me ajude a alcançar nossa meta: {link}',
    '💪 Vamos juntos mudar isso! Assine a petição: {link}',
    '🌟 Sua voz importa! Assine e compartilhe: {link}',
  ];

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        title: data.title,
        description: data.description,
        banner_url: data.banner_url || null,
        logo_url: data.logo_url || null,
        primary_color: data.primary_color || "#6366f1",
        share_text: data.share_text || null,
        goal: Number(data.goal) || 1,
        status: data.status,
        slug: data.slug,
        collect_email: !!data.collect_email,
        collect_phone: !!data.collect_phone,
        collect_city: !!data.collect_city,
        collect_state: !!data.collect_state,
        collect_cpf: !!data.collect_cpf,
        collect_comment: !!data.collect_comment,
        lgpd_text: data.lgpd_text || null,
      };
      
      if (editingId) {
        return base44.entities.Petition.update(editingId, payload);
      }
      return base44.entities.Petition.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["petitions"] });
      navigate(createPageUrl("PetitionsList"));
    },
    onError: (error) => {
      const msg = error?.message || error?.error || String(error);
      if (msg.includes('Slug') || msg.includes('slug')) {
        alert('Essa URL (slug) já está em uso. Por favor, escolha outra.');
      } else {
        alert('Erro ao salvar petição: ' + msg);
      }
    },
  });

  // Upload genérico (logo/banner)
  const handleFileUpload = async (e, type = "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    type === "logo" ? setUploadingLogo(true) : setUploading(true);
    try {
      const prefix = type === "logo" ? "logos" : "banners";
      const { url } = await uploadToStorage(file, prefix);
      setFormData((prev) => ({
        ...prev,
        [type === "logo" ? "logo_url" : "banner_url"]: url,
      }));
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      alert("Falha no upload: " + String(err?.message || err));
    } finally {
      type === "logo" ? setUploadingLogo(false) : setUploading(false);
    }
  };

  const handleSubmit = (status) => {
    const slug =
      formData.slug ||
      formData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const shareText =
      formData.share_text ||
      `Acabei de assinar "${formData.title}". Junte-se a mim! {link}`;

    createMutation.mutate({
      ...formData,
      slug,
      status,
      share_text: shareText,
    });
  };

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const toggleField = (field) =>
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));

  const collectionFields = [
    {
      id: "collect_email",
      label: "Email",
      icon: Mail,
      color: "from-orange-500 to-orange-600",
      description: "Coletar email do assinante",
    },
    {
      id: "collect_city",
      label: "Cidade",
      icon: MapPin,
      color: "from-blue-500 to-blue-600",
      description: "Coletar cidade do assinante",
    },
    {
      id: "collect_phone",
      label: "Telefone",
      icon: Phone,
      color: "from-green-500 to-green-600",
      description: "Coletar telefone do assinante",
    },
    {
      id: "collect_state",
      label: "Estado",
      icon: Map,
      color: "from-purple-500 to-purple-600",
      description: "Coletar estado do assinante",
    },
    {
      id: "collect_cpf",
      label: "CPF",
      icon: Hash,
      color: "from-pink-500 to-pink-600",
      description: "Coletar CPF do assinante",
    },
    {
      id: "collect_comment",
      label: "Comentário",
      icon: MessageSquare,
      color: "from-indigo-500 to-indigo-600",
      description: "Permitir comentário dos assinantes",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
              {editingId ? 'Editar Petição' : 'Criar Nova Petição'}
            </h1>
            <p className="text-sm md:text-base text-white/90">
              {editingId ? 'Atualize os dados e veja as alterações em tempo real' : 'Preencha os dados e veja o preview em tempo real'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10 pb-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Coluna 1: Formulário */}
          <div>
            <Card className="border-none shadow-xl">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                  Informações da Petição
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {/* Título */}
                <div>
                  <Label htmlFor="title" className="text-sm font-semibold">
                    Título da Petição *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Ex: Preserve a Floresta Amazônica"
                    className="mt-1.5"
                    required
                  />
                </div>

                {/* Descrição */}
                <div>
                  <Label htmlFor="description" className="text-sm font-semibold">
                    Descrição *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Descreva detalhadamente o objetivo da sua petição..."
                    className="mt-1.5 min-h-[100px]"
                    required
                  />
                </div>

                {/* Cor Primária */}
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block">
                    Cor Primária da Petição
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleChange("primary_color", e.target.value)}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => handleChange("primary_color", e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Cor usada em botões e elementos de destaque
                  </p>
                </div>

                {/* Logo Upload */}
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block">
                    Logo da Petição (recomendado)
                  </Label>
                  <div className="border-2 border-dashed border-indigo-300 rounded-xl p-4 hover:border-indigo-400 transition-colors bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                    {formData.logo_url ? (
                      <div className="relative">
                        <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                          <img
                            src={formData.logo_url}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="mt-3 w-full font-medium"
                          onClick={() => handleChange("logo_url", "")}
                        >
                          Alterar Logo
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                          <Upload className="w-10 h-10 text-indigo-600" />
                        </div>
                        <p className="text-xs text-gray-600 mb-3 font-medium">
                          Logo quadrada para identificação da causa
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "logo")}
                          className="hidden"
                          id="logo-upload"
                          disabled={uploadingLogo}
                        />
                        <label htmlFor="logo-upload">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingLogo}
                            className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-semibold"
                            asChild
                          >
                            <span>
                              {uploadingLogo ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Escolher Logo
                                </>
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Banner Upload */}
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block">
                    Banner de Fundo (opcional)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-indigo-400 transition-colors">
                    {formData.banner_url ? (
                      <div className="relative">
                        <img
                          src={formData.banner_url}
                          alt="Banner"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="mt-2 font-medium"
                          onClick={() => handleChange("banner_url", "")}
                        >
                          Alterar Banner
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-xs text-gray-600 mb-2">
                          Imagem de fundo panorâmica
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "banner")}
                          className="hidden"
                          id="banner-upload"
                          disabled={uploading}
                        />
                        <label htmlFor="banner-upload">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploading}
                            asChild
                          >
                            <span>
                              {uploading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Escolher Banner
                                </>
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Texto de Compartilhamento */}
                <div>
                  <Label
                    htmlFor="share_text"
                    className="text-sm font-semibold mb-1.5 block"
                  >
                    Texto de Compartilhamento (opcional)
                  </Label>
                  <Textarea
                    id="share_text"
                    value={formData.share_text}
                    onChange={(e) => handleChange("share_text", e.target.value)}
                    placeholder="Deixe em branco para usar o padrão"
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-gray-600 mt-1 mb-2">
                    Use {"{link}"} onde o link da petição deve aparecer
                  </p>

                  {/* Templates */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-gray-700">
                      Templates:
                    </p>
                    {SHARE_TEXT_TEMPLATES.map((template, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleChange("share_text", template)}
                        className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-indigo-50 rounded border border-gray-200 hover:border-indigo-300 transition-colors"
                      >
                        {template.replace("{link}", "[link]")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Texto LGPD */}
                <div>
                  <Label
                    htmlFor="lgpd_text"
                    className="text-sm font-semibold mb-1.5 block"
                  >
                    Texto LGPD (abaixo do botão de assinar)
                  </Label>
                  <Textarea
                    id="lgpd_text"
                    value={formData.lgpd_text}
                    onChange={(e) => handleChange("lgpd_text", e.target.value)}
                    placeholder="Ao assinar, você concorda em receber atualizações sobre esta petição"
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Texto exibido abaixo do botão de assinar na página da petição
                  </p>
                </div>

                {/* Meta e Slug */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="goal" className="text-sm font-semibold">
                      Meta *
                    </Label>
                    <Input
                      id="goal"
                      type="number"
                      min="1"
                      value={formData.goal}
                      onChange={(e) =>
                        handleChange("goal", parseInt(e.target.value || "1", 10))
                      }
                      className="mt-1.5"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug" className="text-sm font-semibold">
                      URL (opcional)
                    </Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleChange("slug", e.target.value)}
                      placeholder="url-peticao"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* Campos de Coleta */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Campos a Coletar
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    {collectionFields.map((field) => (
                      <div
                        key={field.id}
                        onClick={() => toggleField(field.id)}
                        className={`relative cursor-pointer rounded-lg p-3 border-2 transition-all duration-300 ${
                          formData[field.id]
                            ? `border-transparent bg-gradient-to-br ${field.color} shadow-md`
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-1.5 rounded-lg ${
                              formData[field.id] ? "bg-white/20" : "bg-gray-50"
                            }`}
                          >
                            <field.icon
                              className={`w-4 h-4 ${
                                formData[field.id]
                                  ? "text-white"
                                  : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`font-semibold text-sm ${
                                formData[field.id] ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {field.label}
                            </h4>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              formData[field.id]
                                ? "border-white bg-white"
                                : "border-gray-300"
                            }`}
                          >
                            {formData[field.id] && (
                              <div
                                className={`w-2 h-2 rounded-full bg-gradient-to-br ${field.color}`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmit("rascunho")}
                    disabled={
                      createMutation.isPending ||
                      !formData.title ||
                      !formData.description
                    }
                    className="flex-1 font-semibold border-2 hover:bg-gray-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? 'Salvar Alterações' : 'Salvar Rascunho'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit("publicada")}
                    disabled={
                      createMutation.isPending ||
                      !formData.title ||
                      !formData.description
                    }
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingId ? 'Atualizando...' : 'Publicando...'}
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        {editingId ? 'Atualizar' : 'Publicar'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 2: Preview */}
          <div>
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm p-4 mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Preview da Landing Page
                </h3>
              </div>
            </Card>

            <Card className="border-none shadow-2xl overflow-hidden sticky top-6">
              <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
                {formData.banner_url ? (
                  <img
                    src={formData.banner_url}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Upload className="w-12 h-12 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="mb-2 bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs">
                    Petição {formData.status === "publicada" ? "Publicada" : "Rascunho"}
                  </Badge>
                  <h2 className="text-xl font-bold text-white mb-1 line-clamp-2">
                    {formData.title || "Título da sua petição"}
                  </h2>
                  <p className="text-sm text-white/80 line-clamp-1">
                    {formData.description
                      ? formData.description.substring(0, 80) + "..."
                      : "Descrição aparecerá aqui..."}
                  </p>
                </div>
              </div>

              <CardContent className="p-5">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-gray-900">0</span>
                    <span className="text-sm text-gray-600">
                      Meta: {Number(formData.goal || 0).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">0% alcançado</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-900">
                    Campos que serão coletados:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Nome
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Email
                    </Badge>
                    {formData.collect_city && (
                      <Badge variant="secondary" className="text-xs">
                        Cidade
                      </Badge>
                    )}
                    {formData.collect_phone && (
                      <Badge variant="secondary" className="text-xs">
                        Telefone
                      </Badge>
                    )}
                    {formData.collect_state && (
                      <Badge variant="secondary" className="text-xs">
                        Estado
                      </Badge>
                    )}
                    {formData.collect_cpf && (
                      <Badge variant="secondary" className="text-xs">
                        CPF
                      </Badge>
                    )}
                    {formData.collect_comment && (
                      <Badge variant="secondary" className="text-xs">
                        Comentário
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
