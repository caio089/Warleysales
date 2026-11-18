import { describe, expect, it } from "vitest";
import { exactProduct, filterProducts, type ProductOption } from "./product-search";

const options: ProductOption[] = [
  { value: "1", label: "PCA-CRCPI-003 — Aquisição de veículos novos" },
  { value: "2", label: "PCA-CRCPI-010 — Papel A4" },
  { value: "3", label: "PCA-SFAPI-003 — Locação de veículos" },
];

describe("busca de produto", () => {
  it("encontra pelo nome sem acento e pelo código", () => {
    expect(filterProducts(options, "veiculo").map((item) => item.value)).toEqual(["1", "3"]);
    expect(filterProducts(options, "sfapi-003").map((item) => item.value)).toEqual(["3"]);
  });

  it("reconhece o nome completo como um único produto", () => {
    expect(exactProduct(options, "papel a4")).toBeNull();
    expect(exactProduct(options, "PCA-CRCPI-010 — Papel A4")?.value).toBe("2");
  });
});
