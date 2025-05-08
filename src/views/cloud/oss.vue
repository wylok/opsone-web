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
            <el-table-column label="公有云" align="center" show-overflow-tooltip width="auto">
              <template slot-scope="scope">
                {{ scope.row['cloud']|CloudFormat }}
              </template>
            </el-table-column>
            <el-table-column label="bucket" align="center" show-overflow-tooltip width="auto">
              <template slot-scope="scope">
                {{ scope.row['bucket'] }}
              </template>
            </el-table-column>
            <el-table-column label="区域" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['Location'] }}
              </template>
            </el-table-column>
            <el-table-column label="存储类型" width="250px" align="center">
              <template slot-scope="scope">
                {{ scope.row['StorageClass'] }}
              </template>
            </el-table-column>
            <el-table-column label="存储大小" align="center" width="auto">
              <template slot-scope="scope">
                <span v-if="scope.row['Storage']/1000/1000/1000<1000">{{
                  scope.row['Storage'] / 1000 / 1000 / 1000|FixValue
                }}G</span>
                <span v-else>{{ scope.row['Storage'] / 1000 / 1000 / 1000 / 1000|FixValue }}T</span>
              </template>
            </el-table-column>
            <el-table-column label="存储数量" align="center" width="auto">
              <template slot-scope="scope">
                <span>{{ scope.row['ObjectCount'] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="el-icon-time" />
                <span>{{ scope.row['CreationDate']|DateFormat }}</span>
              </template>
            </el-table-column>
            <el-table-column label="同步时间" align="center" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="el-icon-time" />
                <span>{{ scope.row['sync_time']|DateFormat }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
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
                    @click.native.prevent=""
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
                    @click.native.prevent=""
                  />
                </el-tooltip>
              </el-button-group>
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
import { GetOss } from '@/api/cloud'
import { CloudFormat, DateFormat, getVersion, getYear } from '@/utils/filters'

export default {
  inject: ['reload'],
  filters: {
    DateFormat,
    CloudFormat,
    FixValue(v) {
      return v.toFixed(2)
    }
  },
  data() {
    return {
      list: null,
      listLoading: true,
      activeName: 'aliyun',
      multipleSelection: [],
      searchData: '',
      searchParams: 'bucket',
      prefixSearch: 'bucket搜索',
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
      await GetOss(params).then((res) => {
        if (res.success) {
          this.list = res.data
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
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
