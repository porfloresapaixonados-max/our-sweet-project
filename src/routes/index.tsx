import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Hotel,
  MapPin,
  Menu,
  Plus,
  ReceiptText,
  Utensils,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: TravelHome });

type Step = 1 | 2 | 3 | 4 | 5;

const steps = [
  { id: 1, label: "Deslocação", icon: MapPin },
  { id: 2, label: "Transporte", icon: Car },
  { id: 3, label: "Hospedagem", icon: Hotel },
  { id: 4, label: "Alimentação", icon: Utensils },
  { id: 5, label: "Revisão", icon: FileText },
] as const;

const recentRequests = [
  { id: "CT-2026-0184", trip: "Visita ao projeto de Nampula", person: "Marta Joaquim", date: "18–21 Set", total: "128.400 MZN", status: "Aguardando aprovação" },
  { id: "CT-2026-0181", trip: "Reunião operacional", person: "Carlos Matola", date: "22–23 Set", total: "46.800 MZN", status: "Em revisão" },
  { id: "CT-2026-0175", trip: "Auditoria regional", person: "Ana Ernesto", date: "25–29 Set", total: "91.250 MZN", status: "Aprovado" },
];

const vehicles = [
  { name: "Toyota Corolla", category: "Económico", capacity: "4 lugares", price: 4200, image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=80" },
  { name: "Toyota Fortuner", category: "SUV", capacity: "7 lugares", price: 7200, image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80" },
  { name: "Toyota Hiace", category: "Van 7 lugares", capacity: "8 lugares", price: 8500, image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=80" },
];

const hotels = [
  { name: "Hotel Nampula Central", location: "Centro de Nampula", price: 6800, badge: "Pequeno-almoço incluído", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80" },
  { name: "Ruby Backpackers", location: "Nampula", price: 5200, badge: "Estacionamento", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80" },
  { name: "Grand Plaza", location: "Bairro Central", price: 8400, badge: "Pequeno-almoço incluído", image: "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=900&q=80" },
];

function money(value: number) {
  return `${value.toLocaleString("pt-MZ")} MZN`;
}

function TravelHome() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [transport, setTransport] = useState(true);
  const [hotel, setHotel] = useState(true);
  const [vehicle, setVehicle] = useState(vehicles[1]);
  const [hotelChoice, setHotelChoice] = useState(hotels[0]);
  const [origin, setOrigin] = useState("Nampula");
  const [destination, setDestination] = useState("Maputo");
  const [traveller, setTraveller] = useState("");
  const [reason, setReason] = useState("");

  const total = useMemo(() => {
    const nights = 3;
    const days = 4;
    return (transport ? vehicle.price * days : 0) + (hotel ? hotelChoice.price * nights : 0);
  }, [transport, hotel, vehicle, hotelChoice]);

  function resetWizard() {
    setStep(1);
    setTransport(true);
    setHotel(true);
    setTraveller("");
    setReason("");
  }

  function closeWizard() {
    setWizardOpen(false);
    resetWizard();
  }

  return (
    <div className="min-h-screen bg-[#f8f8f6] text-[#252525]">
      <header className="sticky top-0 z-30 border-b border-[#e6e3de] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CD0219] text-sm font-bold text-white">CT</div>
            <div>
              <div className="font-semibold tracking-tight">Corporate Travel</div>
              <div className="text-[11px] text-[#77736d]">Gestão de viagens empresariais</div>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-[#62605b] md:flex">
            <span className="font-medium text-[#252525]">Visão geral</span>
            <span>Pedidos</span>
            <span>Faturas</span>
            <span>Relatórios</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><div className="text-sm font-medium">Empresa Exemplo, Lda.</div><div className="text-[11px] text-[#77736d]">Aprovador financeiro</div></div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eeeae5] text-sm font-semibold">EE</div>
            <button className="md:hidden" aria-label="Abrir menu"><Menu size={20} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 py-7 lg:px-8 lg:py-9">
        <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-[#CD0219]">Painel da empresa</p>
            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">Bom dia. O que precisa de organizar?</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#706d67]">Monte uma viagem completa num único pedido. A agência prepara a cotação e acompanha o processo consigo.</p>
          </div>
          <button onClick={() => setWizardOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#CD0219] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a90115]">
            <Plus size={18} /> Novo Pedido de Viagem
          </button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={ReceiptText} label="Pedidos este mês" value="18" detail="+4 face ao mês anterior" />
          <Metric icon={CircleDollarSign} label="Gasto este mês" value="1.284.600 MZN" detail="23% do orçamento mensal" />
          <Metric icon={FileText} label="Faturas pendentes" value="4" detail="2 vencem esta semana" alert />
          <Metric icon={CalendarDays} label="Próximas viagens" value="7" detail="Nos próximos 30 dias" />
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_330px]">
          <div className="overflow-hidden rounded-xl border border-[#e5e2dc] bg-white">
            <div className="flex items-center justify-between border-b border-[#ece9e4] px-5 py-4">
              <div><h2 className="font-semibold">Pedidos recentes</h2><p className="mt-0.5 text-xs text-[#817d76]">Acompanhe os pedidos da sua empresa</p></div>
              <button className="text-xs font-semibold text-[#CD0219]">Ver todos</button>
            </div>
            <div className="divide-y divide-[#efede9]">
              {recentRequests.map((request) => (
                <div key={request.id} className="grid gap-3 px-5 py-4 md:grid-cols-[110px_1fr_120px_145px] md:items-center">
                  <div className="text-xs font-semibold text-[#6e6a64]">{request.id}</div>
                  <div><div className="text-sm font-medium">{request.trip}</div><div className="mt-1 text-xs text-[#817d76]">{request.person} · {request.date}</div></div>
                  <div className="text-sm font-semibold md:text-right">{request.total}</div>
                  <div className="md:text-right"><Status label={request.status} /></div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-xl border border-[#e5e2dc] bg-white p-5">
            <h2 className="font-semibold">Limite de crédito</h2>
            <p className="mt-1 text-xs text-[#817d76]">Condições atuais da sua empresa</p>
            <div className="mt-6 flex items-end justify-between"><span className="text-xs text-[#706d67]">Disponível</span><span className="text-lg font-semibold">3.715.400 MZN</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eeeae5]"><div className="h-full w-[54%] rounded-full bg-[#CD0219]" /></div>
            <div className="mt-2 flex justify-between text-[11px] text-[#817d76]"><span>Utilizado: 4.284.600 MZN</span><span>8.000.000 MZN</span></div>
            <div className="mt-6 border-t border-[#ece9e4] pt-5"><div className="text-xs text-[#817d76]">Prazo de pagamento</div><div className="mt-1 text-sm font-medium">30 dias após faturação</div></div>
          </aside>
        </section>

        <section className="mt-8 rounded-xl border border-[#e5e2dc] bg-white p-5 lg:p-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><h2 className="font-semibold">Acesso rápido</h2><p className="mt-1 text-xs text-[#817d76]">As tarefas mais frequentes da sua equipa</p></div></div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <QuickAction icon={Plus} title="Novo pedido" description="Organizar uma nova viagem" onClick={() => setWizardOpen(true)} />
            <QuickAction icon={FileText} title="Cotações para aprovar" description="2 aguardam a sua decisão" />
            <QuickAction icon={ReceiptText} title="Faturas" description="Consultar pagamentos e vencimentos" />
          </div>
        </section>
      </main>

      {wizardOpen && <Wizard step={step} setStep={setStep} onClose={closeWizard} origin={origin} setOrigin={setOrigin} destination={destination} setDestination={setDestination} traveller={traveller} setTraveller={setTraveller} reason={reason} setReason={setReason} transport={transport} setTransport={setTransport} hotel={hotel} setHotel={setHotel} vehicle={vehicle} setVehicle={setVehicle} hotelChoice={hotelChoice} setHotelChoice={setHotelChoice} total={total} />}
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail, alert = false }: { icon: typeof ReceiptText; label: string; value: string; detail: string; alert?: boolean }) {
  return <div className="rounded-xl border border-[#e5e2dc] bg-white p-5"><div className="flex items-center justify-between"><span className="text-xs font-medium text-[#77736d]">{label}</span><Icon size={18} className={alert ? "text-[#CD0219]" : "text-[#77736d]"} /></div><div className="mt-3 text-xl font-semibold tracking-tight">{value}</div><div className={"mt-1 text-[11px] " + (alert ? "text-[#CD0219]" : "text-[#817d76]")}>{detail}</div></div>;
}

function Status({ label }: { label: string }) {
  const positive = label === "Aprovado";
  const attention = label === "Aguardando aprovação";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${positive ? "bg-[#e8f3eb] text-[#247342]" : attention ? "bg-[#fff3d9] text-[#8b6500]" : "bg-[#f0eeeb] text-[#625f59]"}`}>{label}</span>;
}

function QuickAction({ icon: Icon, title, description, onClick }: { icon: typeof Plus; title: string; description: string; onClick?: () => void }) {
  return <button onClick={onClick} className="group flex items-center justify-between rounded-lg border border-[#e8e5df] p-4 text-left transition hover:border-[#CD0219]/40 hover:bg-[#fffafa]"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4f1ed] text-[#CD0219]"><Icon size={17} /></div><div><div className="text-sm font-medium">{title}</div><div className="mt-0.5 text-xs text-[#817d76]">{description}</div></div></div><ArrowRight size={16} className="text-[#aaa49b] transition group-hover:translate-x-0.5 group-hover:text-[#CD0219]" /></button>;
}

function Wizard(props: {
  step: Step; setStep: (step: Step) => void; onClose: () => void;
  origin: string; setOrigin: (v: string) => void; destination: string; setDestination: (v: string) => void;
  traveller: string; setTraveller: (v: string) => void; reason: string; setReason: (v: string) => void;
  transport: boolean; setTransport: (v: boolean) => void; hotel: boolean; setHotel: (v: boolean) => void;
  vehicle: typeof vehicles[number]; setVehicle: (v: typeof vehicles[number]) => void;
  hotelChoice: typeof hotels[number]; setHotelChoice: (v: typeof hotels[number]) => void; total: number;
}) {
  const { step, setStep, onClose } = props;
  const next = () => setStep(Math.min(5, step + 1) as Step);
  const back = () => setStep(Math.max(1, step - 1) as Step);
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#171717]/45 p-0 backdrop-blur-[2px] md:items-center md:p-6">
    <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:h-[850px] md:rounded-2xl">
      <div className="flex items-center justify-between border-b border-[#e7e4df] px-5 py-4 lg:px-7"><div><div className="text-xs font-medium text-[#CD0219]">Novo pedido de viagem</div><h2 className="mt-0.5 text-lg font-semibold">Monte o pedido passo a passo</h2></div><button onClick={onClose} className="rounded-lg p-2 text-[#77736d] hover:bg-[#f4f2ef]" aria-label="Fechar"><X size={20} /></button></div>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="hidden w-60 shrink-0 border-r border-[#e7e4df] bg-[#faf9f7] p-5 md:block"><div className="space-y-1">{steps.map((item) => { const Icon = item.icon; const active = step === item.id; const done = step > item.id; return <button key={item.id} onClick={() => setStep(item.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm ${active ? "bg-white font-semibold text-[#CD0219] shadow-sm" : "text-[#77736d] hover:bg-white"}`}><span className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${done ? "border-[#2f7a48] bg-[#e8f3eb] text-[#2f7a48]" : active ? "border-[#CD0219] text-[#CD0219]" : "border-[#d9d5cf]"}`}>{done ? <Check size={14} /> : <Icon size={14} />}</span>{item.label}</button>; })}</div></div>
        <div className="flex min-h-0 flex-1 flex-col"><div className="border-b border-[#eeeae5] px-5 py-3 md:hidden"><div className="flex items-center gap-2 text-xs font-medium text-[#CD0219]">Passo {step} de 5 <span className="text-[#aaa49b]">·</span> {steps[step - 1].label}</div><div className="mt-2 h-1 overflow-hidden rounded-full bg-[#eeeae5]"><div className="h-full rounded-full bg-[#CD0219]" style={{ width: `${step * 20}%` }} /></div></div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 lg:px-8">
            {step === 1 && <StepOne {...props} />}
            {step === 2 && <StepTwo {...props} />}
            {step === 3 && <StepThree {...props} />}
            {step === 4 && <StepFour />}
            {step === 5 && <StepFive {...props} />}
          </div>
          <div className="flex items-center justify-between border-t border-[#e7e4df] px-5 py-4 lg:px-8"><button onClick={step === 1 ? onClose : back} className="inline-flex items-center gap-2 rounded-lg border border-[#ddd9d3] px-4 py-2.5 text-sm font-medium hover:bg-[#f7f5f2]">{step === 1 ? "Cancelar" : <><ChevronLeft size={16} /> Voltar</>}</button>{step < 5 ? <button onClick={next} className="inline-flex items-center gap-2 rounded-lg bg-[#CD0219] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a90115]">Continuar <ChevronRight size={16} /></button> : <button onClick={onClose} className="inline-flex items-center gap-2 rounded-lg bg-[#CD0219] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a90115]">Enviar Pedido de Cotação <ArrowRight size={16} /></button>}</div>
        </div>
        <aside className="hidden w-72 shrink-0 border-l border-[#e7e4df] bg-[#faf9f7] p-5 lg:block"><div className="text-xs font-semibold uppercase tracking-wide text-[#817d76]">Resumo do pedido</div><div className="mt-5 space-y-4"><SummaryLine label="Deslocação" value={`${props.origin} → ${props.destination}`} /><SummaryLine label="Transporte" value={props.transport ? `${props.vehicle.name} · 4 dias` : "Não necessário"} price={props.transport ? money(props.vehicle.price * 4) : undefined} /><SummaryLine label="Hospedagem" value={props.hotel ? `${props.hotelChoice.name} · 3 noites` : "Não necessária"} price={props.hotel ? money(props.hotelChoice.price * 3) : undefined} /><SummaryLine label="Alimentação" value="A configurar" /></div><div className="mt-7 border-t border-[#dedad4] pt-5"><div className="flex items-center justify-between"><span className="text-sm font-medium">Subtotal</span><span className="text-lg font-semibold">{money(props.total)}</span></div><p className="mt-2 text-[11px] leading-4 text-[#817d76]">Os valores apresentados são baseados no catálogo atual e serão confirmados na cotação da agência.</p></div></aside>
      </div>
    </div>
  </div>;
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-[#4f4c47]">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-lg border border-[#dcd8d1] bg-white px-3 text-sm outline-none transition placeholder:text-[#aaa49b] focus:border-[#CD0219] focus:ring-2 focus:ring-[#CD0219]/10" /></label>;
}

function StepOne(props: any) {
  return <div className="mx-auto max-w-2xl"><StepTitle eyebrow="Passo 1" title="Para onde é a viagem?" text="Comece com os dados básicos. Poderá ajustar os detalhes antes de enviar o pedido." /><div className="mt-7 grid gap-4 sm:grid-cols-2"><Field label="Origem" value={props.origin} onChange={props.setOrigin} placeholder="Cidade ou província" /><Field label="Destino" value={props.destination} onChange={props.setDestination} placeholder="Cidade ou província" /><Field label="Data de ida" value="18/09/2026" onChange={() => {}} /><Field label="Data de volta" value="21/09/2026" onChange={() => {}} /></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Motivo da viagem" value={props.reason} onChange={props.setReason} placeholder="Ex.: Visita ao projeto de Nampula" /><Field label="Colaborador que vai viajar" value={props.traveller} onChange={props.setTraveller} placeholder="Nome completo" /></div><div className="mt-5 rounded-lg border border-[#e7e4df] bg-[#faf9f7] p-4 text-xs leading-5 text-[#706d67]">O pedido pode ser criado por um colega em nome de outra pessoa. O colaborador indicado será associado à viagem.</div></div>;
}

function Choice({ active, title, text, onClick }: { active: boolean; title: string; text: string; onClick: () => void }) {
  return <button onClick={onClick} className={`rounded-xl border p-5 text-left transition ${active ? "border-[#CD0219] bg-[#fff8f8] ring-1 ring-[#CD0219]" : "border-[#e1ddd7] bg-white hover:border-[#bbb6ae]"}`}><div className="flex items-center justify-between"><span className="font-semibold">{title}</span><span className={`h-4 w-4 rounded-full border-2 ${active ? "border-[#CD0219] bg-[#CD0219]" : "border-[#c7c2ba]"}`} /></div><p className="mt-1 text-xs text-[#817d76]">{text}</p></button>;
}

function StepTwo(props: any) {
  return <div className="mx-auto max-w-3xl"><StepTitle eyebrow="Passo 2" title="Vai precisar de carro no destino?" text="Escolha um veículo disponível na região. O número de dias é calculado a partir da viagem." /><div className="mt-7 grid gap-3 sm:grid-cols-2"><Choice active={props.transport} title="Sim" text="Preciso de transporte no destino" onClick={() => props.setTransport(true)} /><Choice active={!props.transport} title="Não" text="Vou organizar o transporte por conta própria" onClick={() => props.setTransport(false)} /></div>{props.transport && <div className="mt-7"><div className="mb-3 text-sm font-semibold">Veículos disponíveis</div><div className="grid gap-4 md:grid-cols-3">{vehicles.map((v) => <button key={v.name} onClick={() => props.setVehicle(v)} className={`overflow-hidden rounded-xl border text-left transition ${props.vehicle.name === v.name ? "border-[#CD0219] ring-1 ring-[#CD0219]" : "border-[#e1ddd7] hover:border-[#bbb6ae]"}`}><img src={v.image} alt={v.name} className="h-32 w-full object-cover" /><div className="p-3"><div className="text-sm font-semibold">{v.name}</div><div className="mt-1 text-[11px] text-[#817d76]">{v.category} · {v.capacity}</div><div className="mt-3 text-sm font-semibold">{money(v.price)} <span className="font-normal text-[#817d76]">/ dia</span></div></div></button>)}</div></div>}</div>;
}

function StepThree(props: any) {
  return <div className="mx-auto max-w-3xl"><StepTitle eyebrow="Passo 3" title="Vai precisar de hospedagem?" text="As opções apresentadas correspondem à região do destino." /><div className="mt-7 grid gap-3 sm:grid-cols-2"><Choice active={props.hotel} title="Sim" text="Preciso de hospedagem" onClick={() => props.setHotel(true)} /><Choice active={!props.hotel} title="Não" text="Não preciso de hospedagem" onClick={() => props.setHotel(false)} /></div>{props.hotel && <div className="mt-7"><div className="mb-3 text-sm font-semibold">Opções disponíveis</div><div className="grid gap-4 md:grid-cols-3">{hotels.map((h) => <button key={h.name} onClick={() => props.setHotelChoice(h)} className={`overflow-hidden rounded-xl border text-left transition ${props.hotelChoice.name === h.name ? "border-[#CD0219] ring-1 ring-[#CD0219]" : "border-[#e1ddd7] hover:border-[#bbb6ae]"}`}><img src={h.image} alt={h.name} className="h-32 w-full object-cover" /><div className="p-3"><div className="text-sm font-semibold">{h.name}</div><div className="mt-1 text-[11px] text-[#817d76]">{h.location}</div><div className="mt-2 inline-flex rounded-full bg-[#f0eee9] px-2 py-1 text-[10px] font-medium text-[#66625c]">{h.badge}</div><div className="mt-3 text-sm font-semibold">{money(h.price)} <span className="font-normal text-[#817d76]">/ noite</span></div></div></button>)}</div></div>}</div>;
}

function StepFour() {
  const places = ["Restaurante", "Lanchonete", "Take-away"];
  return <div className="mx-auto max-w-3xl"><StepTitle eyebrow="Passo 4" title="Vai precisar de alimentação?" text="Escolha onde prefere comer e depois selecione os pratos do cardápio." /><div className="mt-7 grid gap-3 sm:grid-cols-3">{places.map((p, i) => <button key={p} className={`rounded-xl border p-5 text-left ${i === 0 ? "border-[#CD0219] bg-[#fff8f8]" : "border-[#e1ddd7]"}`}><div className="font-semibold">{p}</div><div className="mt-1 text-xs text-[#817d76]">Estabelecimentos disponíveis no destino</div></button>)}</div><div className="mt-7 rounded-xl border border-[#e7e4df] bg-[#faf9f7] p-5"><div className="text-sm font-semibold">Restaurantes em {"Maputo"}</div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-white p-4"><div className="text-sm font-medium">Costa do Sol</div><div className="mt-1 text-xs text-[#817d76]">Cardápio disponível · 12 pratos</div></div><div className="rounded-lg bg-white p-4"><div className="text-sm font-medium">Zambi</div><div className="mt-1 text-xs text-[#817d76]">Cardápio disponível · 9 pratos</div></div></div></div></div>;
}

function StepFive(props: any) {
  return <div className="mx-auto max-w-3xl"><StepTitle eyebrow="Passo 5" title="Revise o pedido antes de enviar" text="Pode voltar a qualquer passo para alterar os dados." /><div className="mt-7 overflow-hidden rounded-xl border border-[#e1ddd7]"><ReviewRow label="Deslocação" value={`${props.origin} → ${props.destination}`} /><ReviewRow label="Transporte" value={props.transport ? `${props.vehicle.name} × 4 dias` : "Não necessário"} price={props.transport ? money(props.vehicle.price * 4) : "—"} /><ReviewRow label="Hospedagem" value={props.hotel ? `${props.hotelChoice.name} × 3 noites` : "Não necessária"} price={props.hotel ? money(props.hotelChoice.price * 3) : "—"} /><ReviewRow label="Alimentação" value="A configurar na cotação" price="—" /><div className="flex items-center justify-between bg-[#faf9f7] px-4 py-5"><span className="font-semibold">Total estimado</span><span className="text-xl font-semibold">{money(props.total)}</span></div></div><div className="mt-5"><label className="block text-xs font-medium text-[#4f4c47]">Observação para a agência <span className="font-normal text-[#817d76]">(opcional)</span></label><textarea placeholder="Ex.: Precisa de hotel com estacionamento" className="mt-1.5 min-h-28 w-full rounded-lg border border-[#dcd8d1] p-3 text-sm outline-none focus:border-[#CD0219] focus:ring-2 focus:ring-[#CD0219]/10" /></div><div className="mt-5 rounded-lg border border-[#ead7d9] bg-[#fff8f8] p-4 text-xs leading-5 text-[#6f5558]">Ao enviar, o pedido passa para <strong>Aguardando Revisão da Agência</strong>. A agência poderá ajustar os valores e enviará uma cotação formal para aprovação.</div></div>;
}

function StepTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div><div className="text-xs font-semibold uppercase tracking-wide text-[#CD0219]">{eyebrow}</div><h3 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#77736d]">{text}</p></div>;
}

function SummaryLine({ label, value, price }: { label: string; value: string; price?: string }) {
  return <div><div className="text-[11px] font-medium uppercase tracking-wide text-[#9a958d]">{label}</div><div className="mt-1 text-xs font-medium leading-5">{value}</div>{price && <div className="mt-0.5 text-xs font-semibold">{price}</div>}</div>;
}

function ReviewRow({ label, value, price }: { label: string; value: string; price?: string }) {
  return <div className="flex items-center justify-between gap-5 border-b border-[#eeeae5] px-4 py-4 last:border-0"><div><div className="text-xs font-medium text-[#817d76]">{label}</div><div className="mt-1 text-sm font-medium">{value}</div></div>{price && <div className="shrink-0 text-sm font-semibold">{price}</div>}</div>;
}
