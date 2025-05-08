let intervalId

export function Host() {
  let host = '115.190.10.126'
  if (host === '') {
    host = window.location.host
  }
  return host
}
export function DataRefresh(func, params, interval) {
  // 计时器正在进行中，退出函数
  if (intervalId != null) {
    return
  }
  // 计时器为空，操作
  intervalId = setInterval(() => {
    func(params)// 加载数据函数
  }, interval)
}

// 停止定时器
export function RefreshClear() {
  clearInterval(intervalId) // 清除计时器
  intervalId = null // 设置为null
}

export function AlarmColor(val) {
  let color
  if (val === 'primary') {
    color = '#409EFF'
  }
  if (val === 'success') {
    color = '#67C23A'
  }
  if (val === 'warning') {
    color = '#E6A23C'
  }
  if (val === 'danger') {
    color = '#F56C6C'
  }
  return color
}

export function FormatMonitorUnit(v, u) {
  if (u.indexOf('GB') > -1) {
    v = v / 1000 / 1000 / 1000
  }
  if (u.indexOf('MB') > -1) {
    v = v / 1000 / 1000
    if (v > 1000) {
      v = v / 1000
      u = u.replace('MB', 'GB')
    }
  }
  if (u.indexOf('Gbps') > -1) {
    v = v / 1000 / 1000 / 1000
  }
  if (u.indexOf('Mbit') > -1) {
    v = v / 1000 / 1000
    if (v > 1000) {
      v = v / 1000
      u = u.replace('Mbit', 'Gbit')
    }
  }
  return [v, u]
}
