import { useFormikContext, getIn } from "formik";

/**
 * Logic hook for OtherVocabularySelectField.
 *
 * Separating logic from rendering makes this fully testable without any
 * oarepo dependencies — only Formik is required.
 *
 * @param {string} vocabItemFieldPath - Formik path for the vocab item object (stores { id }).
 * @param {string} typeFieldPath      - Formik path for the type string (human-readable label).
 * @param {string} otherItemId        - The vocabulary item id treated as "Other".
 * @param {Array}  vocabularyItems    - Pre-serialized options: [{ id, name, text, value }].
 *                                      Comes from processVocabularyItems() on the vocabulary's
 *                                      raw items.
 */
export function useOtherVocabularyField({
  vocabItemFieldPath,
  typeFieldPath,
  otherItemId,
  vocabularyItems,
}) {
  const { values, setFieldValue } = useFormikContext();

  const selectedId = getIn(values, vocabItemFieldPath, {})?.id ?? "";
  const typeValue = getIn(values, typeFieldPath, "");
  const isOtherSelected = Boolean(selectedId) && selectedId === otherItemId;

  // Called by LocalVocabularySelectField's onChange prop.
  // Sets vocabItem to { id } and syncs the type field:
  //   - non-other selection → copy the item's display name
  //   - other or cleared   → clear the type field (user will fill it in)
  const handleVocabChange = ({ data, formikProps }) => {
    const item = vocabularyItems.find((o) => o.id === data.value);
    formikProps.form.setFieldValue(
      vocabItemFieldPath,
      data.value ? { id: data.value } : {}
    );
    if (data.value && data.value !== otherItemId) {
      formikProps.form.setFieldValue(typeFieldPath, item?.name ?? "");
    } else {
      formikProps.form.setFieldValue(typeFieldPath, "");
    }
  };

  // Called by the free-text input shown when "Other" is selected.
  const handleTypeChange = (value) => {
    setFieldValue(typeFieldPath, value);
  };

  // Returns an error string when typeValue is invalid in the Other state,
  // undefined otherwise (Formik-compatible validator signature).
  const validateOtherText = (value) => {
    if (!isOtherSelected) return undefined;
    if (!value || !value.trim()) return "Required when 'Other' is selected.";
    const lower = value.trim().toLowerCase();
    const duplicate = vocabularyItems.some(
      (o) =>
        o.id !== otherItemId &&
        (o.name?.toLowerCase() === lower ||
          o.text?.toString().toLowerCase() === lower)
    );
    if (duplicate) return "This value already exists as a vocabulary term.";
    return undefined;
  };

  // Custom SUI Dropdown search function: always keeps the "Other" item visible
  // regardless of what the user has typed.  Non-other items are filtered normally.
  const pinnedSearch = (options, query) => {
    if (!query) return options;
    const other = options.find((o) => o.id === otherItemId);
    const rest = options.filter((o) => o.id !== otherItemId);
    const q = query.toLowerCase();
    const filtered = rest.filter(
      (o) =>
        o.text?.toString().toLowerCase().includes(q) ||
        o.value?.toString().toLowerCase().includes(q) ||
        o.name?.toString().toLowerCase().includes(q)
    );
    return other ? [...filtered, other] : filtered;
  };

  return {
    isOtherSelected,
    typeValue,
    selectedId,
    handleVocabChange,
    handleTypeChange,
    validateOtherText,
    pinnedSearch,
  };
}
