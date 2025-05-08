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
          <el-button round @click="addRole">新增角色</el-button>
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
        <el-table-column label="角色名称" align="center" width="auto">
          <template slot-scope="scope">
            {{ scope.row.role['role_name'] }}
          </template>
        </el-table-column>
        <el-table-column label="角色类型" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row.role['role_type']|roleTypes }}
          </template>
        </el-table-column>
        <el-table-column label="角色描述" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.role['role_desc'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="角色用户" align="center" width="auto">
          <template slot-scope="scope">
            <el-link type="primary" @click="handleUser(scope.row.user)">查看用户</el-link>
          </template>
        </el-table-column>
        <el-table-column label="角色权限" align="center" width="auto">
          <template slot-scope="scope">
            <el-link type="primary" @click="handlePermission(scope.row.permission)">查看权限</el-link>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template slot-scope="scope">
            <el-button-group>
              <el-tooltip
                class="item"
                effect="light"
                content="编辑"
                placement="top-end"
              >
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="modifyRole(scope.row.role)"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="删除"
                placement="top-end"
              >
                <el-button
                  v-if="scope.row.role['role_type']==='default_type'"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  disabled
                />
                <el-button
                  v-else
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="roleDelete(scope.row.role)"
                />
              </el-tooltip>
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
      <el-drawer
        :show-close="false"
        :visible.sync="drawer"
        :before-close="handleClose"
      >
        <template v-if="showUser">
          <el-table
            :data="content"
            height="800"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column align="center" label="用户名" width="auto">
              <template slot-scope="scope">
                {{ scope.row['user_name'] }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="电子邮箱" width="auto">
              <template slot-scope="scope">
                {{ scope.row['email'] }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="手机号码" width="auto">
              <template slot-scope="scope">
                {{ scope.row['phone'] }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="状态" width="auto">
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row['status'] | statusFilter"
                >
                  <span> {{ scope.row['status'] | CommentStatus }} </span>
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </template>
        <template v-if="showPermission">
          <el-table
            :data="content"
            border
            height="800"
            stripe
            style="width: 100%"
          >
            <el-table-column align="center" label="权限ID" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['privilege_id'] }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="权限名称" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['privilege_name'] }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="API接口" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['api_uri'] }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="接口方法" width="80px">
              <template slot-scope="scope">
                {{ scope.row['api_method'] }}
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-drawer>
      <el-dialog
        :title="roleTitle"
        :visible.sync="roleVisible"
        width="40%"
        :before-close="handleClose"
      >
        <div style="margin-bottom: 3%">
          <el-form label-position="right" label-width="100px" :model="roleForm">
            <el-form-item label="角色名称:" required>
              <el-input v-model="roleForm.role_name" class="user_input" />
            </el-form-item>
            <el-form-item label="角色描述:" required>
              <el-input v-model="roleForm.role_desc" class="user_input" />
            </el-form-item>
          </el-form>
          <div style="margin-left: 7%">
            <div>
              <span style="font-weight: bold">选择用户:</span>
              <el-transfer
                v-model="roleForm.user_ids"
                filterable
                style="text-align: left; display: inline-block"
                :left-default-checked="[]"
                :right-default-checked="[]"
                :titles="['用户列表', '已选用户']"
                :format="{ noChecked: '${total}', hasChecked: '${checked}/${total}' }"
                filter-placeholder="请输入用户名"
                :data="userdata"
              />
            </div>
            <div style="margin-top:3%">
              <span style="font-weight: bold">选择权限:</span>
              <el-transfer
                v-model="roleForm.privilege_ids"
                filterable
                style="text-align: left; display: inline-block"
                :left-default-checked="[]"
                :right-default-checked="[]"
                :titles="['权限列表', '已选权限']"
                :format="{ noChecked: '${total}', hasChecked: '${checked}/${total}' }"
                filter-placeholder="请输入权限名称"
                :data="privilegeData"
              />
            </div>
          </div>
        </div>
        <span
          slot="footer"
          class="dialog-footer"
          style="margin-right: 40%"
        >
          <el-button @click="handleClose">取 消</el-button>
          <el-button v-if="roleForm.role_id===null" @click="roleAdd">确 定</el-button>
          <el-button v-else @click="roleModify">确 定</el-button>
        </span>
      </el-dialog>
    </div>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DeleteRole, PostRole, Privileges, PutRole, roles } from '@/api/auth'
