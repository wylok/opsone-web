import axios from 'axios'
import { cookieGet, cookieRemove } from '@/utils/cookie'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    config.headers['token'] = cookieGet('token')
    return config
  },
  error => {
    // do something with request error// for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * return  response => response
   */
  response => {
    const res = response.data
    if (response.status === 401) {
      cookieRemove('token')
      this.$router.push({ name: 'login' })
    }
    if (response.status !== 200) {
      return Promise.reject(new Error(res.message))
    }
    return res
  },
  error => {
    return Promise.reject(error)
  }
)

export default service
