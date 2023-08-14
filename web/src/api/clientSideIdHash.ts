const hashCodeId = function (str?: string): string {
  var hash = 0,
    i,
    chr
  if (!str || str.length === 0) return hash.toString()
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash).toString().slice(0, 6)
}

export default hashCodeId
