import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        Vue: "readonly",
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        navigator: "readonly",
        HTMLElement: "readonly",
        Event: "readonly",
        customElements: "readonly",
        DISQUS: "readonly",
        jQuery: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "brace-style": ["error", "1tbs"],
      indent: ["error", 2],
      quotes: ["error", "double"],
      semi: ["error", "always"],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".git/**",
      "js/distill.template.v2.js",
      "js/disqus.js",
      "js/toc-dropdown.js",
      "disqus_comments/**",
      "css/bulma.css",
      "scripts/**",
    ],
  },
];
