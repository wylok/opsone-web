<template>
  <div class="app-container">
    <div class="app-div">
      <el-container>
        <el-header height="50px">
          <div style="border: 1px solid #a7b6cd;height: 45px;border-radius: 5px;background-color: #234883">
            <div style="margin-top: 5px">
              <el-row :gutter="24">
                <el-col :span="6" class="col-hide">
                  <el-page-header :content="content" style="margin-top: 5px;color: white" @back="goBack" />
                </el-col>
                <el-col :span="3">
                  <el-button type="primary" plain size="small" @click="yamlVisible=true">查看/编辑yaml</el-button>
                </el-col>
                <el-col :span="3">
                  <el-button type="primary" plain size="small" @click="imageModify=true">调整镜像版本</el-button>
                </el-col>
                <el-col :span="3">
                  <el-button type="success" plain size="small" @click="scalerModify=true">设置自动伸缩</el-button>
                </el-col>
                <el-col :span="3">
                  <el-button type="warning" plain size="small" @click="deploymentRestart">重启Deployment</el-button>
                </el-col>
                <el-col :span="3">
                  <el-button type="danger" plain size="small" @click="delDeployment">删除Deployment</el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-header>
        <el-container style="padding: 0 15px;height: 700px;">
          <el-aside width="25%">
            <div style="padding-left: 15px;font-size: smaller">历史版本,当前副本集数 <span style="color: green;font-weight: bolder">{{ activities.length }}</span></div>
            <div v-if="activities!==null" style="margin-top: 10px">
              <el-timeline :reverse="true">
                <el-timeline-item
                  v-for="(activity, index) in activities"
                  :key="index"
                  :timestamp="activity.CreationTimestamp|DateFormat|AddTime"
                >
                  <div style="color: lightslategray;width: 300px" class="col-hide">
                    已创建: {{ activity.Name }}
                    <span style="color: mediumslateblue;font-size: smaller">({{ activity.CreationTimestamp|DateFormat|DateTimeFormat(8) }})</span>
                  </div>
                  <div style="height: 80px;width: 300px;background-color: #e9edf3;border-radius: 5px;margin-top: 5px">
                    <div style="padding: 5px;height: 55px;width: 280px">{{ activity.Image }}</div>
                    <div style="height: 20px;width: 280px;margin-top: 1px;font-size: smaller;text-align: right">
                      <el-link
                        type="primary"
                        icon="el-icon-refresh-right"
                        style="margin-top: 5px"
                        @click="modifyImages({ deployment: activity.Image.split(':') }, '回滚镜像版本成功' )"
                      >
                        回滚到  #{{ activity.Generation }}
                      </el-link>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
            <el-empty v-else :image-size="100" description="没有历史版本数据" />
          </el-aside>
          <el-main>
            <div
              v-for="(v,k) in list"
              :id="v['Name']"
              :key="k"
              class="pod-list"
              @mouseout="podOut(v)"
              @mouseover="podOver(v)"
            >
              <div style="margin-top: 15px">
                <el-row :gutter="24">
                  <el-col :span="15" :offset="1" class="col-hide">
                    {{ v['Name'] }}
                  </el-col>
                  <el-col :span="6" :offset="1">
                    <div v-if="v['Stat']==='Ready'" :id="'stat-' + v['Name']" class="ready">{{ v['Stat'] }}</div>
                    <div v-else :id="'stat-' + v['Name']" class="notReady">{{ v['Stat'] }}</div>
                  </el-col>
                </el-row>
              </div>
              <div style="margin-top: 15px;font-size: 12px">
                <el-row :gutter="24">
                  <el-col :span="7">
                    <div style="text-align: center">
                      <i class="el-icon-time" />
                      {{ v['StartTime']|DateFormat|DateTimeFormat(8) }}
                    </div>
                  </el-col>
                  <el-col :span="8" style="text-align: center">
                    <span class="flag">P</span>{{ v['PodIP'] }}
                  </el-col>
                  <el-col :span="4">
                    <el-link type="info" style="color: white" @click="showMetricChart(v['Name'],true)">监控</el-link>
                  </el-col>
                  <el-col :span="4">
                    <el-link :id="'del-' + v['Name']" type="info" @click="delPod(v['Name'])">删除</el-link>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-main>
          <el-aside width="45%" style="padding-left: 8px;margin-top: 5px">
            <div style="font-size: 13px;border: 2px solid #7b91b5;border-radius: 8px;height: 210px;width: 98%;margin-bottom: 12px">
              <div class="pod-detail">容器基础信息</div>
              <div v-if="podInfos!==null" style="margin-top: 15px;text-overflow: ellipsis;overflow: hidden">
                <el-descriptions border :column=2 :labelStyle="{'font-weight': 'bold'}">
                  <el-descriptions-item label="PodName">{{ podInfos['Name'] }}</el-descriptions-item>
                  <el-descriptions-item v-for="(v,k) in podInfos['images']" :key="k" label="容器列表">
                    <el-tooltip :content="v.join(':')" placement="top">
                      <el-button type="text" size="mini">{{ k }}</el-button>
                    </el-tooltip>
                    <router-link
                      :to="{ name:'k8sWebShell', params: { k8s_id: k8s_id, namespace: podInfos['namespace'], pod: podInfos['Name'], container: k }}"
                    >
                      <el-tag size="mini" effect="plain" type="danger" style="margin-left: 1%">bash</el-tag>
                    </router-link>
                    <router-link
                      :to="{ name:'k8sWebShell', params: { k8s_id: k8s_id, namespace: podInfos['namespace'], pod: podInfos['Name'], container: k, subResource: 'logs'}}"
                    >
                      <el-tag size="mini" effect="plain" type="danger" style="margin-left: 1%">日志</el-tag>
                    </router-link>
                    <el-divider direction="vertical" />
                  </el-descriptions-item>
                  <el-descriptions-item label="NodeName">{{ podInfos['NodeName'] }}</el-descriptions-item>
                  <el-descriptions-item label="NodeIP">{{ podInfos['HostIP'] }}</el-descriptions-item>
                  <el-descriptions-item label="namespace">{{ podInfos['namespace'] }}</el-descriptions-item>
                  <el-descriptions-item label="已运行">{{ podInfos['StartTime']|DateFormat|DateTimeFormat(8) }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
            <div style="font-size: 13px;border: 2px solid #7b91b5;border-radius: 8px;height: 150px;width: 98%;margin-bottom: 12px">
              <div class="pod-detail">容器资源需求</div>
              <div>
                <el-row :gutter="24">
                  <el-col :span="12" style="text-align: center">
                    <div style="margin-top: 20px">
                      CPU资源请求:
                      <el-input v-model="cpu1" style="width: 50%" size="mini" readonly>
                        <template slot="append">core</template>
                      </el-input>
                    </div>
                    <div style="margin-top: 20px">
                      CPU资源限制:
                      <el-input v-model="cpu2" style="width: 50%" size="mini" readonly>
                        <template slot="append">core</template>
                      </el-input>
                    </div>
                  </el-col>
                  <el-col :span="12" style="text-align: center">
                    <div style="margin-top: 20px">
                      内存资源请求:
                      <el-input v-model="mem1" style="width: 40%" size="mini" readonly />
                    </div>
                    <div style="margin-top: 20px">
                      内存资源限制:
                      <el-input v-model="mem2" style="width: 40%" size="mini" readonly />
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
            <div style="font-size: 13px;border: 2px solid #7b91b5;border-radius: 8px;height: 300px;width: 98%">
              <div class="pod-detail">容器关联[事件|监控]</div>
              <el-table
                v-if="podEvents !== null"
                :data="podEvents"
                border
                fit
                height="270px"
                highlight-current-row
              >
                <el-table-column label="Reason" width="110px" align="center" show-overflow-tooltip>
                  <template slot-scope="scope">
                    {{ scope.row['Reason'] }}
                  </template>
                </el-table-column>
                <el-table-column label="Type" width="90px" align="center">
                  <template slot-scope="scope">
                    <el-tag v-if="scope.row['Type']==='Warning'" type="danger">{{ scope.row['Type'] }}</el-tag>
                    <el-tag v-else>{{ scope.row['Type'] }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Count" align="center" width="70px">
                  <template slot-scope="scope">
                    {{ scope.row['Count'] }}
                  </template>
                </el-table-column>
                <el-table-column align="center" prop="time" label="Time" width="110px">
                  <template slot-scope="scope">
                    <span v-if="scope.row['Time']!==null"> {{ scope.row['Time'] | DateFormat|DateTimeFormat(0) }} </span>
                  </template>
                </el-table-column>
                <el-table-column label="Message" align="center" width="auto" show-overflow-tooltip>
                  <template slot-scope="scope">
                    {{ scope.row['Message'] }}
                  </template>
                </el-table-column>
              </el-table>
              <div v-else>
                <div v-if="podMemoryChart.tagData.length>0">
                  <LineChart :chart-data="podCpuChart" height="135px" />
                  <LineChart :chart-data="podMemoryChart" height="135px" style="margin-top: 5px" />
                </div>
                <div v-else><el-empty description="该Pod无关联[事件|监控]" :image-size="135" /></div>
              </div>
            </div>
          </el-aside>
        </el-container>
      </el-container>
    </div>
    <el-dialog
      title="DeploymentYaml"
      :visible.sync="yamlVisible"
      width="65%"
      :before-close="handleClose"
    >
      <el-input v-if="yamlModify===false" v-model="textarea" type="textarea" autosize resize="none" readonly />
      <el-input v-else v-model="textarea" type="textarea" autosize resize="none" :readonly="false" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button v-if="yamlModify===false" type="primary" @click="yamlModify = true">修 改</el-button>
        <el-button v-else type="primary" @click="yamlModify = false">保 存</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="调整镜像版本"
      :visible.sync="imageModify"
      width="75%"
      :before-close="handleClose"
    >
      <div>
        <div style="background-color: #234883;color: white;height: 30px">
          <el-row :gutter="24" style="padding: 8px">
            <el-col :span="4">名称</el-col>
            <el-col :span="8">镜像</el-col>
            <el-col :span="8">当前版本</el-col>
            <el-col :span="4">新版本</el-col>
          </el-row>
        </div>
        <div v-if="podInfos!==null && images!==null">
          <el-row v-for="(v,k) in podInfos['images']" :key="k" :gutter="24" style="margin-top: 10px">
            <el-col :span="4" class="col-hide">{{ k }}</el-col>
            <el-col :span="8" class="col-hide">{{ v[0] }}</el-col>
            <el-col :span="8">{{ v[1] }}</el-col>
            <el-col :span="4" style="padding-left: 5px">
              <el-input v-model="images[k][1]" size="mini" style="width: 200px" />
            </el-col>
          </el-row>
        </div>
        <el-divider />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="modifyImages(images, '调整镜像版成功')">提 交</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="设置自动伸缩"
      :visible.sync="scalerModify"
      width="75%"
      :before-close="handleClose"
    >
      <div style="height: 30px;margin-bottom: 10px;margin-top: -40px">
        <el-row :gutter="24">
          <el-col v-if="scaler===null" :span="4" :offset="22">
            <el-button type="text" size="mini" @click="modifyScaler('此操作将开启自动伸缩，请确认参数配置是否正确?')">开启自动伸缩</el-button>
          </el-col>
          <el-col v-else :span="4" :offset="22">
            <el-button type="text" size="mini" style="color: red" @click="delScaler">关闭自动伸缩</el-button>
          </el-col>
        </el-row>
      </div>
      <div style="background-color: #234883;color: white;height: 30px">
        <el-row :gutter="24" style="padding: 8px">
          <el-col :span="4">名称</el-col>
          <el-col :span="3">最小副本数</el-col>
          <el-col :span="3">最大副本数</el-col>
          <el-col :span="3">当前副本数</el-col>
          <el-col :span="4">目标CPU利用率</el-col>
          <el-col :span="4">当前CPU利用率</el-col>
          <el-col :span="3">状态</el-col>
        </el-row>
      </div>
      <el-row :gutter="24" style="margin-top: 10px;padding: 1px">
        <el-col :span="4" class="col-hide">
          <span>{{ scalerName }}</span>
        </el-col>
        <el-col :span="3">
          <el-input v-model="MinReplicas" type="number" size="mini" style="width: 55%" placeholder="输入副本数" />
        </el-col>
        <el-col :span="3">
          <el-input v-model="MaxReplicas" type="number" size="mini" style="width: 55%" placeholder="输入副本数" />
        </el-col>
        <el-col v-if="scaler!=null" :span="3">{{ scaler['CurrentReplicas'] }}</el-col>
        <el-col v-else :span="3">无数据</el-col>
        <el-col :span="4">
          <el-input v-model="CPUUtilizationPercentage" type="number" size="mini" style="width: 65%" placeholder="输入利用率">
            <template slot="append">%</template>
          </el-input>
        </el-col>
        <el-col v-if="scaler!=null" :span="4">{{ scaler['CurrentCPUUtilizationPercentage'] }}%</el-col>
        <el-col v-else :span="4">无数据</el-col>
        <el-col v-if="scaler!=null" :span="3"><el-tag type="success">已开启</el-tag></el-col>
        <el-col v-else :span="3"><el-tag type="info">未开启</el-tag></el-col>
      </el-row>
      <el-divider />
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClose">取 消</el-button>
        <el-button v-if="scaler!=null" type="primary" @click="modifyScaler('此操作将修改自动伸缩参数，是否继续?')">提 交</el-button>
        <el-button v-else type="primary" disabled>提 交</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="节点CPU/内存监控详情"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      width="75%"
    >
      <el-row style="background:#fff;padding:8px 8px 0;margin-bottom:16px;">
        <LineChart :chart-data="podCpuChart" height="250px" />
        <LineChart :chart-data="podMemoryChart" height="250px" style="margin-top: 5px" />
      </el-row>
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DateFormat, getVersion, getYear, DateTimeFormat, AddTime } from '@/utils/filters'
import {
  deleteDeployment,
  deletePod,
  getDeploymentYaml,
  getK8sPods,
  getPodEvent,
  getReplicaSets,
  updateDeployment,
  restartDeployment,
  getAutoScalers,
  uploadAutoScaler,
  deleteAutoScaler,
  getMetricChart
} from '@/api/k8s'
import LineChart from '@/components/echarts/LineChart.vue'

export default {
  components: { LineChart },
  inject: ['reload'],
  filters: {
    DateFormat,
    AddTime,
    DateTimeFormat
  },
  data() {
    return {
      list: [],
      k8s_id: null,
      k8s_name: null,
      namespace: null,
      deployment: null,
      content: null,
      podInfos: null,
      podEvents: null,
      podName: null,
      cpu1: null,
      cpu2: null,
      mem1: null,
      mem2: null,
      activities: [],
      images: {},
      scaler: null,
      MinReplicas: null,
      MaxReplicas: null,
      scalerName: null,
      CPUUtilizationPercentage: null,
      yamlVisible: false,
      yamlModify: false,
      imageModify: false,
      scalerModify: false,
      textarea: null,
      dialogVisible: false,
      podCpuChart: { expectedData: [], tagData: [], legendName: '', FormatData: '' },
      podMemoryChart: { expectedData: [], tagData: [], legendName: '', FormatData: '' },
      year: getYear(),
      version: getVersion()
    }
  },
  created() {
    this.k8s_id = this.$route.params['k8s_id']
    this.k8s_name = this.$route.params['k8s_name']
    this.namespace = this.$route.params['namespace']
    this.deployment = this.$route.params['name']
    this.content = this.k8s_name + '  |  ' + this.namespace + '  |  ' + this.deployment
    this.getData()
    setInterval(this.getData, 15000)
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    handleClose(done) {
      this.yamlVisible = false
      this.yamlModify = false
      this.imageModify = false
      this.scalerModify = false
      this.dialogVisible = false
      done()
    },
    getResource() {
      if (this.podInfos.resources.length > 0) {
        if (this.podInfos.resources[0].requests !== null) {
          this.cpu1 = this.podInfos.resources[0].requests.cpu
          this.mem1 = this.podInfos.resources[0].requests.memory
        }
        if (this.podInfos.resources[0].limits !== null) {
          this.cpu2 = this.podInfos.resources[0].limits.cpu
          this.mem2 = this.podInfos.resources[0].limits.memory
        }
      }
    },
    getData() {
      if (this.podName !== null) {
        document.getElementById(this.podName).style.backgroundColor = ''
        document.getElementById('stat-' + this.podName).style.color = ''
        this.podName = null
      }
      this.scaler = null
      getK8sPods({ k8s_id: this.k8s_id, namespace: this.namespace, deployment: this.deployment }).then((res) => {
        if (res.success) {
          this.list = res.data
          if (this.podInfos === null) {
            this.podInfos = this.list[0]
            this.podMessage(this.podInfos['Name'])
            this.images = this.podInfos['images']
            this.getResource()
            this.showMetricChart(this.podInfos['Name'], false)
          }
        }
      })
      getReplicaSets({ k8s_id: this.k8s_id, namespace: this.namespace, name: this.deployment }).then((res) => {
        if (res.success) {
          this.activities = res.data
        }
      })
      getDeploymentYaml({ k8s_id: this.k8s_id, namespace: this.namespace, name: this.deployment }).then((res) => {
        if (res.success) {
          this.textarea = res.data
        }
      })
      getAutoScalers({ k8s_id: this.k8s_id, namespace: this.namespace, deployment: this.deployment }).then((res) => {
        if (res.success) {
          this.scalerName = this.deployment
          this.MinReplicas = this.list.length
          this.MaxReplicas = this.list.length
          this.CPUUtilizationPercentage = 65
          if (res.data != null) {
            this.scaler = res.data[0]
            this.scalerName = this.scaler['Name']
            this.MinReplicas = this.scaler['MinReplicas']
            this.MaxReplicas = this.scaler['MaxReplicas']
            this.CPUUtilizationPercentage = this.scaler['CPUUtilizationPercentage']
          }
        }
      })
    },
    delPod(pod_name) {
      this.$confirm('此操作将移除' + pod_name + '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deletePod({ k8s_id: this.k8s_id, namespace: this.namespace, name: pod_name }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: pod_name + '已移除'
            })
            this.podName = pod_name
            document.getElementById(pod_name).style.backgroundColor = '#F56C6C'
            document.getElementById('stat-' + pod_name).style.color = '#F56C6C'
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delDeployment() {
      this.$confirm('此操作将移除' + this.deployment + '并销毁所属pod,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDeployment({ k8s_id: this.k8s_id, namespace: this.namespace, name: this.deployment }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: this.deployment + '已移除'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    deploymentRestart() {
      this.$confirm('此操作将重启' + this.deployment + '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        restartDeployment({ k8s_id: this.k8s_id, namespace: this.namespace, name: this.deployment }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: this.deployment + '已重启'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    modifyScaler(msg) {
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        uploadAutoScaler({ k8s_id: this.k8s_id, namespace: this.namespace, name: this.scalerName,
          scaler: { 'MinReplicas': this.MinReplicas, 'MaxReplicas': this.MaxReplicas,
            'CPUUtilizationPercentage': this.CPUUtilizationPercentage }}).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: '设置自动伸缩参数成功'
            })
            this.handleClose()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delScaler() {
      this.$confirm('此操作将关闭自动伸缩，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAutoScaler({ k8s_id: this.k8s_id, namespace: this.namespace, name: this.scalerName }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: '自动伸缩关闭成功'
            })
            this.handleClose()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    modifyImages(images, msg) {
      updateDeployment({ k8s_id: this.k8s_id, namespace: this.namespace, name: this.deployment, images: images }).then((res) => {
        if (res.success) {
          this.$message({
            type: 'success',
            message: msg
          })
          this.handleClose()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    podMessage(pod_name) {
      getPodEvent({ k8s_id: this.k8s_id, namespace: this.namespace, name: pod_name }).then((res) => {
        if (res.success) {
          this.podEvents = res.data
        }
      })
    },
    podOver(v) {
      document.getElementById(v['Name']).style.backgroundColor = 'limegreen'
      document.getElementById('del-' + v['Name']).style.color = '#F56C6C'
      this.podInfos = v
      this.podMessage(this.podInfos['Name'])
      this.images = this.podInfos['images']
      this.getResource()
      this.showMetricChart(this.podInfos['Name'], false)
    },
    podOut(v) {
      document.getElementById(v['Name']).style.backgroundColor = ''
      document.getElementById('del-' + v['Name']).style.color = '#909399'
    },
    showMetricChart(pod_name, show) {
      this.dialogVisible = show
      this.podCpuChart.legendName = pod_name + '(cpu)'
      this.podCpuChart.expectedData = []
      this.podCpuChart.tagData = []
      this.podMemoryChart.legendName = pod_name + '(内存)'
      this.podMemoryChart.expectedData = []
      this.podMemoryChart.FormatData = 'GB'
      this.podMemoryChart.tagData = []
      getMetricChart({ k8s_id: this.k8s_id, resource: 'pod', name: pod_name, name_space: this.namespace }).then((res) => {
        if (res.success) {
          res.data.forEach((val) => {
            this.podCpuChart.expectedData.push(val['cpu'].toFixed(2))
            this.podCpuChart.tagData.push(val['time'])
            this.podMemoryChart.expectedData.push((val['memory'] / 1000 / 1000 / 1000).toFixed(2))
            this.podMemoryChart.tagData.push(val['time'])
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.pod-list{
  height: 70px;
  border-radius: 12px;
  border: 1px dashed #a7b6cd;
  color: white;
  background-color: #0fbe8f;
  margin-top: 8px;
  font-size: 13px;
}
.pod-detail{
  height: 25px;
  border-radius: 5px;
  background-color: #234883;
  color: white;
  padding: 6px 10px;
}
.flag{
  font-size: 12px;
  background-color: #5a5e66;
}
.ready{
  font-weight: bold;
  font-size: 14px;
  color: #0fbe8f;
  text-align: center;
  border-radius: 5px;
  background-color: honeydew;
}
.notReady{
  font-weight: bold;
  font-size: 14px;
  color: white;
  text-align: center;
  border-radius: 5px;
  background-color: #E6A23C;
}
.col-hide{
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
::v-deep .el-page-header__content {
  color: white;
  font-size: 16px;
}
</style>
