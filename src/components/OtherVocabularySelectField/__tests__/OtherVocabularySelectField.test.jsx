import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Formik } from "formik";
import { OtherVocabularySelectField } from "../OtherVocabularySelectField";
import { useFormConfig } from "@js/oarepo_ui/forms";

// Raw vocabulary items as they would come from formConfig.vocabularies[name].all
const RAW_VOCAB = [
  { id: "xrd", title: { en: "X-ray Diffraction" } },
  { id: "sem", title: { en: "SEM" } },
  { id: "other", title: { en: "Other" } },
];

// processVocabularyItems mock (from __mocks__) normalizes these to { id, name, text, value }

function setupFormConfig(vocabName = "methods") {
  useFormConfig.mockReturnValue({
    formConfig: {
      vocabularies: {
        [vocabName]: { all: RAW_VOCAB },
      },
    },
    config: {},
  });
}

function renderField(initialValues = { vocabItem: {}, type: "" }, props = {}) {
  setupFormConfig();
  return render(
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      <OtherVocabularySelectField
        vocabItemFieldPath="vocabItem"
        typeFieldPath="type"
        vocabularyName="methods"
        otherItemId="other"
        {...props}
      />
    </Formik>
  );
}

// --- rendering ---

describe("rendering", () => {
  it("renders the vocabulary select", () => {
    renderField();
    expect(screen.getByTestId("vocab-select")).toBeInTheDocument();
  });

  it("passes the correct fieldPath and vocabularyName to the select", () => {
    renderField();
    const select = screen.getByTestId("vocab-select");
    expect(select).toHaveAttribute("data-field-path", "vocabItem");
    expect(select).toHaveAttribute("data-vocabulary-name", "methods");
  });

  it("passes a custom search function (not the default)", () => {
    renderField();
    const select = screen.getByTestId("vocab-select");
    expect(select).toHaveAttribute("data-has-custom-search", "true");
  });

  it("does not render the type input when no item is selected", () => {
    renderField({ vocabItem: {}, type: "" });
    expect(screen.queryByPlaceholderText("Enter type...")).not.toBeInTheDocument();
  });

  it("does not render the type input when a normal vocabulary item is selected", () => {
    renderField({ vocabItem: { id: "xrd" }, type: "X-ray Diffraction" });
    expect(screen.queryByPlaceholderText("Enter type...")).not.toBeInTheDocument();
  });

  it("renders the type input when the Other item is selected", () => {
    renderField({ vocabItem: { id: "other" }, type: "" });
    expect(screen.getByPlaceholderText("Enter type...")).toBeInTheDocument();
  });

  it("accepts a custom typeLabel and typePlaceholder", () => {
    renderField(
      { vocabItem: { id: "other" }, type: "" },
      { typeLabel: "Method name", typePlaceholder: "Describe the method..." }
    );
    expect(screen.getByPlaceholderText("Describe the method...")).toBeInTheDocument();
    expect(screen.getByText("Method name")).toBeInTheDocument();
  });
});

// --- interaction: selecting Other ---

describe("selecting Other triggers type input", () => {
  it("shows the type input after selecting the Other item", async () => {
    renderField();
    const select = screen.getByTestId("vocab-select");

    fireEvent.change(select, { target: { value: "other" } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter type...")).toBeInTheDocument();
    });
  });

  it("hides the type input after switching away from Other", async () => {
    renderField({ vocabItem: { id: "other" }, type: "" });

    const select = screen.getByTestId("vocab-select");
    fireEvent.change(select, { target: { value: "xrd" } });

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("Enter type...")
      ).not.toBeInTheDocument();
    });
  });
});

// --- enableValidation flag ---

describe("enableValidation", () => {
  it("suppresses all validation errors when enableValidation is false", async () => {
    renderField(
      { vocabItem: { id: "other" }, type: "" },
      { enableValidation: false }
    );
    const input = screen.getByPlaceholderText("Enter type...");

    // Duplicate name — would normally error
    fireEvent.change(input, { target: { value: "SEM" } });

    await waitFor(() => {
      expect(
        screen.queryByText("This value already exists as a vocabulary term.")
      ).not.toBeInTheDocument();
    });

    // Empty value — would normally error
    fireEvent.change(input, { target: { value: "" } });

    await waitFor(() => {
      expect(
        screen.queryByText("Required when 'Other' is selected.")
      ).not.toBeInTheDocument();
    });
  });
});

// --- deprecated item filtering ---

describe("deprecated item filtering", () => {
  it("does not trigger a duplicate error for a name that belongs to a deprecated item", async () => {
    // SEM is deprecated in this test's vocabulary
    useFormConfig.mockReturnValue({
      formConfig: {
        vocabularies: {
          methods: {
            all: [
              { id: "xrd", name: "X-ray Diffraction" },
              { id: "sem", name: "SEM", props: { deprecated: true } },
              { id: "other", name: "Other" },
            ],
          },
        },
      },
      config: {},
    });

    render(
      <Formik initialValues={{ vocabItem: { id: "other" }, type: "" }} onSubmit={() => {}}>
        <OtherVocabularySelectField
          vocabItemFieldPath="vocabItem"
          typeFieldPath="type"
          vocabularyName="methods"
          otherItemId="other"
        />
      </Formik>
    );

    const input = screen.getByPlaceholderText("Enter type...");
    fireEvent.change(input, { target: { value: "SEM" } });

    await waitFor(() => {
      expect(
        screen.queryByText("This value already exists as a vocabulary term.")
      ).not.toBeInTheDocument();
    });
  });
});

// --- validation in the type input ---

describe("type input validation", () => {
  it("shows an error when the type input is empty while Other is selected", async () => {
    renderField({ vocabItem: { id: "other" }, type: "" });
    const input = screen.getByPlaceholderText("Enter type...");

    // Simulate typing then clearing
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.change(input, { target: { value: "" } });

    await waitFor(() => {
      expect(
        screen.getByText("Required when 'Other' is selected.")
      ).toBeInTheDocument();
    });
  });

  it("shows an error when the entered text duplicates an existing vocabulary term", async () => {
    renderField({ vocabItem: { id: "other" }, type: "" });
    const input = screen.getByPlaceholderText("Enter type...");

    fireEvent.change(input, { target: { value: "SEM" } });

    await waitFor(() => {
      expect(
        screen.getByText("This value already exists as a vocabulary term.")
      ).toBeInTheDocument();
    });
  });

  it("shows no error for a valid unique type string", async () => {
    renderField({ vocabItem: { id: "other" }, type: "" });
    const input = screen.getByPlaceholderText("Enter type...");

    fireEvent.change(input, { target: { value: "Raman Spectroscopy" } });

    await waitFor(() => {
      expect(
        screen.queryByText("Required when 'Other' is selected.")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("This value already exists as a vocabulary term.")
      ).not.toBeInTheDocument();
    });
  });
});
