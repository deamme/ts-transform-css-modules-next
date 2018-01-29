const path = require('path')
const {
  FuseBox,
  Sparky,
  EnvPlugin,
  CSSPlugin,
  WebIndexPlugin,
  QuantumPlugin,
} = require('fuse-box');
const transformCSS = require('../../../dist').default
const transformInferno = require('ts-transform-inferno').default;
let fuse, app;
let isProduction = false;

Sparky.task('config', _ => {
  fuse = new FuseBox({
    homeDir: 'src',
    hash: isProduction,
    output: 'dist/$name.js',
    cache: false,
    sourceMaps: !isProduction,
    useJsNext: true,
    target: "browser",
    transformers: {
      before: [transformCSS({
        autoprefix: true,
        paths: [path.resolve(__dirname, 'styles')],
        output: path.resolve(__dirname, 'dist')
      }), transformInferno({ classwrap: false })],
    },
    plugins: [
      EnvPlugin({ NODE_ENV: isProduction ? 'production' : 'development' }),
      CSSPlugin({
        outFile: (file) => path.resolve(__dirname, 'dist') + `/${file}`
      }),
      WebIndexPlugin({
        title: 'Inferno Typescript FuseBox Example',
        template: 'src/index.html',
      }),
      isProduction &&
      QuantumPlugin({
        bakeApiIntoBundle: 'app',
        treeshake: true,
        uglify: false,
      }),
    ],
  });
  app = fuse.bundle('app').instructions('>index.tsx');
});

Sparky.task('clean', _ => Sparky.src('dist/').clean('dist/'));
Sparky.task('env', _ => (isProduction = true));
Sparky.task('dev', ['clean', 'config'], async () => {
  fuse.dev();
  app.hmr().watch();

  await Sparky.watch('src/**/**.styl', undefined, (event, file) => {
    fuse.sendPageReload();
  }).exec()
  await fuse.run()
  
});

Sparky.task('prod', ['clean', 'env', 'config'], _ => {
  fuse.dev({ reload: true }); // remove after demo
  return fuse.run();
});
