import * as ts from 'typescript'
import * as postCSS from 'postcss'
import * as autoprefixer from 'autoprefixer'
import * as CleanCSS from 'clean-css'
import { resolve, dirname } from 'path'
import { readFileSync, outputFileSync } from 'fs-extra'
import * as stylus from 'stylus'
import * as sass from 'node-sass'
import { parse, stringify } from 'css'

import generateUniqueClassName from './utils/generateUniqueClassName'
import updateSourceFile from './utils/updateSourceFile'

const EXTENSION_REGEX = /\.(styl|scss)$/

export interface Config {
  preprocessor: 'stylus' | 'sass'
  autoprefix?: Boolean
  paths?: ReadonlyArray<string>
  output: String
}

let _counter = 30
let _CSS = ''
let _declarationCache = {}
let _mediaCache = {}
let _globalCache = {}

const parseRules = (
  rules: Array<any>,
  importMap: Array<any>,
  media?: string,
) => {
  rules.forEach(rule => {
    const type = rule.type
    const firstSelector = rule.selectors && rule.selectors[0]

    if (type === 'rule' && firstSelector.substring(0, 1) === '.') {
      const importMapKey = rule.selectors[0].substring(1)
      let importMapValue = ''

      rule.declarations.forEach(declaration => {
        const prop = declaration.property
        const value = declaration.value
        const valueProp = prop + value + (media ? media : '')
        const cachedClassname = _declarationCache[valueProp]

        if (cachedClassname) {
          importMapValue += cachedClassname + ' '
        } else {
          const uniqueClassName = generateUniqueClassName(_counter)
          _declarationCache[valueProp] = uniqueClassName
          importMapValue += uniqueClassName + ' '
          if (media) {
            _mediaCache[media] += `.${uniqueClassName}{${prop}:${value}}`
          } else {
            _CSS += `.${uniqueClassName}{${prop}:${value}}`
          }
          _counter++
        }
      })

      if (importMap[importMapKey]) {
        importMap[importMapKey] += importMapValue
      } else {
        importMap[importMapKey] = importMapValue
      }
    } else if (type === 'rule') {
      const css = stringify({
        type: 'stylesheet',
        stylesheet: {
          rules: [rule],
        },
      })

      if (!_globalCache[css]) {
        _CSS += css
        _globalCache[css] = true
      }
    }

    if (type === 'media') {
      const media = rule.media
      if (!_mediaCache[media]) {
        _mediaCache[media] = ''
      }
      parseRules(rule.rules, importMap, media)
    }

    if (type === 'keyframes' && !rule.vendor) {
      const css = stringify({
        type: 'stylesheet',
        stylesheet: {
          rules: [rule],
        },
      })

      if (!_globalCache[css]) {
        _CSS += css
        _globalCache[css] = true
      }
    }
  })
}

const generateAtomicClasses = (filePath: string, CONFIG: Config) => {
  const { autoprefix, paths, output, preprocessor } = CONFIG
  const data = readFileSync(filePath, 'utf8')

  if (!data) throw 'Could not read stylus/sass file path'

  let renderedCSS
  if (preprocessor === 'stylus') {
    renderedCSS = stylus.render(data, {
      filename: filePath,
      paths: paths || [],
    })
  } else if (preprocessor === 'sass') {
    renderedCSS = sass.renderSync({
      data: data,
      includePaths: paths ? [dirname(filePath)].concat(paths) : [dirname(filePath)]
    }).css.toString()
  }

  const parsedCSS = parse(renderedCSS)
  let importMap = []

  parseRules(parsedCSS.stylesheet.rules, importMap)

  let mediaCSS = ''
  for (const media in _mediaCache) {
    mediaCSS += `@media ${media}{${_mediaCache[media]}}`
  }

  let _finalCSS = ''
  if (autoprefix) {
    _finalCSS = postCSS([autoprefixer]).process(_CSS + mediaCSS, {
      from: undefined,
    }).css
  } else {
    _finalCSS = _CSS + mediaCSS
  }

  outputFileSync(
    output + '/styles.css',
    new CleanCSS({ format: 'beautify' }).minify(_finalCSS).styles,
  )
  outputFileSync(
    output + '/styles.min.css',
    new CleanCSS().minify(_finalCSS).styles,
  )

  return importMap
}

