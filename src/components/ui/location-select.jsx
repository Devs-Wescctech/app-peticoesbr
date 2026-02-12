import * as React from "react";
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function EstadoSelect({ value, onChange, disabled }) {
  const [open, setOpen] = React.useState(false);
  
  const estados = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" }
  ];

  const selectedEstado = estados.find(e => e.sigla === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-11 border-2 bg-white hover:bg-gray-50"
        >
          {selectedEstado ? (
            <span className="truncate">{selectedEstado.sigla} - {selectedEstado.nome}</span>
          ) : (
            <span className="text-muted-foreground">Selecione o estado...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar estado..." />
          <CommandList>
            <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
            <CommandGroup>
              {estados.map((estado) => (
                <CommandItem
                  key={estado.sigla}
                  value={`${estado.sigla} ${estado.nome}`}
                  onSelect={() => {
                    onChange(estado.sigla);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === estado.sigla ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="font-medium">{estado.sigla}</span>
                  <span className="ml-2 text-muted-foreground">{estado.nome}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function CidadeSelect({ value, onChange, uf, disabled }) {
  const [open, setOpen] = React.useState(false);
  const [cidades, setCidades] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    if (uf) {
      setLoading(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
        .then(res => res.json())
        .then(data => {
          setCidades(data.map(c => ({ id: c.id, nome: c.nome })));
          setLoading(false);
        })
        .catch(() => {
          setCidades([]);
          setLoading(false);
        });
    } else {
      setCidades([]);
    }
  }, [uf]);

  const filteredCidades = cidades.filter(cidade =>
    cidade.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || !uf}
          className="w-full justify-between h-11 border-2 bg-white hover:bg-gray-50"
        >
          {value ? (
            <span className="truncate">{value}</span>
          ) : (
            <span className="text-muted-foreground">
              {!uf ? "Selecione o estado primeiro" : "Selecione a cidade..."}
            </span>
          )}
          {loading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar cidade..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCidades.length === 0 ? (
              <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredCidades.slice(0, 100).map((cidade) => (
                  <CommandItem
                    key={cidade.id}
                    value={cidade.nome}
                    onSelect={() => {
                      onChange(cidade.nome);
                      setOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === cidade.nome ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {cidade.nome}
                  </CommandItem>
                ))}
                {filteredCidades.length > 100 && (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground text-center">
                    Mostrando 100 de {filteredCidades.length} cidades. Digite para filtrar.
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

let cachedMunicipios = null;
let fetchPromise = null;

function fetchAllMunicipios() {
  if (cachedMunicipios) return Promise.resolve(cachedMunicipios);
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome")
    .then(res => res.json())
    .then(data => {
      cachedMunicipios = data.map(m => ({
        id: m.id,
        nome: m.nome,
        uf: m.microrregiao.mesorregiao.UF.sigla,
      }));
      return cachedMunicipios;
    })
    .catch(() => {
      fetchPromise = null;
      return [];
    });
  return fetchPromise;
}

export function CidadeUnificadaSelect({
  cityValue,
  stateValue,
  onCityChange,
  onStateChange,
  disabled,
  placeholder = "Digite o nome da cidade...",
}) {
  const [municipios, setMunicipios] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [inputValue, setInputValue] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const wrapperRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    fetchAllMunicipios().then(data => {
      setMunicipios(data);
      setLoading(false);
    });
  }, []);

  React.useEffect(() => {
    if (cityValue && stateValue) {
      setInputValue(`${cityValue} - ${stateValue}`);
    } else if (cityValue) {
      setInputValue(cityValue);
    } else {
      setInputValue("");
    }
  }, [cityValue, stateValue]);

  React.useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizeStr = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filtered = React.useMemo(() => {
    if (inputValue.length < 3) return [];
    const term = normalizeStr(inputValue);
    return municipios.filter(m => normalizeStr(m.nome).includes(term));
  }, [inputValue, municipios]);

  const displayedResults = filtered.slice(0, 20);
  const hasMore = filtered.length > 20;

  function handleInputChange(e) {
    const val = e.target.value;
    setInputValue(val);
    setSelectedIndex(-1);
    setShowDropdown(true);
    if (cityValue || stateValue) {
      onCityChange("");
      onStateChange("");
    }
  }

  function handleSelect(m) {
    onCityChange(m.nome);
    onStateChange(m.uf);
    setInputValue(`${m.nome} - ${m.uf}`);
    setShowDropdown(false);
    setSelectedIndex(-1);
  }

  function handleKeyDown(e) {
    if (!showDropdown || displayedResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < displayedResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : displayedResults.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(displayedResults[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 3 && setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          placeholder={loading ? "Carregando cidades..." : placeholder}
          className={cn(
            "flex h-11 w-full rounded-md border-2 border-input bg-white px-3 py-2 text-sm",
            "ring-offset-background placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "pr-10"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {showDropdown && inputValue.length >= 3 && !loading && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-[260px] overflow-y-auto">
          {displayedResults.length === 0 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground text-center">
              Nenhuma cidade encontrada.
            </div>
          ) : (
            <>
              {displayedResults.map((m, idx) => (
                <div
                  key={m.id}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer flex items-center gap-2",
                    "hover:bg-gray-100",
                    idx === selectedIndex && "bg-gray-100"
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(m)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span className="truncate">{m.nome}</span>
                  <span className="text-muted-foreground shrink-0">- {m.uf}</span>
                </div>
              ))}
              {hasMore && (
                <div className="px-3 py-2 text-xs text-muted-foreground text-center border-t">
                  Digite mais para refinar ({filtered.length} resultados)
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
