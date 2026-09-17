import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Car, Check, ChevronLeft, ChevronRight, CircleDollarSign, FileText, Hotel, MapPin, Menu, Plus, ReceiptText, Utensils, X, AlertTriangle, RefreshCw } from "lucide-react";
import { catalogForRegion, getCatalog, type Accommodation, type Vehicle, type FoodEstablishment, type Dish, type OrderItemSnapshot, type TravelRequestSnapshot } from "../lib/catalog";

export const Route = createFileRoute("/")({ component: TravelHome });
type Step = 1 | 2 | 3 | 4 | 5;
const steps = [{ id: 1, label: "Deslocação", icon: MapPin }, { id: 2, label: "Transporte", icon: Car }, { id: 3, label: "Hospedagem", icon: Hotel }, { id: 4, label: "Alimentação", icon: Utensils }, { id: 5, label: "Revisão", icon: FileText }] as const;
const money = (n: number) => `${n.toLocaleString("pt-MZ")} MT`;
const isoToday = "2026-09-18";
const isoReturn = "2026-09-21";

function daysBetween(start: string, end: string) {
  const a = new Date(`${start}T00:00:00`).getTime();
  const b = new Date(`${end}T00:00:00`).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return 1;
  return Math.max(1, Math.ceil((b - a) / 86400000));
}

