import request from '@/utils/request'
import { Host } from '@/utils/kits'
const base_url = 'http://' + Host() + '/api/v1/work_order'

export function getWorkOrderFlow(params) {
  return request({
    url: base_url + '/flow',
    method: 'get',
    params: params
  })
}

export function postWorkOrderFlow(data) {
  return request({
    url: base_url + '/flow',
    method: 'post',
    data
  })
}

export function putWorkOrderFlow(data) {
  return request({
    url: base_url + '/flow',
    method: 'put',
    data
  })
}

export function deleteWorkOrderFlow(data) {
  return request({
    url: base_url + '/flow',
    method: 'delete',
    data
  })
}

export function getWorkOrder(params) {
  return request({
    url: base_url,
    method: 'get',
    params: params
  })
}

export function getWorkOrderApproveReady(params) {
  return request({
    url: base_url + '/approve/ready',
    method: 'get',
    params: params
  })
}

export function getWorkOrderApprovePend(params) {
  return request({
    url: base_url + '/approve/pend',
    method: 'get',
    params: params
  })
}

export function postWorkOrderApprove(data) {
  return request({
    url: base_url + '/approve',
    method: 'post',
    data
  })
}

export function postWorkOrder(data) {
  return request({
    url: base_url,
    method: 'post',
    data
  })
}

export function putWorkOrder(data) {
  return request({
    url: base_url,
    method: 'put',
    data
  })
}

export function deleteWorkOrder(data) {
  return request({
    url: base_url,
    method: 'delete',
    data
  })
}

export function getWorkOrderType(params) {
  return request({
    url: base_url + '/type',
    method: 'get',
    params: params
  })
}
