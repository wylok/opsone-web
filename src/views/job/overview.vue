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
          <el-button round @click="deleteJobs">批量删除</el-button>
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
        <el-table-column label="作业类型" width="100px" align="center">
          <template slot-scope="scope">
            {{ scope.row['job_type']|jobFilter }}
          </template>
        </el-table-column>
        <el-table-column label="作业内容" width="auto" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row['contents'] }}
          </template>
        </el-table-column>
        <el-table-column label="定时执行" align="center" width="100px">
          <template slot-scope="scope">
            <span>{{ scope.row['cron']|jobFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column label="作业数量" width="100px" align="center">
          <template slot-scope="scope">
            <el-tag type="primary">{{ scope.row['counts'] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="成功数量" align="center" width="100px">
          <template slot-scope="scope">
            <el-tag type="success">{{ scope.row['success'] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="失败数量" align="center" width="100px">
          <template slot-scope="scope">
            <el-tag type="danger">{{ scope.row['fail'] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作人" width="120px" align="center">
          <template slot-scope="scope">
            {{ scope.row.user_name }}
          </template>
        </el-table-column>
        <el-table-column label="作业详情" align="center" width="100px">
          <template slot-scope="scope">
            <router-link
              v-if="scope.row['job_type']==='job_exec'"
              :to="{ name:'job_exec_id', params: { job_id: scope.row.job_id } }"
            >
              <el-link type="primary">查看</el-link>
            </router-link>
            <router-link
              v-if="scope.row['job_type']==='job_file'"
              :to="{ name:'job_file_id', params: { job_id: scope.row.job_id } }"
            >
              <el-link type="primary">查看</el-link>
            </router-link>
            <router-link
              v-if="scope.row['job_type']==='job_script'"
              :to="{ name:'job_script_run_id', params: { job_id: scope.row.job_id } }"
            >
              <el-link type="primary">查看</el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="created_time" label="作业时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            {{ scope.row['create_time'] | DateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template slot-scope="scope">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              plain
              @click.native.prevent="deleteJob(scope.row['job_id'])"
            />
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
import { DateFormat, getVersion, getYear } from '@/utils/filters'
import { Users } from '@/api/user'
import { deleteJobOverview, getJobOverview } from '@/api/job'

export default {
  inject: ['reload'],
  filters: {
    jobFilter(type) {
      const Map = {
        0: '否',
        1: '是',
        'job_exec': '命令执行',
        'job_file': '文件分发',
        'job_script': '脚本执行'
      }
      return Map[type]
    },
    DateFormat
  },
  data() {
    return {
      list: null,
      listLoading: true,
      users: {},
      multipleSelection: [],
      searchData: '',
      prefixSearch: '作业搜索',
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
    this.getData({ pre_page: this.PerPage, page: this.currentPage })
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
    async getData(params) {
      this.listLoading = true
      let data = []
      await getJobOverview(params).then((res) => {
        if (res.success) {
          data = res.data
          this.totalCount = res.pages.totalCount
        }
      })
      await Users().then((res) => {
        if (res.success) {
          this.users = { platform: '平台' }
          for (const v of res.data) {
            this.users[v.user_id] = v.nick_name
          }
        }
      })
      for (const v of data) {
        v['user_name'] = this.users[v.user_id]
      }
      this.list = data
      this.listLoading = false
    },
    deleteJobId(jobIds) {
      deleteJobOverview({ job_ids: jobIds }).then((res) => {
        if (res.success) {
          this.$message.success('删除作业任务完成')
          this.getData({ pre_page: this.PerPage, page: this.currentPage })
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    deleteJob(jobId) {
      this.$confirm('此操作将永久删除作业任务, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteJobId([jobId])
      })
    },
    deleteJobs() {
      const jobIds = []
      this.$confirm('此操作将批量永久删除作业任务, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.multipleSelection.length > 1) {
          this.multipleSelection.forEach((v) => {
            jobIds.push(v['job_id'])
          })
        }
        this.deleteJobId(jobIds)
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
