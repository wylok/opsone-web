import request from '@/utils/request'
import { Host } from '@/utils/kits'

const base_url = 'http://' + Host() + '/api/v1/job'

export function uploadFileUrl() {
  return base_url + '/file/upload'
}

export function uploadScriptUrl() {
  return base_url + '/script/upload'
}

export function getJobExecList(params) {
  return request({
    url: base_url + '/exec',
    method: 'get',
    params: params
  })
}

export function postJobExec(data) {
  return request({
    url: base_url + '/exec',
    method: 'post',
    data
  })
}

export function getJobFileList(params) {
  return request({
    url: base_url + '/file',
    method: 'get',
    params: params
  })
}

export function postJobFileSend(data) {
  return request({
    url: base_url + '/file/send',
    method: 'post',
    data
  })
}

export function getJobOverview(params) {
  return request({
    url: base_url + '/overview',
    method: 'get',
    params: params
  })
}

export function deleteJobOverview(data) {
  return request({
    url: base_url + '/overview',
    method: 'delete',
    data
  })
}

export function getJobScript(params) {
  return request({
    url: base_url + '/script',
    method: 'get',
    params: params
  })
}

export function getJobResults(params) {
  return request({
    url: base_url + '/results',
    method: 'get',
    params: params
  })
}

export function getJobScriptRun(params) {
  return request({
    url: base_url + '/script/run',
    method: 'get',
    params: params
  })
}

export function getJobScriptDetail(params) {
  return request({
    url: base_url + '/script/detail',
    method: 'get',
    params: params
  })
}

export function deleteJobScript(data) {
  return request({
    url: base_url + '/script',
    method: 'delete',
    data
  })
}

export function putJobScript(data) {
  return request({
    url: base_url + '/script',
    method: 'put',
    data
  })
}

export function runJobScript(data) {
  return request({
    url: base_url + '/script/run',
    method: 'post',
    data
  })
}
