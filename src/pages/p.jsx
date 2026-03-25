import { base44 } from "@/api";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EstadoSelect, CidadeSelect, CidadeUnificadaSelect } from "@/components/ui/location-select";
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
  Sparkles,
  ChevronDown,
  ChevronUp,
  Instagram
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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedLgpd, setAcceptedLgpd] = useState(false);
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
    queryKey: ['petition-public', slug],
    queryFn: async () => {
      const response = await fetch(`/api/petitions/slug/${slug}`);
      if (!response.ok) throw new Error('Petition not found');
      return response.json();
    },
    enabled: !!slug,
  });

  const { data: signatureCount } = useQuery({
    queryKey: ['signature-count-public', petition?.id],
    queryFn: async () => {
      const response = await fetch(`/api/signatures/petition/${petition.id}/count`);
      if (!response.ok) return { count: 0 };
      return response.json();
    },
    enabled: !!petition?.id,
  });

  const signatures = [];
  const signatureCountValue = signatureCount?.count || 0;

  const signMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Enviando assinatura:', data);
      const response = await fetch('/api/signatures/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      console.log('Response status:', response.status);
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        let errorMsg = `Erro ao assinar: ${response.status}`;
        try {
          const errorData = JSON.parse(text);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signature-count-public', petition?.id] });
      setShowSuccessModal(true);
      setFormData({ name: "", email: "", phone: "", city: "", state: "", cpf: "", comment: "" });
    },
    onError: (error) => {
      alert(`Erro ao assinar: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acceptedTerms || !acceptedLgpd) return;
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

  const progress = Math.min((signatureCountValue / petition.goal) * 100, 100);
  const primaryColor = petition.primary_color || "#6366f1";
  const landingUrl = window.location.href;
  const ogShareUrl = slug
    ? `${window.location.origin}/api/share/petition/${slug}`
    : landingUrl;
  
  const shareText = petition.share_text 
    ? petition.share_text.replace('{link}', ogShareUrl)
    : `Acabei de assinar "${petition.title}". Junte-se a mim! ${ogShareUrl}`;

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
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ogShareUrl)}`
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
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(ogShareUrl)}`
    },
    {
      name: "Telegram",
      icon: Send,
      color: "from-cyan-500 to-cyan-600",
      url: `https://t.me/share/url?url=${encodeURIComponent(ogShareUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: "Instagram",
      icon: Instagram,
      color: "from-pink-500 via-purple-500 to-orange-500",
      url: `https://www.instagram.com/`
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
          url: ogShareUrl,
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
    navigator.clipboard.writeText(ogShareUrl);
    alert('Link copiado para área de transferência!');
  };

  const renderVideo = (url) => {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0`}
          className="w-full aspect-video rounded-2xl shadow-2xl border-4 border-white/20"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          className="w-full aspect-video rounded-2xl shadow-2xl border-4 border-white/20"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <video
        src={url}
        controls
        className="w-full aspect-video rounded-2xl shadow-2xl border-4 border-white/20 object-cover"
      />
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {petition.banner_url ? (
          <div className="absolute inset-0">
            <img
              src={petition.banner_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'blur(25px) brightness(0.7) saturate(1.2)', transform: 'scale(1.2)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${primaryColor}4D, ${primaryColor}4D)` }} />
          </div>
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${primaryColor}cc, ${primaryColor}99)` }} />
        )}

        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', backgroundColor: `${primaryColor}33` }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s', backgroundColor: `${primaryColor}33` }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s', backgroundColor: `${primaryColor}1A` }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto">
            {petition.video_url ? (
              <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-lg">
                  {renderVideo(petition.video_url)}
                </div>
              </div>
            ) : petition.logo_url ? (
              <div className="flex justify-center mb-8">
                <div className="relative group">
                  <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}cc, ${primaryColor}99)` }} />
                  <div className="relative max-w-xs md:max-w-sm lg:max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                    <img
                      src={petition.logo_url}
                      alt={petition.title}
                      className="w-full h-auto max-h-[300px] md:max-h-[400px] object-contain"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <h1 className={`font-black text-white mb-6 leading-tight tracking-tight text-center ${
              petition.title.length > 80
                ? 'text-xl md:text-2xl lg:text-3xl'
                : petition.title.length > 50
                ? 'text-2xl md:text-3xl lg:text-4xl'
                : petition.title.length > 30
                ? 'text-3xl md:text-4xl lg:text-5xl'
                : 'text-4xl md:text-6xl lg:text-7xl'
            }`}>
              {petition.title}
            </h1>

            <div className="max-w-3xl mx-auto mb-10 text-center">
              <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                {showFullDescription || petition.description.length <= 250
                  ? petition.description
                  : `${petition.description.slice(0, 250)}...`}
              </p>
              {petition.description.length > 250 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white/90 hover:text-white text-sm font-semibold transition-all"
                >
                  {showFullDescription ? (
                    <>
                      Ver menos
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Ler descrição completa
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-black text-white">{signatureCountValue.toLocaleString('pt-BR')}</p>
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
                  Faltam <span className="font-bold text-white">{(petition.goal - signatureCountValue).toLocaleString('pt-BR')}</span> assinaturas!
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
                      Junte-se a {signatureCountValue.toLocaleString('pt-BR')} pessoas
                    </p>
                  </div>
                </div>

                <CardContent className="p-6 bg-white/95 backdrop-blur-sm">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className={`grid ${petition.collect_email ? 'md:grid-cols-2' : 'grid-cols-1'} gap-3`}>
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

                      {petition.collect_email && (
                        <div>
                          <Label htmlFor="email" className="text-sm font-bold text-gray-900">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="seu@email.com"
                            className="mt-1.5 h-11 border-2"
                          />
                        </div>
                      )}
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

                    {(petition.collect_state || petition.collect_city) && (
                      <div>
                        <Label htmlFor="city" className="text-sm font-bold text-gray-900">
                          Localidade
                        </Label>
                        <div className="mt-1.5">
                          <CidadeUnificadaSelect
                            cityValue={formData.city}
                            stateValue={formData.state}
                            onCityChange={(value) => setFormData(prev => ({...prev, city: value}))}
                            onStateChange={(value) => setFormData(prev => ({...prev, state: value}))}
                            placeholder="Digite sua cidade..."
                          />
                        </div>
                      </div>
                    )}

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

                    <div className="space-y-3 pt-1">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-current shrink-0"
                          style={{ accentColor: primaryColor }}
                        />
                        <span className="text-xs text-gray-600 leading-relaxed">
                          Li e aceito os{" "}
                          <a
                            href="/termos-de-uso"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold underline hover:opacity-80"
                            style={{ color: primaryColor }}
                          >
                            Termos de Uso e Política de Privacidade
                          </a>{" "}
                          da plataforma Petição BR.
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={acceptedLgpd}
                          onChange={(e) => setAcceptedLgpd(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-current shrink-0"
                          style={{ accentColor: primaryColor }}
                        />
                        <span className="text-xs text-gray-600 leading-relaxed">
                          {petition.lgpd_text || "Declaro estar ciente e de acordo com o tratamento dos meus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD) para os fins desta petição."}
                        </span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={signMutation.isPending || !acceptedTerms || !acceptedLgpd}
                      className="w-full text-white text-base h-14 font-black shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: (!acceptedTerms || !acceptedLgpd)
                          ? '#9ca3af'
                          : `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
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
        <DialogContent className="max-w-md p-0 border-0 bg-transparent overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden">
              <div 
                className="relative p-5 text-center"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` 
                }}
              >
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="absolute top-3 right-3 w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                <div className="w-16 h-16 mx-auto mb-3 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">
                  Obrigado por Assinar!
                </h2>
                <p className="text-white/90 text-sm">
                  Compartilhe para amplificar o impacto
                </p>
              </div>

              <CardContent className="p-5">
                <div className="grid grid-cols-3 gap-2 mb-5">
                  <div className="text-center p-2.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <p className="text-lg font-black text-gray-900">{(signatureCountValue + (showSuccessModal ? 1 : 0)).toLocaleString('pt-BR')}</p>
                    <p className="text-[10px] text-gray-600">Assinaturas</p>
                  </div>
                  <div className="text-center p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <p className="text-lg font-black text-gray-900">{petition.goal.toLocaleString('pt-BR')}</p>
                    <p className="text-[10px] text-gray-600">Meta</p>
                  </div>
                  <div className="text-center p-2.5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <p className="text-lg font-black text-gray-900">{Math.min(((signatureCountValue + (showSuccessModal ? 1 : 0)) / petition.goal) * 100, 100).toFixed(0)}%</p>
                    <p className="text-[10px] text-gray-600">Progresso</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-900 text-center">
                    Compartilhe nas Redes Sociais
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {socialShares.map((social) => (
                      <button
                        key={social.name}
                        onClick={() => handleShare(social)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-lg bg-gradient-to-br ${social.color} text-white font-bold shadow hover:shadow-md transition-all duration-300 hover:scale-105`}
                      >
                        <social.icon className="w-5 h-5" />
                        <span className="text-[10px]">{social.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={copyLink}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 text-white font-bold shadow hover:shadow-md transition-all duration-300 hover:scale-105"
                    >
                      <LinkIcon className="w-5 h-5" />
                      <span className="text-[10px]">Copiar Link</span>
                    </button>
                  </div>

                  <Button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full mt-3 h-11 text-sm font-bold"
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