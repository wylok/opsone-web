import request from '@/utils/request'
import { Host } from '@/utils/kits'

const base_url = 'http://' + Host() + '/api/v1/msg'

export function getMsgList(params) {
  return request({
    url: base_url,
    method: 'get',
    params: params
  })
}

export function getMsgDetail(params) {
  return request({
    url: base_url + '/detail',
    method: 'get',
    params: params
  })
}

export function SendNotice(content) {
  const data = {}
  data['msg_type'] = 'system'
  data['send_type'] = 'Notice'
  data['level'] = 'success'
  data['title'] = ''
  data['content'] = content
  return request({
    url: base_url,
    method: 'post',
    data
  })
}

export function DeleteMsg(data) {
  return request({
    url: base_url,
    method: 'delete',
    data
  })
}
