const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: './app/test/page.tsx',
    'pdf.worker': 'pdfjs-dist/build/pdf.worker.mjs',
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        use: { loader: 'worker-loader' },
      },
      {
        test: /\.(ts|tsx|mjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              jsx: 'react-jsx',
            },
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/pdfjs-dist/build/pdf.worker.mjs',
          to: 'pdf.worker.js',
        },
      ],
    }),
  ],
  mode: 'development',
};