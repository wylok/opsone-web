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
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="消息标题" width="auto" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row['title'] }}
          </template>
        </el-table-column>
        <el-table-column label="消息级别" align="center" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row['level'] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="消息状态" width="auto" align="center">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row['status'] | statusFilter"
            >{{ scope.row['status'] | MsgStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="消息内容" align="center" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-popover
              placement="bottom"
              title=""
              width="300"
              trigger="click"
            >
              <el-link
                slot="reference"
                icon="el-icon-postcard"
                type="primary"
                @click="msgDetail(scope.row['msg_id'])"
              >查看详情
              </el-link>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="created_time" label="创建时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span> {{ scope.row['create_time'] | DateFormat }} </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template slot-scope="scope">
            <el-button-group>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                plain
                @click.native.prevent="deleteMsg(scope.row['msg_id'])"
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
      title="消息详情"
      :visible.sync="dialogVisible"
      width="65%"
      :before-close="handleClose"
    >
      <el-table
        :data="msg_detail"
        style="width: 100%"
      >
        <el-table-column prop="host_name" label="主机名称" width="auto">
          <template slot-scope="scope">
            {{ scope.row.host_name }}
          </template>
        </el-table-column>
        <el-table-column prop="cpu" label="CPU" width="80">
          <template slot-scope="scope">
            {{ scope.row['cpu'] }}
          </template>
        </el-table-column>
        <el-table-column prop="disk" label="磁盘" width="120">
          <template slot-scope="scope">
            {{ scope.row['disk'] / 1024 / 1024 / 1024| Round }}G
          </template>
        </el-table-column>
        <el-table-column prop="memory" label="内存" width="120">
          <template slot-scope="scope">
            {{ scope.row['memory'] / 1024 / 1024 / 1024| Round }}G
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="生产厂家" width="auto">
          <template slot-scope="scope">
            {{ scope.row['product_name'] }}
          </template>
        </el-table-column>
        <el-table-column prop="platform" label="操作系统" width="auto">
          <template slot-scope="scope">
            {{ scope.row['platform'] }}
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="主机IP" width="auto">
          <template slot-scope="scope">
            {{ scope.row['ip'] }}
          </template>
        </el-table-column>
        <el-table-column prop="time" label="上报日期" width="auto">
          <template slot-scope="scope">
            {{ scope.row['time'] }}
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer" />
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DeleteMsg, getMsgDetail, getMsgList } from '@/api/msg'
import { DateFormat, getVersion, getYear, MsgStatus, Round } from '@/utils/filters'

export default {
  inject: ['reload'],
  filters: {
    statusFilter(status) {
      const statusMap = {
        Read: 'info',
        Unread: 'success'
      }
      return statusMap[status]
    },
    Round,
    DateFormat,
    MsgStatus
  },
  data() {
    return {
      list: null,
      msg_detail: null,
      listLoading: true,
      searchData: '',
      searchParams: 'title',
      prefixSearch: '消息标题',
      dialogVisible: false,
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
    if (this.$route.params['status'] !== undefined) {
      params['status'] = this.$route.params['status']
    }
    this.getData(params)
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
      // 其它方法可以处理已选择的行数据
      console.log(this.multipleSelection)
    },
    getData(params) {
      this.listLoading = true
      getMsgList(params).then((res) => {
        if (res.success) {
          this.list = res.data
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
      })
    },
    handleClose() {
      this.dialogVisible = false
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    msgDetail(msg_id) {
      getMsgDetail({ msg_id: msg_id }).then((res) => {
        if (res.success) {
          this.msg_detail = res.data
          this.dialogVisible = true
        }
      })
    },
    deleteMsg(msgId) {
      this.$confirm('此操作将永久删除平台日志, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        DeleteMsg({ msg_ids: [msgId] }).then((res) => {
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
