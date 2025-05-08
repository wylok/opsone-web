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
          <el-button round @click="keyVisible=true">新增云密钥</el-button>
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
            <el-table-column label="公有云" align="center" width="auto">
              <template slot-scope="scope">
                {{ scope.row['cloud']|CloudFormat }}
              </template>
            </el-table-column>
            <el-table-column label="key_id" width="auto" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['key_id'] }}
              </template>
            </el-table-column>
            <el-table-column label="key_secret" width="auto" align="center">
              <template>
                <span style="font-weight: bolder;font-size: larger">*****************</span>
              </template>
            </el-table-column>
            <el-table-column label="key_type" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['key_type'] }}
              </template>
            </el-table-column>
            <el-table-column label="end_point" width="auto" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['end_point'] }}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="el-icon-time" />
                <span>{{ scope.row['create_time']|DateFormat }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template slot-scope="scope">
                <el-button-group>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="同步"
                    placement="top-end"
                  >
                    <el-button
                      type="primary"
                      icon="el-icon-refresh"
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
                      @click.native.prevent="delKey(scope.row['key_id'])"
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
      <div style="text-align: center;margin-top: 1%;font-size: smaller;color: dodgerblue">提示: 目前仅支持阿里云、火山云、百度云,其它公有云还在陆续开发中......</div>
    </div>
    <el-dialog
      title="新增云密钥"
      :visible.sync="keyVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div style="margin-bottom: 20px">
        <el-form label-position="right" label-width="120px" :model="keyForm">
          <el-form-item label="公有云:" required>
            <el-select v-model="keyForm.cloud" placeholder="请选择" style="width: 75%">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="密钥ID:" required>
            <el-input v-model="keyForm.key_id" class="user_input" style="width: 75%" />
          </el-form-item>
          <el-form-item label="密钥串:" required>
            <el-input v-model="keyForm.key_secret" class="user_input" style="width: 75%" />
          </el-form-item>
          <el-form-item label="密钥类型:" required>
            <el-select v-model="keyForm.key_type" placeholder="请选择" style="width: 75%">
              <el-option
                v-for="item in keyTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="ENDPOINT:" required>
            <el-input v-model="keyForm.end_point" class="user_input" style="width: 75%" placeholder="示例:ecs.cn-beijing.aliyuncs.com" />
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleClose">取 消</el-button>
        <el-button @click="addKey">确 定</el-button>
      </span>
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DeleteKey, GetKey, PostKey } from '@/api/cloud'
import { CloudFormat, DateFormat, getVersion, getYear } from '@/utils/filters'

export default {
  inject: ['reload'],
  filters: {
    DateFormat,
    CloudFormat
  },
  data() {
    return {
      list: null,
      listLoading: true,
      keyVisible: false,
      activeName: 'aliyun',
      searchData: '',
      searchParams: 'key_id',
      prefixSearch: 'key_id搜索',
      keyForm: {
        cloud: null,
        key_id: null,
        key_secret: null,
        key_type: null,
        end_point: null
      },
      options: [{
        value: 'aliyun',
        label: '阿里云'
      }, {
        value: 'tencent',
        label: '腾讯云'
      }, {
        value: 'huawei',
        label: '华为云'
      }, {
        value: 'volcengine',
        label: '火山云'
      }, {
        value: 'baidu',
        label: '百度云'
      }
      ],
      clouds: { 'aliyun': '阿里云', 'tencent': '腾讯云', 'huawei': '华为云', 'volcengine': '火山云', 'baidu': '百度云' },
      keyTypes: [{
        value: 'ecs-aliyun',
        label: '阿里云主机'
      }, {
        value: 'bcc-baidu',
        label: '百度云主机'
      }, {
        value: 'ecs-volcengine',
        label: '火山云主机'
      }, {
        value: 'oss-aliyun',
        label: '阿里云对象存储'
      }, {
        value: 'bos-baidu',
        label: '百度云对象存储'
      }, {
        value: 'tos-volcengine',
        label: '火山云对象存储'
      }
      ],
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
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage, cloud: this.activeName }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    handleClose() {
      this.keyVisible = false
    },
    async getData(params) {
      this.listLoading = true
      await GetKey(params).then((res) => {
        if (res.success) {
          this.list = res.data
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
      })
    },
    addKey() {
      PostKey(this.keyForm).then((res) => {
        if (res.success) {
          this.keyVisible = false
          this.onSearch()
        } else {
          this.$message.error(res.message)
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    delKey(keyId) {
      this.$confirm('此操作将永久删除该密钥, 是否继续?', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        DeleteKey({ key_id: keyId }).then((res) => {
          if (res.success) {
            this.onSearch()
          } else {
            this.$message.error(res.message)
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
