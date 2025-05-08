<template>
  <div class="app-container">
    <div class="app-div">
      <el-page-header :content="k8s_name" style="margin-bottom: 10px" @back="goBack" />
      <el-table
        :data="list"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="节点名称" align="center" show-overflow-tooltip width="130px">
          <template slot-scope="scope">
            <router-link
              :to="{ name:'nodeDetail', params: { k8s_id: k8s_id, k8s_name: k8s_name, node_name: scope.row['Name'] } }"
            >
              <el-link underline>{{ scope.row['Name'] }}</el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="role" width="100px" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row['master']===true">
              <el-tag>Master</el-tag>
            </span>
            <span v-else>
              <el-tag>Node</el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="InternalIP" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['InternalIP'] }}
          </template>
        </el-table-column>
        <el-table-column label="CreationTime" align="center" width="120px">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row['CreationTimestamp']|DateFormat|AddTime" placement="top">
              <span>{{ scope.row['CreationTimestamp']|DateFormat|DateTimeFormat(8) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="status" width="110px" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row['Status']==='True'">
              <el-tag type="success">Ready</el-tag>
            </span>
            <span v-else>
              <el-tag type="danger">noReady</el-tag>
            </span>
            <el-tag
              v-if="scope.row['taints']!==null && scope.row['master']===false"
              type="danger"
              style="margin-top: 3px"
            >
              暂停调度
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="System" width="auto" align="center">
          <template slot-scope="scope">
            {{ scope.row['nodeInfo']['operatingSystem'] }}/{{ scope.row['nodeInfo']['architecture'] }}
          </template>
        </el-table-column>
        <el-table-column label="osImage" align="center" width="auto" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row['nodeInfo']['osImage'] }}
          </template>
        </el-table-column>
        <el-table-column label="dockerVersion" align="center" width="120px" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row['nodeInfo']['containerRuntimeVersion'] }}
          </template>
        </el-table-column>
        <el-table-column label="kubeletVersion" width="130px" align="center">
          <template slot-scope="scope">
            {{ scope.row['nodeInfo']['kubeletVersion'] }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="120px">
          <template slot-scope="scope">
            <el-tooltip
              class="item"
              effect="light"
              content="节点监控"
              placement="top-end"
            >
              <el-button
                type="success"
                icon="el-icon-s-data"
                size="mini"
                circle
                plain
                @click.native.prevent="showMetricChart(scope.row['Name'])"
              />
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="light"
              content="删除节点"
              placement="top-end"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                plain
                @click.native.prevent="delNode(scope.row['Name'])"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      title="节点CPU/内存监控详情"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      width="75%"
    >
      <el-row style="background:#fff;padding:8px 8px 0;margin-bottom:16px;">
        <LineChart :chart-data="nodeCpuChart" height="250px" />
        <LineChart :chart-data="nodeMemoryChart" height="250px" style="margin-top: 5px" />
      </el-row>
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DateFormat, DateTimeFormat, AddTime, getVersion, getYear } from '@/utils/filters'
import { deleteNode, getMetricChart, getNodes } from '@/api/k8s'
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
      list: null,
      k8s_id: null,
      k8s_name: null,
      dialogVisible: false,
      nodeCpuChart: { expectedData: [], tagData: [], legendName: '', FormatData: '' },
      nodeMemoryChart: { expectedData: [], tagData: [], legendName: '', FormatData: '' },
      year: getYear(),
      version: getVersion()
    }
  },
  created() {
    this.k8s_id = this.$route.params['k8s_id']
    this.k8s_name = this.$route.params['k8s_name']
    this.getData()
    setInterval(this.getData, 30000)
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    getData() {
      getNodes({ k8s_id: this.k8s_id }).then((res) => {
        if (res.success) {
          this.list = res.data
        }
      })
    },
    handleClose(done) {
      this.dialogVisible = false
      done()
    },
    delNode(node_name) {
      this.$confirm('此操作将移除节点' + node_name + '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteNode({ k8s_id: this.k8s_id, node_name: node_name }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: node_name + '节点已移除'
            })
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
      this.dialogVisible = true
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
