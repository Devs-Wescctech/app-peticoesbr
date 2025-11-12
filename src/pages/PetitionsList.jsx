import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  TrendingUp,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  CheckCircle2,
  FileEdit,
  PauseCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api";

export default function PetitionsList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("todas");
  const itemsPerPage = 9;

  const {
    data: petitions = [],
    isLoading: isLoadingPetitions,
    error: petitionsError,
  } = useQuery({
    queryKey: ["petitions"],
    queryFn: () => base44.entities.Petition.list(),
  });

  const {
    data: signatures = [],
    isLoading: isLoadingSignatures,
    error: signaturesError,
  } = useQuery({
    queryKey: ["signatures"],
    queryFn: () => base44.entities.Signature.list(),
  });

  const getSignaturesForPetition = (petitionId) =>
    signatures.filter((s) => s.petition_id === petitionId).length;

  // Filtro client-side (texto e status)
  const filteredPetitions = petitions.filter((p) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      (p.title || "").toLowerCase().includes(s) ||
      (p.description || "").toLowerCase().includes(s);
    const matchesStatus =
      statusFilter === "todas" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginação
  const totalPages = Math.ceil(filteredPetitions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPetitions = filteredPetitions.slice(startIndex, endIndex);

  const statusCounts = {
    todas: petitions.length,
    publicada: petitions.filter((p) => p.status === "publicada").length,
    rascunho: petitions.filter((p) => p.status === "rascunho").length,
    pausada: petitions.filter((p) => p.status === "pausada").length,
  };

  const statusConfig = {
    todas: {
      label: "Todas",
      icon: Sparkles,
      color: "indigo",
      activeClass: "bg-indigo-500 text-white",
      inactiveClass: "text-gray-600 hover:text-indigo-600",
    },
    publicada: {
      label: "Publicadas",
      icon: CheckCircle2,
      color: "green",
      activeClass: "bg-green-500 text-white",
      inactiveClass: "text-gray-600 hover:text-green-600",
    },
    rascunho: {
      label: "Rascunhos",
      icon: FileEdit,
      color: "amber",
      activeClass: "bg-amber-500 text-white",
      inactiveClass: "text-gray-600 hover:text-amber-600",
    },
    pausada: {
      label: "Pausadas",
      icon: PauseCircle,
      color: "gray",
      activeClass: "bg-gray-500 text-white",
      inactiveClass: "text-gray-600 hover:text-gray-600",
    },
  };

  if (isLoadingPetitions || isLoadingSignatures) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-600">
        Carregando petições…
      </div>
    );
  }

  if (petitionsError || signaturesError) {
    return (
      <div className="min-h-screen grid place-items-center text-red-600 p-6 text-center">
        <div>
          <div className="font-semibold mb-2">Erro ao carregar dados</div>
          <div className="text-sm opacity-80">
            {(petitionsError || signaturesError)?.message || "desconhecido"}
          </div>
          <div className="mt-4 text-xs opacity-70">
            Verifique se o backend está rodando corretamente na porta 3001.
          </div>
        </div>
      </div>
    );
  }

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
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/30">
                  {filteredPetitions.length}{" "}
                  {filteredPetitions.length === 1 ? "Petição" : "Petições"}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                Minhas Petições
              </h1>
              <p className="text-lg text-white/90">
                Gerencie e acompanhe o impacto das suas causas
              </p>
            </div>
            <Button
              onClick={() => navigate(createPageUrl("CreatePetition"))}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-white/90 shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Petição
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        {/* Search & Filters Card */}
        <Card className="p-6 shadow-xl border-none bg-white/80 backdrop-blur-xl mb-8">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar petições por título ou descrição..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 h-12 border-gray-200 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Modern Tab Filters */}
          <div className="relative">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {Object.entries(statusCounts).map(([status, count]) => {
                const config = statusConfig[status];
                const isActive = statusFilter === status;
                const Icon = config.icon;
                return (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-300 relative ${
                      isActive
                        ? config.activeClass + " shadow-lg"
                        : config.inactiveClass + " hover:bg-white/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{config.label}</span>
                    <Badge
                      variant="secondary"
                      className={`${
                        isActive
                          ? "bg-white/30 text-white border-white/30"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Petitions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentPetitions.map((petition, index) => {
            const signatureCount = getSignaturesForPetition(petition.id);
            const progress = Math.min(
              (signatureCount / (petition.goal || 1)) * 100,
              100
            );

            const statusColors = {
              publicada: "bg-green-100 text-green-800",
              rascunho: "bg-yellow-100 text-yellow-800",
              pausada: "bg-gray-100 text-gray-800",
              concluida: "bg-blue-100 text-blue-800",
            };

            return (
              <motion.div
                key={petition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(`PetitionDetails?id=${petition.id}`)}>
                  <Card className="overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full bg-white">
                    {/* Banner */}
                    <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                      {petition.banner_url ? (
                        <img
                          src={petition.banner_url}
                          alt={petition.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <TrendingUp className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <Badge className={statusColors[petition.status]}>
                          {petition.status}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg line-clamp-2 mb-1">
                          {petition.title}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {petition.description}
                      </p>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-900">
                            {signatureCount.toLocaleString("pt-BR")} assinaturas
                          </span>
                          <span className="text-gray-600">
                            Meta: {(petition.goal || 0).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 relative"
                            style={{ width: `${progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {progress.toFixed(0)}% alcançado
                          </span>
                          <ExternalLink className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`rounded-xl ${
                      currentPage === page
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                        : ""
                    }`}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {filteredPetitions.length === 0 && (
          <div className="text-center py-16">
            <TrendingUp className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma petição encontrada
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Tente ajustar os filtros de busca"
                : "Crie sua primeira petição para começar"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
