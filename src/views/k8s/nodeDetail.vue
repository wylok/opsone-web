<template>
  <div class="app-container">
    <div class="app-div">
      <el-page-header :content="content" class="margin-bottom: 5px" @back="goBack" />
      <div class="app-div-search" style="margin-top: 10px">
        <el-row :gutter="24">
          <el-col :span="8">
            <div style="margin-top: 20px;color: #5a5e66;font-size: small">
              <span>节点名称:{{ node_name }}</span>
              <span style="margin-left: 30px">创建时长:{{ creationTimestamp|DateFormat|DateTimeFormat(8) }}</span>
            </div>
          </el-col>
          <el-col :span="16">
            <el-button type="success" @click="showMetricChart(node_name)">节点监控</el-button>
            <el-button type="primary" @click="yamlVisible=true">NodeYaml</el-button>
            <el-button type="primary" @click="DialogVisible=true">编辑标签</el-button>
            <el-button v-if="taints===null" type="warning" @click="taintNode('NoSchedule')">停止调度Cordon</el-button>
            <el-button v-else type="success" @click="taintNode('')">恢复调度Cordon</el-button>
            <el-button type="danger" @click="taintNode('NoExecute')">排空节点Drain</el-button>
            <el-button type="danger" @click="delNode">移除节点</el-button>
          </el-col>
        </el-row>
      </div>
    </div>
    <div style="margin-top: 1%">
      <div class="app-div">
        <div style="height: 300px;margin-top: 3px">
          <div style="margin-top: 10px;color: #2b2f3a;font-weight: bold;font-size: 15px">节点状态</div>
          <el-table
            :data="nodeStatus"
            fit
            border
            stripe
            max-height="280px"
            highlight-current-row
            :header-cell-style="{backgroundColor: 'steelblue',color: 'white',borderRadius: '3%'}"
          >
            <el-table-column label="Type" align="center" show-overflow-tooltip width="130px">
              <template slot-scope="scope">
                {{ scope.row['type'] }}
              </template>
            </el-table-column>
            <el-table-column label="Status" width="100px" align="center">
              <template slot-scope="scope">
                {{ scope.row['status'] }}
              </template>
            </el-table-column>
            <el-table-column label="Indicator" width="100px" align="center">
              <template>
                <el-tag type="success">正常</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="reason" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['reason'] }}
              </template>
            </el-table-column>
            <el-table-column label="message" width="auto" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['message'] }}
              </template>
            </el-table-column>
            <el-table-column label="lastHeartbeatTime" align="center" width="auto">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['lastHeartbeatTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['lastHeartbeatTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="lastTransitionTime" align="center" width="auto">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['lastTransitionTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['lastTransitionTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div style="margin-top: 1%">
      <div class="app-div">
        <div style="height: 300px;margin-top: 3px">
          <div style="color: #2b2f3a;font-weight: bold;font-size: 15px">节点信息</div>
          <el-row :gutter="24">
            <el-col :span="8">
              <div class="node-detail">
                <el-row :gutter="24">
                  <el-col :span="6">
                    <div style="margin-top: 15px;margin-left: 15px">名称</div>
                  </el-col>
                  <el-col :span="18">
                    <div style="margin-top: 15px;">{{ node_name }}</div>
                  </el-col>
                </el-row>
                <el-row :gutter="24">
                  <el-col :span="6">
                    <div style="margin-top: 15px;margin-left: 15px">创建时间</div>
                  </el-col>
                  <el-col :span="18">
                    <div style="margin-top: 15px;">{{ creationTimestamp|DateFormat|DateTimeFormat(8) }}</div>
                  </el-col>
                </el-row>
                <el-row :gutter="24">
                  <el-col :span="6">
                    <div style="margin-top: 15px;margin-left: 15px">标签</div>
                  </el-col>
                  <el-col :span="18">
                    <div style="margin-top: 15px;height: 80px;overflow: hidden">
                      {{ labels }}
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="24">
                  <el-col :span="6">
                    <div style="margin-top: 15px;margin-left: 15px">注解</div>
                  </el-col>
                  <el-col :span="18">
                    <div style="margin-top: 15px;height:80px;overflow: hidden">
                      {{ annotations }}
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="node-detail">
                <el-row :gutter="24">
                  <el-col :span="8">
                    <div class="node-chart" style="margin-left: 15px">
                      <div class="chart-wrapper">
                        <tangential-polar-bar-chart :chart-data="nodeChart" />
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="node-chart">
                      <div class="chart-wrapper">
                        <tangential-polar-bar-chart :chart-data="requestsChart" />
                      </div>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="node-chart" style="margin-right: 15px">
                      <div class="chart-wrapper">
                        <tangential-polar-bar-chart :chart-data="limitsChart" />
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="node-detail">
                <el-row v-for="(v,k) in nodeInfos" :key="k" :gutter="24">
                  <el-col v-if="k!=='systemUUID' && k!=='systemUUID' && k!=='bootID'" :span="9">
                    <div style="margin-top: 15px;margin-left: 15px;overflow: hidden">{{ k }}</div>
                  </el-col>
                  <el-col v-if="k!=='systemUUID' && k!=='systemUUID' && k!=='bootID'" :span="15">
                    <div style="margin-top: 15px;">{{ v }}</div>
                  </el-col>
                </el-row>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <div style="margin-top: 1%">
      <div class="app-div">
        <div style="height: 600px;margin-top: 3px">
          <div style="color: #2b2f3a;font-weight: bold;font-size: 15px">容器组</div>
          <el-table
            :data="pods"
            border
            stripe
            max-height="580px"
            highlight-current-row
            :header-cell-style="{backgroundColor: 'steelblue',color: 'white',borderRadius: '3%'}"
          >
            <el-table-column label="名称空间" width="auto" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['namespace'] }}
              </template>
            </el-table-column>
            <el-table-column label="名称" width="auto" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['Name'] }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="180px" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row['Stat']==='Running'||scope.row['Stat']==='Succeeded'" type="success">{{ scope.row['Stat'] }}</el-tag>
                <el-tag v-else type="danger">{{ scope.row['Stat'] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="容器组IP" width="auto" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['PodIP'] }}
              </template>
            </el-table-column>
            <el-table-column label="重启策略" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['RestartPolicy'] }}
              </template>
            </el-table-column>
            <el-table-column label="images" width="500px" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-row v-for="(v,k) in scope.row['images']" :key="k" :gutter="24">
                  <el-col :span="24" style="text-align: left">{{ v }}</el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" width="auto">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['StartTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['StartTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  size="mini"
                  @click.native.prevent="delPod(scope.row['namespace'], scope.row['Name'], 'NoSchedule')"
                >驱逐</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div>
      <el-dialog
        title="节点标签"
        :visible.sync="DialogVisible"
        width="45%"
        left
      >
        <el-row :gutter="24">
          <el-col :span="10" style="text-align: center">
            <div style="margin-top: 10px;color: #234883">标签名称</div>
          </el-col>
          <el-col :span="8" style="text-align: center">
            <div style="margin-top: 10px;color: #234883">标签值</div>
          </el-col>
          <el-col :span="6" style="text-align: center">
            <div style="margin-top: 10px;color: #234883">操作</div>
          </el-col>
        </el-row>
        <div v-for="(v,k) in labels" :key="k">
          <el-row :gutter="24">
            <el-col :span="10" style="text-align: center">
              <div style="height: 50px;margin-bottom: 5px;border: 1px solid lightsteelblue">
                <div style="margin-top: 13px">{{ k }}</div>
              </div>
            </el-col>
            <el-col :span="8" style="text-align: center">
              <div style="height: 50px;margin-bottom: 5px;border: 1px solid lightsteelblue">
                <div style="margin-top: 15px">{{ v }}</div>
              </div>
            </el-col>
            <el-col :span="6" style="text-align: center">
              <el-button-group style="margin-top: 5px">
                <el-button type="primary" size="mini" @click="updateLabel(k, v)">编辑</el-button>
                <el-button type="danger" size="mini" @click="delLabel(k)">移除</el-button>
              </el-button-group>
            </el-col>
          </el-row>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="DialogVisible = false">关 闭</el-button>
          <el-button type="primary" @click="addLabel">新 增</el-button>
        </span>
      </el-dialog>
      <el-dialog
        :title="labelTitle"
        :visible.sync="updateVisible"
        width="30%"
        :before-close="handleClose"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <el-input v-model="labelName" />
          </el-col>
          <el-col :span="12">
            <el-input v-model="labelData" />
          </el-col>
        </el-row>
        <span slot="footer" class="dialog-footer">
          <el-button @click="updateVisible = false">取 消</el-button>
          <el-button type="primary" @click="modifyNode">保 存</el-button>
        </span>
      </el-dialog>
      <el-dialog
        title="NodeYaml"
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
        title="节点CPU/内存监控详情"
        :visible.sync="MetricVisible"
        :before-close="handleClose"
        width="75%"
      >
        <el-row style="background:#fff;padding:8px 8px 0;margin-bottom:16px;">
          <LineChart :chart-data="nodeCpuChart" height="250px" />
          <LineChart :chart-data="nodeMemoryChart" height="250px" style="margin-top: 5px" />
        </el-row>
      </el-dialog>
    </div>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DateFormat, DateTimeFormat, AddTime, getVersion, getYear } from '@/utils/filters'