function TravelHome() {
  const [open, setOpen] = useState(false), [step, setStep] = useState<Step>(1), [origin, setOrigin] = useState("Maputo"), [destination, setDestination] = useState("Maputo"), [traveller, setTraveller] = useState(""), [reason, setReason] = useState(""), [departure, setDeparture] = useState(isoToday), [returnDate, setReturnDate] = useState(isoReturn), [transportDays, setTransportDays] = useState(daysBetween(isoToday, isoReturn)), [nights, setNights] = useState(daysBetween(isoToday, isoReturn)), [transport, setTransport] = useState<Vehicle | null>(null), [hotel, setHotel] = useState<Accommodation | null>(null), [food, setFood] = useState<FoodEstablishment | null>(null), [selectedDishes, setSelectedDishes] = useState<Dish[]>([]), [catalogVersion, setCatalogVersion] = useState(0);

  useEffect(() => {
    const fn = () => setCatalogVersion(v => v + 1);
    window.addEventListener("catalog-updated", fn);
    window.addEventListener("storage", fn);
    return () => { window.removeEventListener("catalog-updated", fn); window.removeEventListener("storage", fn); };
  }, []);

  const options = useMemo(() => catalogForRegion(destination), [destination, catalogVersion]);
  useEffect(() => {
    if (transport && !options.veiculos.some(v => v.id === transport.id)) setTransport(null);
    if (hotel && !options.hospedagens.some(h => h.id === hotel.id)) setHotel(null);
    if (food && !options.estabelecimentos.some(e => e.id === food.id)) { setFood(null); setSelectedDishes([]); }
    setSelectedDishes(current => current.filter(d => options.estabelecimentos.some(e => e.id === d.estabelecimento_id)));
  }, [destination, catalogVersion]);

  useEffect(() => {
    if (returnDate < departure) setReturnDate(departure);
    const calculatedDays = daysBetween(departure, returnDate);
    setTransportDays(calculatedDays);
    setNights(calculatedDays);
  }, [departure, returnDate]);

  const foodTotal = selectedDishes.reduce((sum, dish) => sum + dish.preco, 0);
  const total = (transport ? transport.preco_dia * transportDays : 0) + (hotel ? hotel.preco_noite * nights : 0) + foodTotal;

  function close() { setOpen(false); setStep(1); }

  function submit() {
    const fresh = getCatalog();
    const invalid: string[] = [];
    if (transport) {
      const current = fresh.veiculos.find(v => v.id === transport.id);
      if (!current || current.estado !== "Ativo" || !current.regioes.some(r => r.trim() === destination.trim())) invalid.push(`Transporte: ${transport.nome}`);
    }
    if (hotel) {
      const current = fresh.hospedagens.find(h => h.id === hotel.id);
      if (!current || current.estado !== "Ativo" || current.regiao.trim() !== destination.trim()) invalid.push(`Hospedagem: ${hotel.nome}`);
    }
    if (food) {
      const current = fresh.estabelecimentos.find(e => e.id === food.id);
      if (!current || current.estado !== "Ativo" || current.regiao.trim() !== destination.trim()) invalid.push(`Estabelecimento: ${food.nome}`);
    }
    selectedDishes.forEach(dish => {
      const current = fresh.pratos.find(d => d.id === dish.id);
      if (!current || current.estado !== "Disponível" || !food || current.estabelecimento_id !== food.id) invalid.push(`Prato: ${dish.nome}`);
    });
    if (invalid.length) {
      alert(`Alguns itens deixaram de estar disponíveis antes do envio:\n\n${invalid.join("\n")}\n\nEscolha novamente apenas estes itens. O restante do pedido foi preservado.`);
      setStep(2);
      return;
    }

    const notes: string[] = [];
    if (!options.veiculos.length) notes.push(`Cliente pediu transporte em ${destination}, mas não há opções cadastradas.`);
    if (!options.hospedagens.length) notes.push(`Cliente pediu hospedagem em ${destination}, mas não há opções cadastradas.`);
    if (!options.estabelecimentos.length) notes.push(`Cliente pediu alimentação em ${destination}, mas não há opções cadastradas.`);

    const vehicleSnapshot: TravelRequestSnapshot["itens_pedido"]["transporte"] = transport ? { catalogo_id: transport.id, nome: transport.nome, preco: transport.preco_dia, categoria: transport.categoria, quantidade: transportDays } : null;
    const hotelSnapshot: TravelRequestSnapshot["itens_pedido"]["hospedagem"] = hotel ? { catalogo_id: hotel.id, nome: hotel.nome, preco: hotel.preco_noite, categoria: hotel.tipo, quantidade: nights } : null;
    const dishSnapshots: OrderItemSnapshot[] = selectedDishes.map(dish => ({ catalogo_id: dish.id, nome: dish.nome, preco: dish.preco, categoria: dish.categoria_prato }));
    const snapshot: TravelRequestSnapshot = { id: `CT-${Date.now()}`, createdAt: new Date().toISOString(), origin, destination, traveller, reason, data_ida: departure, data_volta: returnDate, dias_transporte: transportDays, noites_hospedagem: nights, itens_pedido: { transporte: vehicleSnapshot, hospedagem: hotelSnapshot, alimentacao: dishSnapshots }, notas_automaticas: notes, total };
    localStorage.setItem(`travel-request-${snapshot.id}`, JSON.stringify(snapshot));
    alert("Pedido criado e enviado para revisão da agência.");
    close();
  }

  return <div className="min-h-screen bg-[#f8f8f6] text-[#252525]">
    <header className="sticky top-0 z-30 border-b border-[#e6e3de] bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-8"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CD0219] text-sm font-bold text-white">CT</div><div><div className="font-semibold">Corporate Travel</div><div className="text-[11px] text-[#77736d]">Gestão de viagens empresariais</div></div></div><nav className="hidden items-center gap-7 text-sm text-[#62605b] md:flex"><span className="font-medium text-[#252525]">Visão geral</span><span>Pedidos</span><span>Faturas</span><span>Relatórios</span></nav><div className="flex items-center gap-3"><div className="hidden text-right sm:block"><div className="text-sm font-medium">Empresa Exemplo, Lda.</div><div className="text-[11px] text-[#77736d]">Aprovador financeiro</div></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eeeae5] text-sm font-semibold">EE</div><Menu size={19} className="md:hidden" /></div></div></header>
    <main className="mx-auto max-w-[1400px] px-5 py-8 lg:px-8"><div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="mb-2 text-sm font-medium text-[#CD0219]">Painel da empresa</p><h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">Bom dia. O que precisa de organizar?</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#706d67]">Monte uma viagem completa num único pedido. A agência prepara a cotação e acompanha o processo consigo.</p></div><div className="flex gap-2"><Link to="/admin/catalog" className="hidden rounded-lg border border-[#ddd9d3] px-4 py-2.5 text-sm font-medium md:inline-flex">Catálogo admin</Link><button onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#CD0219] px-5 text-sm font-semibold text-white hover:bg-[#a90115]"><Plus size={18}/> Novo Pedido de Viagem</button></div></div><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={ReceiptText} label="Pedidos este mês" value="18" detail="+4 face ao mês anterior"/><Metric icon={CircleDollarSign} label="Gasto este mês" value="1.284.600 MT" detail="23% do orçamento mensal"/><Metric icon={FileText} label="Faturas pendentes" value="4" detail="2 vencem esta semana" alert/><Metric icon={CalendarDays} label="Próximas viagens" value="7" detail="Nos próximos 30 dias"/></section><section className="mt-8 grid gap-6 xl:grid-cols-[1fr_330px]"><div className="rounded-xl border border-[#e5e2dc] bg-white"><div className="border-b px-5 py-4"><h2 className="font-semibold">Pedidos recentes</h2><p className="mt-1 text-xs text-[#817d76]">Acompanhe os pedidos da sua empresa</p></div>{["CT-2026-0184","CT-2026-0181","CT-2026-0175"].map((id, i) => <div key={id} className="grid gap-2 border-b px-5 py-4 last:border-0 md:grid-cols-[120px_1fr_140px_145px] md:items-center"><span className="text-xs font-semibold text-[#6e6a64]">{id}</span><div><div className="text-sm font-medium">{["Visita ao projeto de Nampula","Reunião operacional","Auditoria regional"][i]}</div><div className="mt-1 text-xs text-[#817d76]">{["Marta Joaquim · 18–21 Set","Carlos Matola · 22–23 Set","Ana Ernesto · 25–29 Set"][i]}</div></div><span className="text-sm font-semibold md:text-right">{["128.400 MT","46.800 MT","91.250 MT"][i]}</span><Status label={["Aguardando aprovação","Em revisão","Aprovado"][i]}/></div>)}</div><aside className="rounded-xl border border-[#e5e2dc] bg-white p-5"><h2 className="font-semibold">Limite de crédito</h2><p className="mt-1 text-xs text-[#817d76]">Condições atuais da empresa</p><div className="mt-6 flex justify-between text-sm"><span>Disponível</span><strong>3.715.400 MT</strong></div><div className="mt-3 h-2 rounded-full bg-[#eeeae5]"><div className="h-full w-[54%] rounded-full bg-[#CD0219]" /></div><div className="mt-2 flex justify-between text-[11px] text-[#817d76]"><span>Utilizado: 4.284.600 MT</span><span>8.000.000 MT</span></div></aside></section></main>
    {open && <Wizard step={step} setStep={setStep} origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination} traveller={traveller} setTraveller={setTraveller} reason={reason} setReason={setReason} departure={departure} setDeparture={setDeparture} returnDate={returnDate} setReturnDate={setReturnDate} transportDays={transportDays} setTransportDays={setTransportDays} nights={nights} setNights={setNights} options={options} catalogVersion={catalogVersion} transport={transport} setTransport={setTransport} hotel={hotel} setHotel={setHotel} food={food} setFood={setFood} selectedDishes={selectedDishes} setSelectedDishes={setSelectedDishes} total={total} foodTotal={foodTotal} close={close} submit={submit} />}
  </div>;
}

