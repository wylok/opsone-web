<template>
  <div class="dashboard-editor-container">
    <el-row :gutter="24">
      <el-col :span="6">
        <div class="chart-wrapper overview">
          <el-row :gutter="24" style="margin-right: 13%">
            <el-col :span="14" style="text-align: right;margin-top: 1px;color: #5a5e66">服务器总数:</el-col>
            <el-col :span="6" style="text-align: center">
              <div style="font-size: 30px;margin-top: -5px;color: darkgreen">{{ overview['server_count'] }}</div>
            </el-col>
            <el-col :span="4" style="text-align: center;margin-top: 1px;color: #5a5e66">台</el-col>
          </el-row>
          <el-row :gutter="24" style="margin-right: 13%">
            <el-col :span="14" style="text-align: right;margin-top: 10px;color: #5a5e66">交换机总数:</el-col>
            <el-col :span="6" style="text-align: center">
              <div style="font-size: 30px;margin-top: 3px;color: darkblue">{{ overview['switch_count'] }}</div>
            </el-col>
            <el-col :span="4" style="text-align: center;margin-top: 12px;color: #5a5e66">台</el-col>
          </el-row>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="chart-wrapper overview">
          <el-row :gutter="24" style="margin-right: 13%">
            <el-col :span="14" style="text-align: right;margin-top: 1px;color: #5a5e66">健康主机数:</el-col>
            <el-col :span="6" style="text-align: center">
              <div style="font-size: 30px;margin-top: -5px;color: darkgreen">
                {{ overview['server_count'] - overview['alarm_hosts'] }}
              </div>
            </el-col>
            <el-col :span="4" style="text-align: center;margin-top: 1px;color: #5a5e66">台</el-col>
          </el-row>
          <el-row :gutter="24" style="margin-right: 13%">
            <el-col :span="14" style="text-align: right;margin-top: 10px;color: #5a5e66">报警主机数:</el-col>
            <el-col :span="6" style="text-align: center">
              <div style="font-size: 30px;margin-top: 3px;color: darkorange">{{ overview['alarm_hosts'] }}</div>
            </el-col>
            <el-col :span="4" style="text-align: center;margin-top: 12px;color: #5a5e66">台</el-col>
          </el-row>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="chart-wrapper overview">
          <el-row :gutter="24" style="margin-right: 13%">
            <el-col :span="14" style="text-align: right;margin-top: 5px;color: #5a5e66">K8S集群数:</el-col>
            <el-col :span="6" style="text-align: center">
              <div style="font-size: 30px;color:darkgreen">{{ k8sClusters }}</div>
            </el-col>
            <el-col :span="4" style="text-align: center;margin-top: 5px;color: #5a5e66">个</el-col>
          </el-row>
          <el-row :gutter="24" style="margin-right: 13%">
            <el-col :span="14" style="text-align: right;margin-top: 5px;color: #5a5e66">公有云平台:</el-col>
            <el-col :span="6" style="text-align: center">
              <div style="font-size: 30px;color:darkblue">{{ overview['cloud'] }}</div>
            </el-col>
            <el-col :span="4" style="text-align: center;margin-top: 5px;color: #5a5e66">个</el-col>
          </el-row>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="chart-wrapper overview">
          <el-row :gutter="24" style="margin-right: 13%">
            <el-col :span="14" style="text-align: right;margin-top: 5px;color: #5a5e66">运维工单数:</el-col>
            <el-col :span="6" style="text-align: center">
              <div style="font-size: 30px;color: darkgreen">{{ overview['WorkOrder'] }}</div>
            </el-col>
            <el-col :span="4" style="text-align: center;margin-top: 5px;color: #5a5e66">单</el-col>
          </el-row>
          <el-row :gutter="24" style="margin-right: 13%">
            <el-col :span="14" style="text-align: right;margin-top: 5px;color: #5a5e66">运维作业数:</el-col>
            <el-col :span="6" style="text-align: center">
              <div style="font-size: 30px;color:darkblue">{{ overview['jobs'] }}</div>
            </el-col>
            <el-col :span="4" style="text-align: center;margin-top: 5px;color: #5a5e66">次</el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
    <div class="c-title" style="font-weight: bold">服务器CPU使用率TOP3(最近1小时)</div>
    <el-carousel :interval="5000" type="card" height="350px">
      <el-carousel-item v-for="val in lineChartData" :key="val.legendName">
        <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px">
          <stacked-area-chart :chart-data="val" />
        </el-row>
      </el-carousel-item>
    </el-carousel>
    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="c-title" style="font-weight: bold">系统LOAD负载TOP7</div>
        <div class="chart-wrapper">
          <bar-chart :chart-data="cpuLoadChart" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="c-title" style="font-weight: bold">TCP活动连接数TOP7</div>
        <div class="chart-wrapper">
          <nightingale-chart :chart-data="customChart" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="c-title" style="font-weight: bold">服务器监控报警统计(周)</div>
        <div class="chart-wrapper">
          <bar-chart :chart-data="AlarmCountChart" />
        </div>
      </el-col>
    </el-row>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import BarChart from '@/components/echarts/BarChart'
