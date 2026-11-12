import { renderHook, act } from "@testing-library/react";
import { Formik } from "formik";
import React from "react";
import { useOtherVocabularyField } from "../useOtherVocabularyField";

const VOCAB_ITEMS = [
  { id: "xrd", name: "X-ray Diffraction", text: "X-ray Diffraction", value: "xrd" },
  { id: "sem", name: "SEM", text: "SEM", value: "sem" },
  { id: "ftir", name: "FTIR", text: "FTIR", value: "ftir" },
  { id: "other", name: "Other", text: "Other", value: "other" },
];

const DEFAULT_ARGS = {
  vocabItemFieldPath: "vocabItem",
  typeFieldPath: "type",
  otherItemId: "other",
  vocabularyItems: VOCAB_ITEMS,
};

function makeWrapper(initialValues = { vocabItem: {}, type: "" }) {
  return function Wrapper({ children }) {
    return (
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        {children}
      </Formik>
    );
  };
}

// --- pinnedSearch ---

describe("pinnedSearch", () => {
  it("returns all options when query is empty", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper(),
    });
    const filtered = result.current.pinnedSearch(VOCAB_ITEMS, "");
    expect(filtered).toHaveLength(VOCAB_ITEMS.length);
  });

  it("filters non-other items by query", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper(),
    });
    const filtered = result.current.pinnedSearch(VOCAB_ITEMS, "xr");
    expect(filtered.map((o) => o.id)).toContain("xrd");
    expect(filtered.map((o) => o.id)).not.toContain("sem");
    expect(filtered.map((o) => o.id)).not.toContain("ftir");
  });

  it("always includes the Other item regardless of query", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper(),
    });
    // "zzz" matches nothing by name, but Other must still appear
    const filtered = result.current.pinnedSearch(VOCAB_ITEMS, "zzz");
    expect(filtered.map((o) => o.id)).toContain("other");
    expect(filtered).toHaveLength(1);
  });

  it("places Other at the end of filtered results", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper(),
    });
    const filtered = result.current.pinnedSearch(VOCAB_ITEMS, "xr");
    expect(filtered[filtered.length - 1].id).toBe("other");
  });

  it("is case-insensitive", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper(),
    });
    const filtered = result.current.pinnedSearch(VOCAB_ITEMS, "XRD");
    expect(filtered.map((o) => o.id)).toContain("xrd");
  });
});

// --- handleVocabChange ---

describe("handleVocabChange", () => {
  it("sets vocabItem to { id } and copies name to type for a normal selection", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper(),
    });
    const mockSetFieldValue = jest.fn();
    act(() => {
      result.current.handleVocabChange({
        data: { value: "xrd" },
        formikProps: { form: { setFieldValue: mockSetFieldValue } },
      });
    });
    expect(mockSetFieldValue).toHaveBeenCalledWith("vocabItem", { id: "xrd" });
    expect(mockSetFieldValue).toHaveBeenCalledWith("type", "X-ray Diffraction");
  });

  it("sets vocabItem to { id: 'other' } and clears type for the Other selection", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper(),
    });
    const mockSetFieldValue = jest.fn();
    act(() => {
      result.current.handleVocabChange({
        data: { value: "other" },
        formikProps: { form: { setFieldValue: mockSetFieldValue } },
      });
    });
    expect(mockSetFieldValue).toHaveBeenCalledWith("vocabItem", { id: "other" });
    expect(mockSetFieldValue).toHaveBeenCalledWith("type", "");
  });

  it("sets both fields to empty when selection is cleared", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper({ vocabItem: { id: "xrd" }, type: "X-ray Diffraction" }),
    });
    const mockSetFieldValue = jest.fn();
    act(() => {
      result.current.handleVocabChange({
        data: { value: "" },
        formikProps: { form: { setFieldValue: mockSetFieldValue } },
      });
    });
    expect(mockSetFieldValue).toHaveBeenCalledWith("vocabItem", {});
    expect(mockSetFieldValue).toHaveBeenCalledWith("type", "");
  });
});

// --- isOtherSelected ---

describe("isOtherSelected", () => {
  it("is false when no item is selected", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper({ vocabItem: {}, type: "" }),
    });
    expect(result.current.isOtherSelected).toBe(false);
  });

  it("is false for a normal vocabulary selection", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper({ vocabItem: { id: "xrd" }, type: "X-ray Diffraction" }),
    });
    expect(result.current.isOtherSelected).toBe(false);
  });

  it("is true when the Other item is selected", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper({ vocabItem: { id: "other" }, type: "" }),
    });
    expect(result.current.isOtherSelected).toBe(true);
  });
});

// --- validateOtherText ---

describe("validateOtherText", () => {
  it("returns undefined when Other is not selected", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper({ vocabItem: { id: "xrd" }, type: "X-ray Diffraction" }),
    });
    expect(result.current.validateOtherText("anything")).toBeUndefined();
  });

  it("returns an error when Other is selected and value is empty", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper({ vocabItem: { id: "other" }, type: "" }),
    });
    expect(result.current.validateOtherText("")).toBeTruthy();
    expect(result.current.validateOtherText("   ")).toBeTruthy();
  });

  it("returns an error when the entered text matches an existing vocabulary term", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper({ vocabItem: { id: "other" }, type: "" }),
    });
    expect(result.current.validateOtherText("SEM")).toBeTruthy();
    expect(result.current.validateOtherText("sem")).toBeTruthy();
  });

  it("returns undefined for valid unique text when Other is selected", () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper({ vocabItem: { id: "other" }, type: "" }),
    });
    expect(result.current.validateOtherText("Raman Spectroscopy")).toBeUndefined();
  });
});

// --- handleTypeChange ---

describe("handleTypeChange", () => {
  it("updates the type field value via Formik setFieldValue", async () => {
    const { result } = renderHook(() => useOtherVocabularyField(DEFAULT_ARGS), {
      wrapper: makeWrapper({ vocabItem: { id: "other" }, type: "" }),
    });
    act(() => {
      result.current.handleTypeChange("Raman Spectroscopy");
    });
    expect(result.current.typeValue).toBe("Raman Spectroscopy");
  });
});
