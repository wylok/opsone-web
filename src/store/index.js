import Vue from 'vue'
import Vuex from 'vuex'
import getters from './modules/getters'
import app from './modules/app'
import settings from './modules/settings'
import auth from './modules/actions'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    auth
  },
  getters
})

export default store
