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
          <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="app-div">
      <el-tabs v-model="activeName" tab-position="left" @tab-click="changeTab">
        <el-tab-pane
          v-for="(v,k) in labels"
          :key="k"
          :label="v"
          :name="k"
        >
          <el-table
            v-loading="listLoading"
            :data="list"
            element-loading-text="Loading"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="权限ID" align="center" width="200px" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['privilege_id'] }}
              </template>
            </el-table-column>
            <el-table-column label="权限名称" width="200px" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['privilege_name'] }}
              </template>
            </el-table-column>
            <el-table-column label="API接口" align="center" width="300px" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['api_uri'] }}
              </template>
            </el-table-column>
            <el-table-column label="接口方法" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['api_method'] }}
              </template>
            </el-table-column>
            <el-table-column label="接口验证" width="auto" align="center">
              <template slot-scope="scope">
                <el-checkbox
                  v-if="scope.row['verify_auth']===1"
                  v-model="mode_true"
                  disabled
                />
                <el-checkbox
                  v-else
                  v-model="mode_false"
                  disabled
                />
              </template>
            </el-table-column>
            <el-table-column label="管理员权限" width="auto" align="center">
              <template slot-scope="scope">
                <el-switch
                  v-if="scope.row['admin']===1"
                  v-model="mode_true"
                  active-color="#13ce66"
                  inactive-color="#909399"
                  @change="ChangePrivilege(scope.row['privilege_id'],0,'admin')"
                />
                <el-switch
                  v-else
                  v-model="mode_false"
                  active-color="#13ce66"
                  inactive-color="#909399"
                  @change="ChangePrivilege(scope.row['privilege_id'],1,'admin')"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作员权限" width="auto" align="center">
              <template slot-scope="scope">
                <el-switch
                  v-if="scope.row['operator']===1"
                  v-model="mode_true"
                  active-color="#13ce66"
                  inactive-color="#909399"
                  @change="ChangePrivilege(scope.row['privilege_id'],0,'operator')"
                />
                <el-switch
                  v-else
                  v-model="mode_false"
                  active-color="#13ce66"
                  inactive-color="#909399"
                  @change="ChangePrivilege(scope.row['privilege_id'],1,'operator')"
                />
              </template>
            </el-table-column>
            <el-table-column label="用户权限" width="auto" align="center">
              <template slot-scope="scope">
                <el-switch
                  v-if="scope.row['user']===1"
                  v-model="mode_true"
                  active-color="#13ce66"
                  inactive-color="#909399"
                  @change="ChangePrivilege(scope.row['privilege_id'],0,'user')"
                />
                <el-switch
                  v-else
                  v-model="mode_false"
                  active-color="#13ce66"
                  inactive-color="#909399"
                  @change="ChangePrivilege(scope.row['privilege_id'],1,'user')"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
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
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { ModifyPrivileges, Privileges } from '@/api/auth'
import { getVersion, getYear } from '@/utils/filters'

export default {
  inject: ['reload'],
  filters: {},
  data() {
    return {
      list: null,
      mode_true: true,
      mode_false: false,
      searchData: '',
      searchParams: 'privilege_name',
      prefixSearch: '权限搜索',
      labels: {
        auth: '组织管理', cmdb: '资源管理', monitor: '监控报警', job: '运维作业', cloud: '多云管理', k8s: 'K8S集群',
        work_order: '工作工单', platform: '平台管理', msg: '消息中心'
      },
      listLoading: true,
      activeName: 'auth',
      privilegeId: null,
      privilegeName: null,
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
    this.getData({ pre_page: this.PerPage, page: this.currentPage, not_show: true, privilege_id: this.activeName + '.' })
  },
  methods: {
    changeTab() {
      this.currentPage = 1
      this.getData({
        pre_page: this.PerPage,
        page: this.currentPage,
        not_show: true,
        privilege_id: this.activeName + '.'
      })
    },
    onSearch() {
      const params = {
        pre_page: this.PerPage,
        page: this.currentPage,
        not_show: true,
        privilege_id: this.activeName + '.'
      }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
      location.reload()
    },
    getData(params) {
      this.listLoading = true
      Privileges(params).then((res) => {
        if (res.success) {
          this.list = res.data
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
      })
    },
    ChangePrivilege(privilege_id, data, tag) {
      const action = {}
      if (data === 0) {
        action[tag] = false
      }
      if (data === 1) {
        action[tag] = true
      }
      ModifyPrivileges({ privilege_id: privilege_id, action: action }).then((res) => {
        if (res.success) {
          this.$message.success('修改权限操作成功')
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    // 每页显示的条数
    handleSizeChange(val) {
      // 改变每页显示的条数
      this.PerPage = val
      // 注意：在改变每页显示的条数时，要将页码显示到第一页
      this.currentPage = 1
      this.getData({
        pre_page: this.PerPage,
        page: this.currentPage,
        not_show: true,
        privilege_id: this.activeName + '.'
      })
    },
    // 显示第几页
    handleCurrentChange(page) {
      // 切换页码时，要获取每页显示的条数
      this.currentPage = page
      this.getData({ pre_page: this.PerPage, page: page, not_show: true, privilege_id: this.activeName + '.' })
    }
  }
}
</script>
