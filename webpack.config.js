const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'production',
  bail: true,
  entry: path.resolve(__dirname, './index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.min.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader', options: {
            presets: ['@babel/preset-env']
          } },
        ]
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
  ]
}
