import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        ignores: ["eslint.config.js"]
    },
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "script",
            globals: {
                // Browser globals
                document: "readonly",
                window: "readonly",
                setInterval: "readonly",
                setTimeout: "readonly",
                // Node globals
                module: "readonly",
                require: "readonly",
                // MagicMirror globals
                Module: "readonly",
                Log: "readonly",
                config: "readonly"
            }
        },
        rules: {
            "indent": ["error", 4, { "SwitchCase": 1 }],
            "linebreak-style": ["error", "unix"],
            "quotes": ["error", "double", { "avoidEscape": true }],
            "semi": ["error", "always"],
            "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "no-console": "off",
            "eqeqeq": ["error", "always"],
            "curly": ["error", "all"],
            "brace-style": ["error", "1tbs"],
            "space-before-blocks": ["error", "always"],
            "keyword-spacing": ["error", { "before": true, "after": true }],
            "comma-dangle": ["error", "never"],
            "no-trailing-spaces": "error",
            "eol-last": ["error", "always"]
        }
    }
];