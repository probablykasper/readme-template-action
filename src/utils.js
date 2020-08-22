module.exports.newErr = function(...args) {
  const err = new Error(...args)
  err.logMessageOnly = true
  return err
}

module.exports.trimLeftChar = function(string, charToRemove) {
  while(string.charAt(0)==charToRemove) {
    string = string.substring(1)
  }
  return string
}
module.exports.trimRightChar = function(string, charToRemove) {
  while(string.charAt(string.length-1)==charToRemove) {
    string = string.substring(0,string.length-1)
  }
  return string
}

module.exports.deleteFirstLine = function(str) {
  const lines = str.split('\n')
  if (lines[0] === '') {
    lines.splice(1, 1)
  } else {
    lines.splice(0, 1)
  }
  return lines.join('\n')
}
module.exports.deleteLastLine = function(str) {
  const lines = str.split('\n')
  if (lines[lines.length-1] === '') {
    lines.splice(-2, 1)
  } else {
    lines.splice(-1, 1)
  }
  console.log(lines)
  return lines.join('\n')
}
