import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  TrendingUp, 
  CheckCircle,
  Heart,
  Target,
  MessageCircle,
  Facebook,
  Twitter,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  ArrowLeft
} from "lucide-react";

const demoPetition = {
  title: "Construção da Nova Praça Central",
  description: "A nossa cidade merece um espaço de lazer moderno e acessível para todas as famílias. Esta petição solicita a construção de uma nova praça central com área verde, playground infantil, academia ao ar livre, pista de caminhada e espaço para eventos culturais. O projeto prevê iluminação LED sustentável, bancos acessíveis, banheiros públicos e estacionamento para bicicletas. A praça será um ponto de encontro para a comunidade, promovendo saúde, bem-estar e integração social entre os moradores do bairro.",
  goal: 5000,
  signatureCount: 1847,
  logo_url: "https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=200&h=200&fit=crop",
  banner_url: "https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?w=1920&h=1080&fit=crop",
  primary_color: "#16a34a"
};

export default function PetitionDemo() {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    state: "",
    city: "",
  });

  const progress = Math.min((demoPetition.signatureCount / demoPetition.goal) * 100, 100);
  const primaryColor = demoPetition.primary_color;

  return (
    <div className="min-h-screen bg-black">
      {demoPetition.banner_url ? (
        <div 
          className="fixed inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${demoPetition.banner_url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90" />
        </div>
      ) : (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar (Esta é uma página de demonstração)
          </a>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="text-center mb-12">
            {demoPetition.logo_url && (
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div 
                    className="absolute -inset-3 rounded-2xl blur-xl opacity-40"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30">
                    <img
                      src={demoPetition.logo_url}
                      alt={demoPetition.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
              {demoPetition.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-white">{demoPetition.signatureCount.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-white/60">assinaturas</p>
                </div>
              </div>

              <div className="w-px h-8 bg-white/20" />

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-white">{demoPetition.goal.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-white/60">meta</p>
                </div>
              </div>

              <div className="w-px h-8 bg-white/20" />

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-green-400">{progress.toFixed(0)}%</p>
                  <p className="text-xs text-white/60">concluído</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3 space-y-6">
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/30 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-purple-300" />
                    </div>
                    Sobre esta petição
                  </h2>
                  
                  <div className="text-white/85 leading-relaxed">
                    <p>
                      {showFullDescription || demoPetition.description.length <= 200
                        ? demoPetition.description
                        : `${demoPetition.description.slice(0, 200)}...`}
                    </p>
                    {demoPetition.description.length > 200 && (
                      <button
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-3 inline-flex items-center gap-1.5 text-purple-300 hover:text-purple-200 text-sm font-semibold transition-colors"
                      >
                        {showFullDescription ? (
                          <>Ver menos <ChevronUp className="w-4 h-4" /></>
                        ) : (
                          <>Ler mais <ChevronDown className="w-4 h-4" /></>
                        )}
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold text-white/70 mb-3">Progresso da petição</h3>
                  <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-white/60">{demoPetition.signatureCount.toLocaleString('pt-BR')} assinaturas</span>
                    <span className="text-white/60">Meta: {demoPetition.goal.toLocaleString('pt-BR')}</span>
                  </div>
                  <p className="text-white/80 text-sm mt-3">
                    Faltam <span className="font-bold text-white">{(demoPetition.goal - demoPetition.signatureCount).toLocaleString('pt-BR')}</span> assinaturas para atingir a meta!
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">
                  <Facebook className="w-5 h-5" />
                  Facebook
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors">
                  <Twitter className="w-5 h-5" />
                  Twitter
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-colors">
                  <LinkIcon className="w-5 h-5" />
                  Copiar Link
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-6">
                <Card className="border-none shadow-2xl bg-white overflow-hidden">
                  <div 
                    className="relative p-5 text-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)` 
                    }}
                  >
                    <div className="w-14 h-14 mx-auto mb-2 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-1">
                      Assine Agora
                    </h3>
                    <p className="text-white/90 text-sm">
                      Junte-se a {demoPetition.signatureCount.toLocaleString('pt-BR')} pessoas
                    </p>
                  </div>

                  <CardContent className="p-5">
                    <form className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-bold text-gray-700">
                          Nome Completo *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Seu nome"
                          className="mt-1.5 h-11 border-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm font-bold text-gray-700">
                          Email *
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

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="state" className="text-sm font-bold text-gray-700">
                            Estado
                          </Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                            placeholder="UF"
                            className="mt-1.5 h-11 border-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="city" className="text-sm font-bold text-gray-700">
                            Cidade
                          </Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            placeholder="Sua cidade"
                            className="mt-1.5 h-11 border-2"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        className="w-full text-white text-base h-12 font-black shadow-xl hover:shadow-2xl transition-all"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`
                        }}
                        onClick={() => alert('Esta é apenas uma demonstração!')}
                      >
                        Assinar Petição
                        <CheckCircle className="w-5 h-5 ml-2" />
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        Ao assinar, você concorda em receber atualizações
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
