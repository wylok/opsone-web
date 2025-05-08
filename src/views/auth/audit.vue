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
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="审计ID" align="center" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row['audit_id'] }}
          </template>
        </el-table-column>
        <el-table-column label="审计类型" align="center" width="auto">
          <template slot-scope="scope">
            {{ scope.row['audit_type'] }}
          </template>
        </el-table-column>
        <el-table-column label="用户名称" align="center" width="auto">
          <template slot-scope="scope">
            {{ scope.row['user_name'] }}
          </template>
        </el-table-column>
        <el-table-column label="Handler" width="150px" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <router-link
              v-if="scope.row['audit_type']==='ssh'"
              :to="{ name:'hostDetail', params: { host_id: scope.row['handler'] } }"
            >
              <el-link type="primary">{{ scope.row['handler_name'] }}</el-link>
            </router-link>
            <span v-else>{{ scope.row['handler_name'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户操作" width="300px" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row['action'] }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="created_at" label="操作时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span> {{ scope.row['create_at'] | DateFormat }} </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template slot-scope="scope">
            <el-button-group>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                plain
                @click.native.prevent="deleteAuditLog(scope.row['audit_id'])"
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
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DeleteAudit, GetAudit } from '@/api/auth'
import { DateFormat, getVersion, getYear } from '@/utils/filters'

export default {
  inject: ['reload'],
  filters: {
    DateFormat
  },
  data() {
    return {
      list: null,
      content: '',
      listLoading: true,
      multipleSelection: [],
      searchData: '',
      searchParams: 'audit_id',
      prefixSearch: '审计ID',
      userIds: {},
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
    this.getData(params)
  },
  methods: {
    getData(params) {
      this.listLoading = true
      GetAudit(params).then((res) => {
        if (res.success) {
          this.list = res.data
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
      })
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    deleteAuditLog(auditId) {
      this.$confirm('此操作将永久删除审核日志, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        DeleteAudit({ audit_id: auditId }).then((res) => {
          if (res.success) {
            this.onSearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
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
