import Cookies from 'js-cookie'

export function cookieGet(Key) {
  return Cookies.get(Key)
}

export function cookieSet(Key, value) {
  return Cookies.set(Key, value)
}

export function cookieRemove(Key) {
  return Cookies.remove(Key)
}
