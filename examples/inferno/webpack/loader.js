const path = require('path')
const fs = require('fs')
const tsLoader = require('ts-loader')

module.exports = function(source) {
  // var callback = this.async();
  var headerPath = this.resourcePath.split('.')[0] + '.tsx'
  // console.log(headerPath)
  this._compiler.plugin("watch-run", (watching, cb) => {
    var times = watching.compiler.fileTimestamps;
    // console.log(times)
    Object.keys(times)
        .filter(function (filePath) {
            // console.log(filePath.match(constants.tsTsxJsJsxRegex))
        const test = headerPath === filePath
            && filePath.match(/\.tsx$/i);
        // console.log(test)
        return test
    })
    cb()
  });

  // return `module.exports = require('${headerPath}');`
  // console.log()
  // this.addDependency(headerPath);
  // console.log(this._compilation.findModule(headerPath))
  // this._compiler.run((test) => {
  //   console.log(test)
  // })
  // this._compiler.applyPlugins("invalid", headerPath, new Date().getTime());
  // if (this._compiler._lastCompilationFileDependencies) {
  //   this._compiler.run((err, stats) => {
  //     // console.log(stats)
  //   })
  // }
  // const onCompiled = (err, compilation) => {
  //   console.log('asdasdasd')
  //   this._compiler._done()
  // }
  // this._compiler.compile(onCompiled)
  // this.loadModule(headerPath, (err, source, sourceMap, module) => {
  //   // console.log(module.needRebuild)
  //   // this._compilation.rebuildModule(module, () => {
  //   //   console.log('whup')
  //   // })
  //   fs.readFile(headerPath, 'utf-8', function(err, content) {
  //     if(err) return callback(err);
  //     console.log(source)
  //     callback(null, source);
  //   });
  // })
  return ''
};
