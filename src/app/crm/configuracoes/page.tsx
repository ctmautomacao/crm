"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plus, Trash2, Users, Tag, Megaphone, UserPlus, Layers, CheckCircle, XCircle, CreditCard, Award, List, Grid, Bell, Pencil, Check, X } from "lucide-react";

type Section =
  | "vendedores" | "alertas"
  | "origens" | "campanhas" | "indicadores"
  | "tipos" | "status" | "motivos"
  | "formas" | "marcas" | "categorias" | "grupos";

const MENU: { key: Section; label: string; icon: any; group: string }[] = [
  { key: "vendedores", label: "Vendedores", icon: Users, group: "Equipe" },
  { key: "alertas", label: "Alertas de Inatividade", icon: Bell, group: "Equipe" },
  { key: "origens", label: "Origens de Lead", icon: Tag, group: "Leads & Oportunidades" },
  { key: "campanhas", label: "Campanhas", icon: Megaphone, group: "Leads & Oportunidades" },
  { key: "indicadores", label: "Indicadores", icon: UserPlus, group: "Leads & Oportunidades" },
  { key: "tipos", label: "Tipos de Oportunidade", icon: Layers, group: "Leads & Oportunidades" },
  { key: "status", label: "Status de Oportunidade", icon: CheckCircle, group: "Leads & Oportunidades" },
  { key: "motivos", label: "Motivos de Encerramento", icon: XCircle, group: "Leads & Oportunidades" },
  { key: "formas", label: "Formas de Pagamento", icon: CreditCard, group: "Comercial" },
  { key: "marcas", label: "Marcas", icon: Award, group: "Produtos" },
  { key: "categorias", label: "Categorias", icon: List, group: "Produtos" },
  { key: "grupos", label: "Grupos de Produto", icon: Grid, group: "Produtos" },
];

