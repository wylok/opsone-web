<template>
  <div class="app-container">
    <div class="app-div-search" style="margin-bottom: 20px">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-input v-model="searchData" :placeholder="prefixSearch" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="onSearch" />
          </el-input>
        </el-col>
        <el-col :span="8"><br></el-col>
        <el-col :span="8" style="text-align: right">
          <el-button round @click="createOrder">创建工单</el-button>
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
        <el-table-column label="工单名称" width="auto" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            {{ scope.row['order_title'] }}
          </template>
        </el-table-column>
        <el-table-column label="工单内容" align="center" width="300px" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row['order_content'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工单流程" width="160px" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            {{ scope.row['order_flow_cn'] }}
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
        <el-table-column label="审批人" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['approve_name'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工单状态" width="auto" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row['order_status'] | orderColor">{{
              scope.row['order_status'] | orderFilter
            }}
            </el-tag>
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
        <el-table-column align="center" prop="end_approve_at" label="审批时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row['create_at']!==scope.row['end_approve_at']">
              <i class="el-icon-time" />
              {{ scope.row['end_approve_at'] | DateFormat }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100px">
          <template slot-scope="scope">
            <el-button-group v-if="scope.row['order_status']==='submitted'">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                plain
                @click.native.prevent="modifyOrder(scope.row)"
              />
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                plain
                @click.native.prevent="workOrderDelete(scope.row['order_id'])"
              />
            </el-button-group>
            <el-button-group v-else>
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                disabled
                plain
                @click.native.prevent=""
              />
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                disabled
                plain
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
      title="修改工单"
      :visible.sync="orderVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form ref="orderForm" :model="orderForm" :rules="rules" label-width="100px">
        <el-form-item label="工单标题" prop="type">
          <el-input v-model="orderForm.order_title" placeholder="标题内容" />
        </el-form-item>
        <el-form-item label="工单内容" prop="desc">
          <el-input v-model="orderForm.order_content" placeholder="工单内容" />
        </el-form-item>
      </el-form>
      <el-row :gutter="24">
        <el-col :span="16" style="text-align: right">
          <el-button @click="orderModify('orderForm')">提交</el-button>
          <el-button @click="handleClose">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <el-dialog
      title="新建工单"
      :visible.sync="newOrderVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form ref="newOrderForm" :model="orderForm" :rules="rules" label-width="100px">
        <el-form-item label="工单标题" prop="order_title" required>
          <el-input v-model="orderForm.order_title" placeholder="标题内容" />
        </el-form-item>
        <el-form-item label="工单内容" prop="order_content" required>
          <el-input v-model="orderForm.order_content" placeholder="工单内容" />
        </el-form-item>
        <el-form-item label="工单流程" prop="order_flow" required>
          <el-select v-model="orderForm.order_flow" placeholder="请选择流程">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <el-row :gutter="24">
        <el-col :span="16" style="text-align: right">
          <el-button @click="orderCreate('newOrderForm')">提交</el-button>
          <el-button @click="handleClose">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { deleteWorkOrder, getWorkOrder, getWorkOrderType, postWorkOrder, putWorkOrder } from '@/api/work_order'
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
        refuse: '已拒绝',
        approved: '审批通过',
        None: '无'
      }
      return statusMap[status]
    },
    orderColor(status) {
      const statusMap = {
        false: 'info',
        true: 'success',
        submitted: 'primary',
        approved: 'success',
        approve: 'primary',
        refuse: 'danger',
        None: 'info'
      }
      return statusMap[status]
    },
    DateFormat
  },
  data() {
    return {
      list: null,
      listLoading: true,
      orderVisible: false,
      newOrderVisible: false,
      departments: {},
      users: {},
      searchParams: 'order_title',
      searchData: '',
      prefixSearch: '工单搜索',
      orderForm: {
        order_id: null,
        order_title: null,
        order_content: null,
        order_flow: null
      },
      rules: {
        order_title: [
          { required: true, message: '工单标题', trigger: 'blur' }
        ],
        order_content: [
          { required: true, message: '工单描述', trigger: 'blur' }
        ]
      },
      year: getYear(),
      version: getVersion(),
      options: [],
      orderTypes: {},
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
    getWorkOrderType().then((res) => {
      if (res.success) {
        this.options = []
        for (const v of res.data) {
          this.options.push({ value: v.order_flow, label: v.order_name })
          this.orderTypes[v.order_flow] = v.order_name
        }
      }
    })
  },
  methods: {
    handleClose() {
      this.orderForm.order_id = null
      this.orderForm.order_title = null
      this.orderForm.order_content = null
      this.orderVisible = false
      this.newOrderVisible = false
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.getData(params)
    },
    async getData(params) {
      this.listLoading = true
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
      getWorkOrder(params).then((res) => {
        if (res.success) {
          this.list = res.data
          for (const v of this.list) {
            v['applicant_name'] = this.users[v.applicant]
            v['approve_name'] = this.users[v.approve]
            v['department_name'] = this.departments[v.department_id]
            v['order_flow_cn'] = this.orderTypes[v.order_flow]
          }
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
      })
    },
    workOrderDelete(order_id) {
      this.$confirm('此操作将永久删除工单, 是否继续?', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteWorkOrder({ order_ids: [order_id] }).then((res) => {
          if (res.success) {
            this.$message.success('删除工单成功')
            this.onSearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    createOrder() {
      this.orderForm.order_title = null
      this.orderForm.order_content = null
      this.newOrderVisible = true
    },
    orderCreate(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          postWorkOrder(this.orderForm).then((res) => {
            if (res.success) {
              this.$message.success('新建工单成功')
              this.newOrderVisible = false
              this.onSearch()
            }
          }).catch(function(err) {
            if (err.toString().includes('403')) {
              alert('用户无权限进行操作,请联系管理员')
            }
          })
        } else {
          return false
        }
      })
    },
    modifyOrder(v) {
      this.orderForm.order_id = v.order_id
      this.orderForm.order_title = v.order_title
      this.orderForm.order_content = v.order_content
      this.orderVisible = true
    },
    orderModify(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          putWorkOrder(this.orderForm).then((res) => {
            if (res.success) {
              this.$message.success('修改工单成功')
              this.orderVisible = false
              this.onSearch()
            }
          }).catch(function(err) {
            if (err.toString().includes('403')) {
              alert('用户无权限进行操作,请联系管理员')
            }
          })
        } else {
          return false
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
