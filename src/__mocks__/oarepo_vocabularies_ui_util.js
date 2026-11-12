// Mock for @js/oarepo_vocabularies_ui/form/util
// processVocabularyItems normalizes raw vocabulary items into SUI Dropdown option shape.
// In tests, raw items are pre-normalized so this is an identity transform.
export const processVocabularyItems = (items, _showLeafsOnly, filterFunction) => {
  if (!items) return [];
  const result = items.map((item) => ({
    id: item.id ?? item.value,
    value: item.id ?? item.value,
    text: item.name ?? item.text ?? item.id,
    key: item.id ?? item.value,
    name: item.name ?? item.text ?? item.id,
    ...item,
  }));
  return filterFunction ? filterFunction(result) : result;
};
