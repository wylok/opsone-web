<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb class="breadcrumb-container" />
    <div class="right-menu">
      <el-badge :value="msgCounts" :max="99" style="margin-right: 35px;">
        <router-link
          v-if="msgCounts>0"
          :to="{ name:'MsgList', params: { status: 'Unread' } }"
        >
          <el-link type="primary">
            <span><i style="font-size:large" class="el-icon-bell" />消息</span>
          </el-link>
        </router-link>
        <span v-else><i style="font-size:large" class="el-icon-close-notification" />消息</span>
      </el-badge>
      <el-dropdown class="avatar-container" size="small">
        <div class="avatar-wrapper">
          <el-button size="mini" circle plain>
            <el-avatar size="small" :src="circleUrl" />
          </el-button>
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <el-dropdown-item divided @click.native="UserInfo">
            <span>个人信息</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="dialogVisible = true">
            <span>修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block; color: #1482f0"><svg-icon icon-class="sign-out-alt" />退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog
      title="修改密码"
      :visible.sync="dialogVisible"
      :show-close="false"
      :before-close="handleClose"
      width="30%"
    >
      <el-form ref="ruleForm" :model="ruleForm" status-icon :rules="rules" label-width="100px" class="ruleForm">
        <el-form-item label="原密码" prop="oldPass">
          <el-input v-model="ruleForm.oldPass" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPass">
          <el-input v-model="ruleForm.newPass" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input v-model="ruleForm.checkPass" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
          <el-button style="margin-left: 15%" @click="resetForm('ruleForm')">重置</el-button>
          <el-button style="margin-left: 15%" @click="dialogVisible = false">取消</el-button>
        </el-form-item>
        <span slot="footer" class="dialog-footer" />
      </el-form>
    </el-dialog>
    <el-dialog
      title="用户信息"
      :visible.sync="userVisible"
      width="65%"
      :before-close="handleClose"
    >
      <el-table
        :data="userData"
        style="width: 100%"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column prop="user_name" label="用户名" width="120px" align="center">
          <template slot-scope="scope">
            {{ scope.row['user_name'] }}
          </template>
        </el-table-column>
        <el-table-column prop="nick_name" label="昵称" width="120px" align="center">
          <template slot-scope="scope">
            {{ scope.row['nick_name'] }}
          </template>
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['email'] }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['phone'] }}
          </template>
        </el-table-column>
        <el-table-column prop="is_root" label="超管" width="60px" align="center">
          <template slot-scope="scope">
            {{ scope.row['is_root'] }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" width="auto">
          <template slot-scope="scope">
            <i class="el-icon-time" />
            {{ scope.row['create_at'] | DateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100px">
          <template slot-scope="scope">
            <router-link
              :to="{ name:'UserList', params: { user_id: scope.row.user_id } }"
            >
              <el-link type="primary" @click="handleClose">变更</el-link>
            </router-link>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer" />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { ChangePwd, Users } from '@/api/user'
import { Logout } from '@/utils/user'
import { getMsgList } from '@/api/msg'
import { cookieGet } from '@/utils/cookie'
import { DateFormat } from '@/utils/filters'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  filters: {
    DateFormat
  },
  data() {
    const oldPass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (value.length < 6) {
          callback(new Error('密码长度不能少于6位'))
        }
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (value.length < 6) {
          callback(new Error('密码长度不能少于6位'))
        }
        if (this.ruleForm.checkPass !== '') {
          this.$refs.ruleForm.validateField('checkPass')
        }
        callback()
      }
    }
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.ruleForm.newPass) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      userData: null,
      userVisible: false,
      dialogVisible: false,
      msgCounts: 0,
      circleUrl: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      ruleForm: {
        newPass: '',
        checkPass: '',
        oldPass: ''
      },
      rules: {
        oldPass: [
          { validator: oldPass, trigger: 'blur' }
        ],
        newPass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'token'
    ])
  },
  created() {
    getMsgList({ status: 'Unread' }).then((res) => {
      if (res.success) {
        this.msgCounts = res.pages.totalCount
      }
    })
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await Logout().catch(function(err) {
        console.log(err)
      })
      this.$router.push(`/login`)
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          ChangePwd({ password: this.ruleForm.oldPass, new_password: this.ruleForm.newPass }).then((res) => {
            if (res.success) {
              this.logout()
            } else {
              this.$notify.error({
                title: '',
                message: '密码修改失败'
              })
            }
            this.dialogVisible = false
          }).catch(function(err) {
            if (err.toString().includes('403')) {
              alert('用户无权限进行操作,请联系管理员')
            }
          })
        } else {
          return false
        }
      })
    },
    UserInfo() {
      Users({ token: cookieGet('token') }).then((res) => {
        if (res.success) {
          this.userVisible = true
          this.userData = res.data
        }
      })
    },
    handleClose() {
      this.dialogVisible = false
      this.userVisible = false
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 10px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 0;
          height: 0;
          background-color: white;
          border-radius: 15px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -15px;
          top: 15px;
          font-size: 15px;
        }
      }
    }
  }
}
</style>
