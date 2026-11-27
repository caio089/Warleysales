import Image from "next/image";

interface BrandMarkProps {
  /** Versão para fundo escuro (sidebar e painel de login). */
  inverted?: boolean;
  compact?: boolean;
}

/** Marca oficial enviada na identidade visual do Warley Sales. */
export function BrandMark({ inverted = false, compact = false }: BrandMarkProps) {
  if (compact) return (
    <Image
      src={inverted ? "/brand/warley-simbolo-branco.png" : "/brand/warley-simbolo-cor.png"}
      alt="Warley Sales"
      width={640}
      height={736}
      loading="eager"
      className="h-9 w-auto max-w-9 object-contain"
    />
  );

  return (
    <Image
      src={inverted ? "/brand/warley-sales-branco.png" : "/brand/warley-sales-cor.png"}
      alt="Warley Sales — licitações, advocacia e consultoria jurídica"
      width={922}
      height={570}
      loading="eager"
      className="h-[5.75rem] w-auto max-w-[10rem] object-contain"
    />
  );
}
