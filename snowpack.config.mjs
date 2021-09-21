// Snowpack Configuration File

// See all supported options: https://www.snowpack.dev/reference/configuration
/** @type {import('snowpack').SnowpackUserConfig } */
// eslint-disable-next-line import/no-default-export
export default {
  buildOptions: {
    jsxInject: "import React from 'react'",
    sourcemap: true,
  },
  devOptions: {
    port: 3000,
  },
  exclude: [
    '**/node_modules/**/*',
    '**/.github/**/*',
    '**/.git/**/*',
    '**/coverage/**/*',
    '**/scripts/**/*',
    '**/.husky/**/*',
    '**/.idea/**/*',
    '**/recordings/**/*',
    '**/commitlint.config.js',
    '**/npmpackagejsonlint.config.js',
    '**/package.json',
    '**/package-lock.json',
    '**/tsconfig.json',
    '**/tsconfig.tsbuildinfo',
    '**/web-test-runner.config.js',
    '**/snowpack.config.mjs',
    '**/*.md',
    '**/*.yml',
    '**/*.toml',
  ],
  optimize: {
    bundle: true,
    loader: {
      '.gif': 'file',
      '.png': 'file',
    },
    manifest: true,
    minify: true,
    splitting: true,
    target: 'es2020',
    treeshake: true,
  },
  packageOptions: {
    external: ['crypto'],
    polyfillNode: true,
    source: 'local',
  },
  plugins: [
    '@snowpack/plugin-react-refresh',
    [
      'snowpack-plugin-svgr',
      {
        /* see "Plugin Options" below */
      },
    ],
    '@snowpack/plugin-dotenv',
  ],
  routes: [
    {
      dest: '/index.html',
      match: 'routes',
      src: '.*',
    },
  ],
  testOptions: {
    files: [
      '**/__tests__/**/*',
      '**/__mocks__/**/*',
      'testHelper/**/*',
      '**/*.@(spec|test).*',
      '**/*.har',
    ],
  },
};
