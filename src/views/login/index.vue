<template>
  <div class="bgm">
    <el-container>
      <el-main>
        <div class="login-container">
          <el-form
            ref="loginForm"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            auto-complete="on"
            label-position="left"
          >
            <div style="color:whitesmoke;font-size:xx-large;margin-bottom: 10%">欢迎登录OPSONE平台</div>
            <div style="margin-bottom: 10%">
              <el-form-item prop="user_name">
                <span class="svg-container">
                  用户
                </span>
                <el-input
                  ref="user_name"
                  v-model="loginForm.user_name"
                  placeholder="用户名"
                  name="user_name"
                  type="text"
                  tabindex="1"
                  auto-complete="on"
                />
              </el-form-item>
            </div>
            <div style="margin-bottom: 10%">
              <el-form-item prop="password">
                <span class="svg-container">
                  密码
                </span>
                <el-input
                  :key="passwordType"
                  ref="password"
                  v-model="loginForm.password"
                  :type="passwordType"
                  placeholder="密码"
                  name="password"
                  tabindex="2"
                  auto-complete="on"
                  @keyup.enter.native="handleLogin"
                />
                <span class="show-pwd" @click="showPwd">
                  <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                </span>
              </el-form-item>
            </div>
            <el-button
              :loading="loading"
              type="primary"
              style="width:100%;margin-bottom:50px;"
              @click.native.prevent="handleLogin"
            >登录
            </el-button>
          </el-form>
          <footer class="footer">智能运维平台(opsone) ©2022-{{ year }}</footer>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { login } from '@/api/auth'
import { cookieRemove, cookieSet } from '@/utils/cookie'
import { getYear } from '@/utils/filters'

export default {
  name: 'Login',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 8) {
        callback(new Error('密码长度不能少于8位'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        user_name: '',
        password: ''
      },
      loginRules: {
        user_name: [{ required: true, trigger: 'blur' }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: '/',
      year: ''
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    this.year = getYear()
  },
  methods: {
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          login(this.loginForm).then((res) => {
            if (res.success) {
              cookieSet('token', res.data['token'])
              cookieSet('department_id', res.data['department_id'])
              cookieSet('user_id', res.data['user_id'])
              cookieSet('user_name', res.data['user_name'])
              cookieSet('nick_name', res.data['nick_name'])
              cookieSet('roles', res.data['roles'])
              cookieSet('expire_time', res.data['expire_time'])
              this.$router.push({ path: this.redirect || '/' })
              this.loading = false
            } else {
              this.$message.error('用户名或密码错误')
              cookieRemove('token')
              this.$router.push({ path: this.redirect || '/logout' })
            }
          })
        } else {
          this.$message.error('填写信息错误')
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
$bg: steelblue;
$light_gray: white;
$cursor: white;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}
.bgm {
  width: 100vw; /* 设置div的宽度 */
  height: 100vh; /* 设置div的高度 */
  background-image: url("../../img/login.jpg"); /* 设置背景图片 */
  background-size: cover; /* 覆盖整个div */
}
/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0;
      border-radius: 0;
      padding: 12px 5px 12px 15px;
      color: white;
      height: 47px;
      caret-color: white;
      &:-webkit-autofill {
        box-shadow: 0 0 0 1000px $bg inset !important;
        -webkit-text-fill-color: white !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid white;
    background: $bg;
    border-radius: 3px;
    color: white;
  }
}
</style>

<style lang="scss" scoped>
$dark_gray: #FFFAFA;
$light_gray: #eee;
.el-main {
  line-height: 100%;
  width: 100%;
}
.login-container {
  min-height: 100%;
  width: 100%;
  overflow: hidden;
  .login-form {
    position: absolute;
    left: 75%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 550px;
    max-width: 100%;
    border-radius: 5px;
    padding: 55px 55px 0;
    border: 1px solid white;
    background-color: steelblue;
    overflow: hidden;
    filter: alpha(Opacity=90);
    -moz-opacity: 0.9;
    opacity: 0.9;
  }
  .tips {
    font-size: 14px;
    color: white;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: white;
    vertical-align: middle;
    width: 50px;
    display: inline-block;
  }
  .title-container {
    position: relative;
    .title {
      font-size: 26px;
      color: white;
      margin: 0 auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: white;
    cursor: pointer;
    user-select: none;
  }
}
</style>
