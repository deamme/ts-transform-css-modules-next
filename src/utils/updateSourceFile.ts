import * as ts from 'typescript'

export default function(sourceFile: ts.SourceFile, importMap: Object) {
  const props = []

  for (let key in importMap) {
    props.push(
      ts.createPropertyAssignment(
        ts.createLiteral(key),
        ts.createLiteral(importMap[key]),
      ),
    )
  }

  return ts.updateSourceFileNode(sourceFile, [
    ts.createVariableStatement(undefined, [
      ts.createVariableDeclaration(
        '_getClassNames',
        undefined,
        ts.createCall(
          ts.createIdentifier('require'),
          [],
          [
            ts.createLiteral(
              'ts-transform-css-modules-next/dist/getClassNames',
            ),
          ],
        ),
      ),
    ]),
    ts.createVariableStatement(undefined, [
      ts.createVariableDeclaration(
        '_importStylesMap',
        undefined,
        ts.createObjectLiteral(props),
      ),
    ]),
    ...sourceFile.statements,
  ])
}
