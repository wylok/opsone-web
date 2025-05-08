<template>
  <div class="app-container">
    <div class="app-div-search" style="margin-bottom: 20px">
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
          <el-button round :disabled="buttonDisabled" @click="addVlanShow">创建Vlan</el-button>
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
          width="45"
        />
        <el-table-column label="交换机名称" align="center" width="130px" show-overflow-tooltip prop="switch_name">
          <template slot-scope="scope">
            <span v-if="scope.row['switch_name']==='none'">
              {{ scope.row['switch_name']|statusFilter }}
            </span>
            <span v-else>
              <span v-if="scope.row['ExtData']['mac_address']===undefined">
                {{ scope.row['switch_name'] }}
              </span>
              <span v-else>
                <el-badge :value="scope.row['ExtData']['mac_address']" class="item" type="primary">
                  {{ scope.row['switch_name'] }}
                </el-badge>
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="交换机ID" align="center" width="auto" show-overflow-tooltip prop="switch_id">
          <template slot-scope="scope">
            <span v-if="scope.row['switch_id']==='none'">
              {{ scope.row['switch_id']|statusFilter }}
            </span>
            <span v-else>
              {{ scope.row['switch_id'] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="交换机品牌" align="center" width="100px" prop="switch_brand">
          <template slot-scope="scope">
            <span v-if="scope.row['switch_brand']==='none'">
              {{ scope.row['switch_brand']|statusFilter }}
            </span>
            <span v-else>
              {{ scope.row['switch_brand'] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="交换机版本" align="center" width="120px" prop="switch_version" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row['switch_version']==='none'">
              {{ scope.row['switch_version']|statusFilter }}
            </span>
            <span v-else>
              {{ scope.row['switch_version'] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="交换机IP" align="center" width="auto" prop="switch_ip">
          <template slot-scope="scope">
            {{ scope.row['switch_ip'] }}
          </template>
        </el-table-column>
        <el-table-column label="Vlan数量" align="center" width="100px" prop="vlan_count">
          <template slot-scope="scope">
            <span v-if="scope.row['vlan_count']===0">
              {{ scope.row['vlan_count'] }}
            </span>
            <span v-else>
              <span v-if="scope.row['ExtData']['vlan']===undefined">
                <el-link type="primary" @click="switchVlanShow(scope.row['switch_name'],scope.row['switch_id'])">
                  {{ scope.row['vlan_count'] }}
                </el-link>
              </span>
              <span v-else>
                <el-badge :value="scope.row['ExtData']['vlan']" class="item" type="primary">
                  <el-link type="primary" @click="switchVlanShow(scope.row['switch_name'],scope.row['switch_id'])">
                    {{ scope.row['vlan_count'] }}
                  </el-link>
                </el-badge>
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="端口数量" align="center" width="100px" prop="port_count">
          <template slot-scope="scope">
            <span v-if="scope.row['port_count']===0">
              {{ scope.row['port_count'] }}
            </span>
            <span v-else>
              <span v-if="scope.row['ExtData']['port_name']===undefined">
                <router-link
                  :to="{ name:'switchPort', params: { switch_id: scope.row['switch_id'],switch_title:scope.row['switch_name'] } }"
                >
                  <el-link type="primary">{{ scope.row['port_count'] }}</el-link>
                </router-link>
              </span>
              <span v-else>
                <el-badge :value="scope.row['ExtData']['port_name']" class="item" type="primary">
                  <router-link
                    :to="{ name:'switchPort', params: { switch_id: scope.row['switch_id'],
                                                        switch_name:scope.row['switch_name'],
                                                        port_name: scope.row['ExtData']['port_name'],
                                                        mac_address:scope.row['ExtData']['mac_address'] } }"
                  >
                    <el-link type="primary">{{ scope.row['port_count'] }}</el-link>
                  </router-link>
                </el-badge>
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="级联交换机" align="center" width="100px" prop="switch_relation">
          <template slot-scope="scope">
            <el-button type="text" @click="querySwitchRelation(scope.row['switch_id'])">查看</el-button>
          </template>
        </el-table-column>
        <el-table-column label="所属IDC" width="auto" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.idc_id !== null">{{ scope.row['idc_cn'] }}</span>
            <span v-else>未知</span>
          </template>
        </el-table-column>
        <el-table-column label="在线状态" width="auto" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.status === 'online'" style="color: #0fbe8f"> {{ scope.row['status'] }} </span>
            <span v-else style="color: #2b2f3a"> {{ scope.row['status'] }} </span>
          </template>
        </el-table-column>
        <el-table-column label="WebShell" width="90px" align="center">
          <template slot-scope="scope">
            <router-link
              v-if="scope.row['switch_pool_id']!==0 && scope.row.status === 'online'"
              :to="{ name:'AssetWebShell', params: { asset_id: scope.row['switch_id'], asset_name: scope.row['switch_name'], asset_type: 'switch' }}"
            >
              <el-tag effect="plain" type="danger" style="margin-left: 1%">bash</el-tag>
            </router-link>
            <el-tag v-else effect="plain" type="info" style="margin-left: 1%">bash</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="sync_time" label="同步时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span> {{ scope.row['sync_time'] | DateFormat }} </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template slot-scope="scope">
            <el-button-group>
              <el-tooltip
                class="item"
                effect="light"
                content="变更名称"
                placement="top-end"
              >
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="changeNameShow(scope.row['switch_id'])"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="执行命令"
                placement="top-end"
              >
                <el-button
                  type="success"
                  icon="el-icon-position"
                  size="mini"
                  circle
                  disabled
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="删除"
                placement="top-end"
              >
                <el-button
                  v-if="scope.row['status']==='offline'"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  @click.native.prevent="delSwitch(scope.row['switch_id'],scope.row['switch_name'])"
                />
                <el-button
                  v-else
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  disabled
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
      <el-dialog
        :title="vlanTitle"
        :visible.sync="vlanVisible"
        width="35%"
      >
        <div>
          <el-row :gutter="12">
            <el-col v-for="v in switch_vlan" :key="v" :label="v" :value="v" :span="2">
              <el-tag size="medium" effect="plain" style="margin-bottom: 100%">{{ v }}</el-tag>
            </el-col>
          </el-row>
        </div>
      </el-dialog>
      <el-dialog
        title="创建Vlan"
        :visible.sync="addVlanVisible"
        width="30%"
        :before-close="addVlanClose"
      >
        <el-input v-model="addVlanForm.vlan" type="textarea" :rows="2" placeholder="请输入vlan,多个vlan以逗号分割" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="addVlanClose">取 消</el-button>
          <el-button v-if="addVlanForm.vlan!==null" type="primary" @click="addVlanSubmit">确 定</el-button>
          <el-button v-else disable>确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="修改交换机名称"
        :visible.sync="changeNameVisible"
        width="30%"
        :before-close="changeNameClose"
      >
        <el-input v-model="changeNameForm.name" type="input" :rows="1" placeholder="请输入新交换机名称" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="changeNameClose">取 消</el-button>
          <el-button v-if="changeNameForm.name!==null" type="primary" @click="changeNameSubmit">确 定</el-button>
          <el-button v-else disable>确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="执行命令"
        :visible.sync="switchOperateVisible"
        width="30%"
        :before-close="switchOperateClose"
      >
        <el-input v-model="switchOperateForm.command" type="textarea" :rows="2" placeholder="请输入命令,多个命令以分号分割" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="switchOperateClose">取消</el-button>
          <el-button v-if="switchOperateForm.command!==null" type="primary" @click="switchOperateSubmit">确定</el-button>
          <el-button v-else disable>确定</el-button>
        </span>
      </el-dialog>
      <el-drawer
        :show-close="false"
        :visible.sync="drawer"
        :before-close="handleClose"
        :title="drawerTitle"
      >
        <template>
          <el-table
            :data="switchRelation"
            height="100%"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column align="center" label="级联交换机ID" width="auto">
              <template slot-scope="scope">
                <router-link :to="{ name:'SwitchSearch',params: {switch_id: scope.row['neighbor_id']} }">
                  <el-link type="primary">{{ scope.row['neighbor_id'] }}</el-link>
                </router-link>
              </template>
            </el-table-column>
            <el-table-column align="center" label="级联交换机名称" width="auto">
              <template slot-scope="scope">
                <router-link :to="{ name:'SwitchSearch',params: {switch_id: scope.row['neighbor_id']} }">
                  <el-link type="primary">{{ scope.row['neighbor_name'] }}</el-link>
                </router-link>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-drawer>
    </div>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>

import {
  addSwitchVlan,
  changeSwitchName,
  deleteSwitch,
  getIdc,
  getSwitches,
  getSwitchRelation,
  getSwitchVlan,
  switchOperate
} from '@/api/cmdb'
import { actionFilter, DateFormat, getVersion, getYear, statusFilter } from '@/utils/filters'

export default {
  inject: ['reload'],
  filters: {
    actionFilter,
    DateFormat,
    statusFilter
  },
  data() {
    return {
      list: [],
      switch_vlan: [],
      listLoading: null,
      prefixSearch: '搜索交换机名称',
      labels: { switch_name: '交换机名称', switch_ip: '交换机IP', switch_id: '交换机ID', host_mac: '服务器mac' },
      searchData: null,
      searchParams: 'switch_name',
      vlanVisible: false,
      vlanTitle: null,
      drawer: false,
      drawerTitle: null,
      buttonDisabled: true,
      addVlanForm: {
        switch_ips: [],
        vlan: null
      },
      changeNameForm: {
        switch_id: null,
        name: null
      },
      switchOperateForm: {
        switch_id: null,
        command: null
      },
      switchRelation: null,
      addVlanVisible: false,
      changeNameVisible: false,
      switchOperateVisible: false,
      year: getYear(),
      version: getVersion(),
      idcNames: {},
      // 默认显示第几页
      currentPage: 1,
      // 总条数，根据接口获取数据长度(注意：这里不能为空)
      totalCount: 0,
      // 个数选择器（可修改）
      pageSizes: [10, 20, 30, 50],
      // 默认每页显示的条数（可修改）
      PerPage: 10,
      params: { 'pre_page': this.PerPage, 'page': this.currentPage }
    }
  },
  watch: {
    searchParams(val) {
      this.prefixSearch = '搜索' + this.labels[val]
    }
  },
  created() {
    this.searchData = null
    this.params = { pre_page: this.PerPage, page: this.currentPage }
    if (this.$route.params['switch_name'] !== undefined) {
      this.params['switch_name'] = this.$route.params['switch_name']
      this.searchParams = 'switch_name'
      this.searchData = this.$route.params['switch_name']
    }
    getIdc({ pre_page: 100, page: 1 }).then((res) => {
      if (res.success) {
        if (res.data !== null) {
          for (const v of res.data) {
            this.idcNames[v['idc_id']] = v['idc_cn']
          }
        }
      }
    })
    this.getData(this.params)
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.buttonDisabled = this.multipleSelection.length <= 1
      this.buttonDisabled = false
      // 其它方法可以处理已选择的行数据
    },
    onSearch() {
      if (this.searchParams !== '' && this.searchData !== null) {
        this.params[this.searchParams] = this.searchData
      }
      if (this.searchData === undefined || this.searchData === '') {
        this.searchData = null
      }
      this.currentPage = 1
      this.getData(this.params)
    },
    // 获取列表数据
    getData(params) {
      this.listLoading = true
      getSwitches(params).then((res) => {
        if (res.success) {
          this.list = []
          if (res.data !== null) {
            for (const v of res.data) {
              v['idc_cn'] = this.idcNames[v['idc_id']]
              this.list.push(v)
            }
            this.totalCount = res.pages.totalCount
          }
        }
        this.listLoading = false
      })
    },
    switchVlanShow(title, switch_id) {
      this.switch_vlan = []
      this.vlanTitle = title + ' | vlan信息'
      getSwitchVlan({ switch_id: switch_id }).then((res) => {
        if (res.success) {
          for (const v of res.data) {
            this.switch_vlan.push(v['switch_vlan'])
          }
          this.listLoading = false
        }
      })
      this.vlanVisible = true
    },
    addVlanShow() {
      if (this.multipleSelection.length >= 1) {
        this.addVlanForm.switch_ips = []
        this.addVlanForm.vlan = null
        for (const v of this.multipleSelection) {
          this.addVlanForm.switch_ips.push(v['switch_ip'])
        }
        this.addVlanVisible = true
      }
    },
    addVlanSubmit() {
      addSwitchVlan(this.addVlanForm).then((res) => {
        if (res.success) {
          this.$message.success('Vlan创建完成')
          this.addVlanClose()
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    addVlanClose(done) {
      this.addVlanForm.switch_ips = []
      this.addVlanForm.vlan = null
      this.addVlanVisible = false
      done()
    },
    changeNameShow(switch_id) {
      this.changeNameForm.switch_id = switch_id
      this.changeNameForm.name = null
      this.changeNameVisible = true
    },
    changeNameClose(done) {
      this.changeNameForm.switch_id = null
      this.changeNameForm.name = null
      this.changeNameVisible = false
      done()
    },
    changeNameSubmit() {
      changeSwitchName(this.changeNameForm).then((res) => {
        if (res.success) {
          this.$message.success('名称变更完成')
          this.changeNameClose()
          this.getData(this.params)
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    switchOperateShow(switch_id) {
      this.switchOperateForm.switch_id = switch_id
      this.switchOperateForm.command = null
      this.switchOperateVisible = true
    },
    switchOperateClose(done) {
      this.switchOperateForm.switch_id = null
      this.switchOperateForm.command = null
      this.switchOperateVisible = false
      done()
    },
    switchOperateSubmit() {
      switchOperate(this.switchOperateForm).then((res) => {
        if (res.success) {
          this.$message.success('命令执行完成')
          this.switchOperateClose()
          this.getData(this.params)
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    delSwitch(switchId, name) {
      this.$confirm('此操作将删除交换机信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSwitch({ switch_id: switchId, name: name }).then((res) => {
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
    querySwitchRelation(switchId) {
      this.switchRelation = null
      this.drawerTitle = null
      getSwitchRelation({ switch_id: switchId }).then((res) => {
        if (res.success) {
          this.switchRelation = res.data
          this.drawerTitle = res.data[0]['switch_name']
        }
      })
      this.drawer = true
    },
    handleClose() {
      this.drawer = false
    },
    // 每页显示的条数
    handleSizeChange(val) {
      // 改变每页显示的条数
      this.PerPage = val
      this.params.pre_page = val
      // 注意：在改变每页显示的条数时，要将页码显示到第一页
      this.params.page = 1
      this.currentPage = 1
      // 点击每页显示的条数时，显示第一页
      this.getData(this.params)
    },
    // 显示第几页
    handleCurrentChange(page) {
      // 切换页码时，要获取每页显示的条数
      this.currentPage = page
      this.params.page = page
      this.getData(this.params)
      if (this.searchData !== null && this.searchData !== '' && this.searchData !== undefined) {
        this.params[this.searchParams] = this.searchData
      }
      this.getData(this.params)
    }
  }
}
</script>
<style>
.item {
  margin-top: 10px;
  margin-right: 10px;
}
</style>
