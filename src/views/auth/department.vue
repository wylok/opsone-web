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
          <el-button round @click="newDepartment('None')">新建一级部门</el-button>
          <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="app-div">
      <el-table
        v-loading="listLoading"
        :data="departments"
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
        <el-table-column label="部门名称" align="center" width="auto">
          <template slot-scope="scope">
            {{ scope.row['department_name'] }}
          </template>
        </el-table-column>
        <el-table-column label="部门描述" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['department_desc']|descFilter }}
          </template>
        </el-table-column>
        <el-table-column label="上级部门" width="auto" align="center">
          <template slot-scope="scope">
            <router-link
              v-if="scope.row['parent_id'] !=='None'"
              :to="{ name:'DepartmentIds', params: { department_ids: scope.row['parent_id'] } }"
            >
              <el-link type="primary">{{ departmentData[scope.row['parent_id']]['department_name'] }}</el-link>
            </router-link>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column label="业务组" width="auto" align="center">
          <template slot-scope="scope">
            <span v-if="departmentData[scope.row['department_id']]['business']===true">
              <el-link
                type="primary"
                @click="queryBusiness(scope.row['department_id'],scope.row['department_name'],1)"
              >
                查看
              </el-link>
              <span>|</span>
              <el-link
                type="primary"
                @click="newBusiness(scope.row['department_id'])"
              >
                新建
              </el-link>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span>{{ scope.row['create_at']|DateFormat }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span> {{ scope.row['update_at']|DateFormat }} </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template slot-scope="scope">
            <el-button-group>
              <el-tooltip
                class="item"
                effect="light"
                content="新建子部门"
                placement="top-end"
              >
                <el-button
                  v-if="departmentData[scope.row['department_id']]['department']===true"
                  type="success"
                  icon="el-icon-crop"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="newDepartment(scope.row['department_id'])"
                />
                <el-button
                  v-else
                  type="info"
                  icon="el-icon-crop"
                  size="mini"
                  circle
                  plain
                  disabled
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="部门修改"
                placement="top-end"
              >
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="alterDepartment(scope.row['department_id'], scope.row['department_name'], scope.row['department_desc'])"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="删除部门"
                placement="top-end"
              >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="DelDepartment(scope.row['department_id'])"
                />
              </el-tooltip>
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
      :title="department_title"
      :visible.sync="departmentVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form
        ref="departmentForm"
        :model="departmentForm"
        :rules="departmentRules"
        :label-position="labelPosition"
        label-width="100px"
      >
        <el-row :gutter="24">
          <el-col :span="22">
            <el-form-item label="部门名称" prop="name">
              <el-input v-model="departmentForm.department_name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="22">
            <el-form-item label="部门描述" prop="desc">
              <el-input v-model="departmentForm.department_desc" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="departmentVisible = false">取 消</el-button>
        <el-button
          v-if="newDepartmentButton"
          type="primary"
          @click="addDepartmentForm('departmentForm')"
        >确 定</el-button>
        <el-button
          v-if="changeDepartmentButton"
          type="primary"
          @click="changeDepartmentForm('departmentForm')"
        >确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="business_title"
      :visible.sync="businessVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-form
        ref="businessForm"
        :model="businessForm"
        :rules="businessRules"
        :label-position="labelPosition"
        label-width="100px"
      >
        <el-row :gutter="24">
          <el-col :span="22">
            <el-form-item label="业务组名称" prop="name">
              <el-input v-model="businessForm.name" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="22">
            <el-form-item label="业务组描述" prop="desc">
              <el-input v-model="businessForm.desc" size="small" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="businessVisible = false">取 消</el-button>
        <el-button v-if="newBusinessButton" type="primary" @click="addBusinessForm('businessForm')">确 定</el-button>
        <el-button
          v-if="changeBusinessButton"
          type="primary"
          @click="changeBusinessForm('businessForm')"
        >确 定</el-button>
      </span>
    </el-dialog>
    <el-drawer
      :title="drawerTitle"
      :visible.sync="drawer"
      size="35%"
      :direction="direction"
      :before-close="handleClose"
    >
      <el-table
        v-loading="listLoading"
        :data="business"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="业务组名称" align="center" width="auto">
          <template slot-scope="scope">
            {{ scope.row['business_name'] }}
          </template>
        </el-table-column>
        <el-table-column label="业务组描述" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['business_desc'] }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" width="auto">
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span>{{ scope.row['create_at']|DateFormat }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template slot-scope="scope">
            <el-button-group>
              <el-tooltip
                class="item"
                effect="light"
                content="编辑"
                placement="top-end"
              >
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="alterBusiness(scope.row['business_id'], scope.row['business_name'], scope.row['business_desc'])"
                />
              </el-tooltip>
              <el-tooltip
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
                  @click.native.prevent="delBusiness(scope.row['business_id'])"
                />
              </el-tooltip>
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
    </el-drawer>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { CommentStatus, DateFormat, getVersion, getYear, statusFilter } from '@/utils/filters'
import {
  CreateBusiness,
  CreateDepartment,
  DeleteBusiness,
  DeleteDepartment,
  GetBusiness,
  GetDepartment,
  ModifyBusiness,
  ModifyDepartment
} from '@/api/auth'

export default {
  inject: ['reload'],
  filters: {
    descFilter(data) {
      if (data === 'None') {
        return '暂无数据'
      }
      return data
    },
    statusFilter,
    DateFormat,
    CommentStatus
  },
  data() {
    return {
      drawer: false,
      drawerTitle: '',
      direction: 'rtl',
      departmentVisible: false,
      modifySubDepartment: false,
      createSubDepartment: false,
      businessVisible: false,
      departments: [],
      departmentData: [],
      business: [],
      department_id: null,
      department_name: null,
      department_title: '',
      newDepartmentButton: true,
      changeDepartmentButton: false,
      newBusinessButton: true,
      changeBusinessButton: false,
      business_title: '',
      multipleSelection: [],
      searchData: '',
      labelPosition: 'right',
      departmentForm: {
        department_name: '',
        department_desc: '',
        parent_id: 'None'
      },
      departmentRules: {
        department_name: [
          { required: true, message: '请输入部门名称', trigger: 'blur' }
        ],
        department_desc: [
          { required: true, message: '请输入部门描述', trigger: 'blur' }
        ]
      },
      businessForm: {
        name: '',
        desc: '',
        department_id: '',
        business_id: ''
      },
      businessRules: {
        name: [
          { required: true, message: '请输入业务组名称', trigger: 'blur' }
        ],
        desc: [
          { required: true, message: '请输入业务组描述', trigger: 'blur' }
        ]
      },
      searchParams: 'department_name',
      prefixSearch: '部门搜索',
      listLoading: false,
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
    if (this.$route.params['department_ids'] !== undefined) {
      params['department_ids'] = this.$route.params['department_ids']
    }
    this.getData(params)
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
      // 其它方法可以处理已选择的行数据
      console.log(this.multipleSelection)
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchData !== '') {
        params['department_name'] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    handleClose(done) {
      this.department_id = null
      this.department_name = null
      this.departmentForm.parent_id = null
      this.departmentForm.department_id = null
      this.businessForm.department_id = null
      this.businessForm.business_id = null
      this.onSearch()
      done()
    },
    getData(params) {
      this.listLoading = true
      GetDepartment(params).then((res) => {
        if (res.success) {
          this.departmentData = res.data
          this.departments = res.data.departments
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
      })
    },
    queryBusiness(department_id, department_name, page) {
      this.department_id = department_id
      this.department_name = department_name
      this.currentPage = page
      const params = { pre_page: this.PerPage, page: this.currentPage, department_id: department_id }
      this.drawer = true
      this.listLoading = true
      this.drawerTitle = department_name
      GetBusiness(params).then((res) => {
        if (res.success) {
          this.business = res.data
          this.totalCount = res.pages.totalCount
        }
        this.listLoading = false
      })
    },
    alterDepartment(department_id, department_name, department_desc) {
      this.department_title = '部门修改'
      this.departmentVisible = true
      this.newDepartmentButton = false
      this.changeDepartmentButton = true
      this.departmentForm.parent_id = ''
      this.departmentForm.department_name = department_name
      this.departmentForm.department_desc = department_desc
      this.departmentForm.department_id = department_id
    },
    changeDepartmentForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          ModifyDepartment({
            department_name: this.departmentForm.department_name,
            department_desc: this.departmentForm.department_desc,
            department_id: this.departmentForm.department_id
          }).then((res) => {
            if (res.success) {
              this.$message.success('修改部门操作成功')
              this.onSearch()
              this.department_id = null
              this.departmentVisible = false
            }
            this.departmentForm.department_id = ''
            this.listLoading = false
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
    DelDepartment(department_id) {
      this.$confirm('此操作将删除部门, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        DeleteDepartment({ department_id: department_id }).then((res) => {
          if (res.success) {
            this.department_id = null
            this.$message.success('删除部门操作成功')
            this.onSearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    newDepartment(parent_id) {
      this.department_title = '新建部门'
      this.departmentVisible = true
      this.newDepartmentButton = true
      this.changeDepartmentButton = false
      this.departmentForm.parent_id = parent_id
      this.departmentForm.department_name = ''
      this.departmentForm.department_desc = ''
    },
    addDepartmentForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          CreateDepartment(this.departmentForm).then((res) => {
            if (res.success) {
              this.$message.success('新建部门操作成功')
              this.departmentVisible = false
              this.onSearch()
            }
            this.listLoading = false
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
    newBusiness(department_id) {
      this.business_title = '新建业务组'
      this.businessVisible = true
      this.newBusinessButton = true
      this.changeBusinessButton = false
      this.businessForm.department_id = department_id
      this.businessForm.business_id = ''
      this.businessForm.name = ''
      this.businessForm.desc = ''
    },
    addBusinessForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          CreateBusiness({
            business_name: this.businessForm.name,
            business_desc: this.businessForm.desc, department_id: this.businessForm.department_id
          }).then((res) => {
            if (res.success) {
              this.$message.success('新建业务组操作成功')
              this.department_id = null
              this.businessVisible = false
              this.onSearch()
            }
            this.listLoading = false
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
    alterBusiness(business_id, business_name, business_desc) {
      this.business_title = '业务组修改'
      this.businessVisible = true
      this.newBusinessButton = false
      this.changeBusinessButton = true
      this.businessForm.department_id = ''
      this.businessForm.business_id = business_id
      this.businessForm.name = business_name
      this.businessForm.desc = business_desc
    },
    changeBusinessForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          ModifyBusiness({
            business_name: this.businessForm.name,
            business_desc: this.businessForm.desc,
            business_id: this.businessForm.business_id
          }).then((res) => {
            if (res.success) {
              this.$message.success('修改业务组操作成功')
              this.department_id = null
              this.businessVisible = false
              this.onSearch()
            }
            this.listLoading = false
            this.businessForm.business_id = ''
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
    delBusiness(business_id) {
      this.$confirm('此操作将删除业务组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        DeleteBusiness({ business_id: business_id }).then((res) => {
          if (res.success) {
            this.department_id = null
            this.$message.success('删除业务组操作成功')
            this.queryBusiness(this.department_id, this.department_name, this.currentPage)
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    // 分页
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
      if (this.department_id !== null) {
        this.queryBusiness(this.department_id, this.department_name, page)
      } else {
        const params = { pre_page: this.PerPage, page: this.currentPage }
        if (this.searchData !== null && this.searchData !== '' && this.searchData !== undefined) {
          params[this.searchParams] = this.searchData
        }
        this.getData(params)
      }
    }
  }
}
</script>
