<template>
  <div class="app-container">
    <div class="app-div-search" style="margin-bottom: 15px">
      <router-link
        :to="{ name:'switch' }"
      >
        <el-link type="primary">返回</el-link>
        <span> | {{ switch_name }}</span>
      </router-link>
    </div>
    <div class="app-div-search" style="margin-bottom: 15px">
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
        <el-table-column
          type="selection"
          align="center"
          width="45"
        />
        <el-table-column label="端口名称" align="center" width="auto" prop="port_name">
          <template slot-scope="scope">
            {{ scope.row['port_name'] }}
          </template>
        </el-table-column>
        <el-table-column label="端口类型" align="center" width="auto" prop="port_type">
          <template slot-scope="scope">
            {{ scope.row['port_type'] }}
          </template>
        </el-table-column>
        <el-table-column label="端口状态" align="center" width="auto" prop="port_stat">
          <template slot-scope="scope">
            <span v-if="scope.row['port_stat']==='UP'">
              <el-tag type="success">{{ scope.row['port_stat'] }}</el-tag>
            </span>
            <span v-else>
              <el-tag type="info">{{ scope.row['port_stat'] }}</el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="所属Vlan" align="center" width="auto" prop="switch_vlan">
          <template slot-scope="scope">
            {{ scope.row['switch_vlan'] }}
          </template>
        </el-table-column>
        <el-table-column label="主机mac" align="center" width="auto" prop="mac_address">
          <template slot-scope="scope">
            <span v-if="scope.row['mac_address']==='none'">
              {{ scope.row['mac_address']|statusFilter }}
            </span>
            <span v-else>
              {{ scope.row['mac_address'] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="last_time" label="同步时间" width="auto">
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span> {{ scope.row['last_time'] | DateFormat }} </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template slot-scope="scope">
            <el-button-group>
              <el-tooltip
                v-if="scope.row['port_stat']==='UP' && scope.row['port_type']==='Access'"
                class="item"
                effect="light"
                content="关闭端口"
                placement="top-end"
              >
                <el-button
                  type="danger"
                  icon="el-icon-circle-close"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="portOperate(scope.row['port_name'],'DOWN')"
                />
              </el-tooltip>
              <el-tooltip
                v-else
                class="item"
                effect="light"
                content="启动端口"
                placement="top-end"
              >
                <el-button
                  v-if="scope.row['port_stat']==='DOWN' && scope.row['port_type']==='Access'"
                  type="success"
                  icon="el-icon-circle-check"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="portOperate(scope.row['port_name'],'UP')"
                />
                <el-button
                  v-else
                  type="danger"
                  icon="el-icon-circle-close"
                  size="mini"
                  circle
                  plain
                  disabled
                />
              </el-tooltip>
              <el-tooltip
                v-if="scope.row['port_type']==='Access'"
                class="item"
                effect="light"
                content="变更VLAN"
                placement="top-end"
              >
                <el-button
                  type="primary"
                  icon="el-icon-link"
                  size="mini"
                  circle
                  @click.native.prevent="changeVlanShow(scope.row['port_name'],scope.row['switch_vlan'])"
                />
              </el-tooltip>
              <el-tooltip
                v-else
                class="item"
                effect="light"
                content="变更VLAN"
                placement="top-end"
              >
                <el-button
                  type="primary"
                  icon="el-icon-link"
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
        title="变更Vlan"
        :visible.sync="changeVlanVisible"
        width="30%"
        :before-close="changeVlanClose"
      >
        端口名称:
        <el-input :value="changeVlanForm.port_name" type="input" :rows="1" disabled style="margin-bottom: 3%" />
        当前Vlan:
        <el-input :value="changeVlanForm.old_vlan" type="input" :rows="1" disabled style="margin-bottom: 3%" />
        输入新vlan:
        <el-input v-model="changeVlanForm.new_vlan" type="input" :rows="1" style="margin-bottom: 3%" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="changeVlanClose">取 消</el-button>
          <el-button v-if="changeVlanForm.new_vlan!==null" type="primary" @click="changeVlanSubmit">确 定</el-button>
          <el-button v-else disable>确 定</el-button>
        </span>
      </el-dialog>
    </div>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { changeSwitchPortVlan, getSwitchPort, SwitchPortVlanOperate } from '@/api/cmdb'
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
      switch_name: null,
      prefixSearch: '搜索端口名称',
      labels: { port_name: '端口名称', mac_address: '主机mac' },
      searchData: null,
      searchParams: 'port_name',
      list: null,
      listLoading: null,
      changeVlanForm: {
        switch_id: null,
        port_name: null,
        old_vlan: null,
        new_vlan: null
      },
      changeVlanVisible: false,
      year: getYear(),
      version: getVersion(),
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
    this.params = { pre_page: this.PerPage, page: this.currentPage }
    this.params['switch_id'] = this.$route.params['switch_id']
    this.changeVlanForm.switch_id = this.$route.params['switch_id']
    if (this.$route.params['switch_name'] !== undefined) {
      this.switch_name = this.$route.params['switch_name']
    }
    if (this.$route.params['port_name'] !== undefined) {
      this.params['port_name'] = this.$route.params['port_name']
    }
    if (this.$route.params['mac_address'] !== undefined) {
      this.searchParams = 'mac_address'
      this.searchData = this.$route.params['mac_address']
      this.params['mac_address'] = this.$route.params['mac_address']
    }
    this.getData(this.params)
  },
  methods: {
    // 获取列表数据
    getData(params) {
      this.listLoading = true
      getSwitchPort(params).then((res) => {
        if (res.success) {
          this.list = res.data
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
      })
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
    changeVlanShow(port_name, old_vlan) {
      this.changeVlanForm.old_vlan = old_vlan
      this.changeVlanForm.port_name = port_name
      this.changeVlanForm.new_vlan = null
      this.changeVlanVisible = true
    },
    changeVlanSubmit() {
      changeSwitchPortVlan(this.changeVlanForm).then((res) => {
        if (res.success) {
          this.$message.success('Vlan变更完成')
          this.changeVlanClose()
          this.getData(this.params)
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    changeVlanClose(done) {
      this.changeVlanForm.old_vlan = null
      this.changeVlanForm.port_name = null
      this.changeVlanForm.new_vlan = null
      this.changeVlanVisible = false
      done()
    },
    portOperate(port_name, operate) {
      let action = '开启'
      if (operate === 'DOWN') {
        action = '关闭'
      }
      this.$confirm('此操作将' + action + '交换机端口, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        SwitchPortVlanOperate({
          switch_id: this.params['switch_id'],
          port_name: port_name, operate: operate
        }).then((res) => {
          if (res.success) {
            this.$message.success('端口操作完成')
            this.getData(this.params)
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
      this.params.page = 1
      this.params.pre_page = val
      // 点击每页显示的条数时，显示第一页
      this.getData(this.params)
    },
    // 显示第几页
    handleCurrentChange(page) {
      // 切换页码时，要获取每页显示的条数
      this.currentPage = page
      this.params.page = page
      this.getData(this.params)
    }
  }
}
</script>
