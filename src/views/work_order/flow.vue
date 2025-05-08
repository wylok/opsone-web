<template>
  <div class="app-container">
    <div class="app-div-search" style="margin-bottom: 20px">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-input v-model="searchData" :placeholder="prefixSearch" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" disabled />
          </el-input>
        </el-col>
        <el-col :span="4"><br></el-col>
        <el-col :span="11" style="text-align: right">
          <el-button round @click="createDialogVisible=true">创建工单流程</el-button>
          <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="app-div">
      <el-collapse v-for="(value,key) in flow_data" :key="key" v-model="activeName" accordion>
        <el-collapse-item :title="value['order_name']" :name="key">
          <div v-if="value.flows!=null">
            <el-steps :active="value.flows.length" finish-status="process">
              <el-step
                v-for="v in value.flows"
                :key="v['flow_id']"
                :title="'审批人:'+users[v['leader_id']]"
                :description="'审批部门:'+departments[v['department_id']]"
              />
            </el-steps>
            <el-row :gutter="24">
              <el-col :span="24" style="text-align: right">
                <el-button-group>
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    circle
                    plain
                    @click.native.prevent="modifyOrderFlow(key,value)"
                  />
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    circle
                    plain
                    @click.native.prevent="workOrderFlowDelete(key)"
                  />
                </el-button-group>
              </el-col>
            </el-row>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <el-dialog
      title="创建工单流程"
      :visible.sync="createDialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px" class="demo-ruleForm">
        <el-form-item label="工单名称" prop="order_name">
          <el-input v-model="ruleForm.order_name" placeholder="中文名称" />
        </el-form-item>
        <el-form-item
          v-for="(approve, index) in ruleForm.approves"
          :key="index"
          label="工单审批"
          :prop="'approves.' + index + '.value'"
          :rules="{
            required: true, message: '审批人不能为空', trigger: 'blur'
          }"
        >
          <div class="block">
            <el-cascader
              v-model="approve.value"
              :options="options"
              :props="{ expandTrigger: 'hover' }"
              @change="handleChange"
            />
          </div>
          <el-button @click.prevent="removeApprove(approve)">删除</el-button>
        </el-form-item>
      </el-form>
      <el-row :gutter="24">
        <el-col :span="20" style="text-align: right">
          <el-button @click="addApprove">新增审批</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
          <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <el-drawer
      :show-close="false"
      :visible.sync="drawer"
      :before-close="handleClose"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px">
        <el-form-item label="工单名称" prop="order_name">
          <el-input v-model="ruleForm.order_name" placeholder="中文名称" />
        </el-form-item>
        <el-form-item
          v-for="(approve, index) in ruleForm.approves"
          :key="index"
          label="工单审批"
          :prop="'approves.' + index + '.value'"
          :rules="{
            required: true, message: '审批人不能为空', trigger: 'blur'
          }"
        >
          <div class="block">
            <el-cascader
              v-model="approve.value"
              :options="options"
              :props="{ expandTrigger: 'hover' }"
              @change="handleChange"
            />
          </div>
          <el-button @click.prevent="removeApprove(approve)">删除</el-button>
        </el-form-item>
      </el-form>
      <el-row :gutter="24">
        <el-col :span="20" style="text-align: right">
          <el-button @click="addApprove">新增审批</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
          <el-button @click.prevent="modifyFlow('ruleForm')">提交</el-button>
        </el-col>
      </el-row>
    </el-drawer>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { deleteWorkOrderFlow, getWorkOrderFlow, postWorkOrderFlow, putWorkOrderFlow } from '@/api/work_order'
import { DateFormat, getVersion, getYear } from '@/utils/filters'
import { Users } from '@/api/user'
import { GetDepartment } from '@/api/auth'

