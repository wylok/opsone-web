import request from '@/utils/request'
import { Host } from '@/utils/kits'

const base_url = 'http://' + Host() + '/api/v1/platform'

export function overview(params) {
  return request({
    url: base_url + '/overview',
    method: 'get',
    params
  })
}

export function agentConf(params) {
  return request({
    url: base_url + '/agent/conf',
    method: 'get',
    params
  })
}

export function putAgentConf(data) {
  return request({
    url: base_url + '/agent/conf',
    method: 'put',
    data: data
  })
}

export function agentAlive(params) {
  return request({
    url: base_url + '/agent/alive',
    method: 'get',
    params
  })
}

export function deleteAgentAlive(data) {
  return request({
    url: base_url + '/agent/alive',
    method: 'delete',
    data: data
  })
}
