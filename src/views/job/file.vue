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
          <el-button v-if="job_id==null" round disabled>查看作业结果</el-button>
          <el-button v-else round @click="getResults({})">查看作业结果</el-button>
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
        <el-table-column label="作业ID" align="center" show-overflow-tooltip width="auto">
          <template slot-scope="scope">
            {{ scope.row['job_id'] }}
          </template>
        </el-table-column>
        <el-table-column label="作业主机" width="auto" align="center">
          <template slot-scope="scope">
            <router-link
              :to="{ name:'hostDetail', params: { host_id: scope.row['host_id'] } }"
            >
              <el-link type="primary">{{ scope.row['host_name'] }}</el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="目标路径" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['dst_path'] }}
          </template>
        </el-table-column>
        <el-table-column label="分发文件" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['files'] }}
          </template>
        </el-table-column>
        <el-table-column label="定时分发" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['cron']|jobFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="send_time" label="分发时间" width="180px">
          <template slot-scope="scope">
            <i class="el-icon-time" />
            {{ scope.row['send_time'] | DateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="作业状态" align="center" width="auto">
          <template slot-scope="scope">
            <el-tag :type="scope.row['status'] | statusFilter">{{ scope.row['status'] | jobFilter }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="作业结果" align="center" width="auto">
          <template slot-scope="scope">
            <el-link
              v-if="scope.row['status']==='completed'"
              type="primary"
              @click="getJobDetail(scope.row['job_id'],
                                   scope.row['host_id'])"
            >查看
            </el-link>
            <span v-else style="color: #2b2f3a">查看</span>
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
    <el-drawer
      size="50%"
      :visible.sync="drawer"
      :before-close="handleClose"
      :title="DrawerTitle"
    >
      <template>
        <div style="margin-left: 3%;margin-right: 3%;width:95%">
          <div v-for="r in jobResults" :key="r" style="margin-left: 1%;word-break:break-word; ">{{ r }}</div>
        </div>
      </template>
    </el-drawer>
    <el-drawer
      size="80%"
      :visible.sync="jobDrawer"
      :before-close="handleClose"
      :title="DrawerTitle"
      style="margin-bottom: 0"
    >
      <template>
        <div class="app-container">
          <div class="app-div" style="margin-bottom: 1%;overflow: scroll;height: 800px">
            <el-table
              v-loading="listLoading"
              :data="Results"
              border
              stripe
              style="width: 100%"
            >
              <el-table-column label="作业主机" width="250px" align="center">
                <template slot-scope="scope">
                  <router-link
                    :to="{ name:'hostDetail', params: { host_id: scope.row['host_id'] } }"
                  >
                    <el-link type="primary">{{ scope.row['host_name'] }}</el-link>
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column label="作业结果" align="left" width="auto">
                <template slot-scope="scope">
                  <div style="margin-left: 2%;margin-right: 2%;background:black;color:white;width:98%">
                    <div
                      v-for="r in scope.row['results'].split('\n')"
                      :key="r"
                      style="margin-left: 1%;word-break:break-word; "
                    >{{ r }}
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column align="center" prop="create_time" label="作业时间" width="auto" show-overflow-tooltip>
                <template slot-scope="scope">
                  <i class="el-icon-time" />
                  <span> {{ scope.row['create_time'] | DateFormat }} </span>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              :current-page="currentPage"
              :page-sizes="pageSizes"
              :page-size="PerPage"
              layout="->, total, sizes, prev, pager, next, jumper"
              :total="totalCount"
              @size-change="jobSizeChange"
              @current-change="jobCurrentChange"
            />
          </div>
        </div>
      </template>
    </el-drawer>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DateFormat, getVersion, getYear } from '@/utils/filters'
import { getJobFileList, getJobResults } from '@/api/job'
import { getServer } from '@/api/cmdb'

export default {
  inject: ['reload'],
  filters: {
    jobFilter(status) {
      const Map = {
        0: '否',
        1: '是',
        'pending': '等待中',
        'sending': '分发中',
        'completed': '已完成',
        'fail': '失败'
      }
      return Map[status]
    },
    statusFilter(status) {
      const Map = {
        'pending': 'primary',
        'sending': 'primary',
        'completed': 'success',
        'fail': 'danger'
      }
      return Map[status]
    },
    DateFormat
  },
  data() {
    return {
      list: null,
      listLoading: true,
      departments: {},
      hostNames: {},
      hostIds: [],
      multipleSelection: [],
      searchData: '',
      prefixSearch: '作业搜索',
      job_id: null,
      drawer: false,
      jobDrawer: false,
      jobResults: [],
      Results: null,
      DrawerTitle: null,
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
    if (this.$route.params['job_id'] !== undefined) {
      params['job_id'] = this.$route.params['job_id']
      this.job_id = this.$route.params['job_id']
    }
    this.getData(params)
  },
  methods: {
    handleClose(done) {
      this.jobResults = []
      this.drawer = false
      done()
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      // 其它方法可以处理已选择的行数据
      console.log(this.multipleSelection)
    },
    async getData(params) {
      this.listLoading = true
      let data = []
      await getJobFileList(params).then((res) => {
        if (res.success) {
          data = res.data
          res.data.forEach((v) => {
            if (this.hostIds.indexOf(v.host_id) === -1) {
              this.hostIds.push(v.host_id)
            }
          })
          this.totalCount = res.pages.totalCount
        }
      })
      await getServer({ host_ids: this.hostIds.join(',') }).then((res) => {
        if (res.success) {
          res.data.forEach((v) => {
            this.hostNames[v.host['host_id']] = v.host['host_name']
          })
        }
      })
      for (const v of data) {
        v['host_name'] = this.hostNames[v.host_id]
      }
      this.list = data
      this.listLoading = false
    },
    getJobDetail(jobId, hostId) {
      getJobResults({ job_id: jobId, host_id: hostId }).then((res) => {
        if (res.success) {
          this.jobResults = []
          this.DrawerTitle = '作业ID:' + jobId + ' 主机:' + this.hostNames[hostId]
          this.jobResults.push('文件分发结果:')
          for (const v of res.data[0].results.split('\n')) {
            this.jobResults.push(v)
          }
          this.drawer = true
        }
      })
    },
    async getResults(params) {
      params['job_id'] = this.job_id
      let data = []
      await getJobResults(params).then((res) => {
        if (res.success) {
          data = res.data
          this.DrawerTitle = '作业ID:' + this.job_id
          this.totalCount = res.pages.totalCount
          res.data.forEach((v) => {
            if (this.hostIds.indexOf(v.host_id) === -1) {
              this.hostIds.push(v.host_id)
            }
          })
        }
      })
      await getServer({ host_ids: this.hostIds.join(',') }).then((res) => {
        if (res.success) {
          res.data.forEach((v) => {
            this.hostNames[v.host['host_id']] = v.host['host_name']
          })
        }
      })
      for (const v of data) {
        v['host_name'] = this.hostNames[v.host_id]
      }
      this.Results = data
      this.jobDrawer = true
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
    },
    // 每页显示的条数
    jobSizeChange(val) {
      // 改变每页显示的条数
      this.PerPage = val
      // 注意：在改变每页显示的条数时，要将页码显示到第一页
      this.currentPage = 1
      this.getResults({ pre_page: this.PerPage, page: this.currentPage })
    },
    // 显示第几页
    jobCurrentChange(page) {
      // 切换页码时，要获取每页显示的条数
      this.currentPage = page
      this.getResults({ pre_page: this.PerPage, page: this.currentPage })
    }
  }
}
</script>
