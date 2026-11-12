import React from "react";
import PropTypes from "prop-types";
import { Form } from "semantic-ui-react";
import { LocalVocabularySelectField } from "@js/oarepo_vocabularies_ui/form/components";
import { processVocabularyItems } from "@js/oarepo_vocabularies_ui/form/util";
import { useFormConfig } from "@js/oarepo_ui/forms";
import { useOtherVocabularyField } from "./useOtherVocabularyField";
import { filterDeprecated } from "./vocabFilters";

/**
 * Vocabulary select field with an "Other" escape hatch.
 *
 * Renders a LocalVocabularySelectField plus a hidden free-text input that
 * appears only when the user selects the designated "Other" item.
 *
 * Two Formik fields are managed together:
 *   - vocabItemFieldPath stores { id } of the selected vocabulary item.
 *   - typeFieldPath stores a human-readable label string:
 *       • for a normal selection: the vocabulary item's display name (copied on select)
 *       • for "Other": whatever the user types in the revealed text input
 *
 * The "Other" item always remains visible in the dropdown filter regardless of
 * what the user types, implemented via a custom search function.
 *
 * Props:
 *   vocabItemFieldPath  Formik path for the vocab item, e.g. "method[0].vocab_item"
 *   typeFieldPath       Formik path for the type string, e.g. "method[0].type"
 *   otherItemId         Vocabulary item id treated as "Other" (default: "other")
 *   vocabularyName      Vocabulary name matching the catalogue entry
 *   typeLabel           Label for the revealed free-text input
 *   typePlaceholder     Placeholder for the revealed free-text input
 *   enableValidation    Boolean flag controlling whether validation occurs.
 *   ...restProps        Forwarded to LocalVocabularySelectField
 */
export const OtherVocabularySelectField = ({
  vocabItemFieldPath,
  typeFieldPath,
  otherItemId = "other",
  vocabularyName,
  typeLabel = "Type",
  typePlaceholder = "Enter type...",
  enableValidation = true,
  ...restProps
}) => {
  const {
    formConfig: { vocabularies },
  } = useFormConfig();

  const { all: rawItems = [] } = vocabularies?.[vocabularyName] ?? {};
  const vocabularyItems = processVocabularyItems(rawItems, false, filterDeprecated);

  const {
    isOtherSelected,
    typeValue,
    handleVocabChange,
    handleTypeChange,
    validateOtherText,
    pinnedSearch,
  } = useOtherVocabularyField({
    vocabItemFieldPath,
    typeFieldPath,
    otherItemId,
    vocabularyItems,
  });

  const typeError = enableValidation ? validateOtherText(typeValue) : undefined;

  return (
    <>
      <LocalVocabularySelectField
        {...restProps}
        fieldPath={vocabItemFieldPath}
        vocabularyName={vocabularyName}
        onChange={handleVocabChange}
        search={pinnedSearch}
      />
      {isOtherSelected && (
        <Form.Input
          label={typeLabel}
          placeholder={typePlaceholder}
          value={typeValue}
          onChange={(e) => handleTypeChange(e.target.value)}
          error={typeError || undefined}
        />
      )}
    </>
  );
};

OtherVocabularySelectField.propTypes = {
  vocabItemFieldPath: PropTypes.string.isRequired,
  typeFieldPath: PropTypes.string.isRequired,
  otherItemId: PropTypes.string,
  vocabularyName: PropTypes.string.isRequired,
  typeLabel: PropTypes.string,
  typePlaceholder: PropTypes.string,
  enableValidation: PropTypes.bool,
};
