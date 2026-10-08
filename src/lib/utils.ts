import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { randomUUID } from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cuid(): string {
  return randomUUID().replace(/-/g, "").slice(0, 24);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date));
}

export function formatDatetime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Cálculo da cadeia de margem
export function calcularMargem(params: {
  custo: number;
  margemBrutaPct: number;
  indicePct: number;
  comissaoPct: number;
  quantidade?: number;
}) {
  const { custo, margemBrutaPct, indicePct, comissaoPct, quantidade = 1 } = params;

  const precoVenda = margemBrutaPct >= 100 ? custo * 2 : custo / (1 - margemBrutaPct / 100);
  const margemBrutaRs = precoVenda - custo;
  const deducaoIndiceRs = margemBrutaRs * (indicePct / 100);
  const margemLiquidaRs = margemBrutaRs - deducaoIndiceRs;
  const comissaoRs = margemLiquidaRs * (comissaoPct / 100);
  const resultadoLiq = margemLiquidaRs - comissaoRs;

  return {
    precoVenda,
    margemBrutaRs,
    deducaoIndiceRs,
    margemLiquidaRs,
    comissaoRs,
    resultadoLiq,
    totalVenda: precoVenda * quantidade,
    totalComissao: comissaoRs * quantidade,
  };
}
