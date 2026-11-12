// Mock for @js/oarepo_ui/util
export const getLocalizedValue = jest.fn((value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.en || value[Object.keys(value)[0]] || "";
});
