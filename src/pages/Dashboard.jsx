import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, FileText, Users, Target, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: petitions = [], isLoading: loadingPetitions } = useQuery({
    queryKey: ['petitions'],
    queryFn: () => base44.entities.Petition.list('-created_date'),
    initialData: [],
  });

  const { data: signatures = [], isLoading: loadingSignatures } = useQuery({
    queryKey: ['signatures'],
    queryFn: () => base44.entities.Signature.list(),
    initialData: [],
  });

  const activePetitions = petitions.filter(p => p.status === 'publicada');
  const totalSignatures = signatures.length;
  
  const getSignaturesForPetition = (petitionId) => {
    return signatures.filter(s => s.petition_id === petitionId).length;
  };

  const topPetitions = [...petitions]
    .map(p => ({
      ...p,
      signatureCount: getSignaturesForPetition(p.id)
    }))
    .sort((a, b) => b.signatureCount - a.signatureCount)
    .slice(0, 3);

  const stats = [
    {
      title: "Petições Ativas",
      value: activePetitions.length,
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total de Assinaturas",
      value: totalSignatures,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Total de Petições",
      value: petitions.length,
      icon: Target,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-xl rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/30 text-xs">
              Sistema de Petições
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tight">
            Dashboard Geral
          </h1>
          <p className="text-sm md:text-base text-white/90">
            Acompanhe o impacto das petições
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-6 relative z-10 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              className="relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 group bg-white"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Petitions */}
          <Card className="lg:col-span-2 border-none shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Petições Mais Populares
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {topPetitions.map((petition, index) => (
                  <Link
                    key={petition.id}
                    to={createPageUrl(`PetitionDetails?id=${petition.id}`)}
                    className="block group"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 border border-transparent hover:border-indigo-200">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-indigo-600 transition-colors">
                          {petition.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">
                            {petition.signatureCount} de {petition.goal} assinaturas
                          </span>
                          <span className="text-indigo-600 font-medium">
                            {Math.round((petition.signatureCount / petition.goal) * 100)}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((petition.signatureCount / petition.goal) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
                {topPetitions.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-4">Nenhuma petição criada ainda</p>
                    <Link to={createPageUrl("CreatePetition")}>
                      <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                        Criar Primeira Petição
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to={createPageUrl("CreatePetition")}>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-indigo-600 hover:bg-gray-100 justify-start gap-3 shadow-md font-semibold"
                >
                  <FileText className="w-5 h-5" />
                  Nova Petição
                </Button>
              </Link>
              <Link to={createPageUrl("PetitionsList")}>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-indigo-600 hover:bg-gray-100 justify-start gap-3 shadow-md font-semibold"
                >
                  <Users className="w-5 h-5" />
                  Ver Todas
                </Button>
              </Link>
              <Link to={createPageUrl("LinkBioPages")}>
                <Button 
                  variant="secondary" 
                  className="w-full bg-white text-indigo-600 hover:bg-gray-100 justify-start gap-3 shadow-md font-semibold"
                >
                  <Target className="w-5 h-5" />
                  Páginas LinkBio
                </Button>
              </Link>

              <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Dica do Dia
                </p>
                <p className="text-sm text-white/90">
                  Adicione imagens impactantes aos banners das suas petições para aumentar o engajamento!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-6 border-none shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {signatures.slice(0, 5).map((signature) => {
                const petition = petitions.find(p => p.id === signature.petition_id);
                return (
                  <div key={signature.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                      {signature.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {signature.name} assinou
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {petition?.title || 'Petição'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(signature.created_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                );
              })}
              {signatures.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma assinatura ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}