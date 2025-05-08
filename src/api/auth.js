import request from '@/utils/request'
import { Host } from '@/utils/kits'

const base_url = 'http://' + Host() + '/api/v1/auth'

export function login(data) {
  return request({
    url: base_url + '/login',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: base_url + '/logout',
    method: 'post'
  })
}

export function roles(params) {
  return request({
    url: base_url + '/roles',
    method: 'get',
    params: params
  })
}

export function PostRole(data) {
  return request({
    url: base_url + '/role',
    method: 'post',
    data
  })
}

export function PutRole(data) {
  return request({
    url: base_url + '/role',
    method: 'put',
    data
  })
}

export function DeleteRole(data) {
  return request({
    url: base_url + '/role',
    method: 'delete',
    data
  })
}

export function Privileges(params) {
  return request({
    url: base_url + '/privileges',
    method: 'get',
    params: params
  })
}

export function ModifyPrivileges(data) {
  return request({
    url: base_url + '/privileges',
    method: 'put',
    data
  })
}

export function GetDepartment(params) {
  return request({
    url: base_url + '/department',
    method: 'get',
    params: params
  })
}

export function CreateDepartment(data) {
  return request({
    url: base_url + '/department',
    method: 'post',
    data
  })
}

export function ModifyDepartment(data) {
  return request({
    url: base_url + '/department',
    method: 'put',
    data
  })
}

export function DeleteDepartment(data) {
  return request({
    url: base_url + '/department',
    method: 'delete',
    data
  })
}

export function GetBusiness(params) {
  return request({
    url: base_url + '/business',
    method: 'get',
    params: params
  })
}

export function CreateBusiness(data) {
  return request({
    url: base_url + '/business',
    method: 'post',
    data
  })
}

export function ModifyBusiness(data) {
  return request({
    url: base_url + '/business',
    method: 'put',
    data
  })
}

export function DeleteBusiness(data) {
  return request({
    url: base_url + '/business',
    method: 'delete',
    data
  })
}

export function GetTree() {
  return request({
    url: base_url + '/tree',
    method: 'get'
  })
}

export function GetAudit(params) {
  return request({
    url: base_url + '/audit',
    method: 'get',
    params: params
  })
}

export function DeleteAudit(data) {
  return request({
    url: base_url + '/audit',
    method: 'delete',
    data
  })
}
