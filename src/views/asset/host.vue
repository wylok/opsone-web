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
          <el-button v-if="activeName!=='offline'" round :disabled="buttonDisabled" @click="jobExecHosts">命令执行</el-button>
          <el-button v-if="activeName!=='offline'" round :disabled="buttonDisabled" @click="jobFileHosts">文件分发</el-button>
          <el-button v-if="activeName!=='offline'" round :disabled="buttonDisabled" @click="jobScriptHosts">脚本执行</el-button>
          <el-button round :disabled="buttonDisabled" @click="reclaimHosts">设备回收</el-button>
          <el-button v-if="list.length>0" round @click="downloadExcel">资产导出</el-button>
          <el-button v-else disabled round>资产导出</el-button>
          <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
        </el-col>
      </el-row>
    </div>
    <div class="app-div">
      <el-tabs
        v-model="activeName"
        type="border-card"
        @tab-click="getData({ host_type: activeName,pre_page: 10, page: 1 })"
      >
        <el-tab-pane v-for="(k,v) in assets" :key="k" :label="k" :name="v">
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
            <el-table-column label="主机名称" align="center" width="160" prop="host_name" sortable show-overflow-tooltip>
              <template slot-scope="scope">
                <el-tooltip :content="scope.row.host['nick_name']">
                  <router-link
                    :to="{ name:'hostDetail', params: { host_id: scope.row.host['host_id'] } }"
                  >
                    <el-link type="primary">{{ scope.row.host['host_name'] }}</el-link>
                  </router-link>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="制造商" width="auto" align="center" prop="manufacturer" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.host['manufacturer'] }}
              </template>
            </el-table-column>
            <el-table-column label="CPU" width="60" align="center">
              <template slot-scope="scope">
                {{ scope.row.host['cpu'] }}
              </template>
            </el-table-column>
            <el-table-column label="CPU使用率" width="120" align="center" prop="cpu_usage" sortable>
              <template slot-scope="scope">
                <el-link
                  v-if="verifyMonitor(scope.row.host['host_id'],'cpu_usage')"
                  :type="monitorData[scope.row.host['host_id']]['cpu_usage'].toFixed(1) | MonitorFilter"
                  @click.native="showMonitorDetail({ host_id: scope.row.host['host_id'],
                                                     host_name: scope.row.host['host_name'], key: 'cpu_usage',
                                                     status: monitorData[scope.row.host['host_id']]['cpu_usage'].toFixed(1)
                  })"
                >
                  {{ monitorData[scope.row.host['host_id']]['cpu_usage'].toFixed(1) }}%
                </el-link>
                <el-link v-else disabled>无数据</el-link>
              </template>
            </el-table-column>
            <el-table-column label="内存" width="70" align="center">
              <template slot-scope="scope">
                {{ scope.row.host['memory'] / 1000 / 1024 / 1024 | Round }}G
              </template>
            </el-table-column>
            <el-table-column label="内存使用率" width="120" align="center" prop="mem_pused" sortable>
              <template slot-scope="scope">
                <el-link
                  v-if="verifyMonitor(scope.row.host['host_id'],'mem_pused')"
                  :type="monitorData[scope.row.host['host_id']]['mem_pused'].toFixed(1) | MonitorFilter"
                  @click.native="showMonitorDetail({ host_id: scope.row.host['host_id'],
                                                     host_name: scope.row.host['host_name'],
                                                     key: 'mem_pused',
                                                     status: monitorData[scope.row.host['host_id']]['mem_pused'].toFixed(1)
                  })"
                >
                  {{ monitorData[scope.row.host['host_id']]['mem_pused'].toFixed(1) }}%
                </el-link>
                <el-link v-else disabled>无数据</el-link>
              </template>
            </el-table-column>
            <el-table-column label="磁盘" width="100" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.host['disk'] / 1000 / 1024 / 1024 < 1000">
                  {{ scope.row.host['disk'] / 1000 / 1024 / 1024| Round }}G
                </span>
                <span v-else>{{ scope.row.host['disk'] / 1000 / 1000 / 1024 / 1024| Round }}T</span>
              </template>
            </el-table-column>
            <el-table-column label="磁盘(/)使用率" width="130" align="center" prop="disk_usage" sortable>
              <template slot-scope="scope">
                <el-link
                  v-if="verifyMonitor(scope.row.host['host_id'],'disk_usage')"
                  :type="monitorData[scope.row.host['host_id']]['disk_usage'].toFixed(1) | MonitorFilter"
                  @click.native="showMonitorDetail({ host_id: scope.row.host['host_id'],
                                                     host_name: scope.row.host['host_name'],
                                                     key: 'disk_usage',
                                                     status: monitorData[scope.row.host['host_id']]['disk_usage'].toFixed(1)
                  })"
                >
                  {{ monitorData[scope.row.host['host_id']]['disk_usage'].toFixed(1) }}%
                </el-link>
                <el-link v-else disabled>无数据</el-link>
              </template>
            </el-table-column>
            <el-table-column label="操作系统" width="auto" align="center" prop="platform" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.host['platform'] }}{{ scope.row.host['platform_version'] }}
              </template>
            </el-table-column>
            <el-table-column label="主机IP" width="120" align="center" sortable show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row.net[0]['ip'] }}
              </template>
            </el-table-column>
            <el-table-column label="主机状态" width="80" align="center" prop="health">
              <template slot-scope="scope">
                <span v-if="verifyMonitor(scope.row.host['host_id'])">
                  <router-link
                    v-if="scope.row.health==='fault'"
                    :to="{ name:'alarm_history_id',params: {type: 'host_id',id: alarm_history_host_id} }"
                  >
                    <el-tag :type="scope.row.health | statusFilter">{{ scope.row.health|healthFilter }}</el-tag>
                  </router-link>
                  <el-tag v-else :type="scope.row.health | statusFilter">{{ scope.row.health|healthFilter }}</el-tag>
                </span>
                <span v-else>
                  <el-tag v-if="scope.row.online===false" type="info">离线</el-tag>
                  <el-tag v-else type="info">未知</el-tag>
                </span>
              </template>
            </el-table-column>
            <el-table-column label="所属IDC" width="auto" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                <span v-if="scope.row.idc !== null">{{ scope.row.idc['idc_cn'] }}</span>
                <span v-else>未知</span>
              </template>
            </el-table-column>
            <el-table-column label="WebShell" width="90px" align="center">
              <template slot-scope="scope">
                <router-link
                  v-if="scope.row.host['pool_id']!==0"
                  :to="{ name:'AssetWebShell', params: { asset_id: scope.row.host.host_id, asset_name: scope.row.host.host_name, asset_type: 'server' }}"
                >
                  <el-tag v-if="scope.row.online===true" effect="plain" type="danger" style="margin-left: 1%">bash</el-tag>
                  <el-tag v-else effect="plain" type="info" style="margin-left: 1%">bash</el-tag>
                </router-link>
                <el-tag v-else effect="plain" type="info" style="margin-left: 1%">bash</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="200px">
              <template slot-scope="scope">
                <el-button-group>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="监控"
                    placement="top-end"
                  >
                    <el-button
                      v-if="verifyMonitor(scope.row.host['host_id'])"
                      type="primary"
                      icon="el-icon-monitor"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="drawerMonitor(scope.row.host['host_id'],scope.row.host['host_name'],true)"
                    />
                    <el-button
                      v-else
                      type="info"
                      icon="el-icon-monitor"
                      size="mini"
                      circle
                      plain
                      disabled
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="配置"
                    placement="top-end"
                  >
                    <el-button
                      v-if="activeName!=='offline'"
                      type="warning"
                      icon="el-icon-connection"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="assetModify(scope.row)"
                    />
                    <el-button
                      v-else
                      type="warning"
                      icon="el-icon-connection"
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
                      v-if="activeName!=='offline'"
                      type="success"
                      icon="el-icon-position"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="jobExecHost(scope.row.host)"
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
                      v-if="activeName!=='offline'"
                      type="primary"
                      icon="el-icon-document-copy"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="jobFileHost(scope.row.host)"
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
                      v-if="activeName!=='offline'"
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
                    content="回收"
                    placement="top-end"
                  >
                    <el-button
                      type="danger"
                      icon="el-icon-s-help"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="reclaimHost(scope.row.host['host_id'])"
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
      <el-dialog
        title="服务器资源回收"
        :visible.sync="serverDialogVisible"
        width="30%"
        :before-close="handleClose"
      >
        <span>服务器资源将被回收,请确认!</span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="serverDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="reclaimServerPool">确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        :title="DialogTitle"
        :visible.sync="dialogVisible"
        width="65%"
      >
        <el-row style="background:#fff;padding:8px 8px 0;margin-bottom:16px;">
          <line-chart :chart-data="lineChartData" height="300px" />
        </el-row>
      </el-dialog>
      <el-dialog
        title="资产配置变更"
        :before-close="handleDialogClose"
        :visible.sync="assetModifyVisible"
        width="50%"
      >
        <el-form
          ref="assetModifyForm"
          :model="assetModifyForm"
          :rules="assetModifyRules"
          label-width="100px"
          size="medium"
        >
          <el-row :gutter="24">
            <el-col :span="8" :offset="2">
              <el-form-item label="设备别名" prop="nick_name" autocomplete="on">
                <el-input v-model="assetModifyForm.nick_name" style="width: 220px" />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="2">
              <el-form-item label="设备类型" prop="host_type" autocomplete="on">
                <el-select v-model="assetModifyForm.host_type" placeholder="请选择" style="width: 220px">
                  <el-option
                    v-for="item in assetOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="8" :offset="2">
              <el-form-item label="设备标签" prop="asset_tag" autocomplete="on">
                <el-input v-model="assetModifyForm.asset_tag" style="width: 220px" />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="2">
              <el-form-item label="所属IDC" prop="idc_id" autocomplete="on">
                <el-select v-model="assetModifyForm.idc_id" placeholder="请选择" style="width: 220px">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="8" :offset="2">
              <el-form-item label="IPMI" prop="ipmi" autocomplete="on">
                <el-input v-model="assetModifyForm.ipmi" style="width: 220px" />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="2">
              <el-form-item label="所在机柜" prop="cabinet" autocomplete="on">
                <el-input v-model="assetModifyForm.cabinet" style="width: 220px" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="24">
            <el-col :span="8" :offset="2">
              <el-form-item label="采购时间" prop="buy_time" autocomplete="on">
                <el-date-picker
                  v-model="assetModifyForm.buy_time"
                  type="datetime"
                  placeholder="选择日期时间"
                  :default-time="assetModifyForm.buy_time"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="2">
              <el-form-item label="过保时间" prop="expired_time" autocomplete="on">
                <el-date-picker
                  v-model="assetModifyForm.expired_time"
                  type="datetime"
                  placeholder="选择日期时间"
                  :default-time="assetModifyForm.expired_time"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item>
            <el-col :span="12" :push="8">
              <el-button
                type="primary"
                @click="changeAssetConf('assetModifyForm')"
              >
                提交
              </el-button>
              <el-button @click="resetForm('assetModifyForm')">重置</el-button>
            </el-col>
          </el-form-item>
        </el-form>
      </el-dialog>
      <el-dialog
        title="新增主机进程监控"
        :visible.sync="addProcessVisible"
        width="30%"
        :before-close="addProcessClose"
      >
        <el-input v-model="addProcess" type="textarea" :rows="2" placeholder="请输入进程名称,多个进程以逗号分割" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="addProcessClose">取 消</el-button>
          <el-button v-if="addProcess!==null" type="primary" @click="addProcessSubmit">确 定</el-button>
          <el-button v-else disable>确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="配置主机进程监控"
        :visible.sync="processDialogVisible"
        width="30%"
        :before-close="DialogClose"
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
              {{ scope.row.value }}
            </template>
          </el-table-column>
        </el-table>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="addProcessVisible=true">新增</el-button>
          <el-button type="primary" @click="deleteProcessSubmit">删除</el-button>
        </span>
      </el-dialog>
      <el-drawer
        size="98%"
        :visible.sync="drawer"
        :before-close="handleClose"
        :title="DrawerTitle"
        style="margin-bottom: 0"
      >
        <template>
          <el-divider content-position="right">
            <router-link :to="{ name:'rule_list' }">
              >>
              <el-link>设置监控报警规则</el-link>
            </router-link>
            <span>  |  </span>
            <router-link :to="{ name:'alarm_history_id',params: {type: 'host_id',id: alarm_history_host_id} }">
              >>
              <el-link>查看主机报警历史</el-link>
            </router-link>
          </el-divider>
          <el-row :gutter="24" style="margin-left: 5px">
            <el-col :span="1.1">
              <el-button v-if="processValue!==''" plain @click="selectMonitorDetail('process',30)">近30分钟</el-button>
              <el-button v-else-if="customValue===true" plain @click="selectMonitorDetail('custom',30)">近30分钟
              </el-button>
              <el-button v-else plain @click="selectMonitorDetail('server',30)">近30分钟</el-button>
            </el-col>
            <el-col :span="1.1">
              <el-button v-if="processValue!==''" plain @click="selectMonitorDetail('process', 60)">近1小时</el-button>
              <el-button v-else-if="customValue===true" plain @click="selectMonitorDetail('custom',60)">近1小时
              </el-button>
              <el-button v-else plain @click="selectMonitorDetail('server',60)">近1小时</el-button>
            </el-col>
            <el-col :span="1.1">
              <el-button v-if="processValue!==''" plain @click="selectMonitorDetail('process', 180)">近3小时</el-button>
              <el-button v-else-if="customValue===true" plain @click="selectMonitorDetail('custom',180)">近3小时
              </el-button>
              <el-button v-else plain @click="selectMonitorDetail('server',180)">近3小时</el-button>
            </el-col>
            <el-col :span="1.1">
              <el-button v-if="processValue!==''" plain @click="selectMonitorDetail('process', 360)">近6小时</el-button>
              <el-button v-else-if="customValue===true" plain @click="selectMonitorDetail('custom',360)">近6小时
              </el-button>
              <el-button v-else plain @click="selectMonitorDetail('server',360)">近6小时</el-button>
            </el-col>
            <el-col :span="1.1">
              <el-button v-if="processValue!==''" plain @click="selectMonitorDetail('process', 720)">近12小时</el-button>
              <el-button v-else-if="customValue===true" plain @click="selectMonitorDetail('custom',720)">近12小时
              </el-button>
              <el-button v-else plain @click="selectMonitorDetail('server',720)">近12小时</el-button>
            </el-col>
            <el-col :span="1.1">
              <el-button v-if="processValue!==''" plain @click="selectMonitorDetail('process', 1440)">近一天</el-button>
              <el-button v-else-if="customValue===true" plain @click="selectMonitorDetail('custom',1440)">近一天
              </el-button>
              <el-button v-else plain @click="selectMonitorDetail('server',1440)">近一天</el-button>
            </el-col>
            <el-col :span="7.5">
              <div>
                <span>选择范围:</span>
                <el-date-picker
                  v-model="SelectDateTime"
                  type="datetimerange"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :default-time="['08:00:00', '12:00:00']"
                />
                <el-button
                  icon="el-icon-search"
                  circle
                  plain
                  size="small"
                  style="margin-left:1px"
                  @click="selectMonitorDetail(resource,0)"
                />
              </div>
            </el-col>
            <el-col :span="3.5">
              <div>
                <el-select
                  v-model="processValue"
                  clearable
                  placeholder="查看进程监控"
                  @change="selectMonitorDetail('process',60)"
                >
                  <el-option
                    v-for="item in processList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <el-tooltip content="进程监控配置" placement="top">
                  <el-button
                    icon="el-icon-edit"
                    circle
                    plain
                    size="small"
                    style="margin-left:1px"
                    @click="processDialogVisible=true"
                  />
                </el-tooltip>
              </div>
            </el-col>
            <el-col :span="2.5">
              <div style="margin-top: 6%">
                <el-switch
                  v-model="customValue"
                  active-text="查看自定义指标"
                  active-color="#13ce66"
                  inactive-color="#909399"
                />
              </div>
            </el-col>
            <el-col :span="2.5">
              <div style="margin-top: 12%">
                <el-link type="primary" @click="processTop">查看进程top</el-link>
              </div>
            </el-col>
          </el-row>
          <div style="height: 850px;margin-top: 10px">
            <el-table
              :data="DrawerChartData"
              height="750px"
              stripe
              :show-header="false"
              style="width: 100%"
            >
              <el-table-column align="center" width="auto">
                <template slot-scope="scope">
                  <distribution-of-electricity :chart-data="scope.row" height="250px" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-drawer>
      <el-dialog
        title="进程CPU/内存使用率"
        :visible.sync="topVisible"
        :before-close="DialogClose"
        width="45%"
      >
        <div class="chart-wrapper">
          <div v-if="cpuChart.expectedData.length>0">
            <bar-chart :chart-data="cpuChart" />
          </div>
          <div v-if="memChart.expectedData.length>0">
            <bar-chart :chart-data="memChart" />
          </div>
        </div>
      </el-dialog>
      <el-dialog
        title="命令执行作业"
        :before-close="cancelSubmit"
        :visible.sync="jobExecVisible"
        width="45%"
      >
        <div>
          <el-form ref="jobExecForm" :model="jobExecForm" :rules="jobExecRules" label-width="100px" size="medium">
            <div style="margin-bottom: 20px;margin-left:105px"><span style="font-weight:bolder">已选择服务器:</span>
              <el-tag
                v-for="s in jobServerNames"
                :key="s"
                type="primary"
                effect="plain"
              >
                {{ s }}
              </el-tag>
            </div>
            <el-row :gutter="24">
              <el-col :span="20" :offset="2" style="margin-left: 70px">
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
        </div>
      </el-dialog>
      <el-dialog
        title="文件分发作业"
        :before-close="cancelSubmit"
        :visible.sync="jobFileVisible"
        width="45%"
      >
        <div>
          <el-form ref="jobFileForm" :model="jobFileForm" :rules="jobFileRules" label-width="100px" size="medium">
            <div style="margin-bottom: 10px;margin-left:100px"><span style="font-weight:bolder">已选择服务器:</span>
              <el-tag
                v-for="s in jobServerNames"
                :key="s"
                type="primary"
                effect="plain"
              >
                {{ s }}
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
                <div class="el-upload__text">将文件拖到此处或<em>点击上传</em></div>
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
        </div>
      </el-dialog>
      <el-dialog
        title="脚本执行作业"
        :before-close="handleClose"
        :visible.sync="scriptVisible"
        width="45%"
      >
        <div>
          <el-form ref="jobRunForm" :model="jobScriptForm" label-width="100px" size="medium">
            <div style="margin-bottom: 10px;margin-left:100px"><span style="font-weight:bolder">已选服务器:</span>
              <el-tag
                v-for="s in ScriptHostNames"
                :key="s"
                type="primary"
                effect="plain"
              >
                {{ s }}
              </el-tag>
            </div>
            <el-row :gutter="24">
              <el-col :span="30" :offset="2">
                <span style="font-weight:bolder;padding-left: 30px;margin-right:10px">作业脚本</span>
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
        </div>
      </el-dialog>
    </div>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>

