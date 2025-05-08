<template>
  <div class="app-container">
    <div class="app-div">
      <div class="cluster-container">
        <div v-if="clusterDate!==null">
          <el-row :gutter="24">
            <el-col v-for="(name,index) in clusterName" :key="index" :span="8">
              <div class="chart-wrapper overview">
                <el-row :gutter="24" style="text-align: center">
                  <el-col :span="24">
                    <div style="font-size: xx-large;color: #234883;margin-top: 25px">{{ name }}</div>
                  </el-col>
                </el-row>
                <el-divider />
                <el-row :gutter="24" style="text-align: center;font-size: 13px;margin-top: 8%;margin-bottom: 8%">
                  <el-col :span="12">
                    <el-tooltip content="apiserver的证书过期时间,更完整的证书过期时间检查,请使用kubeadm certs check-expiration命令" placement="top">
                      <span>证书剩余:<span style="font-size: 13px;color: darkred">{{ clusterDate[name]['daysLeft'] }}天</span></span>
                    </el-tooltip>
                  </el-col>
                  <el-col :span="12">
                    <el-tooltip content="apiserver的证书过期时间,更完整的证书过期时间检查,请使用kubeadm certs check-expiration命令" placement="top">
                      <span>证书到期:<span style="font-size: 13px;color: darkred">{{ clusterDate[name]['expires'] }}</span></span>
                    </el-tooltip>
                  </el-col>
                </el-row>
                <el-row :gutter="24" style="text-align: center;font-size: 13px">
                  <el-col :span="8">
                    nodes:<span style="font-size: 20px;color: darkgreen;margin-left: 8%">{{ clusterDate[name]['nodes'] }}</span>
                  </el-col>
                  <el-col :span="8">
                    nameSpace:<span style="font-size: 20px;color: darkgreen;margin-left: 8%">{{ clusterDate[name]['nameSpace'] }}</span>
                  </el-col>
                  <el-col :span="8">
                    pods:<span style="font-size: 20px;color: darkgreen;margin-left: 8%">{{ clusterDate[name]['pods'] }}</span>
                  </el-col>
                </el-row>
              </div>
            </el-col>
          </el-row>
        </div>
        <div v-else><el-empty :image-size="200" /></div>
      </div>
    </div>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>
<script>
import { DateFormat, DateTimeFormat, AddTime, getVersion, getYear } from '@/utils/filters'
import { getK8sOverview } from '@/api/k8s'

export default {
  inject: ['reload'],
  filters: {
    DateFormat,
    AddTime,
    DateTimeFormat
  },
  data() {
    return {
      clusterDate: null,
      clusterName: null,
      listLoading: true,
      year: getYear(),
      version: getVersion()
    }
  },
  created() {
    this.getData()
    setInterval(this.getData, 30000)
  },
  methods: {
    getData() {
      this.listLoading = true
      getK8sOverview().then((res) => {
        if (res.success) {
          this.clusterDate = res.data
          this.clusterName = res.data.clusterName
        }
      })
      this.listLoading = false
    }
  }
}
</script>
<style lang="scss" scoped>
.cluster-container {
  padding: 60px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background-image: url(../../img/k8s.png);
    background-size:50px 50px;
    background-repeat:no-repeat;
    background-position:320px 30px;
    border: 1px dashed #234883;
    border-radius: 20px;
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
  background: #e9edf3;
  height: 250px;
  font-weight: bold;
  font-size:large;
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
