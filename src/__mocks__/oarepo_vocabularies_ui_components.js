// Mock for @js/oarepo_vocabularies_ui/form/components
// LocalVocabularySelectField is replaced by a simple select that:
//   - calls onChange with the same shape the real component uses
//   - exposes whether a custom search function was provided
//
// Tests can interact via: fireEvent.change(screen.getByTestId('vocab-select'), ...)
// or: await userEvent.selectOptions(screen.getByTestId('vocab-select'), value)

import React from "react";
import { useFormikContext } from "formik";

export const LocalVocabularySelectField = ({
  fieldPath,
  onChange,
  search,
  vocabularyName,
  ...rest
}) => {
  const { setFieldValue } = useFormikContext();
  return (
    <div data-testid="vocab-select-wrapper">
      <select
        data-testid="vocab-select"
        data-field-path={fieldPath}
        data-vocabulary-name={vocabularyName}
        data-has-custom-search={typeof search === "function" ? "true" : "false"}
        defaultValue=""
        onChange={(e) => {
          if (onChange) {
            onChange({
              data: { value: e.target.value },
              formikProps: { form: { setFieldValue } },
            });
          }
        }}
      >
        <option value="">—</option>
        <option value="xrd">X-ray Diffraction</option>
        <option value="sem">SEM</option>
        <option value="other">Other</option>
      </select>
    </div>
  );
};
