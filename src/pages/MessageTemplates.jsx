import { base44 } from "@/api";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Mail,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Sparkles,
  FileText
} from "lucide-react";

const DEFAULT_WHATSAPP_TEMPLATES = [
  {
    name: "Convite Simples",
    content: "Olá {nome}! 👋\n\nConvido você a apoiar nossa causa: *{peticao}*\n\nSua assinatura faz a diferença! 💪\n\nAcesse: {link}",
  },
  {
    name: "Urgente",
    content: "🚨 *URGENTE* 🚨\n\nOlá {nome}!\n\nPrecisamos da sua ajuda AGORA para: {peticao}\n\nJá temos várias assinaturas, mas precisamos de VOCÊ!\n\nAssine aqui: {link}\n\n#FaçaParteDaMudança",
  },
  {
    name: "Formal",
    content: "Prezado(a) {nome},\n\nGostaríamos de convidá-lo(a) a apoiar nossa petição: {peticao}\n\nSua participação é fundamental para alcançarmos nosso objetivo.\n\nPara assinar, acesse: {link}\n\nAtenciosamente,\nEquipe da Petição",
  },
  {
    name: "Amigável",
    content: "E aí, {nome}! 😊\n\nBora fazer a diferença? 🌟\n\nEstamos reunindo assinaturas para: {peticao}\n\nÉ rapidinho, leva menos de 1 minuto!\n\nClica aqui: {link}\n\nConta com a gente! 🙏",
  },
];

const DEFAULT_EMAIL_TEMPLATES = [
  {
    name: "Moderno Simples",
    subject: "Apoie nossa causa: {peticao}",
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
    name: "Urgente",
    subject: "🚨 Ação Urgente: {peticao}",
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
    name: "Minimalista",
    subject: "{nome}, apoie: {peticao}",
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
];

export default function MessageTemplates() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "whatsapp",
    subject: "",
    content: "",
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.MessageTemplate.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MessageTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MessageTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MessageTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", type: "whatsapp", subject: "", content: "" });
    setEditingTemplate(null);
  };

  const handleSave = () => {
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject || "",
      content: template.content,
    });
    setIsModalOpen(true);
  };

  const handleUseDefault = (defaultTemplate) => {
    setFormData({
      name: defaultTemplate.name,
      type: activeTab,
      subject: defaultTemplate.subject || "",
      content: defaultTemplate.content,
    });
    setIsModalOpen(true);
  };

  const userTemplates = templates.filter(t => t.type === activeTab && !t.is_default);
  const defaultTemplates = activeTab === "whatsapp" ? DEFAULT_WHATSAPP_TEMPLATES : DEFAULT_EMAIL_TEMPLATES;

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
                <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/30">
                  Templates de Mensagens
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                Biblioteca de Templates
              </h1>
              <p className="text-lg text-white/90">
                Templates prontos para WhatsApp e Email
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => {
                resetForm();
                setFormData({ ...formData, type: activeTab });
                setIsModalOpen(true);
              }}
              className="bg-white text-indigo-600 hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Template
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10 pb-8">
        {/* Tabs */}
        <Card className="border-none shadow-xl mb-6">
          <div className="flex gap-2 p-2 bg-gray-50">
            <Button
              onClick={() => setActiveTab("whatsapp")}
              className={`flex-1 ${activeTab === "whatsapp" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" : "bg-white text-gray-700"}`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp ({userTemplates.length})
            </Button>
            <Button
              onClick={() => setActiveTab("email")}
              className={`flex-1 ${activeTab === "email" ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" : "bg-white text-gray-700"}`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email ({templates.filter(t => t.type === "email" && !t.is_default).length})
            </Button>
          </div>
        </Card>

        {/* Default Templates */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Templates Prontos
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultTemplates.map((template, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="text-base flex items-center justify-between">
                    {template.name}
                    <Badge variant="secondary" className="text-xs">Pronto</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 max-h-32 overflow-hidden">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {activeTab === "whatsapp" ? template.content.substring(0, 150) : template.subject}...
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600"
                      onClick={() => handleUseDefault(template)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Usar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User Templates */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Meus Templates</h2>
          {userTemplates.length === 0 ? (
            <Card className="border-none shadow-lg">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">Nenhum template personalizado ainda</p>
                <Button
                  onClick={() => {
                    resetForm();
                    setFormData({ ...formData, type: activeTab });
                    setIsModalOpen(true);
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTemplates.map((template) => (
                <Card key={template.id} className="border-none shadow-lg hover:shadow-xl transition-all">
                  <CardHeader className={`border-b ${
                    activeTab === "whatsapp" 
                      ? "bg-gradient-to-r from-green-50 to-emerald-50" 
                      : "bg-gradient-to-r from-blue-50 to-indigo-50"
                  }`}>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="bg-gray-50 rounded-lg p-3 mb-3 max-h-32 overflow-hidden">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {template.content.substring(0, 150)}...
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('Deseja excluir este template?')) {
                            deleteMutation.mutate(template.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Editar Template" : "Novo Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome do Template *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Convite Formal"
              />
            </div>

            {formData.type === "email" && (
              <div>
                <Label>Assunto do Email *</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex: Apoie nossa causa: {peticao}"
                />
              </div>
            )}

            <div>
              <Label>Conteúdo *</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder={
                  formData.type === "whatsapp"
                    ? "Use {nome}, {peticao} e {link} para personalizar"
                    : "Cole seu HTML aqui. Use {nome}, {peticao} e {link}"
                }
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-gray-600 mt-2">
                Variáveis disponíveis: {"{nome}"}, {"{peticao}"}, {"{link}"}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.name || !formData.content || (formData.type === "email" && !formData.subject)}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                {editingTemplate ? "Atualizar" : "Criar"} Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {activeTab === "whatsapp" ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {previewTemplate?.content}
                </pre>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <Label className="text-sm font-semibold">Assunto:</Label>
                  <p className="text-gray-700 mt-1">{previewTemplate?.subject}</p>
                </div>
                <Label className="text-sm font-semibold mb-2 block">Preview HTML:</Label>
                <div
                  className="border rounded-lg overflow-auto max-h-96"
                  dangerouslySetInnerHTML={{ __html: previewTemplate?.content || "" }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}