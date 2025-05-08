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
          <el-button round @click="uploadVisible=true">上传密钥</el-button>
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
          <el-table-column label="密钥名称" align="center" width="200px">
            <template slot-scope="scope">
              {{ scope.row['key_name'] }}
            </template>
          </el-table-column>
          <el-table-column label="SSH用户" width="auto" align="center">
            <template slot-scope="scope">
              {{ scope.row['ssh_user'] }}
            </template>
          </el-table-column>
          <el-table-column label="SSH密钥" width="auto" show-overflow-tooltip align="center">
            <template slot-scope="scope">
              {{ scope.row['ssh_key'] }}
            </template>
          </el-table-column>
          <el-table-column label="上传时间" align="center" width="auto">
            <template slot-scope="scope">
              <i class="el-icon-time" />
              {{ scope.row['create_time'] | DateFormat }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="170px">
            <template slot-scope="scope">
              <el-button-group>
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
                    @click.native.prevent="delSshKey(scope.row['key_name'])"
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
      title="上传密钥"
      :before-close="handleClose"
      :visible.sync="uploadVisible"
      width="45%"
    >
      <div style="margin-bottom:3%">
        <div style="margin-left:8%;width: 85%;margin-bottom: 1%">
          <el-input v-model="KeyName" placeholder="请输入SSH私钥名称(必填)" />
          <el-input
            v-model="KeyConfig"
            type="textarea"
            :rows="10"
            placeholder="请将SSH私钥内容复制粘贴到此处(必填)"
            style="margin-top: 5px"
          />
        </div>
      </div>
      <el-row :gutter="24">
        <el-col :span="12" :push="9">
          <el-button
            v-if="KeyName===null || KeyConfig===null"
            type="primary"
            disabled
          >
            提交
          </el-button>
          <el-button
            v-else
            type="primary"
            @click="submitUpload(KeyName, KeyConfig)"
          >
            提交
          </el-button>
          <el-button @click="handleClose">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DateFormat, getVersion, getYear } from '@/utils/filters'
import { deleteSshKey, getSshKey, uploadSshKey } from '@/api/cmdb'
export default {
  inject: ['reload'],
  filters: {
    DateFormat
  },
  data() {
    return {
      upload_sshKey_url: null,
      list: null,
      inputDisable: true,
      listLoading: true,
      fileList: [],
      multipleSelection: [],
      buttonDisabled: true,
      uploadVisible: false,
      searchData: '',
      KeyName: null,
      KeyConfig: null,
      prefixSearch: '密钥名称搜索',
      purpose: 'key_name',
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
    if (this.$route.params['key_name'] !== undefined) {
      params['key_name'] = this.$route.params['key_name']
    }
    this.getData(params)
  },
  methods: {
    submitUpload(KeyName, KeyConfig) {
      uploadSshKey({ key_name: KeyName, key_config: KeyConfig }).then((res) => {
        if (res.success) {
          this.$message({
            type: 'success',
            message: 'ssh私钥上传完成'
          })
          this.uploadVisible = false
          this.KeyName = null
          this.KeyConfig = null
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    handleClose() {
      this.KeyName = null
      this.KeyConfig = null
      this.uploadVisible = false
      this.onSearch()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.buttonDisabled = this.multipleSelection.length <= 1
      // 其它方法可以处理已选择的行数据
      console.log(this.multipleSelection)
    },
    getData(params) {
      this.listLoading = true
      getSshKey(params).then((res) => {
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
    delSshKey(keyName) {
      this.$confirm('此操作将永久删除SSH密钥, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSshKey({ key_name: keyName }).then((res) => {
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
