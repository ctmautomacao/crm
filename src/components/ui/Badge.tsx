import { cn } from "@/lib/utils";

const variants = {
  default: "bg-gray-800 text-gray-300",
  blue: "bg-blue-900/50 text-blue-400",
  green: "bg-green-900/50 text-green-400",
  yellow: "bg-yellow-900/50 text-yellow-400",
  red: "bg-red-900/50 text-red-400",
  purple: "bg-purple-900/50 text-purple-400",
  orange: "bg-orange-900/50 text-orange-400",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

export const statusLeadVariant: Record<string, keyof typeof variants> = {
  NOVO: "blue",
  CONTATO_REALIZADO: "yellow",
  EM_NEGOCIACAO: "orange",
  CONVERTIDO: "green",
  PERDIDO: "red",
  DESCARTADO: "default",
};

export const statusLeadLabel: Record<string, string> = {
  NOVO: "Novo",
  CONTATO_REALIZADO: "Contato",
  EM_NEGOCIACAO: "Em Negociação",
  CONVERTIDO: "Convertido",
  PERDIDO: "Perdido",
  DESCARTADO: "Descartado",
};

export const statusPropostaVariant: Record<string, keyof typeof variants> = {
  RASCUNHO: "default",
  ENVIADA: "blue",
  APROVADA: "green",
  REPROVADA: "red",
  CANCELADA: "default",
};

export const statusPropostaLabel: Record<string, string> = {
  RASCUNHO: "Rascunho",
  ENVIADA: "Enviada",
  APROVADA: "Aprovada",
  REPROVADA: "Reprovada",
  CANCELADA: "Cancelada",
};