export default (CONFIG?: Config) => {
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    return (sourceFile: ts.SourceFile) => {
      context['filename'] = sourceFile.fileName
      context['_generateImportMap'] = false
      let newSourceFile = ts.visitEachChild(sourceFile, visitor, context)

      // If the content of styleName is a condition/expression (needs to be evaluated at runtime)
      // then create the `importStylesMap` and import `_getClassNames` function
      if (context['_generateImportMap']) {
        newSourceFile = updateSourceFile(newSourceFile, context['_importMap'])
      }

      return newSourceFile
    }

    function visitor(node: ts.Node): ts.VisitResult<ts.Node> {
      switch (node.kind) {
        case ts.SyntaxKind.ImportDeclaration:
          const stylesPath = (node as any).moduleSpecifier.text
          if (EXTENSION_REGEX.test(stylesPath)) {
            context['_importMap'] = generateAtomicClasses(
              resolve(dirname(context['filename']), stylesPath),
              CONFIG,
            )
            return ts.createCall(ts.createIdentifier('require'), [], [
                ts.createLiteral(stylesPath)
              ],
            )
          }
          return node

        case ts.SyntaxKind.JsxElement:
          return Visit(node as ts.JsxElement, (node as ts.JsxElement).children)

        case ts.SyntaxKind.JsxSelfClosingElement:
          return Visit(node as ts.JsxSelfClosingElement)

        default:
          return ts.visitEachChild(node, visitor, context)
      }
    }

    function Visit(
      node: ts.JsxElement | ts.JsxSelfClosingElement,
      children?: ts.NodeArray<ts.JsxChild>,
    ) {
      let properties

      if (children) {
        properties = (node as any).openingElement.attributes.properties
        children.forEach(child => visitor(child))
      } else {
        properties = (node as ts.JsxSelfClosingElement).attributes.properties
      }

      let classNameProp
      let styleNameProp
      let styleNamePropIndex

      properties.forEach((prop, idx) => {
        const propName = prop.name.text
        if (propName === 'styleName') {
          styleNameProp = prop
          styleNamePropIndex = idx
        } else if (propName === 'class' || propName === 'className') {
          classNameProp = prop
        }
      })

      let styleNamePropText
      if (styleNameProp) {
        styleNamePropText = styleNameProp.initializer.text
        if (styleNamePropText) {
          styleNamePropText = styleNamePropText
            .split(' ')
            .map(key => context['_importMap'][key])
            .join('')
        }
      }

      if (classNameProp && styleNameProp) {
        const classNamePropInit = classNameProp.initializer
        const classNamePropExp = classNamePropInit.expression
        const classNamePropKind = classNamePropInit.kind
        const styleNamePropInit = styleNameProp.initializer
        const styleNamePropExp = styleNamePropInit.expression
        const styleNamePropKind = styleNamePropInit.kind

        const kindString = ts.SyntaxKind.StringLiteral
        const kindJsxExp = ts.SyntaxKind.JsxExpression

        if (
          styleNamePropKind === kindString &&
          classNamePropKind === kindString
        ) {
          classNameProp.initializer = ts.createLiteral(
            classNamePropInit.text + ' ' + styleNamePropText,
          )
        } else if (
          styleNamePropKind === kindJsxExp &&
          classNamePropKind === kindJsxExp
        ) {
          classNameProp.initializer = ts.createJsxExpression(
            undefined,
            ts.createAdd(
              classNamePropExp,
              createGetClassNamesCall(styleNamePropExp),
            ),
          )
          context['_generateImportMap'] = true
        } else if (
          styleNamePropKind === kindString &&
          classNamePropKind === kindJsxExp
        ) {
          classNameProp.initializer = ts.createJsxExpression(
            undefined,
            ts.createAdd(classNamePropExp, ts.createLiteral(styleNamePropText)),
          )
        } else if (
          styleNamePropKind === kindJsxExp &&
          classNamePropKind === kindString
        ) {
          classNameProp.initializer = ts.createJsxExpression(
            undefined,
            ts.createAdd(
              classNamePropInit,
              createGetClassNamesCall(styleNamePropExp),
            ),
          )
          context['_generateImportMap'] = true
        }

        // Hacky way to delete the styleName attribute
        properties.splice(styleNamePropIndex, 1)
      } else if (styleNameProp) {
        const styleNamePropKind = styleNameProp.initializer.kind
        styleNameProp.name = ts.createIdentifier('className')
        if (styleNamePropKind === ts.SyntaxKind.StringLiteral) {
          styleNameProp.initializer = ts.createLiteral(styleNamePropText)
        } else if (styleNamePropKind === ts.SyntaxKind.JsxExpression) {
          styleNameProp.initializer = ts.createJsxExpression(
            undefined,
            createGetClassNamesCall(styleNameProp.initializer.expression),
          )
          context['_generateImportMap'] = true
        }
      }

      function createGetClassNamesCall(expression: ts.Expression) {
        return ts.createCall(
          ts.createIdentifier('_getClassNames'),
          [],
          [expression, ts.createIdentifier('_importStylesMap')],
        )
      }

      return node
    }
  }
}
