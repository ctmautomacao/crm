"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusLeadVariant, statusLeadLabel } from "@/components/ui/Badge";
import { TemperaturaInput } from "@/components/ui/TemperaturaInput";
import { formatDate, formatDatetime } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Phone, Mail, MessageSquare, Edit2, Check, X, PhoneCall, MessageCircle, AtSign, MapPin, FileText } from "lucide-react";

const STATUS_OPTIONS = ["NOVO", "CONTATO_REALIZADO", "EM_NEGOCIACAO", "CONVERTIDO", "PERDIDO", "DESCARTADO"];

const FEED_TIPOS = [
  { tipo: "LIGACAO", label: "Ligação", icon: PhoneCall, cor: "text-green-400" },
  { tipo: "MENSAGEM", label: "Mensagem", icon: MessageCircle, cor: "text-blue-400" },
  { tipo: "EMAIL_MANUAL", label: "E-mail", icon: AtSign, cor: "text-yellow-400" },
  { tipo: "VISITA", label: "Visita", icon: MapPin, cor: "text-purple-400" },
  { tipo: "ANOTACAO", label: "Nota", icon: FileText, cor: "text-gray-400" },
];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabelas, setTabelas] = useState<any>({});
  const [novaObservacao, setNovaObservacao] = useState("");
  const [feedTipoAtivo, setFeedTipoAtivo] = useState("ANOTACAO");
  const [enviando, setEnviando] = useState(false);
  const [convertendo, setConvertendo] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<any>({});
  const [salvandoInline, setSalvandoInline] = useState(false);

  async function load() {
    const [leadRes, tabelasRes] = await Promise.all([
      fetch(`/api/leads/${id}`),
      fetch("/api/configuracoes/tabelas"),
    ]);
    const leadData = await leadRes.json();
    const tabelasData = await tabelasRes.json();
    setData(leadData);
    setTabelas(tabelasData);
    setForm({
      nomeContato: leadData.lead?.nomeContato || "",
      empresa: leadData.lead?.empresa || "",
      telefone: leadData.lead?.telefone || "",
      email: leadData.lead?.email || "",
      origemId: leadData.lead?.origemId || "",
      campanhaId: leadData.lead?.campanhaId || "",
      indicadorId: leadData.lead?.indicadorId || "",
      vendedorId: leadData.lead?.vendedorId || "",
      grupoProdutoId: leadData.lead?.grupoProdutoId || "",
      categoriaId: leadData.lead?.categoriaId || "",
      temperatura: leadData.lead?.temperatura || 1,
      status: leadData.lead?.status || "NOVO",
      observacoes: leadData.lead?.observacoes || "",
    });
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function enviarFeed(tipoOverride?: string) {
    if (!novaObservacao.trim()) return;
    setEnviando(true);
    await fetch(`/api/leads/${id}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: novaObservacao, tipo: tipoOverride || feedTipoAtivo }),
    });
    setNovaObservacao("");
    setEnviando(false);
    load();
  }

  async function converter() {
    if (!confirm("Converter este lead em oportunidade?")) return;
    setConvertendo(true);
    const res = await fetch(`/api/leads/${id}/converter`, { method: "POST" });
    const result = await res.json();
    setConvertendo(false);
    if (res.ok && result.oportunidadeId) {
      router.push(`/crm/oportunidades/${result.oportunidadeId}`);
    } else {
      load();
    }
  }

  async function salvar() {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(false);
    load();
  }

  async function salvarCampo(campo: string, valor: any) {
    setSalvandoInline(true);
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [campo]: valor }),
    });
    setSalvandoInline(false);
    load();
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  if (!data?.lead) return <div className="p-8 text-center text-gray-500">Lead não encontrado</div>;

  const { lead, vendedor, origem, campanha, indicador, feed } = data;
  const jaConvertido = lead.status === "CONVERTIDO";

  return (
    <div>
      <PageHeader
        title={lead.nomeContato}
        subtitle={lead.empresa || "Sem empresa"}
        actions={
          <div className="flex items-center gap-2">
            {!jaConvertido && (
              <button
                onClick={converter}
                disabled={convertendo}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
              >
                <ArrowRight className="w-4 h-4" />
                {convertendo ? "Convertendo..." : "Converter em Oportunidade"}
              </button>
            )}
            {jaConvertido && lead.oportunidadeId && (
              <Link
                href={`/crm/oportunidades/${lead.oportunidadeId}`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition"
              >
                <ArrowRight className="w-4 h-4" />
                Ver Oportunidade
              </Link>
            )}
          </div>
        }
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados do Lead */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Dados do Lead</h3>
              {!editando ? (
                <button onClick={() => setEditando(true)} className="text-gray-500 hover:text-white transition">
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={salvar} className="text-green-400 hover:text-green-300 transition">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditando(false)} className="text-gray-500 hover:text-white transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {!editando ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <select
                    value={lead.status}
                    onChange={e => salvarCampo("status", e.target.value)}
                    disabled={salvandoInline}
                    className="text-xs px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{statusLeadLabel[s] || s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Temperatura</span>
                  <TemperaturaInput value={lead.temperatura} onChange={v => salvarCampo("temperatura", v)} size="sm" />
                </div>
                {lead.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <a href={`https://wa.me/55${lead.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300">{lead.telefone}</a>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    <a href={`mailto:${lead.email}`} className="text-sm text-blue-400 hover:text-blue-300">{lead.email}</a>
                  </div>
                )}
                {origem && <Row label="Origem" value={origem.nome} />}
                {campanha && <Row label="Campanha" value={campanha.nome} />}
                {indicador && <Row label="Indicador" value={indicador.nome} />}
                {vendedor && <Row label="Vendedor" value={vendedor.nome} />}
                {data.grupoProduto && <Row label="Grupo de Produto" value={data.grupoProduto.nome} />}
                {data.categoria && <Row label="Categoria" value={data.categoria.nome} />}
                <Row label="Criado em" value={formatDate(lead.criadoEm)} />
                {lead.observacoes && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Observações</span>
                    <p className="text-sm text-gray-300">{lead.observacoes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Field label="Nome *">
                  <input value={form.nomeContato} onChange={e => setForm((p: any) => ({ ...p, nomeContato: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </Field>
                <Field label="Empresa">
                  <input value={form.empresa} onChange={e => setForm((p: any) => ({ ...p, empresa: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </Field>
                <Field label="Telefone">
                  <input value={form.telefone} onChange={e => setForm((p: any) => ({ ...p, telefone: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </Field>
                <Field label="Email">
                  <input type="email" value={form.email} onChange={e => setForm((p: any) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLeadLabel[s]}</option>)}
                  </select>
                </Field>
                <Field label="Temperatura">
                  <TemperaturaInput value={form.temperatura} onChange={v => setForm((p: any) => ({ ...p, temperatura: v }))} />
                </Field>
                <Field label="Origem">
                  <select value={form.origemId} onChange={e => setForm((p: any) => ({ ...p, origemId: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">-</option>
                    {(tabelas.origens || []).map((o: any) => <option key={o.id} value={o.id}>{o.nome}</option>)}
                  </select>
                </Field>
                <Field label="Campanha">
                  <select value={form.campanhaId} onChange={e => setForm((p: any) => ({ ...p, campanhaId: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">-</option>
                    {(tabelas.campanhas || []).map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </Field>
                <Field label="Indicador">
                  <select value={form.indicadorId} onChange={e => setForm((p: any) => ({ ...p, indicadorId: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">-</option>
                    {(tabelas.indicadores || []).map((i: any) => <option key={i.id} value={i.id}>{i.nome}</option>)}
                  </select>
                </Field>
                <Field label="Vendedor">
                  <select value={form.vendedorId} onChange={e => setForm((p: any) => ({ ...p, vendedorId: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">Minha conta</option>
                    {(tabelas.vendedores || []).filter((v: any) => v.ativo).map((v: any) => <option key={v.id} value={v.id}>{v.nome}</option>)}
                  </select>
                </Field>
                <Field label="Grupo de Produto">
                  <select value={form.grupoProdutoId} onChange={e => setForm((p: any) => ({ ...p, grupoProdutoId: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">-</option>
                    {(tabelas.grupos || []).map((g: any) => <option key={g.id} value={g.id}>{g.nome}</option>)}
                  </select>
                </Field>
                <Field label="Categoria">
                  <select value={form.categoriaId} onChange={e => setForm((p: any) => ({ ...p, categoriaId: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">-</option>
                    {(tabelas.categorias || []).map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </Field>
                <Field label="Observações">
                  <textarea rows={3} value={form.observacoes} onChange={e => setForm((p: any) => ({ ...p, observacoes: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
                </Field>
              </div>
            )}
          </div>
        </div>

        {/* Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-300">Histórico / Feed</h3>
            </div>

            <div className="mb-5 space-y-2">
              <div className="flex gap-1.5 flex-wrap">
                {FEED_TIPOS.map(({ tipo, label, icon: Icon, cor }) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => setFeedTipoAtivo(tipo)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      feedTipoAtivo === tipo
                        ? "bg-gray-700 border-gray-500 text-white"
                        : "bg-gray-800/50 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${feedTipoAtivo === tipo ? cor : ""}`} />
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={novaObservacao}
                  onChange={e => setNovaObservacao(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) enviarFeed(); }}
                  placeholder={`Registrar ${FEED_TIPOS.find(f => f.tipo === feedTipoAtivo)?.label.toLowerCase() || "nota"}...`}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                />
                <button
                  onClick={() => enviarFeed()}
                  disabled={enviando || !novaObservacao.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition self-end"
                >
                  {enviando ? "..." : "Salvar"}
                </button>
              </div>
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
                  <div className="flex-1 min-w-0">
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
        <Link href="/crm/leads" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition w-fit">
          <ArrowLeft className="w-4 h-4" /> Voltar para Leads
        </Link>
      </div>
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
    CRIACAO: "✦", ANOTACAO: "💬", MUDANCA_STATUS: "⟳", CONVERSAO: "→",
    LIGACAO: "📞", MENSAGEM: "💬", EMAIL_MANUAL: "✉", VISITA: "📍", PROPOSTA: "📄", PEDIDO: "🛒",
    // legado
    OBSERVACAO: "💬", STATUS: "⟳", EMAIL: "✉",
  };
  return icons[tipo] || "•";
}

function feedTipoLabel(tipo: string) {
  const labels: Record<string, string> = {
    CRIACAO: "Criação", ANOTACAO: "Nota", MUDANCA_STATUS: "Status",
    CONVERSAO: "Conversão", LIGACAO: "Ligação", MENSAGEM: "Mensagem",
    EMAIL_MANUAL: "E-mail", VISITA: "Visita", PROPOSTA: "Proposta", PEDIDO: "Pedido",
    // legado
    OBSERVACAO: "Observação", STATUS: "Status", EMAIL: "E-mail",
  };
  return labels[tipo] || tipo;
}