import { getIdc, getServer, putServer, PutServerPool } from '@/api/cmdb'
import {
  addProcess,
  deleteProcess,
  GetMetric,
  GetMetricCn,
  getProcess,
  getProcessTop,
  MonitorConverge,
  MonitorDetail
} from '@/api/monitor'
import moment from 'moment'
import { DateFormat, getVersion, getYear, Round } from '@/utils/filters'
import { AlarmColor, FormatMonitorUnit, Host } from '@/utils/kits'
import LineChart from '@/components/echarts/LineChart'
import DistributionOfElectricity from '@/components/echarts/DistributionOfElectricityChart'
import { getJobScript, postJobExec, postJobFileSend, runJobScript, uploadFileUrl } from '@/api/job'
import store from '@/store'
import BarChart from '@/components/echarts/BarChart'

export default {
  inject: ['reload'],
  components: {
    DistributionOfElectricity,
    LineChart,
    BarChart
  },
  filters: {
    statusFilter(status) {
      const statusMap = {
        Running: 'success',
        Unknown: 'info',
        Close: 'danger',
        health: 'success',
        unknown: 'info',
        fault: 'danger'
      }
      return statusMap[status]
    },
    MonitorFilter(val) {
      let status = 'primary'
      if (val >= 65 && val <= 85) {
        status = 'warning'
      }
      if (val > 85) {
        status = 'danger'
      }
      return status
    },
    healthFilter(status) {
      const statusMap = {
        unknown: '未知',
        health: '健康',
        fault: '故障'
      }
      return statusMap[status]
    },
    Round,
    DateFormat,
    AlarmColor
  },
  data() {
    return {
      host_id: this.$route.params['host_id'],
      list: null,
      upload_file_url: uploadFileUrl() + '?token=' + store.getters.token,
      content: null,
      monitorData: {},
      options: [{ value: 'None', label: '未知' }],
      assetOptions: [{ value: 'physical', label: '物理机' }, { value: 'vm', label: '虚拟机' }],
      assets: { 'physical': '物理机', 'vm': '虚拟机', 'offline': '离线主机' },
      activeName: 'physical',
      DialogTitle: '监控详情',
      DrawerTitle: '',
      processList: [],
      SelectDateTime: '',
      SelectHostId: '',
      SelectHostName: '',
      processValue: '',
      customValue: false,
      listLoading: true,
      dialogVisible: false,
      assetModifyVisible: false,
      serverDialogVisible: false,
      processDialogVisible: false,
      jobExecVisible: false,
      jobFileVisible: false,
      addProcessVisible: false,
      scriptVisible: false,
      resource: 'server',
      drawer: false,
      buttonDisabled: true,
      addProcess: null,
      key_cn: null,
      alarm_history_host_id: '',
      DetailKey: null,
      lineChartData: { expectedData: [], tagData: [], legendName: '', FormatData: '' },
      cpuChart: { expectedData: [], tagData: [], legendName: '', FormatData: '%' },
      memChart: { expectedData: [], tagData: [], legendName: '', FormatData: '%' },
      prefixSearch: '搜索主机名称',
      labels: { host_name: '主机名称', ip: '主机IP', host_id: '主机ID', asset_tag: '资产标签', host_type: '主机型号', sn: '主机SN', status: '主机状态' },
      DrawerChartData: [],
      multipleSelection: [],
      ReclaimServers: [],
      jobServerNames: [],
      scriptIds: [],
      searchData: null,
      searchParams: 'host_name',
      asset_data: null,
      asset_group_id: null,
      assetModifyForm: {
        host_id: null,
        nick_name: null,
        host_type: null,
        asset_tag: null,
        idc_id: null,
        ipmi: null,
        cabinet: null,
        buy_time: null,
        expired_time: null
      },
      assetModifyRules: {
        host_type: [
          { required: true, message: '设备类型不能为空', trigger: 'change' }
        ]
      },
      jobExecForm: {
        host_ids: [],
        exec: null,
        cron: false,
        run_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      jobExecRules: {
        exec: [
          { required: true, message: 'shell命令不能为空', trigger: 'change' }
        ]
      },
      jobFileForm: {
        host_ids: [],
        dst_path: null,
        cron: false,
        job_id: null,
        send_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      jobFileRules: {
        dst_path: [
          { required: true, message: '目标路径不能为空', trigger: 'change' }
        ]
      },
      jobScriptForm: {
        host_ids: [],
        script_id: null,
        cron: false,
        run_time: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      fileList: [],
      fileInfo: {},
      topVisible: false,
      ScriptHostNames: [],
      download_file_url: 'http://' + Host() + '/api/v1/cmdb/servers/excel?host_type=' + this.activeName,
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
      if (this.labels[val] === undefined) {
        this.prefixSearch = '搜索主机名称'
      } else {
        this.prefixSearch = '搜索' + this.labels[val]
      }
    },
    activeName(val) {
      this.download_file_url = 'http://' + Host() + '/api/v1/cmdb/servers/excel?host_type=' + val
    }
  },
  created() {
    this.options = [{ value: 'None', label: '未知' }]
    getIdc().then((res) => {
      if (res.success) {
        if (res.data !== null) {
          for (const d of res.data) {
            this.options.push({
              value: d['idc_id'],
              label: d['idc_cn']
            })
          }
        }
      }
    })
    GetMetricCn().then((res) => {
      if (res.success) {
        this.key_cn = res.data
      }
    })
    GetMetric({ resource: 'server', items: 'system,custom' }).then((res) => {
      if (res.success) {
        this.DetailKey = res.data
      }
    })
    this.searchData = null
    const params = { host_type: this.activeName, pre_page: this.PerPage, page: this.currentPage }
    if (this.$route.params['host_id'] !== undefined) {
      params['host_ids'] = this.$route.params['host_id']
      this.searchParams = 'host_ids'
      this.searchData = this.$route.params['host_id']
    }
    if (this.$route.params['asset_group_id'] !== undefined) {
      params['asset_group_id'] = this.$route.params['asset_group_id']
      this.searchParams = 'asset_group_id'
      this.asset_group_id = this.$route.params['asset_group_id']
    }
    this.getData(params)
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.buttonDisabled = this.multipleSelection.length <= 1
      this.buttonDisabled = false
      // 其它方法可以处理已选择的行数据
    },
    verifyOnline() {
      for (const v of this.multipleSelection) {
        if (v['online'] === false && this.buttonDisabled === false) {
          this.$message.error('批量操作不能包含离线主机')
          this.multipleSelection = []
          this.buttonDisabled = true
          break
        }
      }
    },
    onSearch() {
      const params = { host_type: this.activeName, pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== null) {
        params[this.searchParams] = this.searchData
      } else {
        if (this.searchParams !== '' && this.asset_group_id !== null) {
          params[this.searchParams] = this.asset_group_id
        }
      }
      if (this.searchData === undefined || this.searchData === '') {
        this.searchData = null
      }
      this.currentPage = 1
      this.getData(params)
    },
    // 验证监控数据是否存在
    verifyMonitor(host_id, key) {
      if (this.monitorData[host_id] !== undefined) {
        if (key != null) {
          if (this.monitorData[host_id][key] !== undefined) {
            return true
          }
        } else {
          return true
        }
      }
      return false
    },
    // 通过不同颜色表示监控严重程度
    MonitorFilter(val) {
      let status = 'primary'
      if (val >= 65 && val <= 85) {
        status = 'warning'
      }
      if (val > 85) {
        status = 'danger'
      }
      return status
    },
    selectMonitorDetail(resource, duration) {
      let start_time = ''
      let end_time = ''
      this.resource = resource
      if (duration === 0) {
        const dt = (this.SelectDateTime[1] - this.SelectDateTime[0]) / 1000 / 60
        if (dt < 5) {
          this.$message.error('选择时间间隔不能小于5分钟')
          this.SelectDateTime = ''
        } else {
          start_time = this.SelectDateTime[0]
          end_time = this.SelectDateTime[1]
        }
      }
      if (resource === 'server') {
        this.getMonitorDetail(this.SelectHostId, resource, 'system', duration, start_time, end_time)
      }
      if (resource === 'custom') {
        this.getMonitorDetail(this.SelectHostId, 'server', resource, duration, start_time, end_time)
      }
      if (resource === 'process' && this.processValue !== '') {
        this.getMonitorDetail(this.SelectHostId, resource, this.processValue, duration, start_time, end_time)
      }
    },
    drawerMonitor(host_id, host_name, drawer) {
      this.drawer = drawer
      this.SelectHostId = host_id
      this.SelectHostName = host_name
      this.alarm_history_host_id = host_id
      this.DrawerTitle = host_name + '服务器监控详情'
      this.getMonitorDetail(host_id, 'server', 'system', 30)
      this.getProcessList(host_id)
    },
    handleClose(done) {
      this.DrawerChartData = []
      this.drawer = false
      this.ScriptHostNames = []
      this.jobScriptForm.host_ids = []
      this.scriptVisible = false
      done()
    },
    addProcessClose(done) {
      this.addProcess = null
      this.addProcessVisible = false
      done()
    },
    DialogClose(done) {
      this.processDialogVisible = false
      this.topVisible = false
      done()
    },
    handleDialogClose(done) {
      this.asset_data = null
      this.assetModifyVisible = false
      done()
    },
    getMonitorDetail(host_id, resource, item, duration, start_time, end_time) {
      if (start_time === undefined && end_time === undefined) {
        start_time = ''
        end_time = ''
      }
      if (duration === undefined) {
        duration = 0
      }
      MonitorDetail({
        host_id: host_id, resource: resource, item: item, duration: duration,
        start_time: start_time, end_time: end_time
      }).then((res) => {
        if (res.success) {
          this.DrawerChartData = []
          let tag = '主机监控指标'
          if (resource === 'server' && item === 'custom') {
            tag = '自定义监控指标'
          }
          if (resource === 'process') {
            tag = item + '进程监控指标'
          }
          this.DetailKey.forEach((k) => {
            const ChartData = {
              expectedData: [], tagData: [], legendName: this.key_cn[k]['KeyCn'] + '(' + tag + ')',
              FormatData: this.key_cn[k]['KeyUnit']
            }
            res.data.forEach((val) => {
              if (Object.prototype.hasOwnProperty.call(val, k)) {
                const data = FormatMonitorUnit(val[k], this.key_cn[k]['KeyUnit'])
                ChartData.FormatData = data[1]
                ChartData.expectedData.push(parseFloat(data[0]).toFixed(1))
                ChartData.tagData.push(val['time'])
              }
            })
            if (ChartData.expectedData.length > 0) {
              this.DrawerChartData.push(ChartData)
            }
          })
        }
      })
    },
    // 获取主机资产列表
    getData(params) {
      this.list = []
      this.listLoading = true
      if (this.asset_group_id != null) {
        params['asset_group_id'] = this.asset_group_id
      }
      getServer(params).then((res) => {
        if (res.success) {
          const servers = []
          this.list = res.data
          this.totalCount = res.pages.totalCount
          for (let i = 0; i < this.list.length; i++) {
            servers.push(this.list[i].host['host_id'])
          }
          // 获取主机监控聚合数据
          MonitorConverge({
            host_ids: servers.join(), resource: 'server',
            item: 'system', converge: 'max'
          }).then((res) => {
            if (res.success) {
              this.monitorData = res.data
            }
          })
        }
      })
      this.listLoading = false
    },
    // 展示监控数据详情
    showMonitorDetail(params) {
      this.dialogVisible = true
      this.lineChartData.legendName = params['host_name']
      this.DialogTitle = this.key_cn[params['key']]['KeyCn'] + '监控详情'
      this.lineChartData.FormatData = this.key_cn[params['key']]['KeyUnit']
      this.lineChartData.expectedData = []
      this.lineChartData.tagData = []
      this.lineChartData.color = AlarmColor(this.MonitorFilter(params['status']))
      MonitorDetail({
        host_id: params['host_id'], resource: 'server', item: 'system', duration: 30,
        key: params['key']
      }).then((res) => {
        if (res.success) {
          res.data.forEach((val) => {
            this.lineChartData.expectedData.push(val[params['key']].toFixed(1))
            this.lineChartData.tagData.push(val['time'])
          })
        }
      })
    },
    downloadExcel() {
      window.location.href = this.download_file_url
    },
    reclaimHost(host_id) {
      this.serverDialogVisible = true
      this.ReclaimServers = []
      this.ReclaimServers.push(host_id)
    },
    reclaimHosts() {
      this.ReclaimServers = []
      if (this.multipleSelection.length > 1) {
        for (const v of this.multipleSelection) {
          this.ReclaimServers.push(v.host['host_id'])
        }
        this.serverDialogVisible = true
      }
    },
    jobExecHost(host) {
      this.jobExecForm.host_ids = []
      this.jobServerNames = []
      this.jobExecForm.host_ids.push(host.host_id)
      this.jobServerNames.push(host.host_name)
      this.jobExecVisible = true
    },
    jobExecHosts() {
      this.verifyOnline()
      this.jobExecForm.host_ids = []
      this.jobServerNames = []
      if (this.multipleSelection.length > 1) {
        for (const v of this.multipleSelection) {
          this.jobExecForm.host_ids.push(v.host['host_id'])
          this.jobServerNames.push(v.host['host_name'])
        }
        this.jobExecVisible = true
      }
    },
    jobFileHost(host) {
      this.jobFileForm.host_ids = []
      this.jobServerNames = []
      this.jobExecForm.host_ids.push(host.host_id)
      this.jobServerNames.push(host.host_name)
      this.jobFileVisible = true
    },
    jobFileHosts() {
      this.verifyOnline()
      this.jobFileForm.host_ids = []
      this.jobServerNames = []
      if (this.multipleSelection.length > 1) {
        for (const v of this.multipleSelection) {
          this.jobFileForm.host_ids.push(v.host['host_id'])
          this.jobServerNames.push(v.host['host_name'])
        }
        this.jobFileVisible = true
      }
    },
    jobScriptHosts() {
      this.verifyOnline()
      if (this.multipleSelection.length > 1) {
        this.jobScriptForm.host_ids = []
        this.ScriptHostNames = []
        this.scriptIds = []
        for (const v of this.multipleSelection) {
          this.jobScriptForm.host_ids.push(v.host['host_id'])
          this.ScriptHostNames.push(v.host['host_name'])
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
      }
    },
    jobScriptHost(data) {
      this.scriptIds = []
      this.jobScriptForm.host_ids = []
      this.ScriptHostNames = []
      this.jobScriptForm.host_ids.push(data.host['host_id'])
      this.ScriptHostNames.push(data.host['host_name'])
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
    runScriptSubmit() {
      runJobScript(this.jobScriptForm).then((res) => {
        if (res.success) {
          this.jobScriptForm.script_id = null
          this.jobScriptForm.host_ids = []
          this.ScriptHostNames = []
          this.scriptIds = []
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
    ServerJobExec() {
      postJobExec(this.jobExecForm).then((res) => {
        if (res.success) {
          this.jobServerNames = []
          this.jobExecForm.host_ids = []
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
    reclaimServerPool() {
      PutServerPool({ asset_ids: this.ReclaimServers }).then((res) => {
        if (res.success) {
          this.multipleSelection = []
          this.ReclaimServers = []
          this.serverDialogVisible = false
          this.$message.success('资源池服务器回收完成')
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    assetModify(data) {
      this.assetModifyVisible = true
      this.asset_data = data
      this.assetModifyForm.host_id = data.host.host_id
      this.assetModifyForm.nick_name = data.host.nick_name
      this.assetModifyForm.host_type = data.host.host_type
      this.assetModifyForm.asset_tag = data.host.asset_tag
      this.assetModifyForm.idc_id = data.extend.idc_id
      this.assetModifyForm.ipmi = data.extend.ipmi
      this.assetModifyForm.cabinet = data.extend.cabinet
      this.assetModifyForm.buy_time = data.extend.buy_time
      this.assetModifyForm.expired_time = data.extend.expired_time
    },
    resetForm(form) {
      this.assetModifyForm.host_id = this.asset_data.host.host_id
      this.assetModifyForm.nick_name = this.asset_data.host.nick_name
      this.assetModifyForm.host_type = this.asset_data.host.host_type
      this.assetModifyForm.asset_tag = this.asset_data.host.asset_tag
      this.assetModifyForm.idc_id = this.asset_data.extend.idc_id
      this.assetModifyForm.ipmi = this.asset_data.extend.ipmi
      this.assetModifyForm.cabinet = this.asset_data.extend.cabinet
      this.assetModifyForm.buy_time = this.asset_data.extend.buy_time
      this.assetModifyForm.expired_time = this.asset_data.extend.expired_time
      this.$refs[form].clearValidate()
      this.$refs[form].resetFields()
    },
    cancelSubmit() {
      this.fileList = []
      this.jobServerNames = []
      this.jobExecForm.host_ids = []
      this.jobExecForm.exec = null
      this.jobFileForm.dst_path = null
      this.jobFileForm.host_ids = []
      this.jobFileForm.job_id = null
      this.jobFileVisible = false
      this.jobExecVisible = false
      this.jobScriptForm.host_ids = []
      this.jobScriptForm.script_id = null
      this.scriptIds = []
      this.scriptVisible = false
    },
    changeAssetConf(form) {
      putServer(this.assetModifyForm).then((res) => {
        if (res.success) {
          this.assetModifyForm.host_id = null
          this.assetModifyForm.nick_name = null
          this.assetModifyForm.host_type = null
          this.assetModifyForm.asset_tag = null
          this.assetModifyForm.idc_id = null
          this.assetModifyForm.ipmi = null
          this.assetModifyForm.cabinet = null
          this.assetModifyForm.buy_time = null
          this.assetModifyForm.expired_time = null
          this.asset_data = null
          this.$refs[form].clearValidate()
          this.$refs[form].resetFields()
          this.assetModifyVisible = false
          this.onSearch()
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
    sendFileSubmit() {
      postJobFileSend(this.jobFileForm).then((res) => {
        if (res.success) {
          this.fileList = []
          this.jobFileForm.job_id = null
          this.jobServerNames = []
          this.jobFileForm.host_ids = []
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
    getProcessList(hostId) {
      getProcess({ host_id: hostId }).then((res) => {
        this.processList = []
        this.processValue = ''
        if (res.success) {
          for (const d of res.data) {
            if (d !== null && d !== undefined) {
              this.processList.push({ value: d.process, label: d.process, hostId: d.host_id })
            }
          }
        }
      })
    },
    deleteProcessSubmit() {
      const process = []
      for (const v of this.multipleSelection) {
        process.push(v.value)
      }
      if (process.length > 0) {
        deleteProcess({ host_ids: [this.SelectHostId], process: process }).then((res) => {
          if (res.success) {
            this.getProcessList(this.SelectHostId)
            this.$message.success('删除进程监控完成')
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      }
    },
    addProcessSubmit() {
      if (this.addProcess !== null) {
        addProcess({ host_ids: [this.SelectHostId], process: this.addProcess.split(',') }).then((res) => {
          if (res.success) {
            this.getProcessList(this.SelectHostId)
            this.addProcess = null
            this.addProcessVisible = false
            this.$message.success('新增进程监控完成')
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
    processTop() {
      this.topVisible = true
      getProcessTop({ host_id: this.SelectHostId }).then((res) => {
        if (res.success) {
          this.cpuChart.legendName = 'CPU使用率'
          this.cpuChart.expectedData = []
          this.cpuChart.tagData = []
          for (const k in res.data.cpu) {
            this.cpuChart.tagData.push(k)
            this.cpuChart.expectedData.push(parseFloat(res.data.cpu[k]).toFixed(2))
          }
          this.memChart.legendName = '内存使用率'
          this.memChart.expectedData = []
          this.memChart.tagData = []
          for (const k in res.data.mem) {
            this.memChart.tagData.push(k)
            this.memChart.expectedData.push(parseFloat(res.data.mem[k]).toFixed(2))
          }
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
      this.getData({ host_type: this.activeName, pre_page: this.PerPage, page: this.currentPage })
    },
    // 显示第几页
    handleCurrentChange(page) {
      // 切换页码时，要获取每页显示的条数
      this.currentPage = page
      const params = { host_type: this.activeName, pre_page: this.PerPage, page: this.currentPage }
      if (this.searchData !== null && this.searchData !== '' && this.searchData !== undefined) {
        params[this.searchParams] = this.searchData
      }
      this.getData(params)
    }
  }
}
</script>
