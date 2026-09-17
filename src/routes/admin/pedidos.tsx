import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type { TravelRequestSnapshot } from "../../lib/catalog";

export const Route = createFileRoute("/admin/pedidos")({ component: AdminPedidos });

function AdminPedidos() {
  const [orders, setOrders] = useState<TravelRequestSnapshot[]>([]);

  const load = () => {
    const found: TravelRequestSnapshot[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("travel-request-")) continue;
      try { found.push(JSON.parse(localStorage.getItem(key) || "") as TravelRequestSnapshot); } catch {}
    }
    found.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    setOrders(found);
  };

  useEffect(() => {
    load();
    const fn = () => load();
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  }, []);

  return <div className="min-h-screen bg-[#f8f8f6] text-[#252525]"><header className="border-b bg-white"><div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-8"><div><div className="font-semibold">Pedidos de Viagem</div><div className="text-[11px] text-[#77736d]">Visão administrativa dos pedidos recebidos</div></div><button onClick={load} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"><RefreshCw size={15}/> Atualizar</button></div></header><main className="mx-auto max-w-[1400px] px-5 py-8 lg:px-8"><div className="mb-6"><h1 className="text-2xl font-semibold">Pedidos recebidos</h1><p className="mt-1 text-sm text-[#77736d]">Os preços e dados dos itens são os snapshots gravados no momento da seleção.</p></div>{!orders.length ? <div className="rounded-xl border border-dashed bg-white p-12 text-center text-sm text-[#77736d]">Ainda não existem pedidos de viagem gravados neste dispositivo.</div> : <div className="space-y-4">{orders.map(order => <article key={order.id} className="rounded-xl border border-[#e5e2dc] bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-xs font-semibold text-[#CD0219]">{order.id}</div><h2 className="mt-1 font-semibold">{order.origin} → {order.destination}</h2><div className="mt-1 text-xs text-[#77736d]">{order.traveller || "Colaborador não indicado"} · {order.data_ida} → {order.data_volta}</div></div><div className="text-right"><div className="text-xs text-[#77736d]">Total estimado</div><div className="font-semibold">{order.total.toLocaleString("pt-MZ")} MT</div></div></div><div className="mt-5 grid gap-3 md:grid-cols-3"><Item label="Transporte" value={order.itens_pedido.transporte ? `${order.itens_pedido.transporte.nome} · ${order.itens_pedido.transporte.preco.toLocaleString("pt-MZ")} MT/dia` : "A confirmar com a agência"}/><Item label="Hospedagem" value={order.itens_pedido.hospedagem ? `${order.itens_pedido.hospedagem.nome} · ${order.itens_pedido.hospedagem.preco.toLocaleString("pt-MZ")} MT/noite` : "A confirmar com a agência"}/><Item label="Alimentação" value={order.itens_pedido.alimentacao.length ? order.itens_pedido.alimentacao.map(d => `${d.nome} (${d.preco.toLocaleString("pt-MZ")} MT)`).join(", ") : "A confirmar com a agência"}/></div>{order.notas_automaticas.length > 0 && <div className="mt-5 rounded-lg border border-[#ead5d5] bg-[#fffafa] p-4"><div className="flex items-center gap-2 text-sm font-semibold text-[#CD0219]"><AlertTriangle size={17}/> Atenção administrativa</div><ul className="mt-2 space-y-1 text-xs text-[#6e6a64]">{order.notas_automaticas.map(note => <li key={note}>• {note}</li>)}</ul></div>}</article>)}</div>}</main></div>;
}

function Item({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-[#faf9f7] p-3"><div className="text-[10px] uppercase text-[#9a958d]">{label}</div><div className="mt-1 text-xs font-medium">{value}</div></div>; }
