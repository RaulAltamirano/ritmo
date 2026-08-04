module.exports = {
  // Configuración base
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  endOfLine: 'lf',

  // Configuración específica para Vue
  vueIndentScriptAndStyle: false,

  // Configuración específica para TypeScript
  arrowParens: 'avoid',
  bracketSpacing: true,
  bracketSameLine: false,

  // Configuración específica para JSON
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
    {
      files: '*.vue',
      options: {
        parser: 'vue',
      },
    },
    {
      files: '*.ts',
      options: {
        parser: 'typescript',
      },
    },
    {
      files: '*.tsx',
      options: {
        parser: 'typescript',
      },
    },
  ],
};
