import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const reactRecommended = reactPlugin.configs.flat.recommended;
const reactHooksRecommended = {
  plugins: {
    'react-hooks': reactHooksPlugin,
  },
  rules: reactHooksPlugin.configs.recommended.rules,
};

export default [
  js.configs.recommended,
  reactRecommended,
  reactHooksRecommended,
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
      },
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
        pragma: 'React',
        fragment: 'Fragment',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/prop-types': 'off',
    },
  },
];
