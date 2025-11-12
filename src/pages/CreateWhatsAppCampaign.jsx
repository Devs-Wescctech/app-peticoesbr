import { base44 } from "@/api";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MessageCircle,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  X,
  Save,
  Rocket,
  ArrowLeft,
  Eye,
  Sparkles,
  FileText,
  ChevronUp,
  Upload
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ContactSelector from "../components/ContactSelector";
import ImportContactsModal from "../components/ImportContactsModal";

const WHATSAPP_TEMPLATES = [
  {
    id: 'convite-simples',
    name: "Convite Simples",
    emoji: "👋",
    color: "from-blue-500 to-cyan-500",
    preview: "Olá {nome}! 👋\n\nConvido você a apoiar nossa causa: *{peticao}*\n\nSua assinatura faz a diferença! 💪\n\nAcesse: {link}",
    content: "Olá {nome}! 👋\n\nConvido você a apoiar nossa causa: *{peticao}*\n\nSua assinatura faz a diferença! 💪\n\nAcesse: {link}",
  },
  {
    id: 'urgente',
    name: "Urgente",
    emoji: "🚨",
    color: "from-red-500 to-orange-500",
    preview: "🚨 *URGENTE* 🚨\n\nOlá {nome}!\n\nPrecisamos da sua ajuda AGORA...",
    content: "🚨 *URGENTE* 🚨\n\nOlá {nome}!\n\nPrecisamos da sua ajuda AGORA para: {peticao}\n\nJá temos várias assinaturas, mas precisamos de VOCÊ!\n\nAssine aqui: {link}\n\n#FaçaParteDaMudança",
  },
  {
    id: 'formal',
    name: "Formal",
    emoji: "📋",
    color: "from-slate-600 to-slate-800",
    preview: "Prezado(a) {nome},\n\nGostaríamos de convidá-lo(a)...",
    content: "Prezado(a) {nome},\n\nGostaríamos de convidá-lo(a) a apoiar nossa petição: {peticao}\n\nSua participação é fundamental para alcançarmos nosso objetivo.\n\nPara assinar, acesse: {link}\n\nAtenciosamente,\nEquipe da Petição",
  },
  {
    id: 'amigavel',
    name: "Amigável",
    emoji: "😊",
    color: "from-green-500 to-emerald-500",
    preview: "E aí, {nome}! 😊\n\nBora fazer a diferença? 🌟...",
    content: "E aí, {nome}! 😊\n\nBora fazer a diferença? 🌟\n\nEstamos reunindo assinaturas para: {peticao}\n\nÉ rapidinho, leva menos de 1 minuto!\n\nClica aqui: {link}\n\nConta com a gente! 🙏",
  },
  {
    id: 'inspirador',
    name: "Inspirador",
    emoji: "✨",
    color: "from-purple-500 to-pink-500",
    preview: "✨ {nome}, você pode fazer a diferença!...",
    content: "✨ {nome}, você pode fazer a diferença!\n\nJunte-se a nós nesta causa importante: *{peticao}*\n\n💪 Cada voz importa!\n💚 Cada assinatura conta!\n🌟 Juntos somos mais fortes!\n\nApoie agora: {link}",
  },
  {
    id: 'direto',
    name: "Direto ao Ponto",
    emoji: "🎯",
    color: "from-indigo-500 to-blue-500",
    preview: "🎯 {nome}, precisamos de você!...",
    content: "🎯 {nome}, precisamos de você!\n\n{peticao}\n\n✅ Clique aqui para assinar: {link}\n\nObrigado! 🙏",
  },
];

