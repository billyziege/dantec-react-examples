/**
 * Vocabulary item filter functions.
 *
 * These are passed as the filterFunction argument to processVocabularyItems().
 * They operate on the serialized option shape: { id, name, text, value, props, ... }.
 */

/**
 * Removes vocabulary items marked as deprecated.
 *
 * Handles all representations of a truthy deprecated value that may appear
 * depending on how Postgres JSONB serialization and Python interact:
 *   - boolean true  (native JSON boolean)
 *   - string "true" (lowercase, from JSON serialization)
 *   - string "True" (Python's str(True))
 *
 * Items with no props, no deprecated key, or deprecated set to any falsy
 * value pass through. Convention: omit the key rather than setting it to
 * "false" — the string "false" would also pass through, but relying on that
 * is fragile.
 */
export const filterDeprecated = (options) =>
  options.filter(
    (o) => String(o.props?.deprecated).toLowerCase() !== "true"
  );
