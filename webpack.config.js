import DotenvWebpackPlugin from 'dotenv-webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ESLintPlugin from 'eslint-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import {dirname} from 'path'
import {fileURLToPath} from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export default {
  entry: __dirname + '/src/index.js',
  devServer: {
    contentBase: __dirname + '/dist',
    hot: true,
  },
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
  },
  optimization: {
    usedExports: true,
  },
  plugins: [
    new DotenvWebpackPlugin(),
    new HtmlWebpackPlugin({template: 'src/index.html'}),
    new ESLintPlugin(),
    new CopyPlugin({
      patterns: [
        {from: 'static', to: 'static'},
      ]},
    ),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-env'],
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}
