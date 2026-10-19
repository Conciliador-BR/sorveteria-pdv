import { Badge, type TomBadge } from "@/components/ui/Badge";
import { rotulosStatus, type StatusVenda as Status } from "../rotulos";

const tons: Record<Status, TomBadge> = { concluida: "sucesso", cancelada: "perigo", aberta: "acento" };

export function StatusVenda({ status }: { status: Status }) {
  return <Badge tom={tons[status]}>{rotulosStatus[status]}</Badge>;
}
