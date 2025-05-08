// get user info
import { cookieRemove } from '@/utils/cookie'
import { logout } from '@/api/auth'
import store from '@/store'
import { resetRouter } from '@/router'

export function Logout() {
  return new Promise((resolve, reject) => {
    logout().then(res => {
      if (res.success) {
        cookieRemove('token')
        store.state.auth.token = ''
        resetRouter()
        resolve()
      }
    }).catch(error => {
      reject(error)
    })
  })
}
