import { axios } from '@xcedu/web-share'

// 测试环境需要在请求url前加前缀
const prefix = '/api-personalized'
// const prefix = ''

// 选人接口
export function getChooseUserDataByParams (params) {
  return axios.get('/api-base/rangeScopes', { params })
}
// 选人输入
export function getSearchListByValue (params) {
  return axios.get('/api-base/rangeScopes?type=search', { params })
}

// 上传附件
export function uploadResource (data) {
  return axios.post('/api-base/attachments/save', data)
}
// 附件信息
export function loadDetailBatchByIds (params) {
  return axios.get('/api-base/attachments/infoList', { params })
}
// 获取密钥信息
export function getClient () {
  return axios.get('/api-base/attachments/infoList')
}
