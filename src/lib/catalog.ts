export type VehicleCategory = "Económico" | "Sedan" | "SUV" | "Van/Minibus" | "Executivo";
export type AccommodationType = "Hotel" | "Apartamento mobilado" | "Pensão/Guest House";
export type FoodType = "Restaurante" | "Lanchonete" | "Take-away";
export type DishCategory = "Pequeno-almoço" | "Entrada" | "Prato principal" | "Sobremesa" | "Bebida";

export interface Vehicle { id: string; nome: string; categoria: VehicleCategory; capacidade: number; com_motorista: boolean; motorista_contacto: string; preco_dia: number; regioes: string[]; fotos: string[]; estado: "Ativo" | "Inativo"; observacoes_internas: string; }
export interface Accommodation { id: string; nome: string; tipo: AccommodationType; regiao: string; bairro: string; preco_noite: number; comodidades: string[]; fotos: string[]; contacto: string; estado: "Ativo" | "Inativo"; observacoes_internas: string; }
export interface FoodEstablishment { id: string; nome: string; tipo: FoodType; regiao: string; bairro: string; fotos: string[]; contacto: string; estado: "Ativo" | "Inativo"; }
export interface Dish { id: string; estabelecimento_id: string; nome: string; categoria_prato: DishCategory; descricao: string; preco: number; foto: string; ordem: number; estado: "Disponível" | "Indisponível"; }

const KEY = "corporate-travel-catalog-v1";
const seed = {
  veiculos: [
    { id: "v1", nome: "Toyota Hilux", categoria: "SUV", capacidade: 5, com_motorista: true, motorista_contacto: "Contacto interno", preco_dia: 7500, regioes: ["Maputo", "Nampula"], fotos: ["https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1000&q=80"], estado: "Ativo", observacoes_internas: "Unidade principal." },
    { id: "v2", nome: "Hyundai Accent", categoria: "Sedan", capacidade: 5, com_motorista: false, motorista_contacto: "", preco_dia: 4200, regioes: ["Maputo"], fotos: ["https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1000&q=80"], estado: "Ativo", observacoes_internas: "" }
  ] as Vehicle[],
  hospedagens: [
    { id: "h1", nome: "Hotel Cardoso", tipo: "Hotel", regiao: "Maputo", bairro: "Polana", preco_noite: 6800, comodidades: ["Pequeno-almoço incluído", "Wi-Fi", "Ar condicionado", "Estacionamento"], fotos: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"], contacto: "Contacto interno", estado: "Ativo", observacoes_internas: "" },
    { id: "h2", nome: "Residencial Palmeiras", tipo: "Pensão/Guest House", regiao: "Nampula", bairro: "Central", preco_noite: 5200, comodidades: ["Wi-Fi", "Estacionamento"], fotos: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=80"], contacto: "Contacto interno", estado: "Ativo", observacoes_internas: "" }
  ] as Accommodation[],
  estabelecimentos: [
    { id: "f1", nome: "Costa do Sol", tipo: "Restaurante", regiao: "Maputo", bairro: "Costa do Sol", fotos: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80"], contacto: "Contacto interno", estado: "Ativo" },
    { id: "f2", nome: "Zambi", tipo: "Restaurante", regiao: "Maputo", bairro: "Baixa", fotos: ["https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=80"], contacto: "Contacto interno", estado: "Ativo" }
  ] as FoodEstablishment[],
  pratos: [
    { id: "d1", estabelecimento_id: "f1", nome: "Peixe grelhado", categoria_prato: "Prato principal", descricao: "Peixe fresco grelhado com acompanhamento.", preco: 950, foto: "", ordem: 1, estado: "Disponível" },
    { id: "d2", estabelecimento_id: "f1", nome: "Sumo natural", categoria_prato: "Bebida", descricao: "Sumo natural do dia.", preco: 250, foto: "", ordem: 1, estado: "Disponível" },
    { id: "d3", estabelecimento_id: "f2", nome: "Frango à zambeze", categoria_prato: "Prato principal", descricao: "Prato tradicional da casa.", preco: 850, foto: "", ordem: 1, estado: "Disponível" }
  ] as Dish[]
};

export type CatalogData = typeof seed;

export function getCatalog(): CatalogData {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as CatalogData;
    window.localStorage.setItem(KEY, JSON.stringify(seed));
  } catch {}
  return seed;
}

export function saveCatalog(data: CatalogData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("catalog-updated"));
}

export function catalogForRegion(region: string) {
  const data = getCatalog();
  const normalized = region.trim().toLocaleLowerCase();
  return {
    veiculos: data.veiculos.filter(v => v.estado === "Ativo" && v.regioes.some(r => r.toLocaleLowerCase() === normalized)),
    hospedagens: data.hospedagens.filter(h => h.estado === "Ativo" && h.regiao.toLocaleLowerCase() === normalized),
    estabelecimentos: data.estabelecimentos.filter(e => e.estado === "Ativo" && e.regiao.toLocaleLowerCase() === normalized && data.pratos.some(p => p.estabelecimento_id === e.id && p.estado === "Disponível"))
  };
}

export const vehicleCategories: VehicleCategory[] = ["Económico", "Sedan", "SUV", "Van/Minibus", "Executivo"];
export const accommodationTypes: AccommodationType[] = ["Hotel", "Apartamento mobilado", "Pensão/Guest House"];
export const foodTypes: FoodType[] = ["Restaurante", "Lanchonete", "Take-away"];
export const dishCategories: DishCategory[] = ["Pequeno-almoço", "Entrada", "Prato principal", "Sobremesa", "Bebida"];
export const amenities = ["Pequeno-almoço incluído", "Wi-Fi", "Ar condicionado", "Estacionamento"];
