import { base44 } from "@/api";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Loader2, CheckCircle, AlertCircle, Users, X, PartyPopper } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EmailSender() {
  const [apiToken, setApiToken] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [selectedPetition, setSelectedPetition] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendResults, setSendResults] = useState({ success: 0, failed: 0, total: 0 });
  const [errors, setErrors] = useState([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { data: petitions = [] } = useQuery({
    queryKey: ['petitions'],
    queryFn: () => base44.entities.Petition.list(),
  });

  const { data: signatures = [] } = useQuery({
    queryKey: ['signatures'],
    queryFn: () => base44.entities.Signature.list(),
  });

  const filteredSignatures = selectedPetition 
    ? signatures.filter(s => s.petition_id === selectedPetition && s.email)
    : signatures.filter(s => s.email);

  const sendEmail = async (toEmail, toName) => {
    const petition = petitions.find(p => p.id === selectedPetition);
    const personalizedHtml = htmlContent
      .replace(/{nome}/g, toName)
      .replace(/{peticao}/g, petition?.title || '')
      .replace(/{link}/g, `${window.location.origin}/p?s=${petition?.slug || selectedPetition}`);

    const personalizedSubject = subject
      .replace(/{nome}/g, toName)
      .replace(/{peticao}/g, petition?.title || '');

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${apiToken}`);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      sendTo: [{
        email: toEmail,
        name: toName
      }],
      subject: personalizedSubject,
      sender: {
        email: senderEmail,
        name: senderName
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
      setErrors(prev => [...prev, {
        email: toEmail,
        name: toName,
        error: error.message,
        status: 'Network Error'
      }]);
      return false;
    }
  };

  const handleSendBulk = async () => {
    if (!apiToken || !senderEmail || !senderName || !subject || !htmlContent || !selectedPetition) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSending(true);
    setErrors([]); // Clear previous errors
    setSendResults({ success: 0, failed: 0, total: filteredSignatures.length });
    setSendProgress(0);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < filteredSignatures.length; i++) {
      const signature = filteredSignatures[i];
      const result = await sendEmail(signature.email, signature.name);
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

    setIsSending(false);
    setShowSuccessDialog(true);
  };

  const handleResetCampaign = () => {
    setShowSuccessDialog(false);
    setSendProgress(0);
    setSendResults({ success: 0, failed: 0, total: 0 });
    setErrors([]);
    setApiToken("");
    setSenderEmail("");
    setSenderName("");
    setSubject("");
    setHtmlContent("");
    setSelectedPetition("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/30 text-xs">
              Email Marketing
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
            Envio de E-mail Marketing
          </h1>
          <p className="text-sm md:text-base text-white/90">
            Envie campanhas personalizadas para os assinantes das suas petições
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-6 relative z-10 pb-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Config Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Configuração da Campanha
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apiToken" className="text-sm font-semibold">
                      API Token Locaweb *
                    </Label>
                    <Input
                      id="apiToken"
                      type="password"
                      value={apiToken}
                      onChange={(e) => setApiToken(e.target.value)}
                      placeholder="Token da API"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="petition" className="text-sm font-semibold">
                      Selecione a Petição *
                    </Label>
                    <select
                      id="petition"
                      value={selectedPetition}
                      onChange={(e) => setSelectedPetition(e.target.value)}
                      className="mt-2 w-full h-10 px-3 rounded-md border border-gray-300 bg-white"
                    >
                      <option value="">Escolha uma petição</option>
                      {petitions.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="senderEmail" className="text-sm font-semibold">
                      E-mail Remetente *
                    </Label>
                    <Input
                      id="senderEmail"
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="senderName" className="text-sm font-semibold">
                      Nome Remetente *
                    </Label>
                    <Input
                      id="senderName"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Seu Nome"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-sm font-semibold">
                    Assunto do E-mail *
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Olá {nome}! Apoie nossa causa: {peticao}"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="html" className="text-sm font-semibold mb-2 block">
                    Conteúdo HTML do E-mail *
                  </Label>
                  <Textarea
                    id="html"
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
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

                <Button
                  onClick={handleSendBulk}
                  disabled={isSending || !apiToken || !senderEmail || !senderName || !subject || !htmlContent || !selectedPetition || filteredSignatures.length === 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando... ({sendResults.success + sendResults.failed}/{sendResults.total})
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Enviar para {filteredSignatures.length} contatos
                    </>
                  )}
                </Button>

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
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{filteredSignatures.length}</p>
                    <p className="text-sm text-white/80">Contatos com E-mail</p>
                  </div>
                </div>

                {selectedPetition && (
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs text-white/80 mb-1">Petição Selecionada:</p>
                    <p className="text-sm font-semibold">
                      {petitions.find(p => p.id === selectedPetition)?.title}
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
                <CardTitle className="text-base">💡 Boas Práticas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Use HTML responsivo</li>
                  <li>• Personalize o conteúdo</li>
                  <li>• Evite palavras que caem em spam</li>
                  <li>• Teste antes de enviar</li>
                  <li>• Respeite a LGPD</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Campanha Concluída!
            </DialogTitle>
            <DialogDescription className="text-center space-y-4">
              <p className="text-base mt-4">
                Sua campanha de e-mail foi enviada com sucesso.
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">✅ Enviados com sucesso:</span>
                  <span className="text-lg font-bold text-green-600">{sendResults.success}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">❌ Falhas no envio:</span>
                  <span className="text-lg font-bold text-red-600">{sendResults.failed}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span className="text-sm font-medium text-gray-700">📊 Total processado:</span>
                  <span className="text-lg font-bold text-gray-900">{sendResults.total}</span>
                </div>
              </div>

              {errors.length > 0 && (
                <p className="text-sm text-amber-600">
                  ⚠️ Alguns envios falharam. Verifique a lista de erros acima para mais detalhes.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              variant="outline"
              className="flex-1"
            >
              Fechar
            </Button>
            <Button
              onClick={handleResetCampaign}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              Nova Campanha
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}