import { deleteNode, deletePod, getMetricChart, getNodeDetail, getNodeYaml, nodeTaint, updateNode } from '@/api/k8s'
import TangentialPolarBarChart from '@/components/echarts/TangentialPolarBarChart.vue'
import LineChart from '@/components/echarts/LineChart.vue'

export default {
  components: { LineChart, TangentialPolarBarChart },
  inject: ['reload'],
  filters: {
    DateFormat,
    AddTime,
    DateTimeFormat
  },
  data() {
    return {
      nodeStatus: null,
      nodeEvents: null,
      nodeInfos: null,
      labels: null,
      annotations: null,
      node_name: null,
      pods: null,
      capacity: null,
      creationTimestamp: null,
      k8s_id: null,
      k8s_name: null,
      content: null,
      taints: null,
      labelTitle: '',
      labelName: null,
      labelSource: null,
      labelData: null,
      textarea: null,
      DialogVisible: false,
      updateVisible: false,
      yamlVisible: false,
      yamlModify: false,
      MetricVisible: false,
      nodeChart: { expectedData: [], tagData: [], title: '', max: 0 },
      requestsChart: { expectedData: [], tagData: [], title: '', max: 0 },
      limitsChart: { expectedData: [], tagData: [], title: '', max: 0 },
      nodeCpuChart: { expectedData: [], tagData: [], legendName: '', FormatData: '' },
      nodeMemoryChart: { expectedData: [], tagData: [], legendName: '', FormatData: '' },
      year: getYear(),
      version: getVersion()
    }
  },
  created() {
    this.k8s_id = this.$route.params['k8s_id']
    this.k8s_name = this.$route.params['k8s_name']
    this.node_name = this.$route.params['node_name']
    this.content = this.k8s_name + ' | ' + this.node_name
    this.getData()
    setInterval(this.getData, 30000)
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    handleClose(done) {
      this.updateVisible = false
      this.yamlVisible = false
      this.yamlModify = false
      this.labelName = null
      this.labelSource = null
      this.labelData = null
      this.MetricVisible = false
      done()
    },
    updateLabel(labelName, labelData) {
      this.updateVisible = true
      this.labelTitle = '修改标签'
      this.labelName = labelName
      this.labelSource = labelName
      this.labelData = labelData
    },
    addLabel() {
      this.updateVisible = true
      this.labelTitle = '新增标签'
      this.labelName = null
      this.labelSource = null
      this.labelData = null
    },
    getData() {
      getNodeDetail({ k8s_id: this.k8s_id, node_name: this.node_name }).then((res) => {
        if (res.success) {
          this.taints = res.data.taints
          this.nodeStatus = res.data.node.status.conditions
          this.nodeInfos = res.data.node.status.nodeInfo
          this.capacity = res.data.node.status.capacity
          this.labels = res.data.node.metadata.labels
          this.creationTimestamp = res.data.node.metadata.creationTimestamp
          this.annotations = res.data.node.metadata.annotations
          this.pods = res.data.pods
          this.nodeChart.tagData = ['Max', 'Ready', 'Available']
          this.nodeChart.expectedData = [this.capacity.pods, this.pods.length, this.capacity.pods - this.pods.length]
          this.nodeChart.max = this.capacity.pods
          this.nodeChart.title = '节点POD'
          this.requestsChart.tagData = ['Total', 'Request', 'Limit']
          this.requestsChart.expectedData = [this.capacity.cpu, res.data.requests.cpu, res.data.limits.cpu]
          this.requestsChart.max = this.capacity.cpu
          this.requestsChart.title = '节点CPU'
          this.limitsChart.tagData = ['Total', 'Request', 'Limit']
          this.limitsChart.expectedData = [Math.floor(this.capacity.memory.replace(new RegExp('Ki', 'g'), '') / 1000 / 1024),
            res.data.requests.mem, res.data.limits.mem]
          this.limitsChart.max = Math.floor(this.capacity.memory.replace(new RegExp('Ki', 'g'), '') / 1000 / 1024)
          this.limitsChart.title = '节点内存'
        }
      })
      getNodeYaml({ k8s_id: this.k8s_id, node_name: this.node_name }).then((res) => {
        if (res.success) {
          this.textarea = res.data
        }
      })
    },
    delPod(namespace, pod_name, effect) {
      this.$confirm('此操作将驱逐' + pod_name + '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        nodeTaint({ k8s_id: this.k8s_id, effect: effect, node_name: this.node_name }).then((res) => {
          if (res.success) {
            deletePod({ k8s_id: this.k8s_id, namespace: namespace, pod_name: pod_name }).then((res) => {
              if (res.success) {
                this.$message({
                  type: 'success',
                  message: pod_name + '已驱逐'
                })
                this.getData()
              }
            }).catch(function(err) {
              if (err.toString().includes('403')) {
                alert('用户无权限进行操作,请联系管理员')
              }
            })
          }
        })
      })
    },
    taintNode(effect) {
      nodeTaint({ k8s_id: this.k8s_id, effect: effect, node_name: this.node_name }).then((res) => {
        if (res.success) {
          if (effect === '') {
            this.$message({
              type: 'success',
              message: '节点调度已恢复'
            })
          } else {
            this.$message({
              type: 'success',
              message: '节点调度已暂停'
            })
          }
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    modifyNode() {
      this.labels[this.labelName] = this.labelData
      if (this.labelName !== this.labelSource && this.labelSource !== null) {
        delete this.labels[this.labelSource]
      }
      updateNode({ k8s_id: this.k8s_id, labels: this.labels, node_name: this.node_name }).then((res) => {
        if (res.success) {
          this.$message({
            type: 'success',
            message: '节点标签已修改'
          })
          this.updateVisible = false
          this.getData()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    delNode() {
      this.$confirm('此操作将移除节点' + this.node_name + '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteNode({ k8s_id: this.k8s_id, node_name: this.node_name }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: this.node_name + '节点已移除'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delLabel(k) {
      this.$confirm('此操作将移除标签' + k + '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delete this.labels[k]
        updateNode({ k8s_id: this.k8s_id, labels: this.labels, node_name: this.node_name }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: '节点标签已移除'
            })
            this.updateVisible = false
            this.getData()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    showMetricChart(node_name) {
      this.MetricVisible = true
      this.nodeCpuChart.legendName = node_name + '(cpu)'
      this.nodeCpuChart.expectedData = []
      this.nodeCpuChart.tagData = []
      this.nodeMemoryChart.legendName = node_name + '(memory)'
      this.nodeMemoryChart.expectedData = []
      this.nodeMemoryChart.FormatData = 'GB'
      this.nodeMemoryChart.tagData = []
      getMetricChart({ k8s_id: this.k8s_id, resource: 'node', name: node_name }).then((res) => {
        if (res.success) {
          res.data.forEach((val) => {
            this.nodeCpuChart.expectedData.push(val['cpu'].toFixed(2))
            this.nodeCpuChart.tagData.push(val['time'])
            this.nodeMemoryChart.expectedData.push((val['memory'] / 1000 / 1000 / 1000).toFixed(2))
            this.nodeMemoryChart.tagData.push(val['time'])
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.node-detail{
  height: 280px;
  border: 1px dashed lightslategray;
  border-radius: 20px;
  background-color: #e9edf3;
  font-size:14px;
  overflow: hidden;
}
.node-chart{
  height: 260px;
  border-radius: 10px;
  border: 1px dashed lightseagreen;
  background-color: white;
  margin-top: 10px;
}
</style>