import { CommentStatus, getVersion, getYear, statusFilter } from '@/utils/filters'
import { Users } from '@/api/user'

export default {
  inject: ['reload'],
  filters: {
    statusFilter,
    CommentStatus,
    roleTypes(roleType) {
      const types = {
        default_type: '平台内置',
        custom_type: '用户设置'
      }
      return types[roleType]
    }
  },
  data() {
    return {
      list: null,
      content: null,
      showUser: false,
      showPermission: false,
      listLoading: true,
      drawer: false,
      roleVisible: false,
      multipleSelection: [],
      searchData: '',
      searchParams: 'role_name',
      roleTitle: null,
      prefixSearch: '角色搜索',
      roleForm: {
        role_id: null,
        role_name: '',
        role_desc: '',
        user_ids: [],
        privilege_ids: []
      },
      userdata: [],
      privilegeData: [],
      rolePrivileges: {},
      roleUsers: {},
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
    this.getData({ pre_page: this.PerPage, page: this.currentPage })
    Users({ not_page: true }).then((res) => {
      if (res.success) {
        for (const v of res.data) {
          this.userdata.push({ key: v.user_id, label: v.nick_name })
        }
      }
    })
    Privileges({ not_page: true }).then((res) => {
      if (res.success) {
        for (const v of res.data) {
          this.privilegeData.push({ key: v.privilege_id, label: v['privilege_name'] })
        }
      }
    })
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
      // 其它方法可以处理已选择的行数据
      console.log(this.multipleSelection)
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    getData(params) {
      this.listLoading = true
      roles(params).then((res) => {
        if (res.success) {
          this.list = res.data
          for (const v of res.data) {
            const ps = []
            const us = []
            for (const p of v.permission) {
              ps.push(p.privilege_id)
            }
            for (const u of v.user) {
              us.push(u.user_id)
            }
            this.rolePrivileges[v.role.role_id] = ps
            this.roleUsers[v.role.role_id] = us
          }
          this.totalCount = res.pages.totalCount
        }
      })
      this.listLoading = false
    },
    handleUser(content) {
      this.content = content
      this.drawer = true
      this.showPermission = false
      this.showUser = true
    },
    handlePermission(content) {
      this.content = content
      this.drawer = true
      this.showUser = false
      this.showPermission = true
    },
    handleClose() {
      this.content = null
      this.roleForm.role_id = null
      this.roleForm.role_name = null
      this.roleForm.role_desc = null
      this.roleForm.user_ids = []
      this.roleForm.privilege_ids = []
      this.roleVisible = false
      this.drawer = false
    },
    addRole() {
      this.roleForm.role_id = null
      this.roleForm.role_name = null
      this.roleForm.role_desc = null
      this.roleForm.user_ids = []
      this.roleForm.privilege_ids = []
      this.roleTitle = '新增角色'
      this.roleVisible = true
    },
    roleAdd() {
      PostRole(this.roleForm).then((res) => {
        if (res.success) {
          this.$message.success('新角色添加成功')
          this.roleVisible = false
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    modifyRole(v) {
      this.roleForm.role_id = v.role_id
      this.roleForm.role_name = v.role_name
      this.roleForm.role_desc = v.role_desc
      this.roleForm.privilege_ids = this.rolePrivileges[v.role_id]
      this.roleForm.user_ids = this.roleUsers[v.role_id]
      this.roleTitle = '修改角色'
      this.roleVisible = true
    },
    roleModify() {
      PutRole(this.roleForm).then((res) => {
        if (res.success) {
          this.$message.success('修改角色操作成功')
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    roleDelete(v) {
      if (v.role_type === 'default_type') {
        this.$message.error('平台内置角色不能删除')
      } else {
        this.$confirm('此操作将永久删除该角色, 是否继续?', '', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          DeleteRole({ role_ids: [v.role_id] }).then((res) => {
            if (res.success) {
              this.$message.success('删除角色操作成功')
              this.onSearch()
            }
          }).catch(function(err) {
            if (err.toString().includes('403')) {
              alert('用户无权限进行操作,请联系管理员')
            }
          })
        })
      }
    },
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
