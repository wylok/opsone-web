<template>
  <div class="app-container">
    <el-container>
      <el-aside width="200px">
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"
        />
        <el-tree
          ref="tree"
          :data="nodeList"
          :props="defaultProps"
          :filter-node-method="filterNode"
          class="filter-tree"
          default-expand-all
          highlight-current
          style="font-weight:bolder"
          @node-click="handleNodeClick"
        />
      </el-aside>
      <el-main>
        <div class="app-div-search" style="margin-bottom: 20px;margin-top: -20px">
          <el-row :gutter="24">
            <el-col :span="8">
              <el-input v-model="searchData" :placeholder="prefixSearch" class="input-with-select">
                <el-select slot="prepend" v-model="searchParams" placeholder="请选择">
                  <el-option v-for="(k,v) in labels" :key="k" :label="k" :value="v" />
                </el-select>
                <el-button slot="append" icon="el-icon-search" @click="onSearch" />
              </el-input>
            </el-col>
            <el-col :span="4"><br></el-col>
            <el-col :span="12" style="text-align: right">
              <el-button round :disabled="buttonDisabled" @click="migrateBusinesses()">变更业务组</el-button>
              <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
            </el-col>
          </el-row>
        </div>
        <div class="app-div">
          <el-table
            v-loading="listLoading"
            :data="nodeData"
            element-loading-text="Loading"
            border
            fit
            highlight-current-row
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              align="center"
              width="45"
            />
            <el-table-column label="主机名称" align="center" width="200">
              <template slot-scope="scope">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="scope.row.host['host_id']"
                  placement="top-start"
                >
                  <router-link
                    :to="{ name:'hostDetail', params: { host_id: scope.row.host['host_id'] } }"
                  >
                    <el-link type="primary">{{ scope.row.host.host_name }}</el-link>
                  </router-link>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="所属厂商" width="auto" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.idc !== null">{{ scope.row.idc['idc_cn'] }}</span>
                <span v-else>未知</span>
              </template>
            </el-table-column>
            <el-table-column label="主机类型" width="130" align="center">
              <template slot-scope="scope">
                {{ scope.row.host['host_type_cn'] }}
              </template>
            </el-table-column>
            <el-table-column label="CPU" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row.host['cpu'] }}
              </template>
            </el-table-column>
            <el-table-column label="内存" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row.host['memory'] / 1000 / 1024 / 1024 | Round }}G
              </template>
            </el-table-column>
            <el-table-column label="磁盘" width="auto" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.host['disk'] / 1000 / 1024 / 1024 < 1000">
                  {{ scope.row.host['disk'] / 1000 / 1024 / 1024| Round }}G
                </span>
                <span v-else>{{ scope.row.host['disk'] / 1000 / 1000 / 1024 / 1024| Round }}T</span>
              </template>
            </el-table-column>
            <el-table-column label="操作系统" width="150" align="center">
              <template slot-scope="scope">
                {{ scope.row.host['platform'] }}{{ scope.row.host['platform_version'] }}
              </template>
            </el-table-column>
            <el-table-column label="主机IP" width="120" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.net.length>0">{{ scope.row.net[0]['ip'] }}</span>
                <span v-else><el-skeleton :rows="1" /></span>
              </template>
            </el-table-column>
            <el-table-column label="主机状态" width="90" align="center">
              <template slot-scope="scope">
                <router-link
                  v-if="scope.row.health==='fault'"
                  :to="{ name:'alarm_history_id',params: {type: 'host_id',id: scope.row.host['host_id']} }"
                >
                  <el-tag :type="scope.row.health | statusFilter">{{ scope.row.health|healthFilter }}</el-tag>
                </router-link>
                <el-tag v-else :type="scope.row.health | statusFilter">{{ scope.row.health|healthFilter }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="business" label="所属业务组" width="150">
              <template slot-scope="scope">
                <span>{{
                  scope.row.under['department_id']|businessFilter(scope.row.under['business_id'],departments)
                }}</span>
              </template>
            </el-table-column>
            <el-table-column label="WebShell" align="center" width="110px">
              <template slot-scope="scope">
                <router-link
                  v-if="scope.row.host['pool_id']!==0"
                  :to="{ name:'AssetWebShell', params: { asset_id: scope.row.host.host_id, asset_name: scope.row.host.host_name, asset_type: 'server' }}"
                >
                  <el-tag v-if="scope.row.online===true" effect="plain" type="danger" style="margin-left: 1%">bash</el-tag>
                  <el-tag v-else effect="plain" type="info" style="margin-left: 1%">bash</el-tag>
                </router-link>
                <el-tag v-else effect="plain" type="info" style="margin-left: 1%">bash</el-tag>
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
            title="业务组间迁移"
            :visible.sync="DialogVisible"
            width="30%"
            :before-close="handleClose"
          >
            <div style="margin-bottom: 20px">
              <span>请选择要迁移的业务组:</span>
            </div>
            <el-radio-group v-model="selectBusinessId">
              <el-radio v-for="(v,key) in business" :key="key" :label="key">{{ v }}</el-radio>
            </el-radio-group>
            <span slot="footer" class="dialog-footer">
              <el-button @click="handleClose">取 消</el-button>
              <el-button v-if="selectBusinessId!==null" type="primary" @click="changeBusiness">确 定</el-button>
              <el-button v-else type="primary" disabled>确 定</el-button>
            </span>
          </el-dialog>
        </div>
      </el-main>
      <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
    </el-container>
  </div>
</template>

<script>
import { GetDepartment, GetTree } from '@/api/auth'
import { getServer, putServerBusiness } from '@/api/cmdb'
import { DateFormat, Round, getVersion, getYear } from '@/utils/filters'

export default {
  inject: ['reload'],
  filters: {
    statusFilter(status) {
      const statusMap = {
        Running: 'success',
        Unknown: 'info',
        Close: 'danger',
        health: 'success',
        unknown: 'info',
        fault: 'danger'
      }
      return statusMap[status]
    },
    businessFilter(department_id, business_id, departments) {
      let b = '未配置'
      if (departments[department_id]['business_group'][business_id] !== undefined) {
        b = departments[department_id]['business_group'][business_id]
      }
      return b
    },
    healthFilter(status) {
      const statusMap = {
        unknown: '未知',
        health: '健康',
        fault: '故障'
      }
      return statusMap[status]
    },
    Round,
    DateFormat
  },
  data() {
    return {
      filterText: '',
      nodeData: null,
      DialogVisible: false,
      nodeList: [],
      departments: {},
      business: {},
      multipleSelection: [],
      listLoading: false,
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      prefixSearch: '搜索主机名称',
      labels: { host_name: '主机名称', host_type: '主机型号', sn: '主机SN', status: '主机状态' },
      searchData: '',
      searchParams: 'host_name',
      departmentId: '',
      selectBusinessId: null,
      assetIds: [],
      buttonDisabled: true,
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
    filterText(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    GetTree().then((res) => {
      if (res.success) {
        this.nodeList = res.data
      }
    })
    GetDepartment().then((res) => {
      if (res.success) {
        this.departments = res.data
      }
    })
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    handleClose() {
      this.assetIds = []
      this.selectBusinessId = null
      this.DialogVisible = false
      this.multipleSelection = []
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.buttonDisabled = this.multipleSelection.length < 1
    },
    handleNodeClick(item) {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (item['children'] === undefined || item['children'].length === 0) {
        params['department_id'] = item['id']
        this.departmentId = item['id']
        this.getData(params)
      } else {
        this.nodeData = []
      }
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage, department_id: this.departmentId }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    // 获取主机资产列表
    getData(params) {
      this.listLoading = true
      getServer(params).then((res) => {
        if (res.success) {
          this.nodeData = res.data
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
      })
    },
    migrateBusinesses(BusinessId) {
      this.selectBusinessId = BusinessId
      this.assetIds = []
      this.business = this.departments[this.departmentId]['business_group']
      for (const v of this.multipleSelection) {
        this.assetIds.push(v.host.host_id)
        this.selectBusinessId = v.under.business_id
      }
      this.DialogVisible = true
    },
    changeBusiness() {
      if (this.selectBusinessId === null) {
        this.$message.error('还没有选择要迁移的业务组')
      } else {
        putServerBusiness(
          { asset_ids: this.assetIds, department_id: this.departmentId, business_id: this.selectBusinessId }
        ).then((res) => {
          if (res.success) {
            this.$message.success('业务迁移操作完成')
            this.assetIds = []
            this.DialogVisible = false
            this.getData({ pre_page: this.PerPage, page: this.currentPage, department_id: this.departmentId })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      }
    },
    // 每页显示的条数
    handleSizeChange(val) {
      // 改变每页显示的条数
      this.PerPage = val
      // 注意：在改变每页显示的条数时，要将页码显示到第一页
      this.currentPage = 1
      // 点击每页显示的条数时，显示第一页
      this.getData({ pre_page: this.PerPage, page: this.currentPage, department_id: this.departmentId })
    },
    // 显示第几页
    handleCurrentChange(page) {
      // 切换页码时，要获取每页显示的条数
      this.currentPage = page
      const params = { pre_page: this.PerPage, page: this.currentPage, department_id: this.departmentId }
      if (this.searchData !== null && this.searchData !== '' && this.searchData !== undefined) {
        params[this.searchParams] = this.searchData
      }
      this.getData(params)
    }
  }
}
</script>

