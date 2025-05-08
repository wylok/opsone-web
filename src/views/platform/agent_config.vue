<template>
  <div class="app-container">
    <div class="app-div">
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="Agent版本" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['agent_version'] }}
          </template>
        </el-table-column>
        <el-table-column label="配置采集" align="center" width="auto">
          <template slot-scope="scope">
            <el-tag v-if="scope.row['asset_agent_run']===1" type="success">{{
              scope.row['asset_agent_run']|AgentStatus
            }}
            </el-tag>
            <el-tag v-else type="info">{{ scope.row['asset_agent_run']|AgentStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="监控采集" width="auto" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row['monitor_agent_run']===1" type="success">
              {{ scope.row['monitor_agent_run']|AgentStatus }}
            </el-tag>
            <el-tag v-else type="info">{{ scope.row['monitor_agent_run']|AgentStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="心跳检测周期(秒)" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['heartbeat_interval'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="配置采集周期(分)" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['asset_interval'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="监控采集周期(秒)" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['monitor_interval'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Agent状态" align="center" width="auto">
          <template slot-scope="scope">
            <el-tag v-if="scope.row['status']===1" type="success">{{ scope.row['status']|AgentStatus }}</el-tag>
            <el-tag v-else type="info">{{ scope.row['status']|AgentStatus }}</el-tag>
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
                @click.native.prevent="agentConf(scope.row)"
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
      <el-dialog
        title="Agent配置变更"
        :before-close="handleDialogClose"
        :visible.sync="agentModifyVisible"
        width="50%"
      >
        <el-form
          ref="agentModifyForm"
          :model="agentModifyForm"
          label-width="130px"
          size="medium"
        >
          <el-row :gutter="24">
            <el-col :span="7" style="margin-left:12px">
              <el-form-item label="配置采集" prop="asset_agent_run">
                <el-switch
                  v-model="agentModifyForm.asset_agent_run"
                  active-color="#13ce66"
                  inactive-color="#E0E0E0"
                />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="监控采集" prop="monitor_agent_run">
                <el-switch
                  v-model="agentModifyForm.monitor_agent_run"
                  active-color="#13ce66"
                  inactive-color="#E0E0E0"
                />
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="Agent状态" prop="status">
                <el-switch
                  v-model="agentModifyForm.status"
                  active-color="#13ce66"
                  inactive-color="#E0E0E0"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="7" offset="1">
              <el-form-item label="心跳检测周期(秒)" prop="heartbeat_interval">
                <el-select v-model="agentModifyForm.heartbeat_interval" placeholder="请选择" style="width: 70%">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="配置采集周期(分)" prop="asset_interval">
                <el-select v-model="agentModifyForm.asset_interval" placeholder="请选择" style="width: 70%">
                  <el-option
                    v-for="item in asset_options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="监控采集周期(秒)" prop="monitor_interval">
                <el-select v-model="agentModifyForm.monitor_interval" placeholder="请选择" style="width: 70%">
                  <el-option
                    v-for="item in monitor_options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-col :span="12" :push="8">
              <el-button
                type="primary"
                @click="changeAgentConf('agentModifyForm')"
              >
                提交
              </el-button>
              <el-button @click="resetForm('agentModifyForm')">重置</el-button>
            </el-col>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { agentConf, putAgentConf } from '@/api/platform'
import { AgentStatus, boolConvert, DateFormat, getVersion, getYear } from '@/utils/filters'

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
      listLoading: true,
      agent_data: null,
      agentModifyVisible: false,
      agentModifyForm: {
        id: null,
        asset_agent_run: true,
        monitor_agent_run: true,
        heartbeat_interval: null,
        asset_interval: null,
        monitor_interval: null,
        status: true
      },
      options: [{
        value: 5,
        label: '5'
      }, {
        value: 10,
        label: '10'
      }, {
        value: 15,
        label: '15'
      }, {
        value: 20,
        label: '20'
      }, {
        value: 30,
        label: '30'
      }],
      monitor_options: [{
        value: 5,
        label: '5'
      }, {
        value: 10,
        label: '10'
      }, {
        value: 15,
        label: '15'
      }, {
        value: 30,
        label: '30'
      }, {
        value: 60,
        label: '60'
      }, {
        value: 120,
        label: '120'
      }],
      asset_options: [{
        value: 5,
        label: '5'
      }, {
        value: 10,
        label: '10'
      }, {
        value: 15,
        label: '15'
      }, {
        value: 30,
        label: '30'
      }, {
        value: 60,
        label: '60'
      }],
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
      await agentConf(params).then((res) => {
        if (res.success) {
          this.list = res.data
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
      })
    },
    agentConf(data) {
      this.agent_data = data
      this.agentModifyForm.id = data.id
      this.agentModifyForm.asset_agent_run = boolConvert(data.asset_agent_run)
      this.agentModifyForm.monitor_agent_run = boolConvert(data.monitor_agent_run)
      this.agentModifyForm.heartbeat_interval = data.heartbeat_interval
      this.agentModifyForm.asset_interval = data.asset_interval
      this.agentModifyForm.monitor_interval = data.monitor_interval
      this.agentModifyForm.status = boolConvert(data.status)
      this.agentModifyVisible = true
    },
    changeAgentConf(form) {
      putAgentConf(this.agentModifyForm).then((res) => {
        if (res.success) {
          this.agent_data = null
          this.$refs[form].clearValidate()
          this.$refs[form].resetFields()
          this.agentModifyVisible = false
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    resetForm(form) {
      this.agentModifyForm.asset_agent_run = boolConvert(this.agent_data.asset_agent_run)
      this.agentModifyForm.monitor_agent_run = boolConvert(this.agent_data.monitor_agent_run)
      this.agentModifyForm.heartbeat_interval = this.agent_data.heartbeat_interval
      this.agentModifyForm.asset_interval = this.agent_data.asset_interval
      this.agentModifyForm.monitor_interval = this.agent_data.monitor_interval
      this.agentModifyForm.status = boolConvert(this.agent_data.status)
      this.$refs[form].clearValidate()
      this.$refs[form].resetFields()
    },
    handleDialogClose(done) {
      this.agent_data = null
      this.agentModifyVisible = false
      done()
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
