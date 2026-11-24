import { CurrencyField } from "@/shared/ui/forms/fields";
import { CurrencyInput } from "@/shared/ui/forms/currency-input";
import { SimpleTable } from "@/shared/ui/simple-table";

export default function CurrencyFixture() {
  return (
    <>
      <form>
        <CurrencyField label="Valor" name="value" />
        <CurrencyField label="Valor existente" name="existing" defaultValue={10500.5} />
        <CurrencyInput name="readOnly" aria-label="Somente leitura" defaultValue={0.99} readOnly />
        <CurrencyInput name="disabled" aria-label="Desabilitado" defaultValue={100} disabled />
        <button type="reset">Restaurar</button>
      </form>
      <SimpleTable
        caption="Valores persistidos"
        columns={[{ key: "amount", header: "Valor persistido", kind: "currency" }]}
        rows={[{ id: "a", amount: 10000.5 }, { id: "b", amount: null }, { id: "c", amount: 99 }, { id: "d", amount: 1000 }]}
      />
    </>
  );
}
