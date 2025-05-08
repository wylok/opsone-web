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
          <el-button round @click="uploadVisible=true">上传脚本</el-button>
          <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="app-div">
      <el-tabs v-model="purpose" type="border-card" @tab-click="onSearch">
        <el-tab-pane label="作业脚本" name="job">
          <el-table
            v-loading="listLoading"
            :data="list"
            element-loading-text="Loading"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="脚本ID" align="center" show-overflow-tooltip width="200px">
              <template slot-scope="scope">
                {{ scope.row['script_id'] }}
              </template>
            </el-table-column>
            <el-table-column label="脚本类型" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['script_type'] }}
              </template>
            </el-table-column>
            <el-table-column label="脚本名称" width="auto" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['script_name'] }}
              </template>
            </el-table-column>
            <el-table-column label="脚本描述" align="center" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{ scope.row['script_desc'] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建者" align="center" width="auto">
              <template slot-scope="scope">
                {{ scope.row['user_name'] }}
              </template>
            </el-table-column>
            <el-table-column label="上传时间" align="center" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="el-icon-time" />
                {{ scope.row['create_time'] | DateFormat }}
              </template>
            </el-table-column>
            <el-table-column label="脚本详情" align="center" width="auto">
              <template slot-scope="scope">
                <el-link type="primary" @click="getJobDetail(scope.row['script_id'],scope.row['script_name'])">查看
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="130px">
              <template slot-scope="scope">
                <el-button-group>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="修改脚本描述"
                    placement="top-end"
                  >
                    <el-button
                      type="warning"
                      icon="el-icon-edit"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="scriptEdit(scope.row.script_id)"
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="更新脚本内容"
                    placement="top-end"
                  >
                    <el-button
                      type="success"
                      icon="el-icon-refresh"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="changeScript(scope.row.script_id)"
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="删除脚本"
                    placement="top-end"
                  >
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="delScript(scope.row.script_id,scope.row['script_name'])"
                    />
                  </el-tooltip>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="监控脚本" name="monitor">
          <el-table
            v-loading="listLoading"
            :data="list"
            element-loading-text="Loading"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="脚本ID" align="center" show-overflow-tooltip width="200px">
              <template slot-scope="scope">
                {{ scope.row['script_id'] }}
              </template>
            </el-table-column>
            <el-table-column label="脚本类型" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['script_type'] }}
              </template>
            </el-table-column>
            <el-table-column label="脚本名称" width="auto" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['script_name'] }}
              </template>
            </el-table-column>
            <el-table-column label="脚本描述" align="center" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <span>{{ scope.row['script_desc'] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建者" align="center" width="auto">
              <template slot-scope="scope">
                {{ scope.row['user_name'] }}
              </template>
            </el-table-column>
            <el-table-column label="上传时间" align="center" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="el-icon-time" />
                {{ scope.row['create_time'] | DateFormat }}
              </template>
            </el-table-column>
            <el-table-column label="脚本详情" align="center" width="auto">
              <template slot-scope="scope">
                <el-link type="primary" @click="getJobDetail(scope.row['script_id'],scope.row['script_name'])">查看
                </el-link>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="130px">
              <template slot-scope="scope">
                <el-button-group>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="修改脚本描述"
                    placement="top-end"
                  >
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="scriptEdit(scope.row.script_id)"
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="更新脚本内容"
                    placement="top-end"
                  >
                    <el-button
                      type="success"
                      icon="el-icon-refresh"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="changeScript(scope.row.script_id)"
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="删除脚本"
                    placement="top-end"
                  >
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="delScript(scope.row.script_id,scope.row['script_name'])"
                    />
                  </el-tooltip>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
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
      title="上传脚本"
      :before-close="handleDialogClose"
      :visible.sync="uploadVisible"
      width="45%"
    >
      <div style="margin-left: 32%;margin-bottom:3%">
        <el-upload
          ref="upload"
          class="upload-demo"
          drag
          :file-list="fileList"
          :action="upload_script_url + '&purpose=' + purpose"
          :on-success="handleSuccess"
          :auto-upload="false"
          accept=".sh, .py"
          multiple
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将脚本拖到此处或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">
            <span style="margin-right: 5%;color: red">脚本大小不超过5MB</span>
            <el-radio-group v-model="purpose">
              <el-radio label="job">作业脚本</el-radio>
              <el-radio label="monitor">监控脚本</el-radio>
            </el-radio-group>
          </div>
        </el-upload>
      </div>
      <el-row :gutter="24">
        <el-col :span="12" :push="11">
          <el-button
            type="primary"
            @click="submitUpload"
          >
            提交
          </el-button>
          <el-button @click="cancelUpload">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <el-dialog
      :title="descTitle"
      :before-close="handleDialogClose"
      :visible.sync="detailVisible"
      width="50%"
    >
      <el-input
        v-model="scriptDetail"
        type="textarea"
        disabled
        :autosize="{ minRows: 5}"
      />
    </el-dialog>
    <el-dialog
      title="修改脚本描述"
      :before-close="handleDialogClose"
      :visible.sync="descVisible"
      width="50%"
    >
      <el-input
        v-model="scriptDesc"
        type="textarea"
        :autosize="{ minRows: 5}"
      />
      <el-row style="margin-top: 3%">
        <el-col :span="12" :push="10">
          <el-button
            type="primary"
            @click="editScript"
          >
            提交
          </el-button>
          <el-button @click="handleDialogClose">取消</el-button>
        </el-col>
      </el-row>
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DateFormat, getVersion, getYear } from '@/utils/filters'
import { deleteJobScript, getJobScript, getJobScriptDetail, putJobScript, uploadScriptUrl } from '@/api/job'
import store from '@/store'
import { Users } from '@/api/user'

export default {
  inject: ['reload'],
  filters: {
    jobFilter(status) {
      const Map = {
        0: '否',
        1: '是',
        'pending': '等待中',
        'sending': '分发中',
        'completed': '已完成',
        'fail': '失败'
      }
      return Map[status]
    },
    statusFilter(status) {
      const Map = {
        'pending': 'primary',
        'sending': 'primary',
        'completed': 'success',
        'fail': 'danger'
      }
      return Map[status]
    },
    DateFormat
  },
  data() {
    return {
      upload_script_url: uploadScriptUrl() + '?token=' + store.getters.token,
      list: null,
      listLoading: true,
      hostNames: {},
      hostIds: [],
      fileList: [],
      transferValue: [],
      transferData: [],
      multipleSelection: [],
      SourceAssetGroups: [],
      AssetGroups: [],
      buttonDisabled: true,
      uploadVisible: false,
      descVisible: false,
      detailVisible: false,
      descTitle: '',
      searchData: '',
      scriptDesc: null,
      scriptDetail: null,
      scriptId: null,
      prefixSearch: '脚本搜索',
      purpose: 'job',
      users: {},
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
    if (this.$route.params['script_ids'] !== undefined) {
      params['script_ids'] = this.$route.params['script_ids']
    }
    params['purpose'] = this.purpose
    this.getData(params)
  },
  methods: {
    submitUpload() {
      this.$refs.upload.submit()
      this.$refs.upload.clearFiles()
      this.upload_script_url = uploadScriptUrl() + '?token=' + store.getters.token
      this.uploadVisible = false
      this.onSearch()
    },
    cancelUpload() {
      this.fileList = []
      this.upload_script_url = uploadScriptUrl() + '?token=' + store.getters.token
      this.uploadVisible = false
    },
    handleSuccess() {
      this.$message.success('脚本上传成功')
    },
    handleClose(done) {
      done()
    },
    handleDialogClose(done) {
      this.upload_script_url = uploadScriptUrl() + '?token=' + store.getters.token
      this.uploadVisible = false
      this.detailVisible = false
      this.scriptDetail = null
      this.scriptId = null
      this.scriptDesc = null
      this.descVisible = false
      done()
    },
    async getData(params) {
      this.listLoading = true
      params['purpose'] = this.purpose
      let data = []
      await Users().then((res) => {
        if (res.success) {
          for (const v of res.data) {
            this.users[v.user_id] = v.nick_name
          }
        }
      })
      await getJobScript(params).then((res) => {
        if (res.success) {
          data = res.data
          this.totalCount = res.pages.totalCount
        }
      })
      for (const v of data) {
        v['user_name'] = this.users[v.user_id]
      }
      this.list = data
      this.listLoading = false
    },
    getJobDetail(scriptId, scriptName) {
      getJobScriptDetail({ script_id: scriptId }).then((res) => {
        if (res.success) {
          this.scriptDetail = res.data.content
          this.descTitle = '作业脚本(' + scriptName + ')详情'
          this.detailVisible = true
        }
      })
    },
    delScript(script_id, script_name) {
      this.$alert('确定要删除作业脚本' + script_name + '吗?', '', {
        confirmButtonText: '确定',
        callback: action => {
          deleteJobScript({ script_ids: [script_id] }).then((res) => {
            if (res.success) {
              this.$message.success('删除脚本操作成功')
              this.onSearch()
            }
          }).catch(function(err) {
            if (err.toString().includes('403')) {
              alert('用户无权限进行操作,请联系管理员')
            }
          })
        }
      })
    },
    scriptEdit(scriptId) {
      this.scriptId = scriptId
      getJobScript({ script_id: scriptId }).then((res) => {
        if (res.success) {
          if (res.data !== null && res.data.length > 0) {
            this.scriptDesc = res.data[0]['script_desc']
          }
        }
      })
      this.descVisible = true
    },
    editScript() {
      putJobScript({ script_id: this.scriptId, script_desc: this.scriptDesc }).then((res) => {
        if (res.success) {
          this.scriptId = null
          this.scriptDesc = null
          this.descVisible = false
          this.$message.success('修改脚本描述成功')
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    changeScript(script_id) {
      this.uploadVisible = true
      this.upload_script_url = this.upload_script_url + '&script_id=' + script_id
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      params['purpose'] = this.purpose
      this.getData(params)
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
