const imgCache = {}

export function getOrSetImageForUrl(url, width, height) {
  if (imgCache[url]) {
    return imgCache[url]
  }

  const newImage = new Image()
  newImage.src = url
  imgCache[url] = newImage
  return null
}
