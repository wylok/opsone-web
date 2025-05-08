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
        <el-col :span="16" style="text-align: right">
          <el-button
            round
            type="primary"
            plain
            small
            @click.native="createRule"
          >
            创建规则
          </el-button>
          <el-button
            round
            type="success"
            :disabled="buttonDisabled"
            plain
            small
            @click.native="listRuleGroups"
          >
            关联规则
          </el-button>
          <el-button
            round
            type="danger"
            :disabled="buttonDisabled"
            plain
            small
            @click.native="deleteRule(SelectRuleIds)"
          >
            删除规则
          </el-button>
          <el-button
            round
            type="primary"
            :disabled="buttonDisabled"
            plain
            small
          >
            故障自愈
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
          width="45"
        />
        <el-table-column label="规则名称" show-overflow-tooltip align="center" width="200">
          <template slot-scope="scope">
            {{ scope.row['rule_name'] }}
          </template>
        </el-table-column>
        <el-table-column label="监控指标" width="150" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row['monitor_key'] }}
          </template>
        </el-table-column>
        <el-table-column label="报警等级" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['alarm_level']|levelFilter }}
          </template>
        </el-table-column>
        <el-table-column label="报警阈值" width="250" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ key_cn[scope.row['monitor_key']]['KeyCn'] }}{{ scope.row['diff_rule'] }}
            {{ scope.row['rule_value'] }}{{ key_cn[scope.row['monitor_key']]['KeyUnit'] }}
          </template>
        </el-table-column>
        <el-table-column label="连续触发" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['rule_t'] }}次
          </template>
        </el-table-column>
        <el-table-column label="规则状态" width="auto" align="center">
          <template slot-scope="scope">
            <el-tag
              :type="scope.row['status'] | statusFilter"
            >
              {{ scope.row['status'] | CommentStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建者" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['create_user_name'] }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="created_at" label="创建时间" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span> {{ scope.row['create_time'] | DateFormat }} </span>
          </template>
        </el-table-column>
        <el-table-column label="通知规则" width="auto" align="center">
          <template slot-scope="scope">
            <el-link @click="getStages({rule_id:scope.row['rule_id']})">查看</el-link>
          </template>
        </el-table-column>
        <el-table-column label="报警记录" width="auto" align="center">
          <template slot-scope="scope">
            <router-link
              :to="{ name:'alarm_history_id', params: { type: 'rule_id', id: scope.row['rule_id'] } }"
            >
              <el-link>查看</el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180px">
          <template slot-scope="scope">
            <el-button-group>
              <el-tooltip
                class="item"
                effect="light"
                content="启用规则"
                placement="top-end"
              >
                <el-button
                  v-if="scope.row['status']==='close'"
                  type="success"
                  icon="el-icon-check"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="changeRuleStatus(scope.row['rule_id'], 'active')"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="禁用规则"
                placement="top-end"
              >
                <el-button
                  v-if="scope.row['status']==='active'"
                  type="danger"
                  icon="el-icon-close"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="changeRuleStatus(scope.row['rule_id'], 'close')"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="编辑规则"
                placement="top-end"
              >
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="modifyRule(scope.row['rule_id'])"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="关联规则"
                placement="top-end"
              >
                <el-button
                  type="success"
                  icon="el-icon-share"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="listRuleGroups(scope.row['rule_id'])"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="删除规则"
                placement="top-end"
              >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="deleteRule([scope.row['rule_id']])"
                />
              </el-tooltip>
              <el-tooltip
                class="item"
                effect="light"
                content="故障自愈"
                placement="top-end"
              >
                <el-button
                  type="primary"
                  icon="el-icon-finished"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="relationRuleJob(scope.row['rule_id'])"
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
    </div>
    <el-dialog
      :title="form_title"
      :before-close="handleDialogClose"
      :visible.sync="dialogVisible"
      width="55%"
    >
      <el-form ref="ruleForm" :model="ruleForm" :rules="rules" label-width="100px" size="medium">
        <el-row :gutter="24">
          <el-col :span="20">
            <el-form-item label="规则名称" prop="rule_name" autocomplete="on">
              <el-input v-model="ruleForm.rule_name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="20">
            <el-form-item label="告警策略" prop="monitor_key">
              <el-cascader
                v-model="ruleForm.monitor_key"
                :options="options"
                :props="{ expandTrigger: 'hover' }"
                @change="handleChange"
              />
              <span>连续触发</span>
              <el-select v-model="ruleForm.rule_t" placeholder="请选择触发数值" style="width: 13%">
                <el-option label="1" value="1" />
                <el-option label="2" value="2" />
                <el-option label="3" value="3" />
                <el-option label="4" value="4" />
                <el-option label="5" value="5" />
              </el-select>
              <span>次</span>
              <el-select v-model="ruleForm.diff_rule" placeholder="请选择触发条件" style="width: 13%">
                <el-option label="=" value="=" />
                <el-option label=">" value=">" />
                <el-option label="<" value="<" />
                <el-option label=">=" value=">=" />
                <el-option label="<=" value="<=" />
                <el-option label="!=" value="!=" />
              </el-select>
              <el-input
                v-model="ruleForm.rule_value"
                onkeyup="value=value.replace(/[^\d]/g,'')"
                clearable
                style="width: 15%"
              />
              {{ key_unit }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="规则等级" prop="alarm_level">
              <el-select v-model="ruleForm.alarm_level" placeholder="请选择规则等级">
                <el-option label="通知" value="Info" />
                <el-option label="警告" value="Warning" />
                <el-option label="严重" value="Critical" />
                <el-option label="致命" value="Error" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="通知规则" prop="stages">
              <el-select v-model="ruleForm.stages" disabled placeholder="请选择通知规则">
                <el-option label="默认规则" :value="ruleForm.stages" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="20">
            <el-form-item label="通知渠道" prop="channel">
              <el-radio-group v-model="ruleForm.channel">
                <el-radio disabled label="Email">邮件</el-radio>
                <el-radio disabled label="Sms">短信</el-radio>
                <el-radio label="DingDing">钉钉</el-radio>
                <el-radio disabled label="weiXin">企业微信</el-radio>
                <el-radio disabled label="phone">语音电话</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="20">
            <el-form-item label="通知联系人" prop="contacts">
              <el-input
                v-model="ruleForm.contacts"
                placeholder="多个钉钉token以逗号分割,需提前设置机器人关键词:报警"
                :value="ruleForm.contacts"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="关联资源组" prop="group_ids">
              <el-select
                v-model="ruleForm.GroupIds"
                :disabled="groups_disabled"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请选择资源组"
                @change="handleGroupChange"
              >
                <el-option
                  v-for="item in asset_groups"
                  :key="item['group_id']"
                  :label="item['group_name']"
                  :value="item['group_id']"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="自动关联" prop="relation">
              <el-switch
                v-model="ruleForm.relation"
                active-text="资源组新增监控主机"
                :disabled="relation_disable"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item>
              <el-col :span="12" :push="8">
                <el-button
                  v-if="formId==='createRule'"
                  :id="formId"
                  type="primary"
                  @click="createRuleForm('ruleForm')"
                >
                  提交
                </el-button>
                <el-button
                  v-if="formId==='modifyRule'"
                  :id="formId"
                  type="primary"
                  @click="modifyRuleForm('ruleForm')"
                >
                  提交
                </el-button>
                <el-button @click="resetForm">重置</el-button>
              </el-col>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
    <el-dialog
      title="报警规则关联资源组"
      :before-close="RuleGroupClose"
      :visible.sync="ruleGroupVisible"
      width="625px"
    >
      <el-transfer
        v-model="SelectAssetGroups"
        filterable
        style="text-align: left; display: inline-block"
        :left-default-checked="[]"
        :right-default-checked="[]"
        :titles="['资源组列表', '已选资源组']"
        :format="{ noChecked: '${total}', hasChecked: '${checked}/${total}' }"
        :data="AssetGroups"
      >
        <el-button
          slot="left-footer"
          class="transfer-footer"
          size="small"
          :disabled="disableRuleGroupButton"
          @click="resetRuleGroup"
        >
          重置
        </el-button>
        <el-button
          slot="right-footer"
          class="transfer-footer"
          size="small"
          :disabled="disableRuleGroupButton"
          @click="relationRuleGroups"
        >
          提交
        </el-button>
      </el-transfer>
    </el-dialog>
    <el-dialog
      title="故障自愈"
      :visible.sync="purposeVisible"
      width="50%"
    >
      <el-tabs v-model="activeName" @tab-click="activeTab">
        <el-tab-pane label="监控脚本" name="script">
          <div style="margin-left:16%">
            <el-transfer
              v-model="SelectScripts"
              filterable
              style="text-align: left; display: inline-block"
              :left-default-checked="[]"
              :right-default-checked="[]"
              :titles="['监控脚本列表', '已选监控脚本']"
              :format="{ noChecked: '${total}', hasChecked: '${checked}/${total}' }"
              :data="Scripts"
            >
              <el-button
                slot="right-footer"
                class="transfer-footer"
                size="small"
                :disabled="disableScriptButton"
                @click="resetScripts"
              >
                重置
              </el-button>
            </el-transfer>
          </div>
        </el-tab-pane>
        <el-tab-pane label="执行命令" name="exec">
          <div>
            <el-input
              v-model="exec"
              type="textarea"
              :rows="13"
              placeholder="请输入shell命令"
              :disabled="execDisable"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
      <div style="margin-left: 40%;margin-top: 3%">
        <el-button
          type="primary"
          @click="relationJobs"
        >
          提交
        </el-button>
        <el-button
          type="primary"
          @click="deleteRuleJobs"
        >
          删除
        </el-button>
      </div>
    </el-dialog>
    <el-drawer
      size="35%"
      :visible.sync="drawer"
      :before-close="handleClose"
      title="报警通知规则"
      style="margin-bottom: 0"
    >
      <template>
        <div class="app-div-search" style="background-color: #EBEEF5">
          <el-row :gutter="24">
            <el-col :span="16"><br></el-col>
            <el-col :span="8" style="text-align: right">
              <el-tooltip
                class="item"
                effect="light"
                content="编辑规则"
                placement="top-end"
              >
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="innerDrawer=true"
                />
              </el-tooltip>
            </el-col>
          </el-row>
        </div>
        <el-table
          :data="send_stages.stages"
          height="850"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column
            label="步骤"
            type="index"
            align="center"
            width="50"
          />
          <el-table-column label="报警发送规则" align="center" width="auto">
            <template slot-scope="scope">
              {{ scope.row.content }}
            </template>
          </el-table-column>
        </el-table>
        <el-drawer
          size="33%"
          title="编辑通知规则"
          :append-to-body="true"
          :before-close="innerHandleClose"
          :visible.sync="innerDrawer"
        >
          <el-form ref="sendModifyStages" :model="sendModifyStages" label-width="100px">
            <el-form-item
              v-for="(stage, index) in sendModifyStages.Stages"
              :key="index"
              :label="index|addIndex"
              :prop="'Stages.' + index + '.value'+ '.value'"
            >
              <el-row type="flex" class="row-bg">
                <el-col :span="16">
                  <el-input
                    v-model="stage.value.interval"
                    maxlength="2"
                    onkeyup="value=value.replace(/[^\d]/g,'')"
                  >
                    <template slot="prepend">监控规则连续触发报警</template>
                    <template slot="append">次</template>
                  </el-input>
                </el-col>
              </el-row>
              <el-row type="flex" class="row-bg">
                <el-col :span="16">
                  <el-input
                    v-model="stage.value.stage"
                    maxlength="2"
                    onkeyup="value=value.replace(/[^\d]/g,'')"
                  >
                    <template slot="prepend">发送通知并周期性执行</template>
                    <template slot="append">次</template>
                  </el-input>
                </el-col>
                <el-col :span="3" style="text-align: right">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    plain
                    circle
                    :disabled="deleteButton"
                    @click.prevent="removeStage(index)"
                  />
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item>
              <el-row :gutter="24">
                <el-col :span="16" :push="3">
                  <el-button type="primary" @click="submitStagesForm('sendModifyStages')">提交</el-button>
                  <el-button @click="addStage">新增</el-button>
                  <el-button @click="innerDrawer=false">取消</el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
        </el-drawer>
      </template>
    </el-drawer>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>
<style>
.transfer-footer {
  margin-left: 70px;
  padding: 6px 12px;
}
</style>
<script>
import {
  CreateMonitorRule,
  DeleteMonitorRule,
  deleteRuleJobs,
  GetMetric,
  GetMetricCn,
  getMonitorProcess,
  GetMonitorRule, getRuleContacts,
  getRuleGroups,
  getRuleJobs,
  ModifyMonitorRule,
  MonitorStages,
  postRuleJobs,
  RelationRuleGroups,
  UpdateStages
} from '@/api/monitor'
import { CommentStatus, DateFormat, getVersion, getYear, levelFilter, statusFilter } from '@/utils/filters'
import { GetAssetGroup } from '@/api/cmdb'
import { getJobScript } from '@/api/job'
import { Users } from '@/api/user'

export default {
  inject: ['reload'],
  filters: {
    FormatRule(val) {
      const date = {
        'default_stage': '默认规则', 'custom_stage': '自定规则',
        'custom_rule': '自定规则', 'default_rule': '默认规则'
      }
      // eslint-disable-next-line no-prototype-builtins
      if (date.hasOwnProperty(val)) {
        val = date[val]
      }
      return val
    },
    addIndex(val) {
      val = val + 1
      return '步骤' + val
    },
    levelFilter,
    DateFormat,
    CommentStatus,
    statusFilter
  },
  data() {
    return {
      list: null,
      content: '',
      key_cn: null,
      listLoading: true,
      buttonDisabled: true,
      dialogVisible: false,
      ruleGroupVisible: false,
      drawer: false,
      innerDrawer: false,
      searchParams: 'rule_name',
      searchData: '',
      deleteButton: false,
      prefixSearch: '搜索规则名称',
      form_title: '',
      formId: '',
      activeName: 'script',
      SelectRuleIds: [],
      options: [],
      send_stages: [],
      sendModifyStages: {
        Stages: [{
          value: { interval: 3, stage: 5 }
        }]
      },
      labels: {
        rule_name: '规则名称', monitor_resource: '监控资源', monitor_item: '监控项',
        monitor_key: '监控指标', status: '规则状态'
      },
      ruleForm: {
        rule_id: null,
        rule_name: null,
        monitor_key: [],
        diff_rule: '=',
        rule_value: null,
        alarm_level: null,
        rule_t: 3,
        channel: 'DingDing',
        stages: [{ 'stage': 1, 'interval': 3 }],
        contacts: '',
        relation: false,
        GroupIds: []
      },
      relation_disable: true,
      groups_disabled: false,
      disableRuleGroupButton: true,
      disableScriptButton: true,
      purposeVisible: false,
      key_unit: '',
      scriptDisabled: false,
      process_list: [],
      asset_groups: [],
      ruleGroupsData: [],
      SelectAssetGroups: [],
      RelationAssetGroups: [],
      AssetGroups: [],
      SourceAssetGroups: [],
      SourceScripts: [],
      RelationScripts: [],
      SelectScripts: [],
      Scripts: [],
      SelectRuleId: null,
      execDisable: false,
      exec: '',
      rules: {
        rule_name: [
          { required: true, message: '请输入规则名称', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
        ],
        monitor_key: [
          { required: true, message: '请填写报警策略', trigger: 'blur' }
        ],
        alarm_level: [
          { required: true, message: '请选择报警等级', trigger: 'change' }
        ],
        diff_rule: [
          { required: true, message: '请选择触发条件', trigger: 'change' }
        ],
        rule_value: [
          { required: true, message: '请输入报警阈值', trigger: 'blur' }
        ]
      },
      systemChildren: [],
      processChildren: [],
      customChildren: [],
      users: {},
      year: getYear(),
      version: getVersion(),
      ruleData: null,
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
    },
    SelectAssetGroups() {
      this.disableRuleGroupButton = this.SelectAssetGroups === this.RelationAssetGroups
    }
  },
  created() {
    const params = { pre_page: this.PerPage, page: this.currentPage }
    if (this.$route.params['type'] !== undefined && this.$route.params['id'] !== undefined) {
      params[this.$route.params['type']] = this.$route.params['id']
    }
    this.getData(params)
    GetMetricCn().then((res) => {
      if (res.success) {
        this.key_cn = res.data
        this.systemChildren = []
        this.customChildren = []
        this.process_list = []
        GetMetric({ resource: 'server', items: 'custom' }).then((res) => {
          if (res.success) {
            if (res.data !== null) {
              res.data.forEach((val, index) => {
                this.customChildren.push({ value: val, label: this.key_cn[val]['KeyCn'] })
              })
            }
          }
        })
        GetMetric({ resource: 'server', items: 'system' }).then((res) => {
          if (res.success) {
            if (res.data !== null) {
              res.data.forEach((val, index) => {
                this.systemChildren.push({ value: val, label: this.key_cn[val]['KeyCn'] })
              })
            }
          }
        })
        getMonitorProcess().then((res) => {
          if (res.success) {
            for (const v of res.data) {
              this.process_list.push(v.process)
            }
          }
        })
        GetMetric({ resource: 'server', items: 'process' }).then((res) => {
          const childless = [{ value: 'system', label: '系统', children: this.systemChildren }]
          if (this.customChildren !== null) {
            childless.push({ value: 'custom', label: '自定义', children: this.customChildren })
          }
          this.options = [{
            value: 'server',
            label: '主机',
            children: childless
          }]
          if (res.success) {
            const children = []
            this.processChildren = []
            if (res.data !== null) {
              res.data.forEach((val, index) => {
                children.push({ value: val, label: this.key_cn[val]['KeyCn'] })
              })
            }
            if (this.process_list !== null) {
              for (const p of this.process_list) {
                this.processChildren.push({ value: p, label: p, children: children })
              }
              this.options.push({ value: 'process', label: '进程', children: this.processChildren })
            }
          }
        })
      }
    })
  },
  methods: {
    submitStagesForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const sendStages = []
          this.sendModifyStages.Stages.forEach((data, index) => {
            let stage
            let interval
            if (data.value.interval === '') {
              interval = 3
            } else {
              interval = parseInt(data.value.interval)
            }
            if (data.value.stage === '') {
              stage = 5
            } else {
              stage = parseInt(data.value.stage)
            }
            sendStages.push({ interval: interval, stage: stage })
          })
          UpdateStages({ rule_id: this.send_stages.rule_id, stages: sendStages }).then((res) => {
            if (res.success) {
              this.innerDrawer = false
              this.drawer = false
              this.$message.success('变更报警发送规则成功')
            }
          }).catch(function(err) {
            if (err.toString().includes('403')) {
              alert('用户无权限进行操作,请联系管理员')
            }
          })
        } else {
          return false
        }
      })
    },
    removeStage(index) {
      if (index !== -1) {
        this.sendModifyStages.Stages.splice(index, 1)
        this.deleteButton = this.sendModifyStages.Stages.length <= 1
      }
    },
    addStage() {
      this.sendModifyStages.Stages.push({ value: { interval: 3, stage: 5 }})
      this.deleteButton = this.sendModifyStages.Stages.length <= 1
    },
    handleChange(value) {
      this.key_unit = this.key_cn[value[[value.length - 1]]]['KeyUnit']
    },
    handleGroupChange() {
      this.relation_disable = this.ruleForm.GroupIds.length <= 0
    },
    createRule() {
      this.dialogVisible = true
      this.form_title = '创建报警规则'
      this.formId = 'createRule'
      this.key_unit = ''
      GetAssetGroup().then((res) => {
        if (res.success) {
          this.asset_groups = res.data
        }
      })
    },
    async modifyRule(rule_id) {
      this.dialogVisible = true
      this.form_title = '修改报警规则'
      this.formId = 'modifyRule'
      this.ruleForm.rule_id = rule_id
      this.relation_disable = true
      this.groups_disabled = true
      await GetMonitorRule({ rule_ids: rule_id }).then((res) => {
        if (res.success) {
          this.ruleForm.rule_name = res.data[0].rule_name
          this.ruleForm.monitor_key = [res.data[0].monitor_resource, res.data[0].monitor_item, res.data[0].monitor_key]
          this.ruleForm.diff_rule = res.data[0].diff_rule
          this.ruleForm.rule_value = res.data[0].rule_value
          this.ruleForm.alarm_level = res.data[0].alarm_level
          this.ruleForm.rule_t = res.data[0].rule_t
          this.key_unit = this.key_cn[res.data[0].monitor_key]['KeyUnit']
        }
      })
      await getRuleContacts({ rule_id: rule_id, channel: this.ruleForm.channel }).then((res) => {
        if (res.success) {
          this.ruleForm.contacts = res.data['address']
        }
      })
    },
    listRuleGroups(rule_id) {
      this.ruleGroupVisible = true
      if (rule_id !== undefined) {
        this.SelectRuleIds.push(rule_id)
      }
      GetAssetGroup().then((res) => {
        if (res.success) {
          this.SourceAssetGroups = []
          res.data.forEach((v, index) => {
            this.SourceAssetGroups.push({
              key: v['group_id'],
              label: v['group_name'],
              disabled: false
            })
          })
          this.AssetGroups = this.SourceAssetGroups
        } else {
          this.ruleGroupVisible = false
        }
      })
      getRuleGroups({ rule_ids: this.SelectRuleIds.join(',') }).then((res) => {
        if (res.success) {
          if (res.data === null) {
            res.data = []
          }
          this.RelationAssetGroups = res.data
          this.SelectAssetGroups = res.data
        } else {
          this.ruleGroupVisible = false
        }
      })
    },
    relationRuleGroups() {
      RelationRuleGroups({
        rule_ids: this.SelectRuleIds,
        group_ids: this.SelectAssetGroups
      }).then((res) => {
        if (res.success) {
          this.ruleGroupVisible = false
          this.RuleGroupClose()
          this.$message.success('监控规则关联资源组成功')
        } else {
          this.$message.error('监控规则关联资源组失败')
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    relationJobs() {
      let script_id = ''
      if (this.SelectScripts.length > 0) {
        script_id = this.SelectScripts[0]
      }
      postRuleJobs({
        rule_id: this.selectRuleId,
        exec: this.exec,
        script_id: script_id
      }).then((res) => {
        if (res.success) {
          this.purposeVisible = false
          this.$message.success('故障自愈设置成功')
        } else {
          this.$message.error('故障自愈设置失败')
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    handleClose() {
      this.send_stages = {}
      this.SelectScripts = []
      this.drawer = false
    },
    handleDialogClose() {
      this.resetForm()
      this.SelectScripts = []
      this.dialogVisible = false
    },
    RuleGroupClose() {
      this.SourceAssetGroups = []
      this.RelationAssetGroups = []
      this.AssetGroups = []
      this.SelectAssetGroups = []
      this.SelectRuleIds = []
      this.ruleGroupVisible = false
      this.groups_disabled = false
    },
    async relationRuleJob(rule_id) {
      this.purposeVisible = true
      this.selectRuleId = rule_id
      await getJobScript({ not_page: true, purpose: 'monitor' }).then((res) => {
        if (res.success) {
          this.SourceScripts = []
          res.data.forEach((v, index) => {
            this.SourceScripts.push({
              key: v['script_id'],
              label: v['script_name'],
              disabled: false
            })
          })
          this.Scripts = this.SourceScripts
        }
      })
      await getRuleJobs({ not_page: true, rule_ids: rule_id }).then((res) => {
        if (res.success) {
          this.SelectScripts = []
          this.RelationScripts = []
          this.exec = ''
          if (res.data[0].script_id !== 'None') {
            this.execDisable = true
            this.RelationScripts = [res.data[0].script_id]
          }
          if (res.data[0].exec !== 'None') {
            this.scriptDisabled = true
            this.exec = res.data[0].exec
          }
          this.SelectScripts = this.RelationScripts
        }
      })
    },
    resetRuleGroup() {
      this.AssetGroups = this.SourceAssetGroups
      this.SelectAssetGroups = this.RelationAssetGroups
    },
    resetScripts() {
      this.Scripts = this.SourceScripts
      this.SelectScripts = this.RelationScripts
    },
    innerHandleClose(done) {
      this.getStages({ rule_id: this.send_stages['rule_id'] })
      this.sendModifyStages.Stages = []
      done()
    },
    getStages(params) {
      MonitorStages(params).then((res) => {
        if (res.success) {
          this.send_stages = { rule_id: params['rule_id'], stages: res.data }
          this.sendModifyStages.Stages = []
          res.data.forEach((v, index) => {
            this.sendModifyStages.Stages.push({ value: { interval: v.data.interval, stage: v.data.stage }})
          })
          this.deleteButton = this.sendModifyStages.Stages.length <= 1
          this.drawer = true
        }
      })
    },
    deleteRule(rule_ids) {
      this.$confirm('此操作将删除监控规则, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        DeleteMonitorRule({ rule_ids: rule_ids }).then((res) => {
          if (res.success) {
            this.$message.success('删除监控规则成功')
            this.onSearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    deleteRuleJobs() {
      this.$confirm('此操作将删除故障自愈, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRuleJobs({ rule_id: this.selectRuleId }).then((res) => {
          if (res.success) {
            this.$message.success('删除故障自愈成功')
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    async createRuleForm(formName) {
      await this.$refs[formName].validate((valid) => {
        if (valid) {
          const data = {
            rule_name: this.ruleForm.rule_name,
            monitor_resource: this.ruleForm.monitor_key[0],
            monitor_item: this.ruleForm.monitor_key[1],
            monitor_key: this.ruleForm.monitor_key[2],
            diff_rule: this.ruleForm.diff_rule,
            rule_value: parseFloat(this.ruleForm.rule_value),
            rule_t: parseInt(this.ruleForm.rule_t),
            alarm_level: this.ruleForm.alarm_level,
            stages: [{ 'stage': 1, 'interval': 3 }]
          }
          if (this.ruleForm.channel !== '' && this.ruleForm.contacts !== '') {
            data['channels'] = [{
              channel: this.ruleForm.channel,
              contacts: this.ruleForm.contacts
            }]
          }
          if (this.ruleForm.GroupIds !== null) {
            data['group_ids'] = this.ruleForm.GroupIds
            data['relation'] = this.ruleForm.relation
          }
          CreateMonitorRule(data).then((res) => {
            if (res.success) {
              this.$message.success('创建监控规则成功')
              this.onSearch()
              this.dialogVisible = false
            }
          }).catch(function(err) {
            if (err.toString().includes('403')) {
              alert('用户无权限进行操作,请联系管理员')
            }
          })
        } else {
          return false
        }
      })
    },
    async modifyRuleForm(formName) {
      await this.$refs[formName].validate((valid) => {
        if (valid) {
          const data = {
            rule_id: this.ruleForm.rule_id,
            rule_name: this.ruleForm.rule_name,
            monitor_resource: this.ruleForm.monitor_key[0],
            monitor_item: this.ruleForm.monitor_key[1],
            monitor_key: this.ruleForm.monitor_key[2],
            diff_rule: this.ruleForm.diff_rule,
            rule_value: parseFloat(this.ruleForm.rule_value),
            rule_t: parseInt(this.ruleForm.rule_t),
            alarm_level: this.ruleForm.alarm_level
          }
          if (this.ruleForm.channel !== '' && this.ruleForm.contacts !== '') {
            data['channels'] = [{
              channel: this.ruleForm.channel,
              contacts: this.ruleForm.contacts
            }]
          }
          if (this.ruleForm.GroupIds !== null) {
            data['group_ids'] = this.ruleForm.GroupIds
            data['relation'] = this.ruleForm.relation
          }
          ModifyMonitorRule(data).then((res) => {
            if (res.success) {
              this.$message.success('修改监控规则成功')
              this.onSearch()
              this.dialogVisible = false
            }
          }).catch(function(err) {
            if (err.toString().includes('403')) {
              alert('用户无权限进行操作,请联系管理员')
            }
          })
        } else {
          return false
        }
      })
    },
    changeRuleStatus(rule_id, status) {
      ModifyMonitorRule({ rule_id: rule_id, status: status }).then((res) => {
        if (res.success) {
          this.reload()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    handleSelectionChange(val) {
      this.buttonDisabled = val.length <= 0
      // 其它方法可以处理已选择的行数据
      if (val.length > 0) {
        val.forEach((v, index) => {
          this.SelectRuleIds.push(v['rule_id'])
        })
      }
    },
    onSearch() {
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    async getData(params) {
      this.listLoading = true
      await Users().then((res) => {
        if (res.success) {
          if (res.data !== null) {
            for (const v of res.data) {
              this.users[v.user_id] = v.nick_name
            }
          }
        }
      })
      GetMonitorRule(params).then((res) => {
        if (res.success) {
          if (res.data !== null) {
            this.list = res.data
            this.totalCount = res.pages.totalCount
            for (const v of this.list) {
              v['create_user_name'] = this.users[v.create_user]
              v['update_user_name'] = this.users[v.update_user]
            }
          }
          this.listLoading = false
        }
      })
    },
    activeTab() {
      if (this.SelectScripts !== null) {
        this.Scripts = this.SourceScripts
        this.execDisable = true
      } else {
        if (this.exec !== '') {
          this.Scripts = []
        } else {
          this.execDisable = false
          this.Scripts = this.SourceScripts
        }
      }
      if (this.exec !== '') {
        this.execDisable = false
      } else {
        if (this.SelectScripts.length > 0) {
          this.Scripts = this.SourceScripts
          this.execDisable = true
        } else {
          this.execDisable = false
          this.Scripts = this.SourceScripts
        }
      }
    },
    resetForm() {
      this.ruleForm.diff_rule = ''
      this.ruleForm.rule_value = ''
      this.ruleForm.rule_t = 3
      this.$refs['ruleForm'].clearValidate()
      this.$refs['ruleForm'].resetFields()
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
      this.currentPage = page
      // 切换页码时，要获取每页显示的条数
      const params = { pre_page: this.PerPage, page: this.currentPage }
      if (this.searchData !== null && this.searchData !== '' && this.searchData !== undefined) {
        params[this.searchParams] = this.searchData
      }
      this.getData(params)
    }
  }
}
</script>
