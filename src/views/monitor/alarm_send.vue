<template>
  <div class="app-container">
    <div class="app-div-search" style="margin-bottom: 20px">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-input
            v-model="searchData"
            minlength="1"
            :placeholder="prefixSearch"
            class="input-with-select"
          >
            <el-select slot="prepend" v-model="searchParams" placeholder="请选择">
              <el-option v-for="(k,v) in labels" :key="k" :label="k" :value="v" />
            </el-select>
            <el-button slot="append" icon="el-icon-search" @click="onSearch" />
          </el-input>
        </el-col>
        <el-col :span="8"><br></el-col>
        <el-col :span="8" style="text-align: right">
          <el-button
            round
            type="danger"
            :disabled="buttonDisabled"
            plain
            small
            @click.native="deleteSend(SelectIds)"
          >
            删除报警通知
          </el-button>
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
          width="55"
        />
        <el-table-column label="主机名称" align="center" show-overflow-tooltip width="auto">
          <template slot-scope="scope">
            <router-link
              :to="{ name:'hostDetail', params: { host_id: scope.row['host_id'] } }"
            >
              <el-link type="primary">{{ scope.row.host_name }}</el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="规则名称" width="auto" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <router-link
              :to="{ name:'search_rule_id', params: {type:'rule_ids', id: scope.row['rule_id'] } }"
            >
              <el-link>{{ scope.row.rule_name }}</el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="通知内容" align="center" width="650px" show-overflow-tooltip>
          <template slot-scope="scope">
            <span style="text-align: left" v-html="scope.row['content']" />
          </template>
        </el-table-column>
        <el-table-column label="通知渠道" align="center" width="100px">
          <template slot-scope="scope">
            <span>{{ scope.row['channel'] }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="start_time" label="通知时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span> {{ scope.row['send_time'] | DateFormat }} </span>
          </template>
        </el-table-column>
        <el-table-column label="送达结果" align="center" width="80px">
          <template slot-scope="scope">
            {{ scope.row['result'] | statusFilter }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="80px">
          <template slot-scope="scope">
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
                @click.native.prevent="deleteSend([scope.row['id']])"
              />
            </el-tooltip>
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
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { AlarmSend, deleteAlarmSend } from '@/api/monitor'
import { DateFormat, getVersion, getYear, statusFilter } from '@/utils/filters'

export default {
  inject: ['reload'],
  filters: {
    DateFormat,
    statusFilter
  },
  data() {
    return {
      list: null,
      content: '',
      searchData: '',
      searchParams: 'rule_id',
      prefixSearch: '搜索规则ID',
      listLoading: true,
      buttonDisabled: true,
      deleteButton: false,
      SelectIds: [],
      labels: { rule_id: '规则ID', host_id: '主机ID', channel: '通知渠道' },
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
    searchParams(val) {
      this.prefixSearch = '搜索' + this.labels[val]
    }
  },
  created() {
    const params = { pre_page: this.PerPage, page: this.currentPage }
    if (this.$route.params['type'] !== undefined && this.$route.params['id'] !== undefined) {
      params[this.$route.params['type']] = this.$route.params['id']
    }
    this.getData(params)
  },
  methods: {
    handleSelectionChange(val) {
      this.buttonDisabled = val.length <= 0
      if (val.length > 0) {
        val.forEach((v, index) => {
          this.SelectIds.push(v['id'])
        })
      }
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    async getData(params) {
      this.listLoading = true
      await AlarmSend(params).then((res) => {
        if (res.success) {
          this.list = res.data
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
      })
    },
    deleteSend(ids) {
      this.$confirm('此操作将删除报警通知, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAlarmSend({ ids: ids }).then((res) => {
          if (res.success) {
            this.$message.success('删除报警通知成功')
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
      // 点击每页显示的条数时，显示第一页
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
