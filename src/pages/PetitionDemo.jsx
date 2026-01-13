import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  CheckCircle,
  Heart,
  MessageCircle,
  Facebook,
  Twitter,
  ChevronDown,
  ChevronUp,
  ArrowLeft
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const demoPetition = {
  title: "Construção da Nova Praça Central",
  description: "A nossa cidade merece um espaço de lazer moderno e acessível para todas as famílias. Esta petição solicita a construção de uma nova praça central com área verde, playground infantil, academia ao ar livre, pista de caminhada e espaço para eventos culturais. O projeto prevê iluminação LED sustentável, bancos acessíveis, banheiros públicos e estacionamento para bicicletas. A praça será um ponto de encontro para a comunidade, promovendo saúde, bem-estar e integração social entre os moradores do bairro.",
  goal: 5000,
  signatureCount: 1234,
  logo_url: "https://images.unsplash.com/photo-1569974507005-6dc61f97fb5c?w=200&h=200&fit=crop",
  banner_url: null,
  primary_color: "#7c3aed"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 min-h-screen">
        <header className="flex items-center justify-between px-8 py-6">
          <a 
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Petições</span>
          </a>
          
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </a>
        </header>

        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                  {demoPetition.title}
                </h1>
              </div>

              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
                <CardContent className="p-6">
                  <p className="text-white/85 leading-relaxed text-base">
                    {showFullDescription || demoPetition.description.length <= 180
                      ? demoPetition.description
                      : `${demoPetition.description.slice(0, 180)}...`}
                  </p>
                  {demoPetition.description.length > 180 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-4 inline-flex items-center gap-1.5 text-purple-300 hover:text-purple-200 text-sm font-semibold transition-colors"
                    >
                      {showFullDescription ? (
                        <>Ver menos <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>Ler mais <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  )}

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between text-white mb-2">
                      <span className="text-2xl font-black">{demoPetition.signatureCount.toLocaleString('pt-BR')}/{demoPetition.goal.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: primaryColor
                        }}
                      />
                    </div>
                    <p className="text-white/60 text-sm mt-2 text-right">{progress.toFixed(0)}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:sticky lg:top-8">
              <Card className="bg-white shadow-2xl overflow-hidden border-0">
                <div className="p-6 text-center border-b border-gray-100">
                  <p className="text-purple-600 font-bold text-sm mb-1">✦ Assine Agora ✦</p>
                </div>

                <CardContent className="p-6">
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm text-gray-600">
                        Nome *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder=""
                        className="mt-1 h-11 border-gray-200 bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm text-gray-600">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder=""
                        className="mt-1 h-11 border-gray-200 bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="state" className="text-sm text-gray-600">
                          * Estado *
                        </Label>
                        <Select
                          value={formData.state}
                          onValueChange={(value) => setFormData({...formData, state: value})}
                        >
                          <SelectTrigger className="mt-1 h-11 border-gray-200 bg-gray-50">
                            <SelectValue placeholder="" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SP">São Paulo</SelectItem>
                            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                            <SelectItem value="MG">Minas Gerais</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="city" className="text-sm text-gray-600">
                          Cidade *
                        </Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          placeholder=""
                          className="mt-1 h-11 border-gray-200 bg-gray-50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="w-full text-white text-base h-12 font-bold shadow-lg hover:shadow-xl transition-all mt-2"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
                      }}
                      onClick={() => alert('Esta é apenas uma demonstração!')}
                    >
                      ✦ Assinar Petição
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-4 mt-6">
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