function Metric({ icon: Icon, label, value, detail, alert = false }: { icon: any; label: string; value: string; detail: string; alert?: boolean }) { return <div className="rounded-xl border border-[#e5e2dc] bg-white p-5"><div className="flex justify-between text-xs text-[#77736d]"><span>{label}</span><Icon size={18} className={alert ? "text-[#CD0219]" : ""}/></div><div className="mt-3 text-xl font-semibold">{value}</div><div className={`mt-1 text-[11px] ${alert ? "text-[#CD0219]" : "text-[#817d76]"}`}>{detail}</div></div>; }
function Status({ label }: { label: string }) { const c = label === "Aprovado" ? "bg-[#e8f3eb] text-[#267244]" : label.startsWith("Aguardando") ? "bg-[#fff3d9] text-[#8b6500]" : "bg-[#f0eeeb] text-[#625f59]"; return <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-medium ${c}`}>{label}</span>; }

function Wizard(p: any) {
  const [foodType, setFoodType] = useState("Restaurante");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    if (p.step < 2 || p.step > 4) return;
    setLoading(true); setLoadError("");
    const timer = window.setTimeout(() => {
      try { getCatalog(); if (active) { setLoading(false); setRefresh(v => v + 1); } }
      catch { if (active) { setLoading(false); setLoadError(`Não foi possível obter as opções de ${p.step === 2 ? "transporte" : p.step === 3 ? "hospedagem" : "alimentação"}.`); } }
    }, 180);
    return () => { active = false; window.clearTimeout(timer); };
  }, [p.step, p.destination, p.catalogVersion]);

  useEffect(() => {
    if (!p.food) { setDishes([]); return; }
    const current = getCatalog().pratos.filter(d => d.estabelecimento_id === p.food.id && d.estado === "Disponível").sort((a, b) => a.ordem - b.ordem);
    setDishes(current);
    p.setSelectedDishes((selected: Dish[]) => selected.filter(d => current.some(c => c.id === d.id)));
  }, [p.food, p.catalogVersion, refresh]);

  const next = () => p.setStep(Math.min(5, p.step + 1) as Step);
  const back = () => p.setStep(Math.max(1, p.step - 1) as Step);
  const selectDish = (dish: Dish) => p.setSelectedDishes((current: Dish[]) => current.some(d => d.id === dish.id) ? current.filter(d => d.id !== dish.id) : [...current, dish]);

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 md:items-center md:p-6"><div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:h-[850px] md:rounded-2xl"><div className="flex items-center justify-between border-b px-5 py-4"><div><div className="text-xs font-semibold text-[#CD0219]">Novo pedido de viagem</div><h2 className="mt-1 font-semibold">Monte o pedido passo a passo</h2></div><button onClick={p.close}><X size={20}/></button></div><div className="flex min-h-0 flex-1"><aside className="hidden w-56 border-r bg-[#faf9f7] p-4 md:block">{steps.map(s => <button key={s.id} onClick={() => p.setStep(s.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm ${p.step === s.id ? "bg-white font-semibold text-[#CD0219]" : "text-[#77736d]"}`}><span className="flex h-7 w-7 items-center justify-center rounded-full border">{p.step > s.id ? <Check size={14}/> : <s.icon size={14}/>}</span>{s.label}</button>)}</aside><div className="flex min-w-0 flex-1 flex-col"><div className="border-b px-5 py-3 text-xs text-[#CD0219] md:hidden">Passo {p.step} de 5 · {steps[p.step - 1].label}</div><div className="flex-1 overflow-y-auto px-5 py-7 lg:px-8">{p.step === 1 && <StepOne {...p}/>} {p.step === 2 && (loading ? <Loading text={`A procurar veículos disponíveis em ${p.destination}...`} /> : loadError ? <LoadError text={loadError} retry={() => setRefresh(v => v + 1)} /> : <StepTransport {...p}/>)} {p.step === 3 && (loading ? <Loading text={`A procurar hospedagens disponíveis em ${p.destination}...`} /> : loadError ? <LoadError text={loadError} retry={() => setRefresh(v => v + 1)} /> : <StepHotel {...p}/>)} {p.step === 4 && (loading ? <Loading text={`A procurar opções de alimentação em ${p.destination}...`} /> : loadError ? <LoadError text={loadError} retry={() => setRefresh(v => v + 1)} /> : <StepFood {...p} foodType={foodType} setFoodType={setFoodType} dishes={dishes} selectDish={selectDish}/>)} {p.step === 5 && <StepReview {...p}/>}</div><div className="flex justify-between border-t px-5 py-4"><button onClick={p.step === 1 ? p.close : back} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm">{p.step === 1 ? "Cancelar" : <><ChevronLeft size={16}/> Voltar</>}</button>{p.step < 5 ? <button onClick={next} className="inline-flex items-center gap-2 rounded-lg bg-[#CD0219] px-5 py-2.5 text-sm font-semibold text-white">Continuar <ChevronRight size={16}/></button> : <button onClick={p.submit} className="inline-flex items-center gap-2 rounded-lg bg-[#CD0219] px-5 py-2.5 text-sm font-semibold text-white">Enviar Pedido <ArrowRight size={16}/></button>}</div></div><aside className="hidden w-72 border-l bg-[#faf9f7] p-5 lg:block"><div className="text-xs font-semibold uppercase text-[#817d76]">Resumo</div><div className="mt-5 space-y-4"><Summary label="Deslocação" value={`${p.origin} → ${p.destination}`}/><Summary label="Transporte" value={p.transport ? `${p.transport.nome} · ${p.transportDays} dias` : "Não selecionado"} price={p.transport ? money(p.transport.preco_dia * p.transportDays) : undefined}/><Summary label="Hospedagem" value={p.hotel ? `${p.hotel.nome} · ${p.nights} noites` : "Não selecionada"} price={p.hotel ? money(p.hotel.preco_noite * p.nights) : undefined}/><Summary label="Alimentação" value={p.food ? `${p.food.nome} · ${p.selectedDishes.length} prato(s)` : "Não selecionada"} price={p.foodTotal ? money(p.foodTotal) : undefined}/></div><div className="mt-7 border-t pt-5 flex justify-between font-semibold"><span>Estimado</span><span>{money(p.total)}</span></div></aside></div></div></div>;
}

