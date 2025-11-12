import { base44 } from "@/api";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, ExternalLink, Users, Target, Loader2, Share2, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function LinkTreeView() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  const { data: page, isLoading: loadingPage } = useQuery({
    queryKey: ['linktree-page', slug],
    queryFn: async () => {
      const pages = await base44.entities.LinkTreePage.list();
      return pages.find(p => p.slug === slug);
    },
  });

  const { data: petitions = [] } = useQuery({
    queryKey: ['petitions'],
    queryFn: () => base44.entities.Petition.list(),
    enabled: !!page,
  });

  const { data: signatures = [] } = useQuery({
    queryKey: ['signatures'],
    queryFn: () => base44.entities.Signature.list(),
    enabled: !!page,
  });

  if (loadingPage || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  const pagePetitions = petitions.filter(p => page.petition_ids?.includes(p.id));

  const getSignaturesForPetition = (petitionId) => {
    return signatures.filter(s => s.petition_id === petitionId).length;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: page.title,
          text: page.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado!');
    }
  };

  return (
    <div
      className="min-h-screen py-16 px-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${page.background_color} 0%, ${page.background_color}dd 50%, ${page.background_color}aa 100%)`
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse" 
             style={{ background: 'white', animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse" 
             style={{ background: 'white', animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header with Avatar */}
        <div className="text-center mb-10">
          {/* Avatar/Logo */}
          <div className="relative inline-block mb-6">
            <div className="absolute -inset-4 bg-white/30 rounded-full blur-2xl" />
            <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full shadow-2xl border-4 border-white/50 backdrop-blur-sm overflow-hidden bg-white">
              {page.avatar_url ? (
                <img
                  src={page.avatar_url}
                  alt={page.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
                  <Link2 className="w-16 h-16 md:w-20 md:h-20" style={{ color: page.background_color }} />
                </div>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-lg md:text-xl text-white/90 max-w-lg mx-auto leading-relaxed">
              {page.description}
            </p>
          )}

          {/* Share Button */}
          <Button
            onClick={handleShare}
            size="lg"
            className="mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border-2 border-white/30 font-bold shadow-xl"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Compartilhar Página
          </Button>
        </div>

        {/* Petitions Links - Com Banner e Logo */}
        <div className="space-y-6">
          {pagePetitions.map((petition) => {
            const signatureCount = getSignaturesForPetition(petition.id);
            const progress = Math.min((signatureCount / petition.goal) * 100, 100);
            const landingUrl = createPageUrl(`PetitionLanding?id=${petition.id}`);

            return (
              <Link key={petition.id} to={landingUrl}>
                <Card className="bg-white/95 backdrop-blur-sm border-none shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
                  {/* Banner da Petição */}
                  {petition.banner_url && (
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={petition.banner_url}
                        alt={petition.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Logo da Petição */}
                      {petition.logo_url && (
                        <div className={`shrink-0 ${petition.banner_url ? '-mt-10 relative z-10' : ''}`}>
                          <div className={`w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border-4 border-white ${petition.banner_url ? 'group-hover:border-opacity-80' : 'group-hover:border-indigo-300'} transition-all`}>
                            <img
                              src={petition.logo_url}
                              alt={petition.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      <div className={`flex-1 min-w-0 ${petition.logo_url && petition.banner_url ? '-mt-10 pt-2' : ''}`}>
                        <h3 className="font-black text-xl text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {petition.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {petition.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                              <Users className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {signatureCount.toLocaleString('pt-BR')}
                              </p>
                              <p className="text-xs text-gray-600">assinaturas</p>
                            </div>
                          </div>

                          <div className="w-px h-12 bg-gray-200" />

                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
                              <Target className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {petition.goal.toLocaleString('pt-BR')}
                              </p>
                              <p className="text-xs text-gray-600">meta</p>
                            </div>
                          </div>

                          <Badge
                            className="ml-auto text-sm font-bold px-3 py-1.5"
                            style={{
                              backgroundColor: `${page.background_color}20`,
                              color: page.background_color
                            }}
                          >
                            {progress.toFixed(0)}%
                          </Badge>
                        </div>

                        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: page.background_color
                            }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>
                      </div>

                      <ExternalLink
                        className="w-6 h-6 shrink-0 group-hover:translate-x-1 transition-all"
                        style={{ color: page.background_color }}
                      />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {pagePetitions.length === 0 && (
          <Card className="bg-white/95 backdrop-blur-sm border-none shadow-xl p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg font-medium">
              Nenhuma petição disponível nesta página
            </p>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
            <Heart className="w-4 h-4 text-white" />
            <p className="text-sm font-semibold text-white">
              Criado com PetiçõesBR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
