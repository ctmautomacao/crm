"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusPropostaVariant, statusPropostaLabel } from "@/components/ui/Badge";
import { formatDate, formatCurrency, calcularMargem } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const STATUS_LIST = ["RASCUNHO", "ENVIADA", "EM_NEGOCIACAO", "APROVADA", "REPROVADA", "CANCELADA"];

export default function PropostaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabelas, setTabelas] = useState<any>({});
  const [addingItem, setAddingItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    descricao: "", produtoId: "", quantidade: "1",
    custo: "", margemBrutaPct: "20", indicePct: "0", comissaoPct: "5",
  });
  const [savingItem, setSavingItem] = useState(false);
  const [status, setStatus] = useState("");

  async function load() {
    const [pRes, tRes] = await Promise.all([
      fetch(`/api/propostas/${id}`),
      fetch("/api/configuracoes/tabelas"),
    ]);
    const pData = await pRes.json();
    const tData = await tRes.json();
    setData(pData);
    setTabelas(tData);
    setStatus(pData.proposta?.status || "RASCUNHO");
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function adicionarItem(e: React.FormEvent) {
    e.preventDefault();
    setSavingItem(true);
    await fetch(`/api/propostas/${id}/itens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemForm),
    });
    setSavingItem(false);
    setAddingItem(false);
    setItemForm({ descricao: "", produtoId: "", quantidade: "1", custo: "", margemBrutaPct: "20", indicePct: "0", comissaoPct: "5" });
    load();
  }

  async function removerItem(itemId: string) {
    if (!confirm("Remover este item?")) return;
    await fetch(`/api/propostas/${id}/itens`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    load();
  }

  async function alterarStatus(novoStatus: string) {
    setStatus(novoStatus);
    await fetch(`/api/propostas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });
    load();
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando...</div>;
  if (!data?.proposta) return <div className="p-8 text-center text-gray-500">Proposta não encontrada</div>;

  const { proposta, cliente, vendedor, oportunidade, itens } = data;

  // Calcula preview do item atual
  const previewCalc = itemForm.custo && itemForm.margemBrutaPct
    ? calcularMargem({
        custo: Number(itemForm.custo),
        margemBrutaPct: Number(itemForm.margemBrutaPct),
        indicePct: Number(itemForm.indicePct || 0),
        comissaoPct: Number(itemForm.comissaoPct || 0),
        quantidade: Number(itemForm.quantidade || 1),
      })
    : null;

  return (
    <div>
      <PageHeader
        title={proposta.numero}
        subtitle={cliente?.nome || "Sem cliente"}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant={statusPropostaVariant[proposta.status]}>{statusPropostaLabel[proposta.status]}</Badge>
            <select
              value={status}
              onChange={e => alterarStatus(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {STATUS_LIST.map(s => (
                <option key={s} value={s}>{statusPropostaLabel[s]}</option>
              ))}
            </select>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Cliente", value: cliente?.nome || "-" },
            { label: "Oportunidade", value: oportunidade?.titulo || "-" },
            { label: "Vendedor", value: vendedor?.nome || "-" },
            { label: "Validade", value: proposta.validadeAte ? formatDate(proposta.validadeAte) : "-" },
          ].map(item => (
            <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="text-sm font-medium text-gray-200">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Itens */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-gray-300">Itens da Proposta</h3>
            <button onClick={() => setAddingItem(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition">
              <Plus className="w-3.5 h-3.5" /> Adicionar Item
            </button>
          </div>

          {addingItem && (
            <form onSubmit={adicionarItem} className="p-5 border-b border-gray-800 bg-gray-800/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">Descrição *</label>
                  <input required value={itemForm.descricao} onChange={e => setItemForm(p => ({ ...p, descricao: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Qtd</label>
                  <input type="number" min="1" value={itemForm.quantidade} onChange={e => setItemForm(p => ({ ...p, quantidade: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Custo Unit. *</label>
                  <input required type="number" step="0.01" value={itemForm.custo} onChange={e => setItemForm(p => ({ ...p, custo: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Margem Bruta %</label>
                  <input type="number" step="0.01" value={itemForm.margemBrutaPct} onChange={e => setItemForm(p => ({ ...p, margemBrutaPct: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Índice %</label>
                  <input type="number" step="0.01" value={itemForm.indicePct} onChange={e => setItemForm(p => ({ ...p, indicePct: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Comissão %</label>
                  <input type="number" step="0.01" value={itemForm.comissaoPct} onChange={e => setItemForm(p => ({ ...p, comissaoPct: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {previewCalc && (
                <div className="grid grid-cols-4 gap-2 mb-3 p-3 bg-gray-900 rounded-lg text-xs">
                  <div>
                    <span className="text-gray-500 block">Preço Unit.</span>
                    <span className="text-green-400 font-medium">{formatCurrency(previewCalc.precoVenda)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Mg. Bruta R$</span>
                    <span className="text-blue-400 font-medium">{formatCurrency(previewCalc.margemBrutaRs)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Comissão R$</span>
                    <span className="text-yellow-400 font-medium">{formatCurrency(previewCalc.comissaoRs)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Resultado Liq.</span>
                    <span className={`font-medium ${previewCalc.resultadoLiq >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatCurrency(previewCalc.resultadoLiq)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button type="button" onClick={() => setAddingItem(false)}
                  className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition">
                  Cancelar
                </button>
                <button type="submit" disabled={savingItem}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition">
                  {savingItem ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </form>
          )}

          {itens?.length === 0 && !addingItem ? (
            <div className="py-12 text-center text-gray-600 text-sm">Nenhum item adicionado</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Qtd</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Custo</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Preço Unit.</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Total</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Mg. Bruta</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Resultado</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {(itens || []).map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-gray-200">
                      {item.descricao}
                      {item.produto && <span className="text-xs text-gray-500 block">{item.produto.partNumber}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-right">{item.quantidade}</td>
                    <td className="px-4 py-3 text-gray-400 text-right">{formatCurrency(Number(item.custo))}</td>
                    <td className="px-4 py-3 text-gray-300 text-right">{formatCurrency(Number(item.precoUnitario))}</td>
                    <td className="px-4 py-3 text-white font-medium text-right">{formatCurrency(Number(item.precoTotal))}</td>
                    <td className="px-4 py-3 text-blue-400 text-right">{formatCurrency(Number(item.margemBrutaRs))}</td>
                    <td className={`px-4 py-3 text-right font-medium ${Number(item.resultadoLiq) >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatCurrency(Number(item.resultadoLiq))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removerItem(item.id)} className="text-gray-600 hover:text-red-400 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-700">
                  <td colSpan={4} className="px-4 py-3 text-xs text-gray-500 font-medium uppercase">Total Geral</td>
                  <td className="px-4 py-3 text-right text-lg font-bold text-white">
                    {formatCurrency(Number(proposta.valorTotal || 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-blue-400 font-medium">
                    {formatCurrency((itens || []).reduce((acc: number, i: any) => acc + Number(i.margemBrutaRs), 0))}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-green-400">
                    {formatCurrency((itens || []).reduce((acc: number, i: any) => acc + Number(i.resultadoLiq), 0))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {proposta.observacoes && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Observações</h3>
            <p className="text-sm text-gray-400">{proposta.observacoes}</p>
          </div>
        )}
      </div>

      <div className="px-6 pb-4">
        <Link href="/crm/propostas" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition w-fit">
          <ArrowLeft className="w-4 h-4" /> Voltar para Propostas
        </Link>
      </div>
    </div>
  );
}
