export const inBrowser = typeof window !== 'undefined'
export const URL = inBrowser ? window.URL || window.webkitURL || window.mozURL : null

export const _ready = 'ready'
export const _uploading = 'uploading'
export const _error = 'error'
export const _success = 'success'

export function initFile(name = '', size = 0, status = '', progress = 0, file = null) {
  const base64 = (file && file.base64) || createURL(file)
  const url = (file && file.url) || ''

  return { name, size, url, base64, status, progress, file }
}

export function processFiles(files, eachCb, cb) {
  const arr = []
  const len = files.length

  for (let i = 0; i < len; i++) {
    let file = files[i]
    const newFile = initFile(file.name, file.size, _ready, 0, file)
    arr[i] = newFile
    eachCb(newFile, i)
  }
  cb(arr)
}

function createURL(file) {
  if (file && URL) {
    return URL.createObjectURL(file)
  }
  return ''
}

export function evalOpts(data, ...args) {
  if (typeof data === 'function') {
    return data.apply(this, args)
  }
  return data
}

export function base64ToBlob(data) { // 将base64转换为blob
  const rImageType = /data:(image\/.+);base64,/
  let mimeString = ''
  let raw, uInt8Array, i, rawLength;

  raw = data.replace(rImageType, function (header, imageType) {
    mimeString = imageType;

    return ''
  })

  raw = atob(raw)
  rawLength = raw.length
  uInt8Array = new Uint8Array(rawLength)

  for (i=0; i<rawLength; i++) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], { type: mimeString })
}

export function base64ToFile (dataurl, fileName) { // 将base64转换为file
  let arr = dataurl.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let bstr = atob(arr[1])
  let n = bstr.length
  let u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, {
    type: mime,
    name: fileName,
    lastModified: +new Date(),
    lastModifiedDate: new Date()
  })
}
