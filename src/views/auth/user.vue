<template>
  <div class="app-container">
    <div class="app-div-search" style="margin-bottom: 20px">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-input v-model="searchData" :placeholder="prefixSearch" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="onSearch" />
          </el-input>
        </el-col>
        <el-col :span="4"><br></el-col>
        <el-col :span="12" style="text-align: right">
          <el-button round @click="addUser">新增用户</el-button>
          <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="app-div">
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          align="center"
          width="55"
        />
        <el-table-column label="用户名" align="center" width="auto">
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="dark"
              :content="scope.row['user_id']"
              placement="top-start"
            >
              <el-link>{{ scope.row['user_name'] }}</el-link>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="昵称" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['nick_name'] }}
          </template>
        </el-table-column>
        <el-table-column label="电子邮箱" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['email'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="手机号码" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['phone'] }}
          </template>
        </el-table-column>
        <el-table-column label="部门" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['department_name'] }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="用户状态" width="auto">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row['status'] | statusFilter"
            >
              <span> {{ scope.row['status'] | CommentStatus }} </span>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="最近登录时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span> {{ scope.row['last_login_at'] | DateFormat }} </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span> {{ scope.row['create_at'] | DateFormat }} </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="更新时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span> {{ scope.row['update_at'] | DateFormat }} </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template slot-scope="scope">
            <el-button-group>
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                plain
                @click.native.prevent="modifyUser(scope.row)"
              />
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                plain
                @click.native.prevent="userDelete(scope.row.user_id)"
              />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="currentPage"
        :page-sizes="pageSizes"
        :page-size="PerPage"
        layout="->, total, sizes, prev, pager, next, jumper"
        :total="totalCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog
      :title="userTitle"
      :visible.sync="userVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div style="margin-bottom: 20px">
        <el-form label-position="right" label-width="120px" :model="userForm">
          <el-form-item label="用户:" required>
            <el-input v-model="userForm.user_name" class="user_input" />
          </el-form-item>
          <el-form-item label="昵称:" required>
            <el-input v-model="userForm.nick_name" class="user_input" />
          </el-form-item>
          <el-form-item label="邮箱:">
            <el-input v-model="userForm.email" class="user_input" />
          </el-form-item>
          <el-form-item label="手机:" required>
            <el-input v-model="userForm.phone" class="user_input" />
          </el-form-item>
          <el-form-item v-if="passwordShow===true" label="密码:" required>
            <el-input v-model="userForm.password" class="user_input" />
          </el-form-item>
          <el-form-item label="部门:" required>
            <el-select v-model="userForm.department_id" placeholder="请选择">
              <el-option
                v-for="item in departments"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleClose">取 消</el-button>
        <el-button v-if="passwordShow===true" @click="userAdd">确 定</el-button>
        <el-button v-else @click="userModify">确 定</el-button>
      </span>
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DeleteUser, PostUser, PutUser, Users } from '@/api/user'
import { CommentStatus, DateFormat, getVersion, getYear, statusFilter } from '@/utils/filters'
import { GetDepartment } from '@/api/auth'

export default {
  inject: ['reload'],
  filters: {
    statusFilter,
    DateFormat,
    CommentStatus
  },
  data() {
    return {
      list: [],
      userVisible: false,
      content: '',
      multipleSelection: [],
      searchData: '',
      prefixSearch: '用户搜索',
      listLoading: false,
      searchParams: 'user_name',
      userForm: {
        user_id: '',
        user_name: '',
        nick_name: '',
        email: '',
        phone: '',
        password: '',
        department_id: ''
      },
      userTitle: '',
      departments: [],
      departmentList: {},
      passwordShow: true,
      rootDisable: true,
      year: getYear(),
      version: getVersion(),
      // 默认显示第几页
      currentPage: 1,
      // 总条数，根据接口获取数据长度(注意：这里不能为空)
      totalCount: 0,
      // 个数选择器（可修改）
      pageSizes: [10, 20, 30, 50],
      // 默认每页显示的条数（可修改）
      PerPage: 10
    }
  },
  created() {
    const params = { pre_page: this.PerPage, page: this.currentPage }
    if (this.$route.params['user_name'] !== undefined) {
      params['user_name'] = this.$route.params['user_name']
      this.searchParams = 'user_name'
      this.searchData = this.$route.params['user_name']
    }
    if (this.$route.params['user_id'] !== undefined) {
      params['user_id'] = this.$route.params['user_id']
      this.searchParams = 'user_id'
      this.searchData = this.$route.params['user_id']
    }
    this.getData(params)
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
      // 其它方法可以处理已选择的行数据
      console.log(this.multipleSelection)
    },
    handleClose() {
      this.userForm.user_id = null
      this.userForm.user_name = null
      this.userForm.nick_name = null
      this.userForm.email = null
      this.userForm.phone = null
      this.userForm.password = null
      this.userForm.department_id = null
      this.userVisible = false
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    async getData(params) {
      this.listLoading = true
      this.departments = []
      await GetDepartment().then((res) => {
        if (res.success) {
          for (const v of res.data.departments) {
            if (res.data[v.department_id] !== undefined) {
              this.departmentList[v.department_id] = v.department_name
              this.departments.push({ value: v.department_id, label: v.department_name })
            }
          }
        }
      })
      await Users(params).then((res) => {
        if (res.success) {
          this.list = res.data
          for (const v of this.list) {
            v['department_name'] = this.departmentList[v.department_id]
          }
          this.totalCount = res.pages.totalCount
        }
        this.listLoading = false
      })
    },
    addUser() {
      this.userTitle = '新增用户信息'
      this.passwordShow = true
      if (this.list.length === 0) {
        this.rootDisable = false
      }
      this.userForm.user_name = null
      this.userForm.nick_name = null
      this.userForm.email = null
      this.userForm.phone = null
      this.userForm.password = null
      this.userForm.department_id = null
      this.userVisible = true
    },
    userAdd() {
      PostUser(this.userForm).then((res) => {
        if (res.success) {
          this.activeName = 'user'
          this.userVisible = false
          this.$message.success('新增用户成功')
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    modifyUser(value) {
      this.userTitle = '修改用户信息'
      this.passwordShow = false
      if (this.list.length === 1) {
        this.rootDisable = false
      }
      this.userForm.user_id = value.user_id
      this.userForm.user_name = value.user_name
      this.userForm.nick_name = value.nick_name
      this.userForm.email = value.email
      this.userForm.phone = value.phone
      this.userForm.department_id = value.department_id
      this.userVisible = true
    },
    userModify() {
      PutUser(this.userForm).then((res) => {
        if (res.success) {
          this.$message.success('修改用户信息成功')
          this.activeName = 'user'
          this.userVisible = false
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    userDelete(user_id) {
      this.$confirm('该操作将永久删除用户, 是否继续?', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        DeleteUser({ user_ids: [user_id] }).then((res) => {
          if (res.success) {
            this.$message.success('删除用户成功')
            this.onSearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    // 分页
    // 每页显示的条数
    handleSizeChange(val) {
      // 改变每页显示的条数
      this.PerPage = val
      // 注意：在改变每页显示的条数时，要将页码显示到第一页
      this.currentPage = 1
      this.getData({ pre_page: this.PerPage, page: this.currentPage })
    },
    // 显示第几页
    handleCurrentChange(page) {
      // 切换页码时，要获取每页显示的条数
      this.currentPage = page
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchData !== null && this.searchData !== '' && this.searchData !== undefined) {
        params[this.searchParams] = this.searchData
      }
      this.getData(params)
    }
  }
}
</script>
<style lang="scss" scoped>
.user_input {
  width: 80%
}
</style>
