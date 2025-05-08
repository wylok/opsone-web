<template>
  <div class="app-container">
    <div class="app-div" style="margin-bottom: 20px">
      <div>
        <el-row>
          <el-col :span="12">
            <div>待审批工单</div>
          </el-col>
          <el-col :span="12" style="text-align: right">
            <el-button type="text" @click="onPendSearch">刷新</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table
        v-loading="pendListLoading"
        :data="pendList"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="工单名称" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['order_title'] }}
          </template>
        </el-table-column>
        <el-table-column label="工单内容" align="center" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row['order_content'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申请人" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['applicant_name'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申请部门" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['department_name'] }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="created_at" label="申请时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>
              <i class="el-icon-time" />
              {{ scope.row['create_at'] | DateFormat }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template slot-scope="scope">
            <el-button-group>
              <el-tooltip
                class="item"
                effect="light"
                content="通过"
                placement="top-end"
              >
                <el-button
                  type="success"
                  icon="el-icon-check"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="approveWorkOrder(scope.row['order_id'], scope.row['order_flow'], scope.row['flow_id'])"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="拒绝"
                placement="top-end"
              >
                <el-button
                  type="danger"
                  icon="el-icon-close"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="refuseWorkOrder(scope.row['order_id'], scope.row['order_flow'], scope.row['flow_id'])"
                />
              </el-tooltip>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="currentPendPage"
        :page-sizes="pageSizes"
        :page-size="PerPendPage"
        layout="->, total, sizes, prev, pager, next, jumper"
        :total="totalPendCount"
        @size-change="handlePendSizeChange"
        @current-change="handlePendCurrentChange"
      />
    </div>
    <div class="app-div">
      <div>
        <el-row>
          <el-col :span="12">
            <div>已审批工单</div>
          </el-col>
          <el-col :span="12" style="text-align: right">
            <el-button type="text" @click="onReadySearch">刷新</el-button>
          </el-col>
        </el-row>
      </div>
      <el-table
        v-loading="readyListLoading"
        :data="readyList"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="工单名称" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['order_title'] }}
          </template>
        </el-table-column>
        <el-table-column label="工单内容" align="center" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row['order_content'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申请人" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['applicant_name'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申请部门" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['department_name'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审批操作" align="center" width="auto">
          <template slot-scope="scope">
            <el-tag :type="scope.row['order_operate'] | orderColor">{{
              scope.row['order_operate'] | orderFilter
            }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="approve_time" label="审批时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>
              <i class="el-icon-time" />
              {{ scope.row['approve_time'] | DateFormat }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="currentReadyPage"
        :page-sizes="pageSizes"
        :page-size="PerReadyPage"
        layout="->, total, sizes, prev, pager, next, jumper"
        :total="totalReadyCount"
        @size-change="handleReadySizeChange"
        @current-change="handleReadyCurrentChange"
      />
    </div>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { getWorkOrderApprovePend, getWorkOrderApproveReady, postWorkOrderApprove } from '@/api/work_order'
import { DateFormat, getVersion, getYear } from '@/utils/filters'
import { Users } from '@/api/user'
import { GetDepartment } from '@/api/auth'

export default {
  inject: ['reload'],
  filters: {
    orderFilter(status) {
      const statusMap = {
        false: '未结束',
        true: '已结束',
        submitted: '已提交',
        approve: '审批中',
        pass: '已同意',
        approved: '已审批',
        refuse: '已拒绝',
        None: '无'
      }
      return statusMap[status]
    },
    orderColor(status) {
      const statusMap = {
        false: 'info',
        true: 'success',
        submitted: 'primary',
        approve: 'primary',
        approved: 'success',
        pass: 'success',
        refuse: 'danger',
        None: 'info'
      }
      return statusMap[status]
    },
    DateFormat
  },
  data() {
    return {
      readyList: null,
      pendList: null,
      readyListLoading: true,
      pendListLoading: true,
      departments: {},
      users: {},
      year: getYear(),
      version: getVersion(),
      // 默认显示第几页
      currentReadyPage: 1,
      // 总条数，根据接口获取数据长度(注意：这里不能为空)
      totalReadyCount: 0,
      // 个数选择器（可修改）
      pageSizes: [10, 20, 30, 50],
      // 默认每页显示的条数（可修改）
      PerReadyPage: 10,
      // 默认显示第几页
      currentPendPage: 1,
      // 总条数，根据接口获取数据长度(注意：这里不能为空)
      totalPendCount: 0,
      // 默认每页显示的条数（可修改）
      PerPendPage: 10
    }
  },
  created() {
    this.getPendData({ pre_page: this.PerPendPage, page: this.currentPendPage })
    this.getReadyData({ pre_page: this.PerReadyPage, page: this.currentReadyPage })
  },
  methods: {
    onPendSearch() {
      const params = { pre_page: this.PerPendPage, page: this.currentPendPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPendPage = 1
      this.getPendData(params)
    },
    onReadySearch() {
      const params = { pre_page: this.PerReadyPage, page: this.currentReadyPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentReadyPage = 1
      this.getReadyData(params)
    },
    async getReadyData(params) {
      this.readyListLoading = true
      await Users().then((res) => {
        if (res.success) {
          for (const v of res.data) {
            this.users[v.user_id] = v.nick_name
          }
        }
      })
      await GetDepartment().then((res) => {
        if (res.success) {
          for (const v of res.data.departments) {
            this.departments[v.department_id] = v.department_name
          }
        }
      })
      getWorkOrderApproveReady(params).then((res) => {
        if (res.success) {
          if (res.data !== null) {
            this.readyList = res.data
            for (const v of this.readyList) {
              v['applicant_name'] = this.users[v.applicant]
              v['department_name'] = this.departments[v.department_id]
            }
            this.totalReadyCount = res.pages.totalCount
          }
          this.readyListLoading = false
        }
      })
    },
    async getPendData(params) {
      this.pendListLoading = true
      await Users().then((res) => {
        if (res.success) {
          for (const v of res.data) {
            this.users[v.user_id] = v.nick_name
          }
        }
      })
      await GetDepartment().then((res) => {
        if (res.success) {
          for (const v of res.data.departments) {
            this.departments[v.department_id] = v.department_name
          }
        }
      })
      getWorkOrderApprovePend(params).then((res) => {
        if (res.success) {
          if (res.data !== null) {
            this.pendList = res.data
            for (const v of this.pendList) {
              v['applicant_name'] = this.users[v.applicant]
              v['department_name'] = this.departments[v.department_id]
            }
            this.totalPendCount = res.pages.totalCount
          }
          this.pendListLoading = false
        }
      })
    },
    approveWorkOrder(order_id, order_flow, flow_id) {
      this.$confirm('该工单将会审批通过, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        postWorkOrderApprove({ order_id: order_id, order_flow: order_flow, flow_id: flow_id, approve: true }).then((res) => {
          if (res.success) {
            this.$message.success('工单审批通过!')
            this.onPendSearch()
            this.onReadySearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    refuseWorkOrder(order_id, order_flow, flow_id) {
      this.$confirm('该工单将会审批拒绝, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        postWorkOrderApprove({ order_id: order_id, order_flow: order_flow, flow_id: flow_id, approve: false }).then((res) => {
          if (res.success) {
            this.$message.success('工单审批拒绝!')
            this.onPendSearch()
            this.onReadySearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    // 每页显示的条数
    handlePendSizeChange(val) {
      // 改变每页显示的条数
      this.PerPendPage = val
      // 注意：在改变每页显示的条数时，要将页码显示到第一页
      this.currentPendPage = 1
      this.getPendData({ pre_page: this.PerPendPage, page: this.currentPendPage })
    },
    // 显示第几页
    handlePendCurrentChange(page) {
      // 切换页码时，要获取每页显示的条数
      this.currentPendPage = page
      const params = { pre_page: this.PerPendPage, page: this.currentPendPage }
      if (this.searchData !== null && this.searchData !== '' && this.searchData !== undefined) {
        params[this.searchParams] = this.searchData
      }
      this.getPendData(params)
    },
    // 每页显示的条数
    handleReadySizeChange(val) {
      // 改变每页显示的条数
      this.PerReadyPage = val
      // 注意：在改变每页显示的条数时，要将页码显示到第一页
      this.currentReadyPage = 1
      this.getReadyData({ pre_page: this.PerReadyPage, page: this.currentReadyPage })
    },
    // 显示第几页
    handleReadyCurrentChange(page) {
      // 切换页码时，要获取每页显示的条数
      this.currentReadyPage = page
      const params = { pre_page: this.PerReadyPage, page: this.currentReadyPage }
      if (this.searchData !== null && this.searchData !== '' && this.searchData !== undefined) {
        params[this.searchParams] = this.searchData
      }
      this.getReadyData(params)
    }
  }
}
</script>
