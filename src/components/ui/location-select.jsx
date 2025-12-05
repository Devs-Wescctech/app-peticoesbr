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
