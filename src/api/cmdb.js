import request from '@/utils/request'
import { Host } from '@/utils/kits'

const base_url = 'http://' + Host() + '/api/v1/cmdb'

export function getServer(params) {
  return request({
    url: base_url + '/servers',
    method: 'get',
    params: params
  })
}

export function putServer(data) {
  return request({
    url: base_url + '/servers',
    method: 'put',
    data
  })
}

export function GetAssetGroup(params) {
  return request({
    url: base_url + '/group',
    method: 'get',
    params: params
  })
}

export function PostAssetGroup(data) {
  return request({
    url: base_url + '/group',
    method: 'post',
    data
  })
}

export function PutAssetGroup(data) {
  return request({
    url: base_url + '/group',
    method: 'put',
    data
  })
}

export function DelAssetGroup(data) {
  return request({
    url: base_url + '/group',
    method: 'delete',
    data
  })
}

export function GetServerPool(params) {
  return request({
    url: base_url + '/pool/server',
    method: 'get',
    params: params
  })
}

export function GetServerIpPool(params) {
  return request({
    url: base_url + '/pool/server/ip',
    method: 'get',
    params: params
  })
}

export function PutServerPool(data) {
  return request({
    url: base_url + '/pool/server',
    method: 'put',
    data
  })
}

export function PostServerIpPool(data) {
  return request({
    url: base_url + '/pool/server/ip',
    method: 'post',
    data
  })
}

export function PutServerIpPool(data) {
  return request({
    url: base_url + '/pool/server/ip',
    method: 'put',
    data
  })
}

export function DeleteServerIpPool(data) {
  return request({
    url: base_url + '/pool/server/ip',
    method: 'delete',
    data
  })
}

export function PostServerPool(data) {
  return request({
    url: base_url + '/pool/server',
    method: 'post',
    data
  })
}

export function DeleteServerPool(data) {
  return request({
    url: base_url + '/pool/server',
    method: 'delete',
    data
  })
}

export function GetGroupRelatedServers(params) {
  return request({
    url: base_url + '/group/related/servers',
    method: 'get',
    params: params
  })
}

export function GetGroupServersDetail(params) {
  return request({
    url: base_url + '/group/servers/detail',
    method: 'get',
    params: params
  })
}

export function putServerBusiness(data) {
  return request({
    url: base_url + '/pool/server/business',
    method: 'put',
    data
  })
}

export function getSwitchPool(params) {
  return request({
    url: base_url + '/pool/switch',
    method: 'get',
    params: params
  })
}

export function postSwitchPool(data) {
  return request({
    url: base_url + '/pool/switch',
    method: 'post',
    data
  })
}

export function putSwitchPool(data) {
  return request({
    url: base_url + '/pool/switch',
    method: 'put',
    data
  })
}

export function deleteSwitchPool(data) {
  return request({
    url: base_url + '/pool/switch',
    method: 'delete',
    data
  })
}
export function deleteSwitch(data) {
  return request({
    url: base_url + '/switch',
    method: 'delete',
    data
  })
}
export function getSwitches(params) {
  return request({
    url: base_url + '/switches',
    method: 'get',
    params: params
  })
}

export function getSwitchPort(params) {
  return request({
    url: base_url + '/switch/port',
    method: 'get',
    params: params
  })
}

export function getSwitchVlan(params) {
  return request({
    url: base_url + '/switch/vlan',
    method: 'get',
    params: params
  })
}

export function addSwitchVlan(data) {
  return request({
    url: base_url + '/switch/vlan',
    method: 'post',
    data
  })
}

export function changeSwitchPortVlan(data) {
  return request({
    url: base_url + '/switch/port/vlan',
    method: 'post',
    data
  })
}

export function SwitchPortVlanOperate(data) {
  return request({
    url: base_url + '/switch/port/operate',
    method: 'post',
    data
  })
}

export function switchOperate(data) {
  return request({
    url: base_url + '/switch/operate',
    method: 'post',
    data
  })
}

export function changeSwitchName(data) {
  return request({
    url: base_url + '/switch/name',
    method: 'post',
    data
  })
}

export function getSshKey(params) {
  return request({
    url: base_url + '/ssh_key',
    method: 'get',
    params: params
  })
}

export function uploadSshKey(data) {
  return request({
    url: base_url + '/ssh_key',
    method: 'post',
    data
  })
}

export function deleteSshKey(data) {
  return request({
    url: base_url + '/ssh_key',
    method: 'delete',
    data
  })
}

export function getIdc(params) {
  return request({
    url: base_url + '/idc',
    method: 'get',
    params: params
  })
}

export function deleteIdc(data) {
  return request({
    url: base_url + '/idc',
    method: 'delete',
    data
  })
}

export function addIdc(data) {
  return request({
    url: base_url + '/idc',
    method: 'post',
    data
  })
}

export function modifyIdc(data) {
  return request({
    url: base_url + '/idc',
    method: 'put',
    data
  })
}

export function getSwitchRelation(params) {
  return request({
    url: base_url + '/switch/relation',
    method: 'get',
    params: params
  })
}

export function getJumpServerKey(params) {
  return request({
    url: base_url + '/jumpserver_key',
    method: 'get',
    params: params
  })
}

export function deleteJumpServerKey(data) {
  return request({
    url: base_url + '/jumpserver_key',
    method: 'delete',
    data
  })
}

export function addJumpServerKey(data) {
  return request({
    url: base_url + '/jumpserver_key',
    method: 'post',
    data
  })
}
