// Mock for @js/oarepo_ui/forms
// useFormConfig is a jest.fn() so tests can override its return value:
//   import { useFormConfig } from "@js/oarepo_ui/forms";
//   useFormConfig.mockReturnValue({ formConfig: { vocabularies: { ... } } });

export const useFormConfig = jest.fn(() => ({
  formConfig: { vocabularies: {} },
  config: { vocabularies: { vocabularies: {} }, ui_model: {} },
}));

export const useFieldData = jest.fn(() => ({
  getFieldData: () => ({
    label: "",
    helpText: "",
    placeholder: "",
    detail: "single",
  }),
}));

// SUI Dropdown accepts search={true} or a function; true enables built-in search.
export const search = true;
