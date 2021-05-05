// const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const path = require('path');

module.exports = {
  productionSourceMap: false
  // ,
  // chainWebpack: config => {
  //   config.plugin('monaco-editor').use(MonacoWebpackPlugin, [
  //     {
  //       // Languages are loaded on demand at runtime
  //       languages: ['json', 'javascript', 'typescript', 'yaml', 'json' ],
  //       features: ['!gotoSymbol', '!suggest']
  //       }
  //   ])
  // }
}
