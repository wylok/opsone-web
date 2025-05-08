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
          <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="app-div">
      <el-tabs v-model="activeName" type="border-card" @tab-click="getData({ cloud: activeName })">
        <el-tab-pane v-for="(k,v) in clouds" :key="k" :label="k" :name="v">
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
            <el-table-column label="实例ID" align="center" show-overflow-tooltip width="auto">
              <template slot-scope="scope">
                {{ scope.row['instance_id'] }}
              </template>
            </el-table-column>
            <el-table-column label="实例类型" width="80px" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['instance_type'] }}
              </template>
            </el-table-column>
            <el-table-column label="主机名称" align="center" width="100px" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{ scope.row['host_name'] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="区域ID" align="center" width="100px">
              <template slot-scope="scope">
                <span>{{ scope.row['region_id'] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="可用区" align="center" width="100px">
              <template slot-scope="scope">
                <span>{{ scope.row['zone_id'] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="cpu" align="center" width="60px">
              <template slot-scope="scope">
                <span>{{ scope.row['cpu'] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="内存" align="center" width="60px">
              <template slot-scope="scope">
                <span>{{ scope.row['memory'] / 1000|intFilter }}G</span>
              </template>
            </el-table-column>
            <el-table-column label="内网IP" align="center" width="120px" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{ scope.row['InnerIpAddress'] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="公网IP" align="center" width="120px" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{ scope.row['PublicIpAddress'] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="主机状态" align="center" width="80px">
              <template slot-scope="scope">
                <el-tag :type="scope.row['status'] | statsFilter">{{ scope.row['status']|statusFilter }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="el-icon-time" />
                <span>{{ scope.row['CreationDate']|DateFormat }}</span>
              </template>
            </el-table-column>
            <el-table-column label="过期时间" align="center" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="el-icon-time" />
                <span>{{ scope.row['ExpiredTime']|DateFormat }}</span>
              </template>
            </el-table-column>
            <el-table-column label="密钥ID" align="center" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{ scope.row['key_id'] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="140px">
              <template slot-scope="scope">
                <el-button-group>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="启动"
                    placement="top-end"
                  >
                    <el-button
                      v-if="scope.row['status']==='Stopped'"
                      type="success"
                      icon="el-icon-video-play"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="operateServer({'instance_id':scope.row['instance_id'],'key_id':scope.row['key_id'],'operate':'start'})"
                    />
                    <el-button
                      v-else
                      type="success"
                      icon="el-icon-video-play"
                      size="mini"
                      circle
                      plain
                      disabled
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="停止"
                    placement="top-end"
                  >
                    <el-button
                      v-if="scope.row['status']==='Running'"
                      type="primary"
                      icon="el-icon-video-pause"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="operateServer({'instance_id':scope.row['instance_id'],'key_id':scope.row['key_id'],'operate':'stop'})"
                    />
                    <el-button
                      v-else
                      type="primary"
                      icon="el-icon-video-pause"
                      size="mini"
                      circle
                      plain
                      disabled
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="重启"
                    placement="top-end"
                  >
                    <el-button
                      type="warning"
                      icon="el-icon-refresh"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="operateServer({'instance_id':scope.row['instance_id'],'key_id':scope.row['key_id'],'operate':'reboot'})"
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
                      @click.native.prevent="operateServer({'instance_id':scope.row['instance_id'],'key_id':scope.row['key_id'],'operate':'delete'})"
                    />
                  </el-tooltip>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
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
import { getCloudServer, operateCloudServer } from '@/api/cloud'
import { DateFormat, getVersion, getYear, statusFilter } from '@/utils/filters'

export default {
  inject: ['reload'],
  filters: {
    DateFormat,
    statusFilter,
    statsFilter(status) {
      const statusMap = {
        Running: 'success',
        RUNNING: 'success',
        STOPPED: 'danger',
        Stopped: 'danger'
      }
      return statusMap[status]
    },
    intFilter(i) {
      return parseInt(i)
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      multipleSelection: [],
      searchData: '',
      searchParams: 'instance_name',
      prefixSearch: '实例名称',
      activeName: 'aliyun',
      clouds: { 'aliyun': '阿里云', 'tencent': '腾讯云', 'huawei': '华为云', 'volcengine': '火山云', 'baidu': '百度云' },
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
    this.getData({ pre_page: this.PerPage, page: this.currentPage, cloud: this.activeName })
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
      // 其它方法可以处理已选择的行数据
      console.log(this.multipleSelection)
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage, cloud: this.activeName }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    async getData(params) {
      this.listLoading = true
      await getCloudServer(params).then((res) => {
        if (res.success) {
          this.list = res.data
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
      })
    },
    operateServer(params) {
      const operate = { 'start': '启动', 'stop': '停止', 'reboot': '重启', 'delete': '删除' }
      this.$confirm('此操作将' + operate[params['operate']] + '实列, 是否继续?', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        operateCloudServer(params).then((res) => {
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
    // 每页显示的条数
    handleSizeChange(val) {
      // 改变每页显示的条数
      this.PerPage = val
      // 注意：在改变每页显示的条数时，要将页码显示到第一页
      this.currentPage = 1
      this.getData({ pre_page: this.PerPage, page: this.currentPage, cloud: this.activeName })
    },
    // 显示第几页
    handleCurrentChange(page) {
      // 切换页码时，要获取每页显示的条数
      this.currentPage = page
      const params = { pre_page: this.PerPage, page: this.currentPage, cloud: this.activeName }
      if (this.searchData !== null && this.searchData !== '' && this.searchData !== undefined) {
        params[this.searchParams] = this.searchData
      }
      this.getData(params)
    }
  }
}
</script>
