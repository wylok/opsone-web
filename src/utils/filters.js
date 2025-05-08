export function Round(v) {
  return v.toFixed(1)
}

export function DateFormat(v) {
  if (v !== null && v !== undefined) {
    const date = v.split('T')
    return date[0] + ' ' + date[1].split('+')[0].split('Z')[0]
  }
  return ''
}

export function AddTime(Time) {
  if (Time !== null && Time.split(' ').length >= 2) {
    const time = Time.split(' ')[0]
    const arrTime = Time.split(' ')[1].split(':')
    const time2 = arrTime.slice(1, arrTime.length).join(':')
    const h = parseInt(arrTime[0]) + 8
    const newH = ((h < 24) ? h : (h % 24)).toString()
    return time + ' ' + newH + ':' + time2
  }
  return ''
}

export function DateTimeFormat(oldTime, zone) {
  let years
  let months
  let days
  let hours
  let minutes
  if (oldTime !== null && oldTime.split(' ').length >= 2) {
    const currTime = Date.parse(new Date())
    const time1 = oldTime.split(' ')[0]
    const arrTime = oldTime.split(' ')[1].split(':')
    const time2 = arrTime.slice(1, arrTime.length).join(':')
    const h = parseInt(arrTime[0]) + zone
    const newH = ((h < 24) ? h : (h % 24)).toString()
    let time = ((Date.parse(time1 + ' ' + newH + ':' + time2) / 1000)) - (currTime / 1000)
    if (time > 0) {
      if (time < 60) {
        return Math.floor(time) + '秒后'
      }
      minutes = time / 60
      if (minutes < 60) {
        return Math.floor(minutes) + '分钟后'
      }
      hours = time / 3600
      if (hours < 24) {
        return Math.floor(hours) + '小时后'
      }
      days = time / 3600 / 24
      if (days < 30) {
        return Math.floor(days) + '天后'
      }
      months = time / 3600 / 24 / 30
      if (months < 12) {
        return Math.floor(months) + '月后'
      }
      years = time / 3600 / 24 / 30 / 12
      return Math.floor(years) + '年后'
    } else {
      time = Math.abs(time)
      if (time < 60) {
        return Math.floor(time) + '秒前'
      }
      minutes = time / 60
      if (minutes < 60) {
        return Math.floor(minutes) + '分钟前'
      }
      hours = time / 3600
      if (hours < 24) {
        return Math.floor(hours) + '小时前'
      }
      days = time / 3600 / 24
      if (days < 30) {
        return Math.floor(days) + '天前'
      }
      months = time / 3600 / 24 / 30
      if (months < 12) {
        return Math.floor(months) + '月前'
      }
      years = time / 3600 / 24 / 30 / 12
      return Math.floor(years) + '年前'
    }
  }
}

export function MsgStatus(v) {
  const date = { 'Unread': '未读', 'Read': '已读' }
  // eslint-disable-next-line no-prototype-builtins
  if (date.hasOwnProperty(v)) {
    v = date[v]
  }
  return v
}

export function CommentStatus(v) {
  const date = { 'active': '启用', 'close': '禁用' }
  // eslint-disable-next-line no-prototype-builtins
  if (date.hasOwnProperty(v)) {
    v = date[v]
  }
  return v
}

export function AgentStatus(v) {
  const date = { 1: '已开启', 0: '已关闭', 'active': '激活', 'close': '休眠' }
  // eslint-disable-next-line no-prototype-builtins
  if (date.hasOwnProperty(v)) {
    v = date[v]
  }
  return v
}

export function boolConvert(v) {
  const date = { 1: true, 0: false }
  // eslint-disable-next-line no-prototype-builtins
  if (date.hasOwnProperty(v)) {
    v = date[v]
  }
  return v
}

export function statusFilter(status) {
  const statusMap = {
    active: 'success',
    close: 'danger',
    recovery: 'success',
    error: 'danger',
    success: '成功',
    fail: '失败',
    fault: 'warning',
    unknown: 'info',
    enable: 'success',
    disable: 'danger',
    none: '未知',
    Running: '运行中',
    Stopped: '已停止',
    RUNNING: '运行中',
    STOPPED: '已停止'
  }
  return statusMap[status]
}

export function actionFilter(status) {
  const statusMap = {
    active: '启用',
    close: '关闭',
    enable: '启用',
    disable: '关闭'
  }
  return statusMap[status]
}

export function alarmStatusFilter(status) {
  const statusMap = {
    fault: '报警中',
    unknown: '未知',
    recovery: '已恢复'
  }
  return statusMap[status]
}

export function DurationFormat(v) {
  // eslint-disable-next-line no-unreachable
  if (parseInt(v) < 60) {
    return String(v) + '秒'
  }
  if (parseInt(v) >= 60 && parseInt(v) < 3600) {
    return String((parseInt(v) / 60).toFixed()) + '分钟'
  }
  if (parseInt(v) >= 3600 && parseInt(v) < 86400) {
    return String((parseInt(v) / 60 / 60).toFixed()) + '小时'
  }
  if (parseInt(v) >= 86400) {
    return String((parseInt(v) / 60 / 60 / 60).toFixed()) + '天'
  }
}

export function levelFilter(v) {
  const date = {
    'Info': '通知', 'Warning': '警告', 'Critical': '严重', 'Error': '致命'
  }
  return date[v]
}

export function CloudFormat(v) {
  const date = { aliyun: '阿里云', tencent: '腾讯云', baidu: '百度云' }
  // eslint-disable-next-line no-prototype-builtins
  if (date.hasOwnProperty(v)) {
    v = date[v]
  }
  return v
}

export function getYear() {
  const date = new Date()
  return date.getFullYear()
}

export function getVersion() {
  return 'opsone v4.5'
}
