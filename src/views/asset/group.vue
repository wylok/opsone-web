<template>
  <div class="app-container">
    <div class="app-div-search" style="margin-bottom: 20px">
      <el-row :gutter="24">
        <el-col :span="8">
          <el-input v-model="searchData" :placeholder="prefixSearch" class="input-with-select">
            <el-button slot="append" icon="el-icon-search" @click="onSearch" />
          </el-input>
        </el-col>
        <el-col :span="16" style="text-align: right">
          <el-button round @click="newGroup">新建资源组</el-button>
          <el-button round :disabled="buttonDisabled" @click="deleteAssetGroup([])">批量删除</el-button>
          <el-button round :disabled="buttonDisabled" @click="jobExecHost(null)">命令执行</el-button>
          <el-button round :disabled="buttonDisabled" @click="jobFileHost(null)">文件分发</el-button>
          <el-button round :disabled="buttonDisabled" @click="jobScriptHost(null)">脚本执行</el-button>
          <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="app-div">
      <el-table
        v-loading="listLoading"
        :data="groupData"
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
        <el-table-column label="资源组名称" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['group_name'] }}
          </template>
        </el-table-column>
        <el-table-column label="所属部门" width="auto" align="center">
          <template slot-scope="scope">
            <router-link
              :to="{ name:'DepartmentIds', params: { department_ids: scope.row['department_id'] } }"
            >
              <el-link type="primary">{{ scope.row['department_id']|DepartmentFilter(departments) }}</el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="主机列表" width="auto" align="center">
          <template slot-scope="scope">
            <router-link
              :to="{ name:'GroupHostSearch', params: { asset_group_id: scope.row['group_id'] } }"
            >
              <el-link type="primary">查看</el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="主机数量" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['hosts'] }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="250px">
          <template slot-scope="scope">
            <el-button-group>
              <el-tooltip
                class="item"
                effect="light"
                content="关联"
                placement="top-end"
              >
                <el-button
                  type="success"
                  icon="el-icon-share"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="listHosts(scope.row['group_id'])"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="变更"
                placement="top-end"
              >
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="modifyGroup(scope.row['group_id'], scope.row['department_id'], scope.row['group_name'])"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="进程监控"
                placement="top-end"
              >
                <el-button
                  v-if="scope.row['hosts']>0"
                  type="warning"
                  icon="el-icon-aim"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="groupProcess(scope.row['group_id'])"
                />
                <el-button
                  v-else
                  type="info"
                  icon="el-icon-aim"
                  size="mini"
                  circle
                  plain
                  disabled
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="监控指标"
                placement="top-end"
              >
                <el-button
                  v-if="scope.row['hosts']>0"
                  type="primary"
                  icon="el-icon-data-line"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="customMetrics(scope.row['group_id'])"
                />
                <el-button
                  v-else
                  type="info"
                  icon="el-icon-data-line"
                  size="mini"
                  circle
                  plain
                  disabled
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="命令作业"
                placement="top-end"
              >
                <el-button
                  v-if="scope.row['hosts']>0"
                  type="success"
                  icon="el-icon-position"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="jobExecHost(scope.row)"
                />
                <el-button
                  v-else
                  type="info"
                  icon="el-icon-position"
                  size="mini"
                  circle
                  plain
                  disabled
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="文件分发"
                placement="top-end"
              >
                <el-button
                  v-if="scope.row['hosts']>0"
                  type="primary"
                  icon="el-icon-document-copy"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="jobFileHost(scope.row)"
                />
                <el-button
                  v-else
                  type="info"
                  icon="el-icon-document-copy"
                  size="mini"
                  circle
                  plain
                  disabled
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="脚本执行"
                placement="top-end"
              >
                <el-button
                  v-if="scope.row['hosts']>0"
                  type="warning"
                  icon="el-icon-c-scale-to-original"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="jobScriptHost(scope.row)"
                />
                <el-button
                  v-else
                  type="info"
                  icon="el-icon-c-scale-to-original"
                  size="mini"
                  circle
                  plain
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
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="deleteAssetGroup([scope.row['group_id']])"
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
        :title="groupTitle"
        :visible.sync="dialogVisible"
        width="30%"
        :before-close="handleClose"
      >
        <el-form
          ref="groupForm"
          :model="groupForm"
          :rules="groupRules"
          :label-position="labelPosition"
          label-width="100px"
        >
          <el-row :gutter="24">
            <el-col :span="22">
              <el-form-item label="资源组名称" prop="name" required>
                <el-input v-model="groupForm.name" size="small" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="22">
              <el-form-item label="选择部门" prop="department_id" required>
                <el-select v-model="groupForm.department_id" placeholder="请选择">
                  <el-option
                    v-for="item in departments"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button v-if="newGroupButton" type="primary" @click="addGroupForm('groupForm')">确 定</el-button>
          <el-button v-if="changeGroupButton" type="primary" @click="modifyGroupForm('groupForm')">确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="服务器关联资源组"
        :before-close="assetGroupClose"
        :visible.sync="assetGroupVisible"
        width="625px"
      >
        <el-transfer
          v-model="SelectHosts"
          filterable
          style="text-align: left; display: inline-block"
          :left-default-checked="[]"
          :right-default-checked="[]"
          :titles="['服务器列表', '已选服务器']"
          :format="{ noChecked: '${total}', hasChecked: '${checked}/${total}' }"
          :data="Hosts"
        >
          <el-button
            slot="left-footer"
            class="transfer-footer"
            size="small"
            :disabled="disableAssetGroupButton"
            @click="resetAssetGroup"
          >
            重置
          </el-button>
          <el-button
            slot="right-footer"
            class="transfer-footer"
            size="small"
            :disabled="disableAssetGroupButton"
            @click="relationAssetGroup"
          >
            提交
          </el-button>
        </el-transfer>
      </el-dialog>
      <el-dialog
        title="配置资源组进程监控"
        :visible.sync="addProcessVisible"
        width="30%"
        :before-close="addProcessClose"
      >
        <el-input v-model="addProcess" type="textarea" :rows="2" placeholder="请输入进程名称,多个进程以逗号分割" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="addProcessClose">取 消</el-button>
          <el-button v-if="addProcess!==null" type="primary" @click="addGroupProcessSubmit">确 定</el-button>
          <el-button v-else disable>确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="配置资源组进程监控"
        :visible.sync="processDialogVisible"
        width="30%"
        :before-close="processDialogClose"
      >
        <el-table
          v-loading="listLoading"
          :data="processList"
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
          <el-table-column label="进程名称" align="left" width="auto">
            <template slot-scope="scope">
              {{ scope.row.process }}
            </template>
          </el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addProcessVisible=true">新增</el-button>
          <el-button type="primary" @click="deleteGroupProcessSubmit">删除</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="自定义监控指标"
        :visible.sync="customVisible"
        width="30%"
        :before-close="customClose"
      >
        <el-table
          v-loading="listLoading"
          :data="customGroupData"
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
        >
          <el-table-column label="监控指标" align="left" width="auto">
            <template slot-scope="scope">
              {{ scope.row.monitor_key }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="150px">
            <template slot-scope="scope">
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
                    @click.native.prevent="customEdit(scope.row.group_id,scope.row.monitor_key)"
                  />
                </el-tooltip>
                <el-tooltip
                  class="item"
                  effect="light"
                  content="更新采集脚本"
                  placement="top-end"
                >
                  <el-button
                    type="success"
                    icon="el-icon-refresh"
                    size="mini"
                    circle
                    plain
                    @click.native.prevent="refreshCustomScript(scope.row.monitor_key)"
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
                    @click.native.prevent="deleteCustom(scope.row.group_id,scope.row.monitor_key)"
                  />
                </el-tooltip>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addCustomVisible = true">新增</el-button>
          <el-button type="primary" @click="customClose">取消</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="配置自定义监控指标"
        :visible.sync="addCustomVisible"
        width="30%"
        :before-close="addCustomClose"
      >
        <el-form :label-position="labelPosition" label-width="130px" :model="customForm" :rules="customRules">
          <el-form-item label="资源组ID" required>
            <el-input v-model="customForm.group_id" disabled style="width: 80%" />
          </el-form-item>
          <el-form-item label="监控指标" required>
            <el-input v-model="customForm.monitor_key" style="width: 80%" />
          </el-form-item>
          <el-form-item label="指标名称" required>
            <el-input v-model="customForm.key_cn" style="width: 80%" />
          </el-form-item>
          <el-form-item label="指标单位">
            <el-input v-model="customForm.key_unit" style="width: 80%" />
          </el-form-item>
          <el-form-item label="采集器脚本ID" required>
            <el-select v-model="customForm.script_id" placeholder="请选择" style="width: 80%">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer" style="margin-right: 30%">
          <el-button type="primary" @click="addCustom">提交</el-button>
          <el-button type="primary" @click="addCustomClose">取消</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="命令执行作业"
        :before-close="cancelSubmit"
        :visible.sync="jobExecVisible"
        width="50%"
      >
        <el-form ref="jobExecForm" :model="jobExecForm" :rules="jobExecRules" label-width="100px" size="medium">
          <div style="margin-bottom: 20px;margin-left:105px"><span style="font-weight:bolder">已选择资源组:</span>
            <el-tag
              v-for="(v,k) in jobGroupNames"
              :key="k"
              type="primary"
              effect="plain"
              style="margin-left: 10px;"
            >
              {{ v }}
            </el-tag>
          </div>
          <el-row :gutter="24">
            <el-col :span="20" :offset="2" style="padding-left: 7px">
              <el-form-item label="定时执行" prop="cron">
                <el-switch
                  v-model="jobExecForm.cron"
                  active-text="      "
                />
                <span>
                  <el-date-picker
                    v-if="jobExecForm.cron===true"
                    v-model="jobExecForm.run_time"
                    type="datetime"
                    placeholder="选择日期时间"
                    :default-time="jobExecForm.run_time"
                  />
                  <el-date-picker
                    v-else
                    v-model="jobExecForm.run_time"
                    type="datetime"
                    placeholder="选择日期时间"
                    disabled
                    :default-time="jobExecForm.run_time"
                  />
                </span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="20" :offset="2">
              <el-form-item label="Shell命令" prop="exec" autocomplete="on">
                <el-input
                  v-model="jobExecForm.exec"
                  type="textarea"
                  :autosize="{ minRows: 6, maxRows: 8}"
                  resize="none"
                  placeholder="请输入命令内容......"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-col :span="12" :push="8">
              <el-button
                type="primary"
                @click="ServerJobExec"
              >
                提交
              </el-button>
              <el-button @click="cancelSubmit">取消</el-button>
            </el-col>
          </el-form-item>
        </el-form>
      </el-dialog>
      <el-dialog
        title="文件分发作业"
        :before-close="cancelSubmit"
        :visible.sync="jobFileVisible"
        width="50%"
      >
        <el-form ref="jobFileForm" :model="jobFileForm" :rules="jobFileRules" label-width="100px" size="medium">
          <div style="margin-bottom: 10px;margin-left:110px"><span style="font-weight:bolder">已选资源组:</span>
            <el-tag
              v-for="(v,k) in jobGroupNames"
              :key="k"
              type="primary"
              effect="plain"
              style="margin-left: 10px;"
            >
              {{ v }}
            </el-tag>
          </div>
          <el-row :gutter="24">
            <el-col :span="20" :offset="2">
              <el-form-item label="目标路径" prop="dst_path" autocomplete="on">
                <el-input v-model="jobFileForm.dst_path" type="text" resize="none" placeholder="请输入文件分发目标路径" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="20" :offset="2">
              <el-form-item label="定时执行" prop="cron">
                <el-switch
                  v-model="jobExecForm.cron"
                  active-text="      "
                />
                <span>
                  <el-date-picker
                    v-if="jobExecForm.cron===true"
                    v-model="jobExecForm.run_time"
                    type="datetime"
                    placeholder="选择日期时间"
                    :default-time="jobExecForm.run_time"
                  />
                  <el-date-picker
                    v-else
                    v-model="jobExecForm.run_time"
                    type="datetime"
                    placeholder="选择日期时间"
                    disabled
                    :default-time="jobExecForm.run_time"
                  />
                </span>
              </el-form-item>
            </el-col>
          </el-row>
          <div style="margin-left: 32%;margin-bottom:3%">
            <el-upload
              ref="upload"
              class="upload-demo"
              drag
              :before-remove="beforeRemove"
              :action="upload_file_url"
              :file-list="fileList"
              :on-success="handleSuccess"
              accept=".sh, .txt, .py"
              :auto-upload="true"
              multiple
            >
              <i class="el-icon-upload" />
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div slot="tip" class="el-upload__tip"><span style="color: red">文件大小不超过5MB</span></div>
            </el-upload>
          </div>
          <el-form-item>
            <el-col :span="12" :push="8">
              <el-button
                type="primary"
                @click="sendFileSubmit"
              >
                提交
              </el-button>
              <el-button @click="cancelSubmit">取消</el-button>
            </el-col>
          </el-form-item>
        </el-form>
      </el-dialog>
      <el-dialog
        title="脚本执行作业"
        :before-close="handleClose"
        :visible.sync="scriptVisible"
        width="45%"
      >
        <el-form ref="jobRunForm" :model="jobScriptForm" label-width="100px" size="medium">
          <div style="margin-bottom: 10px;margin-left:100px"><span style="font-weight:bolder">已选资源组:</span>
            <el-tag
              v-for="(v,k) in jobGroupNames"
              :key="k"
              type="primary"
              effect="plain"
              style="margin-left: 10px;"
            >
              {{ v }}
            </el-tag>
          </div>
          <el-row :gutter="24">
            <el-col :span="30" :offset="2">
              <span style="font-weight:bolder;padding-left: 30px;margin-right:7px">作业脚本</span>
              <el-select v-model="jobScriptForm.script_id" placeholder="请选择">
                <el-option
                  v-for="item in scriptIds"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="20" :offset="2">
              <el-form-item label="定时执行" prop="cron" style="margin-top:3%">
                <el-switch
                  v-model="jobScriptForm.cron"
                  active-text="      "
                />
                <span>
                  <el-date-picker
                    v-if="jobScriptForm.cron===true"
                    v-model="jobScriptForm.run_time"
                    type="datetime"
                    placeholder="选择日期时间"
                    :default-time="jobScriptForm.run_time"
                  />
                  <el-date-picker
                    v-else
                    v-model="jobScriptForm.run_time"
                    type="datetime"
                    placeholder="选择日期时间"
                    disabled
                    :default-time="jobScriptForm.run_time"
                  />
                </span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-col :span="12" :push="8">
              <el-button
                type="primary"
                @click="runScriptSubmit"
              >
                提交
              </el-button>
              <el-button @click="cancelSubmit">取消</el-button>
            </el-col>
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>

import {
  DelAssetGroup,
  GetAssetGroup,
  GetGroupRelatedServers,
  GetGroupServersDetail,
  PostAssetGroup,
  PutAssetGroup
} from '@/api/cmdb'
import { DateFormat, getVersion, getYear, Round } from '@/utils/filters'
import { GetDepartment } from '@/api/auth'
import time from 'mockjs'
import { getJobScript, postJobExec, postJobFileSend, runJobScript, uploadFileUrl } from '@/api/job'
import { cookieGet } from '@/utils/cookie'
import {
  addGroupProcess,
  deleteCustom,
  deleteGroupProcess,
  getCustom,
  getCustomGroup,
  getGroupProcess,
  postCustom,
  putCustomScript
} from '@/api/monitor'

export default {
  inject: ['reload'],
  filters: {
    Round,
    DateFormat,
    DepartmentFilter(department_id, departments) {
      for (const v of departments) {
        if (v['value'] === department_id) {
          return v['label']
        }
      }
    }
  },
  data() {
    return {
      upload_file_url: uploadFileUrl() + '?token=' + cookieGet('token'),
      groupData: null,
      listLoading: true,
      dialogVisible: false,
      buttonDisabled: true,
      customDialogVisible: false,
      scriptVisible: false,
      multipleSelection: [],
      departments: [],
      scriptIds: [],
      prefixSearch: '搜索资源组名称',
      searchData: '',
      searchParams: 'group_name',
      newGroupButton: true,
      changeGroupButton: false,
      labelPosition: 'right',
      processList: [],
      options: [],
      customForm: {
        group_id: null,
        monitor_key: null,
        key_cn: null,
        key_unit: null,
        script_id: 'None'
      },
      customRules: {
        monitor_key: [
          { required: true, message: '请输入监控指标', trigger: 'blur' }
        ],
        key_cn: [
          { required: true, message: '请输入指标名称', trigger: 'blur' }
        ]
      },
      groupTitle: '',
      groupForm: {
        id: '',
        name: '',
        department_id: ''
      },
      groupRules: {
        name: [
          { required: true, message: '请输入资源组名称', trigger: 'blur' }
        ],
        department_id: [
          { required: true, message: '请选择所属部门', trigger: 'blur' }
        ]
      },
      assetGroupVisible: false,
      disableAssetGroupButton: false,
      jobExecVisible: false,
      jobFileVisible: false,
      addProcessVisible: false,
      customVisible: false,
      addCustomVisible: false,
      addProcess: null,
      SelectGroupId: null,
      processDialogVisible: false,
      Hosts: [],
      SelectHosts: [],
      RelationHosts: [],
      SourceHosts: [],
      customGroupData: [],
      jobExecForm: {
        asset_group_ids: [],
        exec: null,
        cron: false,
        run_time: time.now
      },
      jobExecRules: {
        exec: [
          { required: true, message: 'shell命令不能为空', trigger: 'change' }
        ]
      },
      jobFileForm: {
        job_id: null,
        asset_group_ids: [],
        dst_path: null,
        cron: false,
        send_time: time.now
      },
      jobFileRules: {
        dst_path: [
          { required: true, message: '目标路径不能为空', trigger: 'change' }
        ]
      },
      jobScriptForm: {
        asset_group_ids: [],
        script_id: null,
        cron: false,
        run_time: time.now
      },
      year: getYear(),
      version: getVersion(),
      fileList: [],
      AssetGroupId: null,
      jobGroupNames: [],
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
    this.departmentList()
    getJobScript({ not_page: true, purpose: 'monitor' }).then((res) => {
      if (res.success) {
        this.options = []
        res.data.forEach((v, index) => {
          this.options.push({
            value: v['script_id'],
            label: v['script_name']
          })
        })
      }
    })
  },
  mounted() {
    const params = { pre_page: this.PerPage, page: this.currentPage }
    if (this.$route.params['group_id'] !== undefined) {
      params['group_id'] = this.$route.params['group_id']
    }
    this.getData(params)
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.buttonDisabled = this.multipleSelection.length <= 1
      // 其它方法可以处理已选择的行数据
    },
    addProcessClose(done) {
      this.addProcess = null
      this.addProcessVisible = false
      done()
    },
    processDialogClose(done) {
      this.processDialogVisible = false
      this.SelectGroupId = null
      done()
    },
    // 获取列表
    getData(params) {
      this.listLoading = true
      params['pre_page'] = this.PerPage
      params['page'] = this.currentPage
      GetAssetGroup(params).then((res) => {
        if (res.success) {
          this.groupData = res.data
          this.totalCount = res.pages.totalCount
          this.listLoading = false
        }
      })
    },
    departmentList() {
      GetDepartment().then((res) => {
        if (res.success) {
          this.departments = []
          for (const v in res.data) {
            if (v !== 'None' && v !== 'departments') {
              if (res.data[v]['business']) {
                this.departments.push({
                  value: v,
                  label: res.data[v]['department_name']
                })
              }
            }
          }
        }
      })
    },
    newGroup() {
      this.groupTitle = '新建资源组'
      this.dialogVisible = true
      this.newGroupButton = true
      this.changeGroupButton = false
      this.groupForm.name = null
      this.groupForm.department_id = null
    },
    addGroupForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          PostAssetGroup({
            group_name: this.groupForm.name,
            department_id: this.groupForm.department_id
          }).then((res) => {
            if (res.success) {
              this.dialogVisible = false
              this.departmentList()
              this.onSearch()
              this.$message.success('新建资源组操作成功!')
            }
          }).catch(function(err) {
            if (err.toString().includes('403')) {
              alert('用户无权限进行操作,请联系管理员')
            }
          })
        } else {
          return false
        }
        this.groupForm.department_id = null
        this.groupForm.name = null
        this.listLoading = false
      })
    },
    modifyGroup(group_id, department_id, group_name) {
      this.groupTitle = '变更资源组'
      this.dialogVisible = true
      this.newGroupButton = false
      this.changeGroupButton = true
      this.groupForm.name = group_name
      this.groupForm.id = group_id
      this.groupForm.department_id = department_id
    },
    modifyGroupForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          PutAssetGroup({
            group_id: this.groupForm.id, group_name: this.groupForm.name,
            department_id: this.groupForm.department_id
          }).then((res) => {
            if (res.success) {
              this.dialogVisible = false
              this.departmentList()
              this.onSearch()
              this.$message.success('变更资源组操作成功!')
            }
          }).catch(function(err) {
            if (err.toString().includes('403')) {
              alert('用户无权限进行操作,请联系管理员')
            }
          })
          this.groupForm.name = null
          this.groupForm.id = null
        }
      })
    },
    relationAssetGroup() {
      PutAssetGroup({ group_id: this.AssetGroupId, asset_ids: this.SelectHosts }).then((res) => {
        if (res.success) {
          this.assetGroupVisible = false
          this.departmentList()
          this.onSearch()
          this.$message.success('关联资源组操作成功!')
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    deleteAssetGroup(group_ids) {
      this.$confirm('此操作将永久删除所选资源组, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (group_ids.length === 0) {
          if (this.multipleSelection !== null && this.multipleSelection.length > 1) {
            for (const v of this.multipleSelection) {
              group_ids.push(v.group_id)
            }
          }
        }
        DelAssetGroup({ group_ids: group_ids }).then((res) => {
          if (res.success) {
            this.departmentList()
            this.onSearch()
            this.$message.success('删除资源组操作成功!')
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    listHosts(group_id) {
      this.assetGroupVisible = true
      this.AssetGroupId = group_id
      this.SelectHosts = []
      this.Hosts = []
      GetGroupServersDetail({ group_id: this.AssetGroupId }).then((res) => {
        if (res.success) {
          if (res.data !== null) {
            for (const v of res.data) {
              this.Hosts.push({
                key: v['host_id'],
                label: v['host_name'],
                disabled: false
              })
            }
            this.SourceHosts = this.Hosts
          }
        } else {
          this.assetGroupVisible = false
        }
      })
      GetGroupRelatedServers({ group_ids: group_id }).then((res) => {
        if (res.success) {
          if (res.data !== null) {
            for (const v of res.data[group_id]) {
              this.SelectHosts.push(v['host_id'])
            }
            this.RelationHosts = this.SelectHosts
          }
        } else {
          this.assetGroupVisible = false
        }
      })
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    handleClose() {
      this.dialogVisible = false
      this.scriptVisible = false
    },
    addCustomClose() {
      this.addCustomVisible = false
      this.customForm.monitor_key = null
      this.customForm.key_cn = null
      this.customForm.key_unit = null
      this.customForm.script_id = null
    },
    customClose() {
      this.customVisible = false
    },
    assetGroupClose() {
      this.SourceHosts = []
      this.RelationHosts = []
      this.Hosts = []
      this.SelectHosts = []
      this.assetGroupVisible = false
    },
    customMetrics(groupId) {
      this.customVisible = true
      getCustomGroup({ group_id: groupId }).then((res) => {
        if (res.success) {
          this.customForm.group_id = groupId
          this.customGroupData = res.data
        }
      })
    },
    addCustom() {
      postCustom(this.customForm).then((res) => {
        if (res.success) {
          this.addCustomVisible = false
          this.customMetrics(this.customForm.group_id)
          this.$message.success('配置自定义监控指标成功')
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    customEdit(groupId, MonitorKey) {
      this.addCustomVisible = true
      getCustom({ group_id: groupId, monitor_key: MonitorKey }).then((res) => {
        if (res.success) {
          this.customForm.script_id = null
          this.customForm.group_id = groupId
          this.customForm.monitor_key = MonitorKey
          this.customForm.key_cn = res.data['monitor_key_cn']
          this.customForm.key_unit = res.data['monitor_key_unit']
          if (res.data['script_id'] !== 'None') {
            this.customForm.script_id = res.data['script_id']
          }
        }
      })
    },
    deleteCustom(groupId, MonitorKey) {
      this.$confirm('此操作将删除自定义监控指标, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteCustom({ group_id: groupId, monitor_key: MonitorKey }).then((res) => {
          if (res.success) {
            this.$message.success('删除自定义监控指标成功')
            this.customMetrics(groupId)
          }
        })
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    resetAssetGroup() {
      this.Hosts = this.SourceHosts
      this.SelectHosts = this.RelationHosts
    },
    cancelSubmit() {
      this.fileList = []
      this.jobFileForm.job_id = null
      this.jobExecForm.asset_group_ids = []
      this.jobExecForm.exec = null
      this.jobFileForm.dst_path = null
      this.jobFileForm.asset_group_ids = []
      this.jobScriptForm.asset_group_ids = []
      this.jobScriptForm.script_id = null
      this.jobFileVisible = false
      this.jobExecVisible = false
      this.scriptVisible = false
    },
    jobExecHost(group) {
      if (group === null) {
        if (this.multipleSelection.length > 1) {
          for (const v of this.multipleSelection) {
            this.jobExecForm.asset_group_ids.push(v.group_id)
            this.jobGroupNames.push(v.group_name)
          }
        }
      } else {
        this.jobExecForm.asset_group_ids = [group.group_id]
        this.jobGroupNames = [group.group_name]
      }
      this.jobExecVisible = true
    },
    jobFileHost(group) {
      if (group === null) {
        if (this.multipleSelection.length > 1) {
          for (const v of this.multipleSelection) {
            this.jobFileForm.asset_group_ids.push(v.group_id)
            this.jobGroupNames.push(v.group_name)
          }
        }
      } else {
        this.jobFileForm.asset_group_ids = [group.group_id]
        this.jobGroupNames = [group.group_name]
      }
      this.jobFileVisible = true
    },
    jobScriptHost(group) {
      this.scriptIds = []
      if (group === null) {
        if (this.multipleSelection.length > 1) {
          for (const v of this.multipleSelection) {
            this.jobScriptForm.asset_group_ids.push(v.group_id)
            this.jobGroupNames.push(v.group_name)
          }
        }
      } else {
        this.jobScriptForm.asset_group_ids = [group.group_id]
        this.jobGroupNames = [group.group_name]
      }
      getJobScript({ purpose: 'job', not_page: true }).then((res) => {
        if (res.success) {
          for (const v of res.data) {
            if (v['script_id'] !== undefined) {
              this.scriptIds.push({
                value: v['script_id'],
                label: v['script_name']
              })
            }
          }
        }
      })
      this.scriptVisible = true
    },
    ServerJobExec() {
      postJobExec(this.jobExecForm).then((res) => {
        if (res.success) {
          this.jobGroupNames = []
          this.jobExecForm.asset_group_ids = []
          this.jobExecVisible = false
          this.$message.success('Shell命令执行下发完成')
          this.$router.push({ name: 'job_overview' })
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    sendFileSubmit() {
      postJobFileSend(this.jobFileForm).then((res) => {
        if (res.success) {
          this.fileList = []
          this.jobGroupNames = []
          this.jobExecForm.asset_group_ids = []
          this.jobFileVisible = false
          this.$message.success('文件分发任务下发完成')
          this.$router.push({ name: 'job_overview' })
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    runScriptSubmit() {
      runJobScript(this.jobScriptForm).then((res) => {
        if (res.success) {
          this.jobScriptForm.script_id = null
          this.jobScriptForm.asset_group_ids = []
          this.$message.success('脚本运行任务创建成功')
          this.scriptVisible = false
          this.$router.push({ name: 'job_overview' })
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${file.name}吗?`)
    },
    handleSuccess(response, file, fileList) {
      this.jobFileForm.job_id = response.data.job_id
      this.fileList = fileList
    },
    groupProcess(groupId) {
      this.SelectGroupId = groupId
      this.getGroupProcessList(groupId)
      this.processDialogVisible = true
    },
    getGroupProcessList(groupId) {
      getGroupProcess({ group_id: groupId }).then((res) => {
        this.processList = []
        this.processValue = ''
        if (res.success) {
          for (const d of res.data) {
            if (d !== null && d !== undefined) {
              this.processList.push({ process: d.process })
            }
          }
        }
      })
    },
    deleteGroupProcessSubmit() {
      const process = []
      for (const v of this.multipleSelection) {
        process.push(v.process)
      }
      if (process.length > 0) {
        deleteGroupProcess({ group_id: this.SelectGroupId, process: process }).then((res) => {
          if (res.success) {
            this.getGroupProcessList(this.SelectGroupId)
            this.$message.success('批量删除进程监控完成')
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      }
    },
    addGroupProcessSubmit() {
      if (this.addProcess !== null) {
        addGroupProcess({ group_id: this.SelectGroupId, process: this.addProcess.split(',') }).then((res) => {
          if (res.success) {
            this.getGroupProcessList(this.SelectGroupId)
            this.addProcess = null
            this.addProcessVisible = false
            this.$message.success('批量新增进程监控完成')
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      } else {
        this.$message.error('进程信息不能为空')
      }
    },
    refreshCustomScript(monitorKey) {
      putCustomScript({ monitor_key: monitorKey }).then((res) => {
        if (res.success) {
          this.$message.success('重新推送指标采集脚本成功!')
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
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