function SimpleList({ items, onAdd, onDelete, onEdit, label, extra }: {
  items: any[];
  onAdd: (nome: string, extra?: any) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, nome: string) => void;
  label: string;
  extra?: React.ReactNode;
}) {
  const [nome, setNome] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");

  function startEdit(item: any) {
    setEditId(item.id);
    setEditNome(item.nome);
  }

  function cancelEdit() {
    setEditId(null);
    setEditNome("");
  }

  function confirmEdit(id: string) {
    if (editNome.trim() && onEdit) {
      onEdit(id, editNome.trim());
    }
    cancelEdit();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={e => { e.preventDefault(); if (nome.trim()) { onAdd(nome.trim()); setNome(""); } }}
        className="flex gap-2">
        <input value={nome} onChange={e => setNome(e.target.value)}
          placeholder={`Novo ${label.toLowerCase()}...`}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
        {extra}
        <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition">
          <Plus className="w-4 h-4" />
        </button>
      </form>
      <div className="space-y-1">
        {items.length === 0 ? (
          <p className="text-sm text-gray-600 py-4 text-center">Nenhum registro</p>
        ) : items.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition group">
            {editId === item.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") confirmEdit(item.id); if (e.key === "Escape") cancelEdit(); }}
                  className="flex-1 px-2 py-1 bg-gray-700 border border-blue-500 rounded text-sm text-white focus:outline-none"
                />
                <button onClick={() => confirmEdit(item.id)} className="text-green-400 hover:text-green-300 transition">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={cancelEdit} className="text-gray-500 hover:text-white transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  {item.cor && <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.cor }} />}
                  <span className="text-sm text-gray-200">{item.nome}</span>
                  {item.tipo && <span className="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded">{item.tipo}</span>}
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  {onEdit && (
                    <button onClick={() => startEdit(item)} className="text-gray-600 hover:text-blue-400 transition">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => onDelete(item.id)} className="text-gray-600 hover:text-red-400 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VendedoresSection({ vendedores, onReload }: { vendedores: any[]; onReload: () => void }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", senha: "senha123", perfil: "VENDEDOR", comissaoPct: "0" });
  const [saving, setSaving] = useState(false);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/configuracoes/vendedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModal(false);
    setForm({ nome: "", email: "", senha: "senha123", perfil: "VENDEDOR", comissaoPct: "0" });
    onReload();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition">
          <Plus className="w-4 h-4" /> Novo Vendedor
        </button>
      </div>
      <div className="space-y-2">
        {vendedores.length === 0 ? (
          <p className="text-sm text-gray-600 py-4 text-center">Nenhum vendedor cadastrado</p>
        ) : vendedores.map((v: any) => (
          <div key={v.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800/50">
            <div>
              <div className="text-sm font-medium text-gray-200">{v.nome}</div>
              <div className="text-xs text-gray-500">{v.email}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${v.perfil === "GERENTE" ? "bg-purple-900/50 text-purple-300" : "bg-blue-900/50 text-blue-300"}`}>
                {v.perfil}
              </span>
              {v.comissaoPct && Number(v.comissaoPct) > 0 && (
                <span className="text-xs text-gray-400">{v.comissaoPct}% comissão</span>
              )}
              <span className={`w-2 h-2 rounded-full ${v.ativo ? "bg-green-500" : "bg-gray-600"}`} />
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Novo Vendedor</h2>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={criar} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nome *</label>
                <input required value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">E-mail *</label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Senha inicial</label>
                <input value={form.senha} onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Perfil</label>
                  <select value={form.perfil} onChange={e => setForm(p => ({ ...p, perfil: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="VENDEDOR">VENDEDOR</option>
                    <option value="GERENTE">GERENTE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Comissão %</label>
                  <input type="number" step="0.01" value={form.comissaoPct} onChange={e => setForm(p => ({ ...p, comissaoPct: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition">
                  {saving ? "Criando..." : "Criar Vendedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertasSection({ alertas, onReload }: { alertas: any[]; onReload: () => void }) {
  const [form, setForm] = useState({ entidade: "LEAD", nivel: "ATENCAO", dias: "7" });
  const [saving, setSaving] = useState(false);

  // nivel deve corresponder ao enum do banco: ATENCAO | CRITICO
  const COR: Record<string, string> = { ATENCAO: "#F59E0B", CRITICO: "#EF4444" };

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/configuracoes/alertas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dias: Number(form.dias), cor: COR[form.nivel] }),
    });
    setSaving(false);
    onReload();
  }

  async function deletar(id: string) {
    await fetch("/api/configuracoes/alertas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onReload();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={criar} className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Entidade</label>
          <select value={form.entidade} onChange={e => setForm(p => ({ ...p, entidade: e.target.value }))}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
            <option value="LEAD">Lead</option>
            <option value="OPORTUNIDADE">Oportunidade</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nível</label>
          <select value={form.nivel} onChange={e => setForm(p => ({ ...p, nivel: e.target.value }))}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
            <option value="ATENCAO">Atenção (amarelo)</option>
            <option value="CRITICO">Crítico (vermelho)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Dias sem contato</label>
          <input type="number" min="1" value={form.dias} onChange={e => setForm(p => ({ ...p, dias: e.target.value }))}
            className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
        <button type="submit" disabled={saving}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition text-sm">
          <Plus className="w-4 h-4" />
        </button>
      </form>
      <div className="space-y-1">
        {alertas.length === 0 ? (
          <p className="text-sm text-gray-600 py-4 text-center">Nenhum alerta configurado</p>
        ) : alertas.map((a: any) => (
          <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition group">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: a.cor || "#6B7280" }} />
              <span className="text-sm text-gray-200">{a.entidade}</span>
              <span className="text-xs text-gray-500">→</span>
              <span className="text-sm text-gray-400">{a.dias} dias sem contato</span>
            </div>
            <button onClick={() => deletar(a.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ConfiguracoesPage() {
  const [section, setSection] = useState<Section>("vendedores");
  const [tabelas, setTabelas] = useState<any>({});
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [tabs, vends, alts] = await Promise.all([
      fetch("/api/configuracoes/tabelas").then(r => r.json()),
      fetch("/api/configuracoes/vendedores").then(r => r.json()),
      fetch("/api/configuracoes/alertas").then(r => r.json()),
    ]);
    setTabelas(tabs);
    setVendedores(Array.isArray(vends) ? vends : []);
    setAlertas(Array.isArray(alts) ? alts : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addSimple(endpoint: string, nome: string, extra?: any) {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, ...extra }),
    });
    load();
  }

  async function delSimple(endpoint: string, id: string) {
    await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  async function editSimple(endpoint: string, id: string, nome: string) {
    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, nome }),
    });
    load();
  }

  const groups = [...new Set(MENU.map(m => m.group))];

  const sectionTitle = MENU.find(m => m.key === section)?.label || "";

  function renderSection() {
    if (loading) return <div className="py-8 text-center text-gray-500">Carregando...</div>;

    switch (section) {
      case "vendedores":
        return <VendedoresSection vendedores={vendedores} onReload={load} />;
      case "alertas":
        return <AlertasSection alertas={alertas} onReload={load} />;
      case "origens":
        return <SimpleList label="origem" items={tabelas.origens || []}
          onAdd={n => addSimple("/api/configuracoes/origens", n)}
          onDelete={id => delSimple("/api/configuracoes/origens", id)}
          onEdit={(id, n) => editSimple("/api/configuracoes/origens", id, n)} />;
      case "campanhas":
        return <SimpleList label="campanha" items={tabelas.campanhas || []}
          onAdd={n => addSimple("/api/configuracoes/campanhas", n)}
          onDelete={id => delSimple("/api/configuracoes/campanhas", id)}
          onEdit={(id, n) => editSimple("/api/configuracoes/campanhas", id, n)} />;
      case "indicadores":
        return <SimpleList label="indicador" items={tabelas.indicadores || []}
          onAdd={n => addSimple("/api/configuracoes/indicadores", n)}
          onDelete={id => delSimple("/api/configuracoes/indicadores", id)}
          onEdit={(id, n) => editSimple("/api/configuracoes/indicadores", id, n)} />;
      case "tipos":
        return <SimpleList label="tipo" items={tabelas.tipos || []}
          onAdd={n => addSimple("/api/configuracoes/tipos-oportunidade", n)}
          onDelete={id => delSimple("/api/configuracoes/tipos-oportunidade", id)}
          onEdit={(id, n) => editSimple("/api/configuracoes/tipos-oportunidade", id, n)} />;
      case "status":
        return <SimpleList label="status" items={tabelas.status || []}
          onAdd={(n, extra) => addSimple("/api/configuracoes/status-oportunidade", n, extra)}
          onDelete={id => delSimple("/api/configuracoes/status-oportunidade", id)}
          onEdit={(id, n) => editSimple("/api/configuracoes/status-oportunidade", id, n)} />;
      case "motivos":
        return (
          <div className="space-y-4">
            <MotivosList items={tabelas.motivos || []}
              onDelete={id => delSimple("/api/configuracoes/motivos", id)}
              onAdd={(n, tipo) => addSimple("/api/configuracoes/motivos", n, { tipo })}
              onEdit={(id, n) => editSimple("/api/configuracoes/motivos", id, n)} />
          </div>
        );
      case "formas":
        return <SimpleList label="forma de pagamento" items={tabelas.formas || []}
          onAdd={n => addSimple("/api/configuracoes/formas-pagamento", n)}
          onDelete={id => delSimple("/api/configuracoes/formas-pagamento", id)}
          onEdit={(id, n) => editSimple("/api/configuracoes/formas-pagamento", id, n)} />;
      case "marcas":
        return <SimpleList label="marca" items={tabelas.marcas || []}
          onAdd={n => addSimple("/api/configuracoes/marcas", n)}
          onDelete={id => delSimple("/api/configuracoes/marcas", id)}
          onEdit={(id, n) => editSimple("/api/configuracoes/marcas", id, n)} />;
      case "categorias":
        return <SimpleList label="categoria" items={tabelas.categorias || []}
          onAdd={n => addSimple("/api/configuracoes/categorias", n)}
          onDelete={id => delSimple("/api/configuracoes/categorias", id)}
          onEdit={(id, n) => editSimple("/api/configuracoes/categorias", id, n)} />;
      case "grupos":
        return <SimpleList label="grupo" items={tabelas.grupos || []}
          onAdd={n => addSimple("/api/configuracoes/grupos", n)}
          onDelete={id => delSimple("/api/configuracoes/grupos", id)}
          onEdit={(id, n) => editSimple("/api/configuracoes/grupos", id, n)} />;
    }
  }

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Cadastros auxiliares e preferências do sistema" />

      <div className="p-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="space-y-4">
            {groups.map(group => (
              <div key={group}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1">{group}</p>
                <div className="space-y-0.5">
                  {MENU.filter(m => m.group === group).map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setSection(key)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition ${
                        section === key
                          ? "bg-blue-600/20 text-blue-300 font-medium"
                          : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                      }`}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-5">{sectionTitle}</h2>
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}

function MotivosList({ items, onAdd, onDelete, onEdit }: {
  items: any[];
  onAdd: (nome: string, tipo: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, nome: string) => void;
}) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("PERDA");
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");

  return (
    <div className="space-y-4">
      <form onSubmit={e => { e.preventDefault(); if (nome.trim()) { onAdd(nome.trim(), tipo); setNome(""); } }}
        className="flex gap-2">
        <select value={tipo} onChange={e => setTipo(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
          <option value="PERDA">Perda</option>
          <option value="GANHO">Ganho</option>
          <option value="CANCELAMENTO">Cancelamento</option>
        </select>
        <input value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Novo motivo..."
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
        <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition">
          <Plus className="w-4 h-4" />
        </button>
      </form>
      <div className="space-y-1">
        {items.length === 0 ? (
          <p className="text-sm text-gray-600 py-4 text-center">Nenhum registro</p>
        ) : items.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition group">
            {editId === item.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") { onEdit?.(item.id, editNome.trim()); setEditId(null); }
                    if (e.key === "Escape") setEditId(null);
                  }}
                  className="flex-1 px-2 py-1 bg-gray-700 border border-blue-500 rounded text-sm text-white focus:outline-none"
                />
                <button onClick={() => { onEdit?.(item.id, editNome.trim()); setEditId(null); }} className="text-green-400 hover:text-green-300"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={() => setEditId(null)} className="text-gray-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-200">{item.nome}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.tipo === "GANHO" ? "bg-green-900/50 text-green-300" :
                    item.tipo === "PERDA" ? "bg-red-900/50 text-red-300" :
                    "bg-gray-700 text-gray-400"
                  }`}>{item.tipo}</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  {onEdit && <button onClick={() => { setEditId(item.id); setEditNome(item.nome); }} className="text-gray-600 hover:text-blue-400"><Pencil className="w-3.5 h-3.5" /></button>}
                  <button onClick={() => onDelete(item.id)} className="text-gray-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
