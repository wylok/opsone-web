import request from '@/utils/request'
import { Host } from '@/utils/kits'

const base_url = 'http://' + Host() + '/api/v1/monitor'

export function MonitorConverge(params) {
  return request({
    url: base_url + '/data/converge',
    method: 'get',
    params: params
  })
}

export function MonitorDetail(params) {
  return request({
    url: base_url + '/data/detail',
    method: 'get',
    params: params
  })
}

export function GetMetric(params) {
  return request({
    url: base_url + '/metric',
    method: 'get',
    params: params
  })
}

export function GetMetricCn() {
  return request({
    url: base_url + '/metric/cn',
    method: 'get',
    params: null
  })
}

export function GetMonitorRule(params) {
  return request({
    url: base_url + '/rule',
    method: 'get',
    params: params
  })
}

export function CreateMonitorRule(data) {
  return request({
    url: base_url + '/rule',
    method: 'post',
    data
  })
}

export function ModifyMonitorRule(data) {
  return request({
    url: base_url + '/rule',
    method: 'put',
    data
  })
}

export function DeleteMonitorRule(data) {
  return request({
    url: base_url + '/rule',
    method: 'delete',
    data
  })
}

export function MonitorStages(params) {
  return request({
    url: base_url + '/stages',
    method: 'get',
    params: params
  })
}

export function UpdateStages(data) {
  return request({
    url: base_url + '/stages',
    method: 'post',
    data
  })
}

export function AlarmHistory(params) {
  return request({
    url: base_url + '/alarm/history',
    method: 'get',
    params: params
  })
}

export function deleteAlarmHistory(data) {
  return request({
    url: base_url + '/alarm/history',
    method: 'delete',
    data
  })
}

export function AlarmSend(params) {
  return request({
    url: base_url + '/alarm/send',
    method: 'get',
    params: params
  })
}

export function deleteAlarmSend(data) {
  return request({
    url: base_url + '/alarm/send',
    method: 'delete',
    data
  })
}

export function AlarmCount() {
  return request({
    url: base_url + '/alarm/count',
    method: 'get'
  })
}

export function getRuleGroups(params) {
  return request({
    url: base_url + '/rule/groups',
    method: 'get',
    params: params
  })
}

export function RelationRuleGroups(data) {
  return request({
    url: base_url + '/rule/groups',
    method: 'post',
    data
  })
}

export function getAlarmPause(params) {
  return request({
    url: base_url + '/alarm/pause',
    method: 'get',
    params: params
  })
}

export function AlarmPause(data) {
  return request({
    url: base_url + '/alarm/pause',
    method: 'post',
    data
  })
}

export function getProcess(params) {
  return request({
    url: base_url + '/process',
    method: 'get',
    params: params
  })
}

export function addProcess(data) {
  return request({
    url: base_url + '/process',
    method: 'post',
    data
  })
}

export function deleteProcess(data) {
  return request({
    url: base_url + '/process',
    method: 'delete',
    data
  })
}

export function getMetricTop(params) {
  return request({
    url: base_url + '/metric/top',
    method: 'get',
    params: params
  })
}

export function getGroupProcess(params) {
  return request({
    url: base_url + '/group/process',
    method: 'get',
    params: params
  })
}

export function addGroupProcess(data) {
  return request({
    url: base_url + '/group/process',
    method: 'post',
    data
  })
}

export function deleteGroupProcess(data) {
  return request({
    url: base_url + '/group/process',
    method: 'delete',
    data
  })
}

export function getMonitorProcess(params) {
  return request({
    url: base_url + '/process',
    method: 'get',
    params: params
  })
}

export function postRuleJobs(data) {
  return request({
    url: base_url + '/job',
    method: 'post',
    data
  })
}

export function deleteRuleJobs(data) {
  return request({
    url: base_url + '/job',
    method: 'delete',
    data
  })
}

export function getRuleJobs(params) {
  return request({
    url: base_url + '/job',
    method: 'get',
    params: params
  })
}

export function postCustom(data) {
  return request({
    url: base_url + '/custom/metric',
    method: 'post',
    data
  })
}

export function deleteCustom(data) {
  return request({
    url: base_url + '/custom/metric',
    method: 'delete',
    data
  })
}

export function getCustom(params) {
  return request({
    url: base_url + '/custom/metric',
    method: 'get',
    params: params
  })
}

export function getCustomGroup(params) {
  return request({
    url: base_url + '/custom/group/metric',
    method: 'get',
    params: params
  })
}

export function putCustomScript(data) {
  return request({
    url: base_url + '/custom/script',
    method: 'put',
    data
  })
}

export function getProcessTop(params) {
  return request({
    url: base_url + '/process/top',
    method: 'get',
    params: params
  })
}

export function getRuleContacts(params) {
  return request({
    url: base_url + '/rule/contacts',
    method: 'get',
    params: params
  })
}
