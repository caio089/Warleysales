export function deadlinePriority(daysUntilDue: number): "Alta" | "Média" | "Baixa" | "" {
  if (daysUntilDue < 0 || daysUntilDue > 90) return "";
  if (daysUntilDue <= 30) return "Alta";
  if (daysUntilDue <= 60) return "Média";
  return "Baixa";
}
