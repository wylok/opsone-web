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
          <el-button round @click="idcVisible=true">配置新IDC</el-button>
          <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="app-div">
      <el-tabs v-model="purpose" type="border-card" @tab-click="onSearch">
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
          <el-table-column label="IDC名称" align="center" width="auto">
            <template slot-scope="scope">
              {{ scope.row['idc'] }}
            </template>
          </el-table-column>
          <el-table-column label="IDC中文" width="auto" align="center">
            <template slot-scope="scope">
              {{ scope.row['idc_cn'] }}
            </template>
          </el-table-column>
          <el-table-column label="地区名称" width="auto" show-overflow-tooltip align="center">
            <template slot-scope="scope">
              {{ scope.row['region'] }}
            </template>
          </el-table-column>
          <el-table-column label="地区中文" width="auto" show-overflow-tooltip align="center">
            <template slot-scope="scope">
              {{ scope.row['region_cn'] }}
            </template>
          </el-table-column>
          <el-table-column label="数据中心" width="auto" show-overflow-tooltip align="center">
            <template slot-scope="scope">
              {{ scope.row['data_center'] }}
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" width="auto" show-overflow-tooltip>
            <template slot-scope="scope">
              <i class="el-icon-time" />
              {{ scope.row['create_time'] | DateFormat }}
            </template>
          </el-table-column>
          <el-table-column label="变更时间" align="center" width="auto" show-overflow-tooltip>
            <template slot-scope="scope">
              <i class="el-icon-time" />
              {{ scope.row['update_time'] | DateFormat }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120px">
            <template slot-scope="scope">
              <el-button-group>
                <el-tooltip
                  class="item"
                  effect="light"
                  content="变更"
                  placement="top-end"
                >
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    size="mini"
                    circle
                    plainmo
                    @click.native.prevent="changeIdcPool(scope.row)"
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
                    @click.native.prevent="delIdc(scope.row['idc_id'])"
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
      </el-tabs>
    </div>
    <el-dialog
      title="新增IDC配置"
      :visible.sync="idcVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div style="margin-bottom: 20px">
        <el-form label-position="right" label-width="120px" :model="idcForm">
          <el-form-item label="IDC名称" required>
            <el-input v-model="idcForm.idc" class="server_input" />
          </el-form-item>
          <el-form-item label="IDC中文" required>
            <el-input v-model="idcForm.idc_cn" class="server_input" />
          </el-form-item>
          <el-form-item label="地区名称" required>
            <el-input v-model="idcForm.region" class="server_input" />
          </el-form-item>
          <el-form-item label="地区中文" required>
            <el-input v-model="idcForm.region_cn" class="server_input" />
          </el-form-item>
          <el-form-item label="数据中心" required>
            <el-input v-model="idcForm.data_center" class="server_input" />
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="addIdcPool">增加</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改IDC配置"
      :visible.sync="modifyIdcVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div style="margin-bottom: 20px">
        <el-form label-position="right" label-width="120px" :model="idcForm">
          <el-form-item label="IDC名称" required>
            <el-input v-model="idcForm.idc" class="server_input" />
          </el-form-item>
          <el-form-item label="IDC中文" required>
            <el-input v-model="idcForm.idc_cn" class="server_input" />
          </el-form-item>
          <el-form-item label="地区名称" required>
            <el-input v-model="idcForm.region" class="server_input" />
          </el-form-item>
          <el-form-item label="地区中文" required>
            <el-input v-model="idcForm.region_cn" class="server_input" />
          </el-form-item>
          <el-form-item label="数据中心" required>
            <el-input v-model="idcForm.data_center" class="server_input" />
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="modifyIdcPool">变更</el-button>
      </span>
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DateFormat, getVersion, getYear } from '@/utils/filters'
import { addIdc, deleteIdc, getIdc, modifyIdc } from '@/api/cmdb'

export default {
  inject: ['reload'],
  filters: {
    DateFormat
  },
  data() {
    return {
      list: null,
      listLoading: true,
      idcVisible: false,
      modifyIdcVisible: false,
      multipleSelection: [],
      buttonDisabled: true,
      searchData: '',
      prefixSearch: 'IDC名称',
      purpose: 'idc',
      idcForm: {
        idc_id: null,
        idc: null,
        idc_cn: null,
        region: null,
        region_cn: null,
        data_center: null
      },
      idcRules: {
        idc: [
          { required: true, message: '请输入IDC名称', trigger: 'blur' }
        ],
        idc_cn: [
          { required: true, message: '请输入IDC中文', trigger: 'blur' }
        ],
        region: [
          { required: true, message: '请输入地区名称', trigger: 'blur' }
        ],
        region_cn: [
          { required: true, message: '请输入地区中文', trigger: 'blur' }
        ],
        data_center: [
          { required: true, message: '请输入数据中心名称', trigger: 'blur' }
        ]
      },
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
    if (this.$route.params['idc'] !== undefined) {
      params['idc'] = this.$route.params['idc']
    }
    this.getData(params)
  },
  methods: {
    handleClose(done) {
      this.idcForm.idc_id = null
      this.idcForm.idc = null
      this.idcForm.idc_cn = null
      this.idcForm.region = null
      this.idcForm.region_cn = null
      this.idcForm.data_center = null
      this.idcVisible = false
      this.modifyIdcVisible = false
      done()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.buttonDisabled = this.multipleSelection.length <= 1
      // 其它方法可以处理已选择的行数据
      console.log(this.multipleSelection)
    },
    getData(params) {
      this.listLoading = true
      getIdc(params).then((res) => {
        if (res.success) {
          this.list = res.data
          this.totalCount = res.pages.totalCount
        }
      })
      this.listLoading = false
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    delIdc(idcId) {
      this.$confirm('此操作将永久删除IDC配置, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteIdc({ idc_id: idcId }).then((res) => {
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
    addIdcPool() {
      addIdc(this.idcForm).then((res) => {
        if (res.success) {
          this.$message.success('新IDC配置完成!')
          this.idcForm.idc_id = null
          this.idcForm.idc = null
          this.idcForm.idc_cn = null
          this.idcForm.region = null
          this.idcForm.region_cn = null
          this.idcForm.data_center = null
          this.idcVisible = false
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    changeIdcPool(data) {
      this.idcForm.idc_id = data['idc_id']
      this.idcForm.idc = data['idc']
      this.idcForm.idc_cn = data['idc_cn']
      this.idcForm.region = data['region']
      this.idcForm.region_cn = data['region_cn']
      this.idcForm.data_center = data['data_center']
      this.modifyIdcVisible = true
    },
    modifyIdcPool() {
      modifyIdc(this.idcForm).then((res) => {
        if (res.success) {
          this.$message.success('变更IDC配置完成!')
          this.idcForm.idc_id = null
          this.idcForm.idc = null
          this.idcForm.idc_cn = null
          this.idcForm.region = null
          this.idcForm.region_cn = null
          this.idcForm.data_center = null
          this.modifyIdcVisible = false
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
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
