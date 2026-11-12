module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleNameMapper: {
    "^@js/oarepo_vocabularies_ui/form/components$":
      "<rootDir>/src/__mocks__/oarepo_vocabularies_ui_components.js",
    "^@js/oarepo_vocabularies_ui/form/util$":
      "<rootDir>/src/__mocks__/oarepo_vocabularies_ui_util.js",
    "^@js/oarepo_ui/forms$": "<rootDir>/src/__mocks__/oarepo_ui_forms.js",
    "^@js/oarepo_ui/util$": "<rootDir>/src/__mocks__/oarepo_ui_util.js",
  },
};
