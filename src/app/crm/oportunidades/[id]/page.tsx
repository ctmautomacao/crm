"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { TemperaturaInput } from "@/components/ui/TemperaturaInput";
import { formatDate, formatDatetime, formatCurrency } from "@/lib/utils";
import { ArrowLeft, MessageSquare, Edit2, Check, X, Plus } from "lucide-react";
import { NovaPropostaModal } from "@/components/propostas/NovaPropostaModal";

export default function OportunidadeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabelas, setTabelas] = useState<any>({});
  const [novaObservacao, setNovaObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<any>({});
  const [modalProposta, setModalProposta] = useState(false);

  async function load() {
    const [oRes, tRes] = await Promise.all([
      fetch(`/api/oportunidades/${id}`),
      fetch("/api/configuracoes/tabelas"),
    ]);
    const oData = await oRes.json();
    const tData = await tRes.json();
    setData(oData);
    setTabelas(tData);
    setForm({
      titulo: oData.oportunidade?.titulo || "",
      valorEstimado: oData.oportunidade?.valorEstimado || "",
      temperatura: oData.oportunidade?.temperatura || 1,
      statusId: oData.oportunidade?.statusId || "",
      tipoId: oData.oportunidade?.tipoId || "",
      vendedorId: oData.oportunidade?.vendedorId || "",
      observacoes: oData.oportunidade?.observacoes || "",
    });
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function enviarFeed() {
    if (!novaObservacao.trim()) return;
    setEnviando(true);
    await fetch(`/api/oportunidades/${id}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: novaObservacao, tipo: "OBSERVACAO" }),
    });
    setNovaObservacao("");
    setEnviando(false);
    load();
  }

  async function salvar() {
    await fetch(`/api/oportunidades/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(false);
    load();
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  if (!data?.oportunidade) return <div className="p-8 text-center text-gray-500">Oportunidade não encontrada</div>;

  const { oportunidade, vendedor, cliente, status, tipo, feed, propostas } = data;

  return (
    <div>
      <PageHeader
        title={oportunidade.titulo}
        subtitle={cliente?.nome || "Sem cliente"}
        actions={
          <button
            onClick={() => setModalProposta(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Nova Proposta
          </button>
        }
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Dados da Oportunidade</h3>
              {!editando ? (
                <button onClick={() => setEditando(true)} className="text-gray-500 hover:text-white transition">
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={salvar} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditando(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            {!editando ? (
              <div className="space-y-3">
                {status && <Row label="Status" value={status.nome} />}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Temperatura</span>
                  <TemperaturaInput value={oportunidade.temperatura} readOnly size="sm" />
                </div>
                {oportunidade.valorEstimado && <Row label="Valor Est." value={formatCurrency(Number(oportunidade.valorEstimado))} />}
                {tipo && <Row label="Tipo" value={tipo.nome} />}
                {vendedor && <Row label="Vendedor" value={vendedor.nome} />}
                {cliente && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Cliente</span>
                    <Link href={`/crm/clientes/${cliente.id}`} className="text-sm text-blue-400 hover:text-blue-300">{cliente.nome}</Link>
                  </div>
                )}
                <Row label="Criado em" value={formatDate(oportunidade.criadoEm)} />
                {oportunidade.observacoes && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Observações</span>
                    <p className="text-sm text-gray-300">{oportunidade.observacoes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Field label="Título *">
                  <input value={form.titulo} onChange={e => setForm((p: any) => ({ ...p, titulo: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </Field>
                <Field label="Valor Estimado">
                  <input type="number" value={form.valorEstimado} onChange={e => setForm((p: any) => ({ ...p, valorEstimado: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </Field>
                <Field label="Temperatura">
                  <TemperaturaInput value={form.temperatura} onChange={v => setForm((p: any) => ({ ...p, temperatura: v }))} />
                </Field>
                <Field label="Status">
                  <select value={form.statusId} onChange={e => setForm((p: any) => ({ ...p, statusId: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">-</option>
                    {(tabelas.status || []).map((s: any) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                </Field>
                <Field label="Tipo">
                  <select value={form.tipoId} onChange={e => setForm((p: any) => ({ ...p, tipoId: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">-</option>
                    {(tabelas.tipos || []).map((t: any) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                  </select>
                </Field>
                <Field label="Vendedor">
                  <select value={form.vendedorId} onChange={e => setForm((p: any) => ({ ...p, vendedorId: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">-</option>
                    {(tabelas.vendedores || []).filter((v: any) => v.ativo).map((v: any) => <option key={v.id} value={v.id}>{v.nome}</option>)}
                  </select>
                </Field>
                <Field label="Observações">
                  <textarea rows={3} value={form.observacoes} onChange={e => setForm((p: any) => ({ ...p, observacoes: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
                </Field>
              </div>
            )}
          </div>

          {/* Propostas vinculadas */}
          {(propostas || []).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Propostas</h3>
              <div className="space-y-2">
                {propostas.map((p: any) => (
                  <Link key={p.id} href={`/crm/propostas/${p.id}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                    <span className="text-sm text-gray-200">{p.numero}</span>
                    <span className="text-xs text-gray-400">{p.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feed */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-300">Histórico / Feed</h3>
            </div>

            <div className="flex gap-3 mb-5">
              <textarea rows={2} value={novaObservacao} onChange={e => setNovaObservacao(e.target.value)}
                placeholder="Adicionar observação..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none" />
              <button onClick={enviarFeed} disabled={enviando || !novaObservacao.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition self-end">
                {enviando ? "..." : "Adicionar"}
              </button>
            </div>

            <div className="space-y-3">
              {(feed || []).length === 0 && (
                <p className="text-center text-gray-600 text-sm py-6">Nenhuma atividade registrada</p>
              )}
              {(feed || []).map((entry: any) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400 mt-0.5">
                    {feedIcon(entry.tipo)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-gray-300">{entry.autorNome || "Sistema"}</span>
                      <span className="text-xs text-gray-600">{formatDatetime(entry.criadoEm)}</span>
                      <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{feedTipoLabel(entry.tipo)}</span>
                    </div>
                    <p className="text-sm text-gray-400">{entry.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-4">
        <Link href="/crm/oportunidades" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition w-fit">
          <ArrowLeft className="w-4 h-4" /> Voltar para Oportunidades
        </Link>
      </div>

      {modalProposta && (
        <NovaPropostaModal
          oportunidadeId={id}
          clienteId={oportunidade.clienteId}
          vendedorId={oportunidade.vendedorId}
          onClose={() => setModalProposta(false)}
          onCreated={() => { setModalProposta(false); load(); }}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-300">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function feedIcon(tipo: string) {
  const icons: Record<string, string> = {
    CRIACAO: "✦", OBSERVACAO: "💬", STATUS: "⟳", CONVERSAO: "→",
    LIGACAO: "📞", EMAIL: "✉", VISITA: "📍", PROPOSTA: "📄", PEDIDO: "🛒",
  };
  return icons[tipo] || "•";
}

function feedTipoLabel(tipo: string) {
  const labels: Record<string, string> = {
    CRIACAO: "Criação", OBSERVACAO: "Observação", STATUS: "Status",
    CONVERSAO: "Conversão", LIGACAO: "Ligação", EMAIL: "E-mail",
    VISITA: "Visita", PROPOSTA: "Proposta", PEDIDO: "Pedido",
  };
  return labels[tipo] || tipo;
}
