// Credits
// https://github.com/rofrischmann/fela/blob/master/packages/fela/src/generateClassName.js

const chars = 'abcdefghijklmnopqrstuvwxyz'
const charLength = chars.length

export default function generateUniqueClassName(
  id: number,
  className: string = '',
): string {
  if (id <= charLength) {
    return chars[id - 1] + className
  }

  // Bitwise floor as safari performs much faster
  // https://jsperf.com/math-floor-vs-math-round-vs-parseint/55
  return generateUniqueClassName(
    (id / charLength) | 0,
    chars[id % charLength] + className,
  )
}
