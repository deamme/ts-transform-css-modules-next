module.exports = function(classNames: String, importStylesMap: Object) {
  return classNames
    .split(' ')
    .map(key => importStylesMap[key])
    .join('')
}
