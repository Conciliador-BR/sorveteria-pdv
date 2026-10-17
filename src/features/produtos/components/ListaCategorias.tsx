import { Badge } from "@/components/ui/Badge";

export function ListaCategorias({ categorias }: { categorias: { id: string; nome: string; ativo: boolean }[] }) {
  if (categorias.length === 0) return <p className="text-sm text-texto-suave">Nenhuma categoria ainda.</p>;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Categorias cadastradas">
      {categorias.map((categoria) => (
        <li key={categoria.id}>
          <Badge tom={categoria.ativo ? "primaria" : "neutro"}>{categoria.nome}</Badge>
        </li>
      ))}
    </ul>
  );
}
