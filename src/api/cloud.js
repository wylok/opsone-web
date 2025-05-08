import request from '@/utils/request'
import { Host } from '@/utils/kits'

const base_url = 'http://' + Host() + '/api/v1/cloud'

export function GetOss(params) {
  return request({
    url: base_url + '/oss',
    method: 'get',
    params
  })
}

export function GetKey(params) {
  return request({
    url: base_url + '/key',
    method: 'get',
    params
  })
}

export function PostKey(data) {
  return request({
    url: base_url + '/key',
    method: 'post',
    data
  })
}

export function DeleteKey(data) {
  return request({
    url: base_url + '/key',
    method: 'delete',
    data
  })
}

export function getCloudServer(params) {
  return request({
    url: base_url + '/servers',
    method: 'get',
    params: params
  })
}
export function operateCloudServer(data) {
  return request({
    url: base_url + '/server/operate',
    method: 'post',
    data
  })
}