function Loading({ text }: { text: string }) { return <div className="mx-auto max-w-3xl rounded-xl border border-[#e5e2dc] bg-white p-12 text-center"><RefreshCw className="mx-auto animate-spin text-[#CD0219]" size={24}/><div className="mt-4 text-sm font-medium">{text}</div><div className="mt-1 text-xs text-[#817d76]">Aguarde enquanto consultamos o catálogo.</div></div>; }
function LoadError({ text, retry }: { text: string; retry: () => void }) { return <div className="mx-auto max-w-3xl rounded-xl border border-[#ead5d5] bg-[#fffafa] p-10 text-center"><AlertTriangle className="mx-auto text-[#CD0219]" size={25}/><div className="mt-3 text-sm font-semibold">{text}</div><p className="mt-1 text-xs text-[#77736d]">Tente novamente para carregar as opções.</p><button onClick={retry} className="mt-5 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"><RefreshCw size={15}/> Tentar novamente</button></div>; }
function Empty({ type, region }: { type: string; region: string }) { return <div className="rounded-xl border border-dashed border-[#d9d5cf] bg-[#faf9f7] p-8 text-center"><div className="text-sm font-semibold">Ainda não temos opções de {type} cadastradas para {region}.</div><p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-[#77736d]">A nossa equipa vai entrar em contacto para resolver isto diretamente. Pode avançar com o pedido mesmo assim.</p><div className="mt-3 text-[11px] font-medium text-[#CD0219]">A confirmação com a agência será anexada automaticamente ao pedido.</div></div>; }
function StepTitle({ n, title, text }: { n: number; title: string; text: string }) { return <div><div className="text-xs font-semibold uppercase tracking-wide text-[#CD0219]">Passo {n}</div><h3 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h3><p className="mt-2 text-sm leading-6 text-[#77736d]">{text}</p></div>; }
function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) { return <label className="block text-xs font-medium">{label}<input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="mt-1.5 h-11 w-full rounded-lg border border-[#dcd8d1] px-3 text-sm outline-none focus:border-[#CD0219]"/></label>; }
function StepOne(p: any) { return <div className="mx-auto max-w-2xl"><StepTitle n={1} title="Para onde é a viagem?" text="Indique origem, destino e os dados básicos da deslocação."/><div className="mt-7 grid gap-4 sm:grid-cols-2"><Input label="Origem" value={p.origin} onChange={p.setOrigin}/><Input label="Destino" value={p.destination} onChange={p.setDestination}/><Input label="Data de ida" value={p.departure} onChange={p.setDeparture} type="date"/><Input label="Data de volta" value={p.returnDate} onChange={p.setReturnDate} type="date"/><Input label="Motivo da viagem" value={p.reason} onChange={p.setReason} placeholder="Ex.: Reunião com cliente"/><Input label="Colaborador" value={p.traveller} onChange={p.setTraveller} placeholder="Nome completo"/></div></div>; }
function Card({ selected, onClick, img, title, meta, price, extra }: { selected: boolean; onClick: () => void; img?: string; title: string; meta: string; price: string; extra?: string }) { return <button onClick={onClick} className={`overflow-hidden rounded-xl border text-left transition ${selected ? "border-[#CD0219] ring-1 ring-[#CD0219]" : "border-[#e1ddd7] hover:border-[#bbb6ae]"}`}>{img ? <img src={img} alt={title} className="h-36 w-full object-cover"/> : <div className="flex h-36 items-center justify-center bg-[#f1eee9] text-xs text-[#817d76]">Sem fotografia cadastrada</div>}<div className="p-4"><div className="font-semibold">{title}</div><div className="mt-1 text-xs text-[#817d76]">{meta}</div>{extra && <div className="mt-2 text-[10px] text-[#625f59]">{extra}</div>}<div className="mt-3 text-sm font-semibold">{price}</div></div></button>; }
function StepTransport(p: any) { return <div className="mx-auto max-w-3xl"><StepTitle n={2} title="Vai precisar de carro no destino?" text={`Opções ativas cadastradas exatamente para ${p.destination}.`}/><div className="mt-4 flex items-center gap-3 rounded-lg bg-[#faf9f7] p-3"><label className="text-xs font-medium">Dias de transporte<input type="number" min="1" value={p.transportDays} onChange={e => p.setTransportDays(Math.max(1, Number(e.target.value) || 1))} className="ml-2 h-9 w-20 rounded border px-2 text-sm"/></label></div><div className="mt-5 grid gap-4 sm:grid-cols-3">{p.options.veiculos.map((v: Vehicle) => <Card key={v.id} selected={p.transport?.id === v.id} onClick={() => p.setTransport(v)} img={v.fotos[0]} title={v.nome} meta={`${v.categoria} · ${v.capacidade} passageiros`} price={`${money(v.preco_dia)} / dia`} extra={v.com_motorista ? "Com motorista" : "Sem motorista"}/>)}</div>{!p.options.veiculos.length && <div className="mt-5"><Empty type="transporte" region={p.destination}/></div>}</div>; }
function StepHotel(p: any) { return <div className="mx-auto max-w-3xl"><StepTitle n={3} title="Vai precisar de hospedagem?" text={`Opções ativas cadastradas exatamente para ${p.destination}.`}/><div className="mt-4 flex items-center gap-3 rounded-lg bg-[#faf9f7] p-3"><label className="text-xs font-medium">Noites de hospedagem<input type="number" min="1" value={p.nights} onChange={e => p.setNights(Math.max(1, Number(e.target.value) || 1))} className="ml-2 h-9 w-20 rounded border px-2 text-sm"/></label><span className="text-[11px] text-[#817d76]">Pré-calculadas pelas datas do Passo 1; pode editar.</span></div><div className="mt-5 grid gap-4 md:grid-cols-3">{p.options.hospedagens.map((h: Accommodation) => <Card key={h.id} selected={p.hotel?.id === h.id} onClick={() => p.setHotel(h)} img={h.fotos[0]} title={h.nome} meta={`${h.tipo} · ${h.bairro}`} price={`${money(h.preco_noite)} / noite`} extra={h.comodidades.join(" · ")}/>)}</div>{!p.options.hospedagens.length && <div className="mt-5"><Empty type="hospedagem" region={p.destination}/></div>}</div>; }
function StepFood(p: any) { const cats = ["Pequeno-almoço", "Entrada", "Prato principal", "Sobremesa", "Bebida"]; const establishments = p.options.estabelecimentos.filter((e: FoodEstablishment) => e.tipo === p.foodType); return <div className="mx-auto max-w-3xl"><StepTitle n={4} title="Vai precisar de alimentação?" text={`Estabelecimentos ativos com cardápio disponível em ${p.destination}.`}/><div className="mt-7 flex gap-2 overflow-x-auto">{["Restaurante", "Lanchonete", "Take-away"].map(t => <button key={t} onClick={() => p.setFoodType(t)} className={`rounded-lg border px-4 py-2 text-sm ${p.foodType === t ? "border-[#CD0219] bg-[#fff8f8] text-[#CD0219]" : "border-[#ddd9d3]"}`}>{t}</button>)}</div><div className="mt-5 grid gap-4 md:grid-cols-3">{establishments.map((e: FoodEstablishment) => <Card key={e.id} selected={p.food?.id === e.id} onClick={() => { p.setFood(e); p.setSelectedDishes([]); }} img={e.fotos[0]} title={e.nome} meta={`${e.tipo} · ${e.bairro}`} price="Cardápio disponível"/>)}</div>{!establishments.length && <div className="mt-5"><Empty type="alimentação" region={p.destination}/></div>}{p.food && <div className="mt-6 rounded-xl border bg-[#faf9f7] p-5"><div className="flex items-center justify-between gap-3"><div><div className="font-semibold">Cardápio de {p.food.nome}</div><div className="mt-1 text-xs text-[#817d76]">Selecione os pratos necessários. O preço fica congelado no pedido no momento da seleção.</div></div><div className="text-sm font-semibold">{p.selectedDishes.length} selecionado(s)</div></div>{p.dishes.length ? cats.map(cat => { const list = p.dishes.filter((d: Dish) => d.categoria_prato === cat); return list.length ? <div key={cat} className="mt-5"><div className="text-xs font-semibold uppercase text-[#817d76]">{cat}</div>{list.map((d: Dish) => { const selected = p.selectedDishes.some((x: Dish) => x.id === d.id); return <button key={d.id} onClick={() => p.selectDish(d)} className={`mt-2 flex w-full items-center gap-3 rounded-lg border p-3 text-left ${selected ? "border-[#CD0219] bg-[#fff8f8]" : "border-[#e1ddd7] bg-white"}`}>{d.foto ? <img src={d.foto} alt={d.nome} className="h-14 w-14 rounded-md object-cover"/> : null}<div className="min-w-0 flex-1"><div className="text-sm font-medium">{d.nome}</div>{d.descricao && <div className="mt-1 text-xs text-[#817d76]">{d.descricao}</div>}</div><span className="whitespace-nowrap text-sm font-semibold">{money(d.preco)}</span>{selected && <Check size={17} className="text-[#CD0219]"/>}</button>; })}</div> : null; }) : <Empty type="pratos" region={p.food.nome}/>}</div>}</div>; }
function StepReview(p: any) { return <div className="mx-auto max-w-3xl"><StepTitle n={5} title="Revise o pedido antes de enviar" text="Os itens guardam o preço próprio deste pedido. Alterações posteriores no catálogo não alteram pedidos já iniciados."/><div className="mt-7 space-y-4"><div className="rounded-xl border bg-white divide-y"><Summary label="Deslocação" value={`${p.origin} → ${p.destination}`} /><Summary label="Datas" value={`${p.departure} → ${p.returnDate}`} /><Summary label="Transporte" value={p.transport ? `${p.transport.nome} · ${p.transportDays} dias` : "A confirmar com a agência"} price={p.transport ? money(p.transport.preco_dia * p.transportDays) : "—"}/><Summary label="Hospedagem" value={p.hotel ? `${p.hotel.nome} · ${p.nights} noites` : "A confirmar com a agência"} price={p.hotel ? money(p.hotel.preco_noite * p.nights) : "—"}/><Summary label="Alimentação" value={p.food ? `${p.food.nome} · ${p.selectedDishes.length} prato(s)` : "A confirmar com a agência"} price={p.foodTotal ? money(p.foodTotal) : "—"}/><div className="flex justify-between bg-[#faf9f7] px-4 py-5 font-semibold"><span>Total estimado</span><span>{money(p.total)}</span></div></div><div className="rounded-xl border border-[#ead5d5] bg-[#fffafa] p-4 text-xs text-[#6e6a64]">Antes do envio, o sistema verifica novamente se todos os itens escolhidos continuam Ativos/Disponíveis no catálogo. Se algum tiver sido desativado, somente esse item será pedido novamente.</div></div></div>; }
function Summary({ label, value, price }: { label: string; value: string; price?: string }) { return <div className="flex items-center justify-between gap-4 px-4 py-4"><div><div className="text-[11px] uppercase text-[#9a958d]">{label}</div><div className="mt-1 text-sm font-medium">{value}</div></div>{price && <div className="text-sm font-semibold">{price}</div>}</div>; }
