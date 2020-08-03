// 下载附件
export function downloadAttachment (url, displayName) {
  return axios({
    url: url,
    method: 'get',
    responseType: 'blob'
  }).then(res => {
    const blob = new Blob([res.data])
    if ('msSaveOrOpenBlob' in window.navigator) {
      window.navigator.msSaveOrOpenBlob(blob, displayName)
    } else {
      const URL = window.URL || window.webkitURL
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = objectUrl
      a.setAttribute('download', displayName)
      if (typeof a.download === 'undefined') {
        a.setAttribute('target', '_blank')
      }
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    }
  })
}
