import { base44 } from "@/api";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  CheckCircle,
  Loader2,
  Share2,
  Heart,
  Target,
  X,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  Link as LinkIcon,
  Sparkles
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

export default function PetitionLanding() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('s');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    cpf: "",
    comment: "",
  });

  const { data: petition, isLoading } = useQuery({
    queryKey: ['petition', slug],
    queryFn: async () => {
      const petitions = await base44.entities.Petition.list();
      return petitions.find(p => p.slug === slug);
    },
  });

  const { data: signatures = [] } = useQuery({
    queryKey: ['signatures', petition?.id],
    queryFn: async () => {
      const allSignatures = await base44.entities.Signature.list();
      return allSignatures.filter(s => s.petition_id === petition.id);
    },
    initialData: [],
    enabled: !!petition,
  });

  const signMutation = useMutation({
    mutationFn: (data) => base44.entities.Signature.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatures', petition?.id] });
      setShowSuccessModal(true);
      setFormData({ name: "", email: "", phone: "", city: "", state: "", cpf: "", comment: "" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signMutation.mutate({
      ...formData,
      petition_id: petition?.id,
    });
  };

  if (isLoading || !petition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  const progress = Math.min((signatures.length / petition.goal) * 100, 100);
  const primaryColor = petition.primary_color || "#6366f1";
  const landingUrl = window.location.href;
  
  const shareText = petition.share_text 
    ? petition.share_text.replace('{link}', landingUrl)
    : `Acabei de assinar "${petition.title}". Junte-se a mim! ${landingUrl}`;

  const socialShares = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "from-green-500 to-green-600",
      url: `https://wa.me/?text=${encodeURIComponent(shareText)}`
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "from-blue-600 to-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(landingUrl)}`
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "from-sky-500 to-sky-600",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "from-blue-700 to-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(landingUrl)}`
    },
    {
      name: "Telegram",
      icon: Send,
      color: "from-cyan-500 to-cyan-600",
      url: `https://t.me/share/url?url=${encodeURIComponent(landingUrl)}&text=${encodeURIComponent(shareText)}`
    },
  ];

  const handleShare = async (social) => {
    if (social) {
      window.open(social.url, '_blank', 'width=600,height=400');
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: petition.title,
          text: shareText,
          url: landingUrl,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Link copiado!');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(landingUrl);
    alert('Link copiado para área de transferência!');
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {petition.banner_url ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${petition.banner_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-pink-900/30" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
        )}

        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto">
            {petition.logo_url && (
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
                  <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                    <img
                      src={petition.logo_url}
                      alt={petition.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight text-center">
              {petition.title}
            </h1>

            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed text-center">
              {petition.description.slice(0, 200)}...
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-white">{signatures.length.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-white/70">assinaturas</p>
                </div>
              </div>

              <div className="w-px h-10 bg-white/20" />

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-white">{petition.goal.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-white/70">meta</p>
                </div>
              </div>

              <div className="w-px h-10 bg-white/20" />

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-white">{progress.toFixed(0)}%</p>
                  <p className="text-xs text-white/70">concluído</p>
                </div>
              </div>
            </div>

            <div className="max-w-2xl mx-auto mb-10">
              <div className="relative h-3 bg-white/10 backdrop-blur-md rounded-full overflow-hidden border border-white/20">
                <div
                  className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-1000 relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 animate-pulse" />
                </div>
              </div>
              {progress < 100 && (
                <p className="text-white/80 text-sm mt-2 text-center">
                  Faltam <span className="font-bold text-white">{(petition.goal - signatures.length).toLocaleString('pt-BR')}</span> assinaturas!
                </p>
              )}
            </div>

            <div className="max-w-xl mx-auto" id="sign-form">
              <Card className="border-none shadow-2xl bg-white/10 backdrop-blur-2xl overflow-hidden border-2 border-white/20">
                <div 
                  className="relative p-6 text-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` 
                  }}
                >
                  <div className="absolute inset-0 bg-grid-white/10" />
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-1">
                      Assine Agora
                    </h3>
                    <p className="text-white/90 flex items-center justify-center gap-2 text-sm">
                      <Users className="w-4 h-4" />
                      Junte-se a {signatures.length.toLocaleString('pt-BR')} pessoas
                    </p>
                  </div>
                </div>

                <CardContent className="p-6 bg-white/95 backdrop-blur-sm">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="name" className="text-sm font-bold text-gray-900">
                          Nome Completo *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Seu nome"
                          required
                          className="mt-1.5 h-11 border-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm font-bold text-gray-900">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="seu@email.com"
                          required
                          className="mt-1.5 h-11 border-2"
                        />
                      </div>
                    </div>

                    {petition.collect_phone && (
                      <div>
                        <Label htmlFor="phone" className="text-sm font-bold text-gray-900">
                          Telefone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="(00) 00000-0000"
                          className="mt-1.5 h-11 border-2"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {petition.collect_city && (
                        <div>
                          <Label htmlFor="city" className="text-sm font-bold text-gray-900">
                            Cidade
                          </Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            placeholder="Cidade"
                            className="mt-1.5 h-11 border-2"
                          />
                        </div>
                      )}

                      {petition.collect_state && (
                        <div>
                          <Label htmlFor="state" className="text-sm font-bold text-gray-900">
                            Estado
                          </Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                            placeholder="UF"
                            maxLength={2}
                            className="mt-1.5 h-11 border-2"
                          />
                        </div>
                      )}
                    </div>

                    {petition.collect_cpf && (
                      <div>
                        <Label htmlFor="cpf" className="text-sm font-bold text-gray-900">
                          CPF
                        </Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                          placeholder="000.000.000-00"
                          className="mt-1.5 h-11 border-2"
                        />
                      </div>
                    )}

                    {petition.collect_comment && (
                      <div>
                        <Label htmlFor="comment" className="text-sm font-bold text-gray-900">
                          Por que você apoia? (opcional)
                        </Label>
                        <Textarea
                          id="comment"
                          value={formData.comment}
                          onChange={(e) => setFormData({...formData, comment: e.target.value})}
                          placeholder="Compartilhe sua razão..."
                          className="mt-1.5 h-20 resize-none border-2"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={signMutation.isPending}
                      className="w-full text-white text-base h-14 font-black shadow-xl hover:shadow-2xl transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
                      }}
                    >
                      {signMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          Assinar Petição
                          <CheckCircle className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center leading-relaxed">
                      Ao assinar, você concorda em receber atualizações sobre esta petição
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col items-center mt-8 space-y-4">
              <div className="flex flex-wrap gap-3 justify-center">
                {socialShares.map((social) => (
                  <button
                    key={social.name}
                    onClick={() => handleShare(social)}
                    className={`group flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r ${social.color} text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                  >
                    <social.icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{social.name}</span>
                  </button>
                ))}
              </div>
              
              <Button
                onClick={copyLink}
                variant="secondary"
                size="lg"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-2 border-white/30 font-bold shadow-xl"
              >
                <LinkIcon className="w-5 h-5 mr-2" />
                Copiar Link
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-2xl p-0 border-0 bg-transparent overflow-hidden">
          <div className="relative">
            <div 
              className="absolute inset-0 opacity-20 blur-3xl"
              style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` }}
            />
            
            <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden">
              <div 
                className="relative p-8 text-center"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` 
                }}
              >
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="w-24 h-24 mx-auto mb-4 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle className="w-14 h-14 text-white" />
                </div>
                <h2 className="text-4xl font-black text-white mb-2">
                  Obrigado por Assinar!
                </h2>
                <p className="text-white/90 text-lg">
                  Sua voz foi ouvida! Agora compartilhe para amplificar o impacto
                </p>
              </div>

              <CardContent className="p-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-black text-gray-900">{(signatures.length + (showSuccessModal ? 1 : 0)).toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-gray-600">Assinaturas</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-black text-gray-900">{petition.goal.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-gray-600">Meta</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-black text-gray-900">{Math.min(((signatures.length + (showSuccessModal ? 1 : 0)) / petition.goal) * 100, 100).toFixed(0)}%</p>
                    <p className="text-xs text-gray-600">Progresso</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-black text-gray-900 text-center mb-4">
                    Compartilhe nas Redes Sociais
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {socialShares.map((social) => (
                      <button
                        key={social.name}
                        onClick={() => handleShare(social)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${social.color} text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                      >
                        <social.icon className="w-8 h-8" />
                        <span className="text-sm">{social.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={copyLink}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <LinkIcon className="w-8 h-8" />
                      <span className="text-sm">Copiar Link</span>
                    </button>
                  </div>

                  <Button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full mt-6 h-14 text-lg font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
                    }}
                  >
                    Continuar Navegando
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}