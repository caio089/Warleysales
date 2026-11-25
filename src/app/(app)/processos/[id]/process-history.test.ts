import { describe, expect, it } from "vitest";
import { buildProcessHistory, documentPlacementDates } from "./process-history";

describe("buildProcessHistory", () => {
  it("registra envio, DFD/ETP colocados e formalização com data/hora", () => {
    const entries = buildProcessHistory({
      process: {
        number: "001/2026",
        createdAt: "2026-01-10T12:00:00.000Z",
        documentalCompletedAt: "2026-01-20T15:00:00.000Z",
      },
      request: {
        title: "Compra de carros",
        createdAt: "2026-01-10T12:05:00.000Z",
        events: [
          { to: "enviada", at: "2026-01-10T12:06:00.000Z" },
          { to: "aprovada", at: "2026-01-11T09:00:00.000Z", note: "Ok" },
        ],
      },
      documents: [
        {
          id: "d1",
          typeCode: "DFD",
          fileName: "dfd.pdf",
          createdAt: "2026-01-12T10:00:00.000Z",
        },
        {
          id: "d2",
          typeCode: "ETP",
          fileName: "etp.pdf",
          createdAt: "2026-01-13T11:30:00.000Z",
        },
      ],
      formalization: {
        createdAt: "2026-01-18T11:00:00.000Z",
        status: "homologado",
        homologatedAt: "2026-01-19T14:00:00.000Z",
        auctionDate: "2026-01-17",
      },
    });

    expect(entries.some((entry) => entry.title === "Solicitação enviada para aprovação")).toBe(true);
    expect(entries.some((entry) => entry.title === "Solicitação aprovada" && entry.description === "Ok")).toBe(true);
    expect(entries.some((entry) => entry.title === "DFD colocado")).toBe(true);
    expect(entries.some((entry) => entry.title === "ETP colocado")).toBe(true);
    expect(entries.some((entry) => entry.title === "Formalização homologada")).toBe(true);
    expect(entries[0]?.title).toBe("Pasta documental completa");
  });
});

describe("documentPlacementDates", () => {
  it("mostra a primeira data em que cada tipo foi colocado", () => {
    const rows = documentPlacementDates([
      { typeCode: "DFD", fileName: "dfd-v1.pdf", createdAt: "2026-01-12T10:00:00.000Z" },
      { typeCode: "DFD", fileName: "dfd-v2.pdf", createdAt: "2026-01-14T10:00:00.000Z" },
      { typeCode: "ETP", fileName: "etp.pdf", createdAt: "2026-01-13T11:30:00.000Z" },
      { typeCode: "MR", fileName: "mr-old.pdf", createdAt: "2026-01-01T08:00:00.000Z", linkStatus: "archived" },
    ]);
    expect(rows).toEqual([
      {
        typeCode: "DFD",
        label: "Documento de Formalização da Demanda",
        placedAt: "2026-01-12T10:00:00.000Z",
        fileName: "dfd-v1.pdf",
      },
      {
        typeCode: "ETP",
        label: "Estudo Técnico Preliminar",
        placedAt: "2026-01-13T11:30:00.000Z",
        fileName: "etp.pdf",
      },
    ]);
  });
});