export default {
  inject: ['reload'],
  filters: {
    DateFormat
  },
  data() {
    return {
      flow_data: null,
      drawer: false,
      createDialogVisible: false,
      activeName: '1',
      searchData: '',
      listLoading: true,
      options: [],
      departments: {},
      users: {},
      orderTypeDisable: false,
      searchParams: 'role_name',
      prefixSearch: '工单搜索',
      year: getYear(),
      version: getVersion(),
      ruleForm: {
        order_flow: '',
        order_name: '',
        approves: [{ value: [] }]
      },
      rules: {
        order_name: [
          { required: true, message: '工单名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getData()
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
    getData(params) {
      this.listLoading = true
      getWorkOrderFlow(params).then((res) => {
        if (res.success) {
          this.flow_data = res.data
          this.listLoading = false
        }
      })
      Users().then((res) => {
        if (res.success) {
          GetDepartment().then((dep_res) => {
            if (dep_res.success) {
              const departments = {}
              for (const va of dep_res.data.departments) {
                departments[va.department_id] = va.department_name
              }
              this.departments = departments
              for (const v of res.data) {
                let n = true
                this.users[v.user_id] = v.nick_name
                for (const d of this.options) {
                  if (d.value === v.department_id) {
                    n = false
                    d.children.push({
                      value: v.user_id,
                      label: v.nick_name
                    })
                    break
                  }
                }
                if (n) {
                  this.options.push({
                    value: v.department_id,
                    label: departments[v.department_id],
                    children: [{
                      value: v.user_id,
                      label: v.nick_name
                    }]
                  })
                }
              }
            }
          })
        }
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.orderTypeDisable = false
          const approve_flow = []
          let i = 0
          for (const data of this.ruleForm.approves) {
            i = i + 1
            approve_flow.push({
              department_id: data.value[0],
              leader_id: data.value[1], flow_id: i
            })
          }
          postWorkOrderFlow({
            order_name: this.ruleForm.order_name,
            approve_flow: approve_flow
          }).then((res) => {
            if (res.success) {
              this.createDialogVisible = false
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
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    removeApprove(item) {
      const index = this.ruleForm.approves.indexOf(item)
      if (index !== -1) {
        this.ruleForm.approves.splice(index, 1)
      }
    },
    addApprove() {
      this.ruleForm.approves.push({ value: [] })
    },
    handleClose() {
      this.ruleForm.order_name = null
      this.ruleForm.approves = [{ value: [] }]
      this.createDialogVisible = false
      this.orderTypeDisable = false
      this.drawer = false
    },
    handleChange(value) {
      let i = 0
      for (const v of this.ruleForm.approves) {
        if (v.value[1] === value[1]) {
          i = i + 1
        }
        if (i > 1) {
          v.value = []
          this.$message.error('审批人ID(' + value[1] + ')不能重复选择!')
          break
        }
      }
    },
    modifyOrderFlow(k, data) {
      this.ruleForm.order_flow = k
      this.ruleForm.order_name = data['order_name']
      this.ruleForm.approves = []
      for (const v of data.flows) {
        this.ruleForm.approves.push({ value: [v.department_id, v.leader_id] })
      }
      this.orderTypeDisable = true
      this.drawer = true
    },
    modifyFlow(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const approve_flow = []
          for (const i in this.ruleForm.approves) {
            approve_flow.push({
              department_id: this.ruleForm.approves[i].value[0],
              leader_id: this.ruleForm.approves[i].value[1], flow_id: parseInt(i) + 1
            })
          }
          putWorkOrderFlow({
            order_flow: this.ruleForm.order_flow, order_name: this.ruleForm.order_name,
            approve_flow: approve_flow
          }).then((res) => {
            if (res.success) {
              this.$message.success('修改工单流程成功')
              this.orderTypeDisable = false
              this.drawer = false
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
    workOrderFlowDelete(order_flow) {
      this.$confirm('此操作将永久删除工单流程, 是否继续?', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteWorkOrderFlow({ order_flow: order_flow }).then((res) => {
          if (res.success) {
            this.$message.success('删除工单流程操作成功')
            this.onSearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    }
  }
}
</script>
