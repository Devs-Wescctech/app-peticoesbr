import { base44 } from "@/api";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Loader2, CheckCircle, AlertCircle, Users, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function WhatsAppSender() {
  const [accessToken, setAccessToken] = useState("");
  const [message, setMessage] = useState("");
  const [selectedPetition, setSelectedPetition] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendResults, setSendResults] = useState({ success: 0, failed: 0, total: 0 });
  const [errors, setErrors] = useState([]);

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

  const filteredSignatures = selectedPetition 
    ? signatures.filter(s => s.petition_id === selectedPetition && s.phone)
    : signatures.filter(s => s.phone);

  const sendWhatsApp = async (phone, personName) => {
    const petition = petitions.find(p => p.id === selectedPetition);
    const personalizedMessage = message
      .replace('{nome}', personName)
      .replace('{peticao}', petition?.title || '')
      .replace('{link}', `${window.location.origin}/PetitionLanding?id=${selectedPetition}`);

    const myHeaders = new Headers();
    myHeaders.append("access-token", accessToken);
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");

    const raw = JSON.stringify({
      forceSend: false,
      isWhisper: false,
      message: personalizedMessage,
      verifyContact: true,
      number: phone.replace(/\D/g, ''),
      delayInSeconds: 2,
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
      setErrors(prev => [...prev, {
        phone,
        name: personName,
        error: error.message,
        status: 'Network Error'
      }]);
      return false;
    }
  };

  const handleSendBulk = async () => {
    if (!accessToken || !message || !selectedPetition) {
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
      const result = await sendWhatsApp(signature.phone, signature.name);
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      setSendProgress(((i + 1) / filteredSignatures.length) * 100);
      setSendResults({ success, failed, total: filteredSignatures.length });
      
      // Delay entre envios
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    setIsSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/30 text-xs">
              Envio em Massa
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
            Envio via WhatsApp
          </h1>
          <p className="text-sm md:text-base text-white/90">
            Envie mensagens personalizadas para os assinantes das suas petições
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-6 relative z-10 pb-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Config Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  Configuração do Envio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <Label htmlFor="token" className="text-base font-semibold">
                    Access Token da API *
                  </Label>
                  <Input
                    id="token"
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Cole seu token de acesso aqui"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="petition" className="text-base font-semibold">
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

                <div>
                  <Label htmlFor="message" className="text-base font-semibold mb-2 block">
                    Mensagem *
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Olá {nome}! Convido você a apoiar nossa petição: {peticao}. Acesse: {link}"
                    className="min-h-[150px]"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Use {"{nome}"}, {"{peticao}"} e {"{link}"} para personalizar a mensagem
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-1">⚠️ Importante:</p>
                      <p>Haverá um intervalo de 3 segundos entre cada envio para evitar bloqueios. O processo pode levar alguns minutos.</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSendBulk}
                  disabled={isSending || !accessToken || !message || !selectedPetition || filteredSignatures.length === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-12 font-semibold shadow-lg hover:shadow-xl transition-all"
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
          </div>

          {/* Stats Sidebar */}
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
                <CardTitle className="text-base">💡 Dicas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Teste primeiro com seu número</li>
                  <li>• Personalize a mensagem</li>
                  <li>• Evite enviar em horários inadequados</li>
                  <li>• Respeite a LGPD</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}