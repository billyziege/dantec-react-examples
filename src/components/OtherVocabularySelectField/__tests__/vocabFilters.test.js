import { filterDeprecated } from "../vocabFilters";

const item = (id, deprecated) => ({
  id,
  name: id,
  value: id,
  ...(deprecated !== undefined ? { props: { deprecated } } : {}),
});

describe("filterDeprecated", () => {
  it("keeps items with no props at all", () => {
    const result = filterDeprecated([{ id: "xrd", name: "XRD", value: "xrd" }]);
    expect(result).toHaveLength(1);
  });

  it("keeps items with props but no deprecated key", () => {
    const result = filterDeprecated([
      { id: "xrd", name: "XRD", value: "xrd", props: { unit: "K" } },
    ]);
    expect(result).toHaveLength(1);
  });

  it("removes items with deprecated as boolean true", () => {
    expect(filterDeprecated([item("xrd", true)])).toHaveLength(0);
  });

  it("removes items with deprecated as string 'true' (lowercase)", () => {
    expect(filterDeprecated([item("xrd", "true")])).toHaveLength(0);
  });

  it("removes items with deprecated as string 'True' (Python str(True))", () => {
    expect(filterDeprecated([item("xrd", "True")])).toHaveLength(0);
  });

  it("keeps items with deprecated as boolean false", () => {
    expect(filterDeprecated([item("xrd", false)])).toHaveLength(1);
  });

  it("keeps items with deprecated as string 'false'", () => {
    expect(filterDeprecated([item("xrd", "false")])).toHaveLength(1);
  });

  it("keeps items with deprecated as undefined", () => {
    expect(filterDeprecated([item("xrd", undefined)])).toHaveLength(1);
  });

  it("keeps non-deprecated items and removes deprecated ones from a mixed list", () => {
    const options = [
      item("xrd", undefined),
      item("sem", true),
      item("ftir", "true"),
      item("tem", false),
      item("other", undefined),
    ];
    const result = filterDeprecated(options);
    expect(result.map((o) => o.id)).toEqual(["xrd", "tem", "other"]);
  });
});