import StackedAreaChart from '@/components/echarts/StackedAreaChart'
import { AlarmCount, getMetricTop, MonitorDetail } from '@/api/monitor'
import { AlarmColor, DataRefresh, RefreshClear } from '@/utils/kits'
import { overview } from '@/api/platform'
import NightingaleChart from '@/components/echarts/NightingaleChart'
import { getVersion, getYear } from '@/utils/filters'
import { getK8sOverview } from '@/api/k8s'

export default {
  inject: ['reload'],
  name: 'Dashboard',
  components: {
    NightingaleChart,
    StackedAreaChart,
    BarChart
  },
  filters: {
    AlarmColor
  },
  data() {
    return {
      lineChartData: {
        0: { expectedData: [], tagData: [], legendName: '', FormatData: '%' },
        1: { expectedData: [], tagData: [], legendName: '', FormatData: '%' },
        2: { expectedData: [], tagData: [], legendName: '', FormatData: '%' }
      },
      AlarmCountChart: { expectedData: [], tagData: [], legendName: '' },
      customChart: { expectedData: [], tagData: [], legendName: '' },
      cpuLoadChart: { expectedData: [], tagData: [], legendName: '' },
      overview: {},
      servers: {},
      resource: 'server',
      item: 'system',
      key: 'cpu_usage',
      duration: 60,
      k8sClusters: 0,
      year: getYear(),
      version: getVersion()
    }
  },
  created() {
    this.ShowMonitorDetail()
    this.GetAlarmCount()
    this.GetOverview()
    this.GetCpuLoadTop()
    this.GetCustomTop()
  },
  mounted() {
    DataRefresh(this.ShowMonitorDetail, {}, 30000)
  },
  destroyed() {
    // 在页面销毁后，清除计时器
    RefreshClear()
  },
  methods: {
    async ShowMonitorDetail() {
      await getMetricTop({ item: this.item, metric: this.key }).then((res) => {
        if (res.success) {
          for (let i = 0; i <= 2 && res.data.length >= 3; i++) {
            this.servers[i.toString()] = res.data[i].host_id
            this.lineChartData[i.toString()].legendName = res.data[i].host_name
          }
        }
      })
      for (const i in this.servers) {
        await MonitorDetail({
          host_id: this.servers[i],
          resource: this.resource, item: this.item, key: this.key, duration: this.duration
        }).then((res) => {
          if (res.success && res.data !== null) {
            this.lineChartData[i].expectedData = []
            this.lineChartData[i].tagData = []
            for (const val of res.data) {
              if (val !== null) {
                this.lineChartData[i].expectedData.push(val[this.key].toFixed(2))
                this.lineChartData[i].tagData.push(val['time'])
              }
            }
          }
        }).catch(function(err) {
          console.log(err)
        })
      }
    },
    GetAlarmCount() {
      AlarmCount().then((res) => {
        if (res.success) {
          this.AlarmCountChart.legendName = '报警次数'
          this.AlarmCountChart.expectedData = []
          this.AlarmCountChart.tagData = []
          res.data.forEach((val) => {
            for (const k in val) {
              this.AlarmCountChart.tagData.push(k)
              this.AlarmCountChart.expectedData.push(val[k])
            }
          })
        }
      })
    },
    GetCpuLoadTop() {
      getMetricTop({ item: 'system', metric: 'cpu_loadavg' }).then((res) => {
        if (res.success) {
          this.cpuLoadChart.legendName = 'CPU负载'
          this.cpuLoadChart.expectedData = []
          this.cpuLoadChart.tagData = []
          for (const v of res.data) {
            this.cpuLoadChart.tagData.push(v.host_name)
            this.cpuLoadChart.expectedData.push(v.top.toFixed(2))
          }
        }
      })
    },
    GetCustomTop() {
      getMetricTop({ item: 'system', metric: 'tcp_estab' }).then((res) => {
        if (res.success) {
          this.customChart.legendName = 'TCP活动连接数'
          this.customChart.expectedData = []
          this.customChart.tagData = []
          this.customChart.FormData = '%'
          for (const v of res.data) {
            this.customChart.expectedData.push({ value: v.top.toFixed(0), name: v.host_name })
          }
        }
      })
    },
    GetOverview() {
      overview().then((res) => {
        if (res.success) {
          this.overview = res.data
          if (res.data['your-node-ip'].includes('your-node-ip')) {
            this.$message({ type: 'error',
              message: 'configMap的opsone-config文件<your-node-ip>字段还未修改',
              duration: 30000 })
          }
        }
      })
      getK8sOverview().then((res) => {
        if (res.success) {
          this.k8sClusters = res.data['clusters']
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    border: 1px solid #bfcbd9;
    border-radius: 8px;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width: 1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}

.overview {
  height: 100px;
  font-weight: bold;
  font-size: large;
}

.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 320px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}

.c-title {
  font-size: smaller;
  text-align: center;
  margin-bottom: 2px;
  color: #5a5e66;
}
</style>
