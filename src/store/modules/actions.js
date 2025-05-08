import { cookieGet } from '@/utils/cookie'

const getDefaultState = () => {
  return {
    token: cookieGet('token')
  }
}

const state = getDefaultState()

export default {
  namespaced: true,
  state
}

