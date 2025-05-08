import request from '@/utils/request'
import { Host } from '@/utils/kits'

const base_url = 'http://' + Host() + '/api/v1/auth'

export function Users(params) {
  return request({
    url: base_url + '/users',
    method: 'get',
    params: params
  })
}

export function ChangePwd(data) {
  return request({
    url: base_url + '/user/password',
    method: 'post',
    data
  })
}

export function PostUser(data) {
  return request({
    url: base_url + '/user',
    method: 'post',
    data
  })
}

export function PutUser(data) {
  return request({
    url: base_url + '/user',
    method: 'put',
    data
  })
}

export function DeleteUser(data) {
  return request({
    url: base_url + '/user',
    method: 'delete',
    data
  })
}

