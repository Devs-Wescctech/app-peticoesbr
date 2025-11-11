
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Filter,
  X,
  CheckCircle,
  Calendar,
  MapPin,
  FileText,
  Search
} from "lucide-react";

export default function ContactSelector({ 
  petitions, 
  signatures, 
  selectedPetitions, 
  onPetitionsChange,
  filters,
  onFiltersChange,
  type = 'whatsapp' // 'whatsapp' or 'email'
}) {
  const [showFilters, setShowFilters] = useState(false);

  // Calcula contatos filtrados
  const filteredContacts = useMemo(() => {
    let contacts = signatures;

    // Filtro por petições selecionadas
    if (selectedPetitions.length > 0) {
      contacts = contacts.filter(s => selectedPetitions.includes(s.petition_id));
    }

    // Filtro por tipo de contato (email/phone)
    if (type === 'whatsapp') {
      contacts = contacts.filter(s => s.phone);
    } else {
      contacts = contacts.filter(s => s.email);
    }

    // Filtro por cidade
    if (filters.city) {
      contacts = contacts.filter(s => 
        s.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filtro por estado
    if (filters.state) {
      contacts = contacts.filter(s => 
        s.state?.toLowerCase().includes(filters.state.toLowerCase())
      );
    }

    // Filtro por data
    if (filters.dateFrom) {
      contacts = contacts.filter(s => 
        new Date(s.created_date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      contacts = contacts.filter(s => 
        new Date(s.created_date) <= new Date(filters.dateTo)
      );
    }

    // Remove duplicados por email/phone
    const uniqueKey = type === 'whatsapp' ? 'phone' : 'email';
    const seen = new Set();
    return contacts.filter(contact => {
      const key = contact[uniqueKey];
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [signatures, selectedPetitions, filters, type]);

  const handlePetitionToggle = (petitionId) => {
    if (selectedPetitions.includes(petitionId)) {
      onPetitionsChange(selectedPetitions.filter(id => id !== petitionId));
    } else {
      onPetitionsChange([...selectedPetitions, petitionId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPetitions.length === petitions.length) {
      onPetitionsChange([]);
    } else {
      onPetitionsChange(petitions.map(p => p.id));
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      city: '',
      state: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 font-bold">
            <Users className="w-5 h-5 text-indigo-600" />
            Seleção de Contatos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-base font-bold px-3 py-1 bg-indigo-600 text-white">
              {filteredContacts.length}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-2 font-semibold transition-all ${
                activeFiltersCount > 0 
                  ? 'border-indigo-500 text-indigo-700 bg-indigo-50' 
                  : 'border-gray-300 hover:border-indigo-300'
              }`}
            >
              <Filter className="w-4 h-4 mr-1" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-indigo-600 text-white">{activeFiltersCount}</Badge>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seleção de Petições */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-bold text-gray-900">
              Selecione as Petições
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
            >
              {selectedPetitions.length === petitions.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-1">
            {petitions.map((petition) => {
              const petitionSignatures = signatures.filter(s => 
                s.petition_id === petition.id && (type === 'whatsapp' ? s.phone : s.email)
              );
              const isSelected = selectedPetitions.includes(petition.id);

              return (
                <button
                  key={petition.id}
                  type="button"
                  onClick={() => handlePetitionToggle(petition.id)}
                  className={`text-left p-3 rounded-xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-indigo-500 bg-gradient-to-br from-indigo-100 to-purple-100 shadow-md scale-[1.02]'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-white bg-white/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500 shadow-sm'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm mb-1 ${
                        isSelected ? 'text-indigo-900' : 'text-gray-900'
                      }`}>
                        {petition.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          <Users className="w-3 h-3 mr-1" />
                          {petitionSignatures.length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros Avançados */}
        {showFilters && (
          <div className="space-y-3 p-4 bg-white rounded-xl border-2 border-indigo-200 shadow-inner animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-bold flex items-center gap-2 text-gray-900">
                <Filter className="w-4 h-4 text-indigo-600" />
                Filtros Avançados
              </Label>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold"
                >
                  <X className="w-3 h-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1 text-gray-700">
                  <MapPin className="w-3 h-3 text-indigo-600" />
                  Cidade
                </Label>
                <Input
                  placeholder="Ex: São Paulo"
                  value={filters.city || ''}
                  onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
                  className="text-sm border-2 focus:border-indigo-400"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1 text-gray-700">
                  <MapPin className="w-3 h-3 text-indigo-600" />
                  Estado
                </Label>
                <Input
                  placeholder="Ex: SP"
                  value={filters.state || ''}
                  onChange={(e) => onFiltersChange({ ...filters, state: e.target.value })}
                  className="text-sm border-2 focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1 text-gray-700">
                  <Calendar className="w-3 h-3 text-indigo-600" />
                  Data Inicial
                </Label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                  className="text-sm border-2 focus:border-indigo-400"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold mb-1.5 flex items-center gap-1 text-gray-700">
                  <Calendar className="w-3 h-3 text-indigo-600" />
                  Data Final
                </Label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                  className="text-sm border-2 focus:border-indigo-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview de Contatos */}
        <Card className="bg-white rounded-xl border-2 border-indigo-200 shadow-inner">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs font-bold text-gray-900">
                Preview dos Contatos Selecionados
              </Label>
              <Badge variant="secondary" className="text-xs font-bold bg-indigo-100 text-indigo-700">
                {filteredContacts.length}
              </Badge>
            </div>

            {filteredContacts.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filteredContacts.slice(0, 5).map((contact, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs p-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {contact.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{contact.name}</p>
                      <p className="text-gray-600 truncate text-xs">
                        {type === 'whatsapp' ? contact.phone : contact.email}
                      </p>
                    </div>
                  </div>
                ))}
                {filteredContacts.length > 5 && (
                  <p className="text-xs text-center text-indigo-700 pt-2 font-semibold">
                    + {filteredContacts.length - 5} contatos
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-500 font-medium">
                  Nenhum contato selecionado
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
