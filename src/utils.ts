export function trimLeftChar(string, charToRemove) {
  while(string.charAt(0)==charToRemove) {
    string = string.substring(1)
  }
  return string
}
export function trimRightChar(string, charToRemove) {
  while(string.charAt(string.length-1)==charToRemove) {
    string = string.substring(0,string.length-1)
  }
  return string
}

export function deleteFirstLine(str) {
  const lines = str.split('\n')
  if (lines[0] === '') {
    lines.splice(1, 1)
  } else {
    lines.splice(0, 1)
  }
  return lines.join('\n')
}
export function deleteLastLine(str) {
  const lines = str.split('\n')
  if (lines[lines.length-1] === '') {
    lines.splice(-2, 1)
  } else {
    lines.splice(-1, 1)
  }
  return lines.join('\n')
}
