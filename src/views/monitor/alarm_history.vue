<template>
  <div class="app-container">
    <div class="app-div-search" style="margin-bottom: 20px">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-input
            v-model="searchData"
            minlength="1"
            :placeholder="prefixSearch"
            class="input-with-select"
          >
            <el-select slot="prepend" v-model="searchParams" placeholder="请选择">
              <el-option v-for="(k,v) in labels" :key="k" :label="k" :value="v" />
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="onSearch" />
          </el-input>
        </el-col>
        <el-col :span="8"><br></el-col>
        <el-col :span="8" style="text-align: right">
          <el-button
            round
            type="danger"
            :disabled="buttonDisabled"
            plain
            small
            @click.native="deleteHistory(SelectIds)"
          >
            删除报警记录
          </el-button>
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
        <el-table-column label="主机名称" align="center" width="180px" show-overflow-tooltip>
          <template slot-scope="scope">
            <router-link
              :to="{ name:'hostDetail', params: { host_id: scope.row['host_id'] } }"
            >
              <el-link type="primary">{{ scope.row['host_name'] }}</el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="规则名称" width="auto" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <router-link
              :to="{ name:'search_rule_id', params: { type:'rule_ids', id: scope.row['rule_id'] } }"
            >
              <el-link>{{ scope.row['rule_name'] }}</el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="监控资源" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['monitor_resource'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="报警内容" align="center" width="300px" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row['content'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="报警等级" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['alarm_level']|levelFilter }}</span>
          </template>
        </el-table-column>
        <el-table-column label="持续时间" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['duration']|DurationFormat }}</span>
          </template>
        </el-table-column>
        <el-table-column label="当前状态" align="center" width="auto">
          <template slot-scope="scope">
            <el-tag :type="scope.row['status'] | statusFilter">
              {{ scope.row['status']|alarmStatusFilter }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="start_time" label="首次报警时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span> {{ scope.row['start_time'] | DateFormat }} </span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="end_time" label="最后报警时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span> {{ scope.row['end_time'] | DateFormat }} </span>
          </template>
        </el-table-column>
        <el-table-column label="报警通知" align="center" width="auto">
          <template slot-scope="scope">
            <router-link
              :to="{ name:'alarm_send_id', params: { type: 'trace_id', id: scope.row['trace_id'] } }"
            >
              <el-link>查看</el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template slot-scope="scope">
            <el-button-group>
              <el-tooltip
                v-if="scope.row['status']==='fault' && PauseAlarm[scope.row['trace_id']] === true"
                class="item"
                effect="light"
                content="恢复通知"
                placement="top-end"
              >
                <el-button
                  type="success"
                  icon="el-icon-bell"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="alarmPause(scope.row['trace_id'], 'cancel')"
                />
              </el-tooltip>
              <el-tooltip
                v-if="scope.row['status']==='fault' && PauseAlarm[scope.row['trace_id']] === false"
                class="item"
                effect="light"
                content="暂停通知"
                placement="top-end"
              >
                <el-button
                  type="warning"
                  icon="el-icon-close-notification"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="alarmPause(scope.row['trace_id'], 'pause')"
                />
              </el-tooltip>
              <el-tooltip
                v-if="scope.row['status']==='fault'"
                class="item"
                effect="light"
                content="删除"
                placement="top-end"
              >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="deleteHistory([scope.row['id']])"
                />
              </el-tooltip>
            </el-button-group>
            <el-tooltip
              v-if="scope.row['status']!=='fault'"
              class="item"
              effect="light"
              content="删除"
              placement="top-end"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                plain
                @click.native.prevent="deleteHistory([scope.row['id']])"
              />
            </el-tooltip>
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
import { AlarmHistory, AlarmPause, deleteAlarmHistory, getAlarmPause } from '@/api/monitor'
import {
  alarmStatusFilter,
  DateFormat,
  DurationFormat,
  getVersion,
  getYear,
  levelFilter,
  statusFilter
} from '@/utils/filters'
import { getServer } from '@/api/cmdb'

export default {
  inject: ['reload'],
  filters: {
    DateFormat,
    statusFilter,
    alarmStatusFilter,
    DurationFormat,
    levelFilter
  },
  data() {
    return {
      list: null,
      content: '',
      searchParams: 'rule_name',
      searchData: '',
      prefixSearch: '搜索规则名称',
      buttonDisabled: true,
      deleteButton: false,
      SelectIds: [],
      PauseAlarm: {},
      listLoading: true,
      hostNames: {},
      labels: { rule_name: '规则名称', rule_id: '规则ID', resource: '监控资源', item: '监控项', status: '规则状态' },
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
  watch: {
    searchParams(val) {
      this.prefixSearch = '搜索' + this.labels[val]
    }
  },
  created() {
    const params = { pre_page: this.PerPage, page: this.currentPage }
    if (this.$route.params['type'] !== undefined && this.$route.params['id'] !== undefined) {
      params[this.$route.params['type']] = this.$route.params['id']
    }
    this.getData(params)
  },
  methods: {
    handleSelectionChange(val) {
      this.buttonDisabled = val.length <= 0
      // 其它方法可以处理已选择的行数据
      if (val.length > 0) {
        val.forEach((v) => {
          this.SelectIds.push(v['id'])
        })
      }
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
      AlarmHistory(params).then((res) => {
        if (res.success) {
          const list = res.data
          const hostIds = []
          const traceIds = []
          this.totalCount = res.pages.totalCount
          if (list !== null) {
            list.forEach((v) => {
              if (hostIds.indexOf(v.host_id) === -1) {
                hostIds.push(v.host_id)
              }
              traceIds.push(v.trace_id)
            })
            if (hostIds.length > 0) {
              getServer({ host_ids: hostIds.join(',') }).then((res) => {
                if (res.success) {
                  res.data.forEach((v) => {
                    this.hostNames[v.host['host_id']] = v.host['host_name']
                  })
                  list.forEach((v, index) => {
                    list[index]['host_id'] = this.list[index]['host_id']
                    list[index]['mark'] = this.hostNames[this.list[index]['host_id']]
                  })
                }
              })
            }
            if (traceIds.length > 0) {
              getAlarmPause({ trace_ids: traceIds.join(',') }).then((res) => {
                if (res.success) {
                  this.PauseAlarm = res.data
                }
              })
            }
          }
          this.list = list
          this.listLoading = false
        }
      })
    },
    deleteHistory(ids) {
      this.$confirm('此操作将删除报警记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAlarmHistory({ ids: ids }).then((res) => {
          if (res.success) {
            this.$message.success('删除报警记录成功')
            this.onSearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    alarmPause(trace_id, action) {
      const titles = { pause: '此操作将暂停报警通知30分钟, 是否继续?', cancel: '此操作将恢复报警通知, 是否继续?' }
      this.$confirm(titles[action], '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        AlarmPause({ trace_id: trace_id, action: action }).then((res) => {
          if (res.success) {
            if (action === 'pause') {
              this.$message.success('暂停报警通知成功')
            } else {
              this.$message.success('恢复报警通知成功')
            }
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
      // 点击每页显示的条数时，显示第一页
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
