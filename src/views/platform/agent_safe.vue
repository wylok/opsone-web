<template>
  <div class="app-container">
    <div class="app-div-search" style="margin-bottom: 20px">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-input v-model="searchData" :placeholder="prefixSearch" class="input-with-select" :disabled="searchDisabled">
            <el-select slot="prepend" v-model="searchParams" placeholder="请选择">
              <el-option v-for="(k,v) in labels" :key="k" :label="k" :value="v" />
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="onSearch" />
          </el-input>
        </el-col>
        <el-col :span="4"><br></el-col>
        <el-col :span="12" style="text-align: right">
          <el-button v-if="multipleSelection.length>1" round @click="clamAv('','install clamAv')">批量安装clamAv</el-button>
          <el-button v-else round disabled>批量安装clamAv</el-button>
          <el-button v-if="multipleSelection.length>1" round @click="clamAv('','remove clamAv')">批量卸载clamAv</el-button>
          <el-button v-else round disabled>批量卸载clamAv</el-button>
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
        <el-table-column label="主机名称" align="center" width="auto" prop="host_name" sortable show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tooltip :content="scope.row['host_name']">
              <router-link
                :to="{ name:'hostDetail', params: { host_id: scope.row['host_id'] } }"
              >
                <el-link type="primary">{{ scope.row['host_name'] }}</el-link>
              </router-link>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="Agent版本" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['agent_version'] }}
          </template>
        </el-table-column>
        <el-table-column label="clamAv杀毒" align="center" width="auto">
          <template slot-scope="scope">
            <el-tag v-if="scope.row['clamAv']==='clamAv'" type="success">运行中</el-tag>
            <el-tag v-else type="info">未安装</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="clamAv扫描" align="center" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row['clamRun']===''">未知</span>
            <span v-else>{{ scope.row['clamRun'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="在线状态" align="center" width="auto">
          <template slot-scope="scope">
            <el-tag v-if="scope.row['offline_time']===0" type="success">在线中</el-tag>
            <el-tag v-else type="info">已离线</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="离线时间" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['offline_time'] }}分钟
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150px">
          <template slot-scope="scope">
            <el-button-group>
              <el-tooltip
                v-if="scope.row['clamAv']==='clamAv'"
                class="item"
                effect="light"
                content="卸载clamAv"
                placement="top-end"
              >
                <el-button
                  type="warning"
                  icon="el-icon-delete-location"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="clamAv(scope.row['host_id'],'remove clamAv')"
                />
              </el-tooltip>
              <el-tooltip
                v-else
                class="item"
                effect="light"
                content="安装clamAv"
                placement="top-end"
              >
                <el-button
                  type="success"
                  icon="el-icon-add-location"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="clamAv(scope.row['host_id'],'install clamAv')"
                />
              </el-tooltip>
              <el-tooltip
                v-if="scope.row['offline_time']>0"
                class="item"
                effect="light"
                content="删除主机"
                placement="top-end"
              >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delAgentAlive(scope.row['host_id'])"
                />
              </el-tooltip>
              <el-button
                v-else
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                plain
                disabled
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
import { agentAlive, deleteAgentAlive } from '@/api/platform'
import { AgentStatus, boolConvert, DateFormat, getVersion, getYear } from '@/utils/filters'
import { postJobExec } from '@/api/job'
import time from 'mockjs'

export default {
  inject: ['reload'],
  filters: {
    DateFormat,
    AgentStatus,
    boolConvert
  },
  data() {
    return {
      list: null,
      searchDisabled: false,
      searchData: null,
      searchParams: 'host_name',
      labels: { host_name: '主机名称', agent_version: 'agent版本', host_id: '主机ID', clamAv: 'clamAv' },
      prefixSearch: '搜索',
      listLoading: true,
      year: getYear(),
      version: getVersion(),
      multipleSelection: [],
      hostIds: [],
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
  watch: {
    searchParams(val) {
      if (val === 'clamAv') {
        this.searchData = 'clamAv'
        this.searchDisabled = true
      } else {
        this.searchData = ''
        this.searchDisabled = false
      }
    }
  },
  created() {
    this.getData({ pre_page: this.PerPage, page: this.currentPage })
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
      // 其它方法可以处理已选择的行数据
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
      this.multipleSelection = []
      this.hostIds = []
      await agentAlive(params).then((res) => {
        if (res.success) {
          this.list = res.data
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
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
    delAgentAlive(host_id) {
      this.$confirm('此操作将删除所选服务器, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAgentAlive({ host_ids: [host_id] }).then((res) => {
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
    clamAv(host_id, exec) {
      if (this.multipleSelection.length > 0) {
        this.hostIds = []
        for (const v of this.multipleSelection) {
          this.hostIds.push(v.host_id)
        }
      } else {
        this.hostIds = [host_id]
      }
      postJobExec({ host_ids: this.hostIds, exec: exec, cron: false, run_time: time.now }).then((res) => {
        if (res.success) {
          this.$message.success('执行命令下发完成')
          this.$router.push({ name: 'job_overview' })
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    // 显示第几页
    handleCurrentChange(page) {
      // 切换页码时，要获取每页显示的条数
      this.currentPage = page
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.getData(params)
    }
  }
}
</script>