export default function CreateWhatsAppCampaign() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');

  const [formData, setFormData] = useState({
    name: "",
    petition_id: "", // Petição usada NA MENSAGEM para {peticao} e {link}
    message: "",
    api_token: "",
    delay_seconds: 3,
    messages_per_hour: 20,
    avoid_night_hours: true,
  });

  // Petições selecionadas PARA FILTRAR CONTATOS (podem ser múltiplas)
  const [selectedPetitions, setSelectedPetitions] = useState([]);
  const [contactFilters, setContactFilters] = useState({
    city: '',
    state: '',
    dateFrom: '',
    dateTo: ''
  });

  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendResults, setSendResults] = useState({ success: 0, failed: 0, total: 0 });
  const [errors, setErrors] = useState([]);

  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const { data: petitions = [] } = useQuery({
    queryKey: ['petitions'],
    queryFn: () => base44.entities.Petition.list(),
  });

  const { data: signatures = [] } = useQuery({
    queryKey: ['signatures'],
    queryFn: () => base44.entities.Signature.list(),
  });

  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      const campaigns = await base44.entities.Campaign.list();
      return campaigns.find(c => c.id === campaignId);
    },
    enabled: !!campaignId,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates', 'whatsapp'],
    queryFn: async () => {
      const allTemplates = await base44.entities.MessageTemplate.list();
      return allTemplates.filter(t => t.type === 'whatsapp');
    },
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || "",
        petition_id: campaign.petition_id || "", // Kept for message personalization
        message: campaign.message || "",
        api_token: campaign.api_token || "",
        delay_seconds: campaign.delay_seconds || 3,
        messages_per_hour: campaign.messages_per_hour || 20,
        avoid_night_hours: campaign.avoid_night_hours ?? true,
      });
      
      // Carrega petições selecionadas para filtragem de contatos
      if (campaign.target_petitions && campaign.target_petitions.length > 0) {
        setSelectedPetitions(campaign.target_petitions);
      }

      // Carrega filtros
      if (campaign.target_filters) {
        setContactFilters(campaign.target_filters);
      }

      const matchedTemplate = WHATSAPP_TEMPLATES.find(t => t.content === campaign.message);
      if (matchedTemplate) {
        setSelectedTemplate(matchedTemplate.id);
      }
    }
  }, [campaign]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (campaignId) {
        return base44.entities.Campaign.update(campaignId, data);
      }
      return base44.entities.Campaign.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      navigate(createPageUrl("WhatsAppCampaigns"));
    },
  });

  // Calcula contatos filtrados usando o ContactSelector states
  const filteredSignatures = useMemo(() => {
    let contacts = signatures;

    // Filter by selected petitions for recipient pool
    if (selectedPetitions.length > 0) {
      contacts = contacts.filter(s => selectedPetitions.includes(s.petition_id));
    }

    // Filter to ensure phone exists
    contacts = contacts.filter(s => s.phone);

    // Additional filters from contactFilters state
    if (contactFilters.city) {
      contacts = contacts.filter(s => 
        s.city?.toLowerCase().includes(contactFilters.city.toLowerCase())
      );
    }

    if (contactFilters.state) {
      contacts = contacts.filter(s => 
        s.state?.toLowerCase().includes(contactFilters.state.toLowerCase())
      );
    }

    if (contactFilters.dateFrom) {
      contacts = contacts.filter(s => 
        new Date(s.created_date) >= new Date(contactFilters.dateFrom)
      );
    }

    if (contactFilters.dateTo) {
      const dateToAdjusted = new Date(contactFilters.dateTo);
      dateToAdjusted.setHours(23, 59, 59, 999); // Include the whole day
      contacts = contacts.filter(s => 
        new Date(s.created_date) <= dateToAdjusted
      );
    }

    // Remove duplicates by phone number
    const seen = new Set();
    return contacts.filter(contact => {
      if (contact.phone && seen.has(contact.phone)) return false;
      if (contact.phone) seen.add(contact.phone);
      return true;
    });
  }, [signatures, selectedPetitions, contactFilters]);

  const sendWhatsApp = async (phone, personName, campaignIdToLog) => {
    // The petition_id from formData is used here for message personalization
    const petition = petitions.find(p => p.id === formData.petition_id);
    const personalizedMessage = formData.message
      .replace(/{nome}/g, personName)
      .replace(/{peticao}/g, petition?.title || '')
      .replace(/{link}/g, `${window.location.origin}/PetitionLanding?id=${formData.petition_id}`);

    const myHeaders = new Headers();
    myHeaders.append("access-token", formData.api_token);
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");

    // Adiciona código do país +55 se não tiver
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 9) { // Assumes 9 digit number without DDI
      formattedPhone = '55' + formattedPhone;
    } else if (formattedPhone.length === 10) { // Assumes 10 digit number with DDD but without DDI
      formattedPhone = '55' + formattedPhone;
    } else if (formattedPhone.length === 11 && !formattedPhone.startsWith('55')) { // Assumes 11 digit number (DDD + 9xxxxx-xxxx) without DDI
        formattedPhone = '55' + formattedPhone;
    } else if (formattedPhone.length === 12 && !formattedPhone.startsWith('55')) { // Assumes 12 digit number (DDD + xxxxx-xxxx) without DDI
        formattedPhone = '55' + formattedPhone;
    }


    const raw = JSON.stringify({
      forceSend: false,
      isWhisper: false,
      message: personalizedMessage,
      verifyContact: true,
      number: formattedPhone,
      delayInSeconds: formData.delay_seconds || 2,
      linkPreview: true
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    try {
      const response = await fetch("https://api.wescctech.com.br/core/v2/api/chats/send-text", requestOptions);
      const result = await response.text();

      // Salva log no banco
      await base44.entities.CampaignLog.create({
        campaign_id: campaignIdToLog,
        recipient_name: personName,
        recipient_contact: phone,
        status: response.ok ? 'success' : 'error',
        response_status: response.status.toString(),
        response_body: result,
        error_message: response.ok ? null : result
      });

      if (!response.ok) {
        setErrors(prev => [...prev, {
          phone,
          name: personName,
          error: result,
          status: response.status
        }]);
        return false;
      }
      return true;
    } catch (error) {
      // Salva log de erro de rede
      await base44.entities.CampaignLog.create({
        campaign_id: campaignIdToLog,
        recipient_name: personName,
        recipient_contact: phone,
        status: 'error',
        response_status: 'Network Error',
        response_body: error.message,
        error_message: error.message
      });

      setErrors(prev => [...prev, {
        phone,
        name: personName,
        error: error.message,
        status: 'Network Error'
      }]);
      return false;
    }
  };

  const handleSave = (asDraft = true) => {
    saveMutation.mutate({
      ...formData,
      type: 'whatsapp',
      status: asDraft ? 'rascunho' : 'concluida',
      total_recipients: filteredSignatures.length,
      target_petitions: selectedPetitions, // Save selected petitions
      target_filters: contactFilters,     // Save contact filters
    });
  };

  const handleSendNow = async () => {
    // Validation updated to use formData.petition_id and selectedPetitions
    if (!formData.api_token || !formData.message || !formData.petition_id || selectedPetitions.length === 0) {
      alert("Preencha todos os campos obrigatórios, selecione a petição para a mensagem e selecione ao menos uma petição para filtrar os contatos.");
      return;
    }

    // Validação de horário noturno
    if (formData.avoid_night_hours) {
      const currentHour = new Date().getHours();
      if (currentHour >= 22 || currentHour < 8) {
        const confirmSend = confirm('⚠️ Atenção: Você está tentando enviar mensagens em horário noturno (22h-8h).\n\nEnviar mensagens neste horário pode:\n- Incomodar os destinatários\n- Aumentar o risco de denúncias\n- Resultar em banimento do WhatsApp\n\nDeseja continuar mesmo assim?');
        if (!confirmSend) {
          return;
        }
      }
    }

    setIsSending(true);
    setErrors([]);
    setSendResults({ success: 0, failed: 0, total: filteredSignatures.length });
    setSendProgress(0);

    let success = 0;
    let failed = 0;
    let currentCampaignId = campaignId;

    // First, ensure the campaign exists and its ID is known, setting status to 'enviando'
    if (!currentCampaignId) {
      // Create new campaign
      const newCampaign = await base44.entities.Campaign.create({
        ...formData,
        type: 'whatsapp',
        status: 'enviando', // Temporary status while sending
        total_recipients: filteredSignatures.length,
        target_petitions: selectedPetitions, // Save selected petitions
        target_filters: contactFilters,     // Save contact filters
      });
      currentCampaignId = newCampaign.id;
    } else {
      // Update existing campaign status to 'enviando'
      await base44.entities.Campaign.update(currentCampaignId, {
        ...formData, // Ensure name/message etc. are saved before sending begins
        type: 'whatsapp',
        status: 'enviando',
        total_recipients: filteredSignatures.length,
        target_petitions: selectedPetitions, // Save selected petitions
        target_filters: contactFilters,     // Save contact filters
      });
    }
    queryClient.invalidateQueries({ queryKey: ['campaigns'] }); // Invalidate to reflect 'enviando' status

    // --- Sending loop with configurable delay ---
    for (let i = 0; i < filteredSignatures.length; i++) {
      const signature = filteredSignatures[i];
      // Pass currentCampaignId to sendWhatsApp for logging
      const result = await sendWhatsApp(signature.phone, signature.name, currentCampaignId);
      if (result) {
        success++;
      } else {
        failed++;
      }

      setSendProgress(((i + 1) / filteredSignatures.length) * 100);
      setSendResults({ success, failed, total: filteredSignatures.length });

      // Atualiza a campanha no banco a cada 5 mensagens para exibir progresso em tempo real
      if ((i + 1) % 5 === 0 || (i + 1) === filteredSignatures.length) {
        await base44.entities.Campaign.update(currentCampaignId, {
          sent_count: success + failed,
          success_count: success,
          failed_count: failed,
        });
      }

      // Delay configurável entre envios
      const delayMs = (formData.delay_seconds || 3) * 1000;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    // Final update of the campaign with results and 'concluida' status
    await base44.entities.Campaign.update(currentCampaignId, {
      ...formData, // Re-save form data to capture any last-minute changes, though less likely during send.
      type: 'whatsapp',
      status: 'concluida',
      total_recipients: filteredSignatures.length,
      sent_count: success + failed,
      success_count: success,
      failed_count: failed,
      target_petitions: selectedPetitions, // Save selected petitions
      target_filters: contactFilters,     // Save contact filters
    });
    queryClient.invalidateQueries({ queryKey: ['campaigns'] }); // Invalidate again for final status

    setIsSending(false);
    
    // Navega de volta com o ID da campanha
    setTimeout(() => {
      navigate(createPageUrl("WhatsAppCampaigns"));
    }, 2000);
  };

  const handleSelectTemplate = (template) => {
    setFormData({ ...formData, message: template.content });
    setSelectedTemplate(template.id);
    setShowTemplates(false);
  };

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
                  {campaignId ? 'Editar Campanha' : 'Nova Campanha'}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                {campaignId ? 'Editar Campanha' : 'Criar Campanha WhatsApp'}
              </h1>
              <p className="text-lg text-white/90">
                Configure e envie mensagens personalizadas
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(createPageUrl("WhatsAppCampaigns"))}
              className="bg-white text-green-600 hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10 pb-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    Configuração da Campanha
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImportModal(true)}
                    className="border-2 border-green-200 text-green-700 hover:bg-green-50 font-semibold"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label htmlFor="name" className="text-base font-semibold">
                    Nome da Campanha *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Divulgação Petição Ambiental"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="token" className="text-base font-semibold">
                    Access Token da API *
                  </Label>
                  <Input
                    id="token"
                    type="password"
                    value={formData.api_token}
                    onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                    placeholder="Cole seu token de acesso aqui"
                    className="mt-2"
                  />
                </div>

                {/* Seleção da Petição PARA A MENSAGEM */}
                <Card className="bg-blue-50 border-2 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                      <FileText className="w-5 h-5" />
                      Petição para Mensagem
                    </CardTitle>
                    <p className="text-sm text-blue-700 mt-1">
                      Esta petição será usada nas variáveis {"{peticao}"} e {"{link}"} da mensagem
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-1">
                      {petitions.map((petition) => (
                        <button
                          key={petition.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, petition_id: petition.id })}
                          className={`text-left p-3 rounded-lg border-2 transition-all duration-300 ${
                            formData.petition_id === petition.id
                              ? 'border-blue-500 bg-blue-100 shadow-sm'
                              : 'border-gray-200 hover:border-blue-200 hover:bg-white bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              formData.petition_id === petition.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {formData.petition_id === petition.id ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-sm mb-1 ${
                                formData.petition_id === petition.id ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {petition.title}
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-1">
                                {petition.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Selector Component - PARA FILTRAR CONTATOS */}
                <ContactSelector
                  petitions={petitions}
                  signatures={signatures}
                  selectedPetitions={selectedPetitions}
                  onPetitionsChange={setSelectedPetitions}
                  filters={contactFilters}
                  onFiltersChange={setContactFilters}
                  type="whatsapp"
                />

                {/* Templates Section - Redesigned */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      Templates WhatsApp
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="font-semibold"
                    >
                      {showTemplates ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-1" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-1" />
                          Ver Templates
                        </>
                      )}
                    </Button>
                  </div>

                  {showTemplates && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 animate-in slide-in-from-top duration-300">
                      {WHATSAPP_TEMPLATES.map((template) => (
                        <Card
                          key={template.id}
                          onClick={() => handleSelectTemplate(template)}
                          className={`cursor-pointer border-2 transition-all duration-300 hover:shadow-lg group ${
                            selectedTemplate === template.id
                              ? 'border-green-500 shadow-md scale-105'
                              : 'border-transparent hover:border-green-200'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className={`w-full h-24 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center text-4xl mb-3 group-hover:scale-110 transition-transform`}>
                              {template.emoji}
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-1">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {template.preview}
                            </p>
                            {selectedTemplate === template.id && (
                              <Badge className="mt-2 bg-green-500 text-white w-full justify-center">
                                ✓ Selecionado
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="message" className="text-base font-semibold mb-2 block">
                    Mensagem *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Olá {nome}! Convido você a apoiar nossa petição: {peticao}. Acesse: {link}"
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Use {"{nome}"}, {"{peticao}"} e {"{link}"} para personalizar a mensagem
                  </p>
                </div>

                {/* Anti-Ban Settings */}
                <Card className="bg-amber-50 border-2 border-amber-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                      <AlertCircle className="w-5 h-5" />
                      Configurações Anti-Banimento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="delay" className="text-sm font-semibold text-amber-900">
                          Delay entre envios (segundos)
                        </Label>
                        <Input
                          id="delay"
                          type="number"
                          min="2"
                          max="10"
                          value={formData.delay_seconds}
                          onChange={(e) => setFormData({ ...formData, delay_seconds: parseInt(e.target.value) || 3 })}
                          className="mt-2"
                        />
                        <p className="text-xs text-amber-700 mt-1">Recomendado: 3-5 segundos</p>
                      </div>

                      <div>
                        <Label htmlFor="rate" className="text-sm font-semibold text-amber-900">
                          Mensagens por hora (limite)
                        </Label>
                        <Input
                          id="rate"
                          type="number"
                          min="10"
                          max="50"
                          value={formData.messages_per_hour}
                          onChange={(e) => setFormData({ ...formData, messages_per_hour: parseInt(e.target.value) || 20 })}
                          className="mt-2"
                        />
                        <p className="text-xs text-amber-700 mt-1">Recomendado: 15-25 msgs/hora</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                      <input
                        type="checkbox"
                        id="avoidNight"
                        checked={formData.avoid_night_hours}
                        onChange={(e) => setFormData({ ...formData, avoid_night_hours: e.target.checked })}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <label htmlFor="avoidNight" className="text-sm font-medium text-amber-900 cursor-pointer">
                        Alertar sobre envios noturnos (22h-8h)
                      </label>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <p className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Boas Práticas:
                      </p>
                      <ul className="text-xs text-amber-800 space-y-1">
                        <li>• Evite envios entre 22h e 8h</li>
                        <li>• Não envie mais de 25 msgs/hora</li>
                        <li>• Use delay mínimo de 3 segundos</li>
                        <li>• Personalize as mensagens</li>
                        <li>• Teste com seu número primeiro</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1 flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        Importante:
                      </p>
                      <p>O código do país +55 será adicionado automaticamente a todos os números brasileiros.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSave(true)}
                    disabled={saveMutation.isPending || !formData.name || !formData.petition_id || selectedPetitions.length === 0}
                    className="flex-1 font-semibold border-2 hover:bg-gray-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Rascunho
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSendNow}
                    disabled={isSending || !formData.api_token || !formData.message || !formData.petition_id || selectedPetitions.length === 0 || filteredSignatures.length === 0}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando... ({sendResults.success + sendResults.failed}/{sendResults.total})
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        Enviar Agora
                      </>
                    )}
                  </Button>
                </div>

                {isSending && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progresso</span>
                      <span>{Math.round(sendProgress)}%</span>
                    </div>
                    <Progress value={sendProgress} className="h-3" />
                  </div>
                )}

                {/* Error Display */}
                {errors.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-red-800">
                          ⚠️ Erros Durante Envio ({errors.length})
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setErrors([])}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="max-h-60 overflow-y-auto space-y-2">
                      {errors.map((err, idx) => (
                        <div key={idx} className="bg-white rounded-lg p-3 text-sm">
                          <p className="font-semibold text-gray-900">{err.name}</p>
                          <p className="text-gray-600">Tel: {err.phone}</p>
                          <p className="text-red-600 mt-1 font-mono text-xs">
                            Status: {err.status} - {err.error}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="border-none shadow-xl mt-6">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  Preview da Mensagem
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {formData.message && formData.petition_id ? (
                  <div className="relative">
                    {/* WhatsApp-like preview */}
                    <div className="bg-[#DCF8C6] rounded-lg p-4 max-w-md relative">
                      <div className="absolute -left-2 top-0 w-0 h-0 border-t-[15px] border-t-[#DCF8C6] border-r-[15px] border-r-transparent" />
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                        {formData.message
                          .replace(/{nome}/g, 'João Silva')
                          .replace(/{peticao}/g, petitions.find(p => p.id === formData.petition_id)?.title || 'Petição de Exemplo')
                          .replace(/{link}/g, `${window.location.origin.substring(0, 30)}...`)}
                      </pre>
                      <p className="text-xs text-gray-600 mt-2 text-right">
                        {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Preview com dados de exemplo
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Preencha a mensagem e selecione uma petição para ver o preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{filteredSignatures.length}</p>
                    <p className="text-sm text-white/80">Contatos com WhatsApp</p>
                  </div>
                </div>

                {formData.petition_id && (
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-white/80 mb-1">Petição para mensagem:</p>
                    <p className="text-sm font-semibold">
                      {petitions.find(p => p.id === formData.petition_id)?.title}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {sendResults.total > 0 && (
              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base">Resultado do Envio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">Enviados</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{sendResults.success}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium">Falharam</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">{sendResults.failed}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  Dicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Teste primeiro com seu número</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Personalize a mensagem</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Evite horários inadequados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>O +55 é adicionado automaticamente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <span>Respeite os limites de envio</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Import Contacts Modal */}
      <ImportContactsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        petitions={petitions}
      />
    </div>
  );
}
