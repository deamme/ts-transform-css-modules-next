# ts-transform-css-modules-next
[![travis](https://travis-ci.org/deamme/ts-transform-classcat.svg?branch=master)](https://travis-ci.org/deamme/ts-transform-classcat)
[![npm version](https://badge.fury.io/js/ts-transform-css-modules-next.svg)](https://badge.fury.io/js/ts-transform-css-modules-next)

Transform JSX styleName prop to className corresponding atomic CSS classes. Large projects will benefit greatly because each CSS declaration is being reused effeciently.
[Check out the introductory blog post](https://medium.com/@Deam/css-modules-next-intro-a4ab14fe572f).

### Before transpilation:

index.tsx
```javascript
import './styles.styl'

<div styleName="button" class="test"><div/>
```
styles.styl
```css
.button {
  width: 4rem;
  height: 1rem;
  background-color: black;
}
```
### After transpilation:

index.jsx
```javascript
<div className="test a b c"><div/>
```
Outputs a prettified styles.css and a minified styles.min.css
```css
.a {
  width: 4rem;
}
.b {
  height: 1rem;
}
.c {
  background-color: black;
}
```
# Install
`yarn add -D ts-transform-css-modules-next`

## General usage
```javascript
const transformCSS = require('ts-transform-css-modules-next').default;

transformCSS({
  // Preprocessor of choice - "stylus" or "sass"
  preprocessor: 'stylus'

  // Output path for final CSS output files (styles.css and styles.min.css)
  output: resolve(__dirname, './dist')

  // Optional global paths for Stylus @import statements 
  paths: [resolve(__dirname, './styles')],

  // Optional global sass/stylus file (you should import normalize.css and custom global classnames here)
  globalPath: resolve(__dirname, './styles/globals')

  // Optional autoprefix
  autoprefix: true
})
```

## Usage
Look into the `examples` folder.
To understand commands associated with each project look into `package.json` and its scripts.

Webpack example is still work in progress.

## Testing
You can run the following command to test: `npm test`

### Adding test cases
Write your test in a `.tsx` file and add it to `tests/cases`.

Compile with `npm test` and look into the `tests/temp` and verify.

Overwrite references by running the following command: `npm run overwrite-references`

Run `npm test` again to verify that all tests are passing.

## Credits
Heavily inspired by following projects:
- [babel-plugin-react-css-modules](https://github.com/gajus/babel-plugin-react-css-modules)
- [ts-transform-css-modules](https://github.com/longlho/ts-transform-css-modules)
- [Styletron](https://github.com/rtsao/styletron)
- [Fela](https://github.com/rofrischmann/fela)
- [Tachyons](https://github.com/tachyons-css/tachyons)
