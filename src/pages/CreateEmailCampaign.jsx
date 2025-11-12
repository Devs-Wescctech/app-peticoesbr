import { base44 } from "@/api";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch"; // Added for ContactSelector
import {
  Mail,
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
  Upload // Added for ImportContactsModal
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ImportContactsModal from "../components/ImportContactsModal";

const EMAIL_TEMPLATES = [
  {
    id: 'moderno-simples',
    name: "Moderno Simples",
    thumbnail: "https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=300&fit=crop",
    color: "from-purple-500 to-indigo-600",
    subject: "Apoie nossa causa: {peticao}",
    preview: "Design moderno com gradiente roxo/azul, clean e profissional",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Olá, {nome}!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #333; margin-top: 0;">Sua assinatura faz a diferença!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Convidamos você a apoiar nossa petição: <strong>{peticao}</strong>
              </p>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Cada assinatura nos aproxima do nosso objetivo e fortalece nossa causa.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{link}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Assinar Agora
                </a>
              </div>
              <p style="color: #999; font-size: 14px; text-align: center;">
                Obrigado por fazer parte da mudança!
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'urgente',
    name: "Urgente",
    thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
    color: "from-red-500 to-orange-600",
    subject: "🚨 Ação Urgente: {peticao}",
    preview: "Design vermelho impactante para ações urgentes com destaque visual",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 3px solid #ef4444;">
          <tr>
            <td style="background-color: #ef4444; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🚨 URGENTE 🚨</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #ef4444; margin-top: 0;">Olá, {nome}!</h2>
              <p style="color: #333; font-size: 18px; line-height: 1.6; font-weight: bold;">
                Precisamos da sua ajuda AGORA!
              </p>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Nossa petição <strong>{peticao}</strong> precisa de assinaturas urgentes para fazer a diferença.
              </p>
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <p style="color: #991b1b; margin: 0; font-weight: bold;">
                  Cada minuto conta! Sua assinatura pode ser decisiva.
                </p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{link}" style="background-color: #ef4444; color: #ffffff; padding: 18px 50px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 18px;">
                  ASSINAR AGORA
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'minimalista',
    name: "Minimalista",
    thumbnail: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop",
    color: "from-gray-900 to-gray-700",
    subject: "{nome}, apoie: {peticao}",
    preview: "Design clean preto e branco, elegante e sofisticado",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 60px 20px;">
        <table width="500" cellpadding="0" cellspacing="0">
          <tr>
            <td style="border-bottom: 2px solid #000000; padding-bottom: 20px;">
              <h1 style="color: #000000; margin: 0; font-size: 24px; font-weight: 300;">Olá, {nome}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 0;">
              <p style="color: #333; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                Convidamos você a apoiar nossa petição:
              </p>
              <p style="color: #000; font-size: 20px; font-weight: bold; margin: 0 0 30px 0;">
                {peticao}
              </p>
              <div style="text-align: left;">
                <a href="{link}" style="color: #000000; border: 2px solid #000000; padding: 12px 30px; text-decoration: none; display: inline-block; font-weight: bold;">
                  Assinar Petição →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #e5e5e5; padding-top: 20px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Sua participação é fundamental para o sucesso desta causa.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
  {
    id: 'colorido',
    name: "Colorido",
    thumbnail: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=400&h=300&fit=crop",
    color: "from-pink-500 to-purple-600",
    subject: "🎨 Junte-se a nós: {peticao}",
    preview: "Design vibrante com gradientes coloridos e visual alegre",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 50px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">Oi, {nome}! 👋</h1>
              <p style="color: #ffffff; margin: 0; font-size: 18px;">Sua voz importa!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                  ✨ FAÇA PARTE
                </span>
              </div>
              <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 22px; text-align: center;">{peticao}</h2>
              <p style="color: #4a5568; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; text-align: center;">
                Juntos somos mais fortes! Sua assinatura ajuda a amplificar nossa mensagem e criar um impacto real.
              </p>
              <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 12px; padding: 20px; margin: 30px 0;">
                <p style="color: #744210; margin: 0; font-size: 14px; text-align: center;">
                  💪 <strong>Cada assinatura conta!</strong> Seja a mudança que você quer ver no mundo.
                </p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{link}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 50px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  🚀 ASSINAR AGORA
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <p style="color: #ffffff; font-size: 12px; margin: 0;">
                🌟 Obrigado por fazer parte desta jornada!
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },
];

// --- ContactSelector Component ---
function ContactSelector({ petitions, selectedPetitions, onPetitionsChange, filters, onFiltersChange }) {
  const [showFilters, setShowFilters] = useState(false);

  const handlePetitionToggle = (petitionId) => {
    if (selectedPetitions.includes(petitionId)) {
      onPetitionsChange(selectedPetitions.filter(id => id !== petitionId));
    } else {
      onPetitionsChange([...selectedPetitions, petitionId]);
    }
  };

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    onFiltersChange(prev => ({ ...prev, [id]: value }));
  };

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Users className="w-5 h-5" />
          Seleção e Filtro de Contatos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Filtrar Contatos por Petições (Opcional)
          </Label>
          <p className="text-sm text-gray-600 mb-3">
            Selecione uma ou mais petições para filtrar os contatos que receberão o email. Se nenhuma for selecionada, todos os contatos com email serão incluídos.
          </p>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-1 border rounded-lg bg-gray-50">
            {petitions.length === 0 && <p className="text-center text-sm text-gray-500 py-4">Nenhuma petição disponível para filtrar.</p>}
            {petitions.map((petition) => (
              <div
                key={petition.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                  selectedPetitions.includes(petition.id)
                    ? 'border-purple-500 bg-purple-100 shadow-sm'
                    : 'border-gray-200 hover:border-purple-200 hover:bg-white bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedPetitions.includes(petition.id)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {selectedPetitions.includes(petition.id) ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <h4 className={`font-semibold text-sm ${
                    selectedPetitions.includes(petition.id) ? 'text-purple-900' : 'text-gray-900'
                  }`}>
                    {petition.title}
                  </h4>
                </div>
                <Switch
                  checked={selectedPetitions.includes(petition.id)}
                  onCheckedChange={() => handlePetitionToggle(petition.id)}
                  aria-label={`Selecionar petição ${petition.title}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Filtros Demográficos e de Data (Opcional)
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="font-semibold"
            >
              {showFilters ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Ocultar
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Mostrar Filtros
                </>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="grid md:grid-cols-2 gap-4 animate-in slide-in-from-top duration-300">
              <div>
                <Label htmlFor="city" className="text-sm">Cidade</Label>
                <Input
                  id="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="Ex: São Paulo"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-sm">Estado</Label>
                <Input
                  id="state"
                  value={filters.state}
                  onChange={handleFilterChange}
                  placeholder="Ex: SP"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dateFrom" className="text-sm">Assinado a partir de</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-sm">Assinado até</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


export default function CreateEmailCampaign() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');

  const [formData, setFormData] = useState({
    name: "",
    petition_id: "", // Petição usada NA MENSAGEM (para {peticao} e {link})
    subject: "",
    message: "",
    sender_email: "",
    sender_name: "",
    api_token: "",
  });

  // Petições selecionadas PARA FILTRAR CONTATOS
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
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false); // New state for import modal

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

  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      const campaigns = await base44.entities.Campaign.list();
      return campaigns.find(c => c.id === campaignId);
    },
    enabled: !!campaignId,
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || "",
        petition_id: campaign.petition_id || "",
        subject: campaign.subject || "",
        message: campaign.message || "",
        sender_email: campaign.sender_email || "",
        sender_name: campaign.sender_name || "",
        api_token: campaign.api_token || "",
      });

      if (campaign.target_petitions && campaign.target_petitions.length > 0) {
        setSelectedPetitions(campaign.target_petitions);
      }

      if (campaign.target_filters) {
        setContactFilters(campaign.target_filters);
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
      // Navigation is now handled by the specific event handlers (handleSave, handleSendNow)
      // to allow sendNow to complete its process before navigating.
    },
  });

  // Calcula contatos filtrados
  const filteredSignatures = React.useMemo(() => {
    let contacts = signatures;

    // Filter by selected petitions for contacts
    if (selectedPetitions.length > 0) {
      contacts = contacts.filter(s => selectedPetitions.includes(s.petition_id));
    }

    // Ensure contacts have an email
    contacts = contacts.filter(s => s.email);

    // Apply additional contact filters
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
      dateToAdjusted.setHours(23, 59, 59, 999); // Include full day
      contacts = contacts.filter(s =>
        new Date(s.created_date) <= dateToAdjusted
      );
    }

    // Remove duplicate emails
    const seen = new Set();
    return contacts.filter(contact => {
      if (contact.email && seen.has(contact.email)) return false;
      if (contact.email) seen.add(contact.email);
      return true;
    });
  }, [signatures, selectedPetitions, contactFilters]);

  const sendEmail = async (toEmail, toName, currentCampaignId) => {
    const petition = petitions.find(p => p.id === formData.petition_id); // This is the petition used for the MESSAGE
    const personalizedHtml = formData.message
      .replace(/{nome}/g, toName)
      .replace(/{peticao}/g, petition?.title || '')
      .replace(/{link}/g, `${window.location.origin}/PetitionLanding?id=${formData.petition_id}`);

    const personalizedSubject = formData.subject
      .replace(/{nome}/g, toName)
      .replace(/{peticao}/g, petition?.title || '');

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${formData.api_token}`);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      sendTo: [{
        email: toEmail,
        name: toName
      }],
      subject: personalizedSubject,
      sender: {
        email: formData.sender_email,
        name: formData.sender_name
      },
      html: personalizedHtml
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    try {
      const response = await fetch("https://api.locaweb.com.br/v2/email-marketing/messages", requestOptions);
      const result = await response.text();

      // Salva log no banco
      await base44.entities.CampaignLog.create({
        campaign_id: currentCampaignId,
        recipient_name: toName,
        recipient_contact: toEmail,
        status: response.ok ? 'success' : 'error',
        response_status: response.status.toString(),
        response_body: result,
        error_message: response.ok ? null : result
      });

      if (!response.ok) {
        setErrors(prev => [...prev, {
          email: toEmail,
          name: toName,
          error: result,
          status: response.status
        }]);
        return false;
      }
      return true;
    } catch (error) {
      // Salva log de erro de rede
      await base44.entities.CampaignLog.create({
        campaign_id: currentCampaignId,
        recipient_name: toName,
        recipient_contact: toEmail,
        status: 'error',
        response_status: 'Network Error',
        response_body: error.message,
        error_message: error.message
      });

      setErrors(prev => [...prev, {
        email: toEmail,
        name: toName,
        error: error.message,
        status: 'Network Error'
      }]);
      return false;
    }
  };

  const handleSave = async (asDraft = true) => {
    await saveMutation.mutateAsync({
      ...formData,
      type: 'email',
      status: asDraft ? 'rascunho' : 'concluida',
      total_recipients: filteredSignatures.length,
      target_petitions: selectedPetitions, // Save selected petitions for filtering
      target_filters: contactFilters, // Save additional contact filters
    });
    navigate(createPageUrl("EmailCampaigns")); // Navigate after explicit save
  };

  const handleSendNow = async () => {
    if (!formData.api_token || !formData.message || !formData.petition_id || !formData.subject || !formData.sender_email || !formData.sender_name) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    if (filteredSignatures.length === 0) {
      alert("Nenhum contato encontrado com os filtros selecionados.");
      return;
    }

    setIsSending(true);
    setErrors([]);
    setSendResults({ success: 0, failed: 0, total: filteredSignatures.length });
    setSendProgress(0);

    let success = 0;
    let failed = 0;

    // Salva campanha primeiro para ter o ID, se for uma nova campanha
    let currentCampaignId = campaignId;
    if (!campaignId) {
      const newCampaign = await saveMutation.mutateAsync({
        ...formData,
        type: 'email',
        status: 'enviando', // Status while sending
        total_recipients: filteredSignatures.length,
        target_petitions: selectedPetitions, // Save selected petitions for filtering
        target_filters: contactFilters, // Save additional contact filters
      });
      currentCampaignId = newCampaign.id;
    }

    for (let i = 0; i < filteredSignatures.length; i++) {
      const signature = filteredSignatures[i];
      const result = await sendEmail(signature.email, signature.name, currentCampaignId); // Pass the current campaign ID
      if (result) {
        success++;
      } else {
        failed++;
      }

      setSendProgress(((i + 1) / filteredSignatures.length) * 100);
      setSendResults({ success, failed, total: filteredSignatures.length });

      // Delay entre envios (1 segundo)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Atualiza campanha como concluída após o envio
    await base44.entities.Campaign.update(currentCampaignId, {
      ...formData,
      type: 'email',
      status: 'concluida',
      total_recipients: success + failed, // Should be actual sent count, not filteredSignatures.length
      sent_count: success + failed,
      success_count: success,
      failed_count: failed,
      target_petitions: selectedPetitions, // Save selected petitions for filtering
      target_filters: contactFilters, // Save additional contact filters
    });

    setIsSending(false);
    
    // Navega de volta com o ID da campanha
    setTimeout(() => {
      navigate(createPageUrl("EmailCampaigns"));
    }, 2000);
  };

  const handleSelectTemplate = (template) => {
    setFormData({ 
      ...formData, 
      message: template.content,
      subject: template.subject
    });
    setSelectedTemplate(template.id);
    setShowTemplates(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/30">
                  {campaignId ? 'Editar Campanha' : 'Nova Campanha'}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                {campaignId ? 'Editar Campanha' : 'Criar Campanha de Email'}
              </h1>
              <p className="text-lg text-white/90">
                Configure e envie emails personalizados
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(createPageUrl("EmailCampaigns"))}
              className="bg-white text-blue-600 hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 font-semibold"
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
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    Configuração da Campanha
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImportModal(true)}
                    className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold"
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
                    placeholder="Ex: Newsletter Mensal - Petições"
                    className="mt-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="token" className="text-sm font-semibold">
                      API Token Locaweb *
                    </Label>
                    <Input
                      id="token"
                      type="password"
                      value={formData.api_token}
                      onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                      placeholder="Token da API"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="senderEmail" className="text-sm font-semibold">
                      E-mail Remetente *
                    </Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      value={formData.sender_email}
                      onChange={(e) => setFormData({ ...formData, sender_email: e.target.value })}
                      placeholder="seu@email.com"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="senderName" className="text-sm font-semibold">
                    Nome Remetente *
                  </Label>
                  <Input
                    id="senderName"
                    value={formData.sender_name}
                    onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })}
                    placeholder="Seu Nome"
                    className="mt-2"
                  />
                </div>

                {/* Seleção da Petição PARA A MENSAGEM */}
                <Card className="bg-blue-50 border-2 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                      <FileText className="w-5 h-5" />
                      Petição para Conteúdo da Mensagem *
                    </CardTitle>
                    <p className="text-sm text-blue-700 mt-1">
                      Selecione a petição que será referenciada nas variáveis {"{peticao}"} e {"{link}"} do email.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto p-1">
                      {petitions.length === 0 && <p className="text-center text-sm text-gray-500 py-4">Nenhuma petição disponível.</p>}
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

                {/* Contact Selector - PARA FILTRAR CONTATOS */}
                <ContactSelector
                  petitions={petitions}
                  selectedPetitions={selectedPetitions}
                  onPetitionsChange={setSelectedPetitions}
                  filters={contactFilters}
                  onFiltersChange={setContactFilters}
                />

                {/* Templates Section - Redesigned */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      Templates HTML
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 animate-in slide-in-from-top duration-300">
                      {EMAIL_TEMPLATES.map((template) => (
                        <Card
                          key={template.id}
                          className={`cursor-pointer border-2 transition-all duration-300 hover:shadow-lg group overflow-hidden ${
                            selectedTemplate === template.id
                              ? 'border-blue-500 shadow-md'
                              : 'border-transparent hover:border-blue-200'
                          }`}
                        >
                          <CardContent className="p-0">
                            <div 
                              className={`w-full h-32 bg-gradient-to-br ${template.color} flex items-center justify-center text-white font-bold text-lg relative overflow-hidden group-hover:scale-105 transition-transform`}
                              style={{
                                backgroundImage: `url(${template.thumbnail})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            >
                              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                              <span className="relative z-10">{template.name}</span>
                              {selectedTemplate === template.id && (
                                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                {template.preview}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewTemplate(template);
                                  }}
                                  className="flex-1"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Preview
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => handleSelectTemplate(template)}
                                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600"
                                >
                                  Usar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="subject" className="text-base font-semibold">
                    Assunto do E-mail *
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Olá {nome}! Apoie nossa causa: {peticao}"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-base font-semibold mb-2 block">
                    Conteúdo HTML do E-mail *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="<h1>Olá {nome}!</h1><p>Convido você a apoiar nossa petição: <strong>{peticao}</strong></p><a href='{link}'>Clique aqui para assinar</a>"
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Use {"{nome}"}, {"{peticao}"} e {"{link}"} para personalizar o e-mail
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">📧 Sobre o envio:</p>
                      <p>Os e-mails serão enviados através da API da Locaweb. Certifique-se de ter configurado corretamente suas credenciais.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSave(true)}
                    disabled={saveMutation.isPending || !formData.name || !formData.petition_id}
                    className="flex-1 font-semibold border-2 hover:bg-gray-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Rascunho
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSendNow}
                    disabled={isSending || !formData.api_token || !formData.message || !formData.petition_id || !formData.subject || !formData.sender_email || !formData.sender_name || filteredSignatures.length === 0}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando... ({sendResults.success + sendResults.failed}/{sendResults.total})
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        Enviar Agora ({filteredSignatures.length} contatos)
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
                          <p className="text-gray-600">Email: {err.email}</p>
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
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Preview do Email
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {formData.message && formData.subject && formData.petition_id && formData.sender_name && formData.sender_email ? (
                  <div className="space-y-4">
                    {/* Email Header Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                          {formData.sender_name ? formData.sender_name[0].toUpperCase() : 'E'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {formData.sender_name || 'Nome do Remetente'} ({formData.sender_email || 'email@exemplo.com'})
                          </p>
                          <p className="text-xs text-gray-600">Para: João Silva</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 text-base">
                        {formData.subject
                          .replace(/{nome}/g, 'João Silva')
                          .replace(/{peticao}/g, petitions.find(p => p.id === formData.petition_id)?.title || 'Petição')}
                      </p>
                    </div>

                    {/* HTML Content Preview */}
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
                        <p className="text-xs text-gray-600">Conteúdo do Email:</p>
                      </div>
                      <div 
                        className="p-4 max-h-96 overflow-auto"
                        dangerouslySetInnerHTML={{ 
                          __html: formData.message
                            .replace(/{nome}/g, 'João Silva')
                            .replace(/{peticao}/g, petitions.find(p => p.id === formData.petition_id)?.title || 'Petição')
                            .replace(/{link}/g, `${window.location.origin}/PetitionLanding?id=${formData.petition_id}`)
                        }}
                      />
                    </div>

                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Preview com dados de exemplo
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Preencha os campos obrigatórios (Remetente, Assunto, Mensagem, Petição) para ver o preview do email</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{filteredSignatures.length}</p>
                    <p className="text-sm text-white/80">Contatos Alcançáveis</p>
                  </div>
                </div>

                {formData.petition_id && (
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-white/80 mb-1">Petição de Conteúdo Selecionada:</p>
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
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Boas Práticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>Use HTML responsivo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>Personalize o conteúdo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>Evite palavras que caem em spam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>Teste antes de enviar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>Respeite a LGPD</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{previewTemplate.preview}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewTemplate(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="mb-4">
                <Label className="text-sm font-semibold">Assunto:</Label>
                <p className="text-gray-700 mt-1">{previewTemplate.subject}</p>
              </div>
              <Label className="text-sm font-semibold mb-2 block">Preview HTML:</Label>
              <div
                className="border rounded-lg p-2 bg-gray-50 min-h-[300px]"
                dangerouslySetInnerHTML={{ __html: previewTemplate.content }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Import Contacts Modal */}
      <ImportContactsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        petitions={petitions}
      />
    </div>
  );
}
