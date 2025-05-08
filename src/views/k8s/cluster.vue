<template>
  <div class="app-container">
    <div class="app-div">
      <div class="cluster-container">
        <el-row :gutter="24">
          <el-col v-for="(item,index) in list" :key="index" :span="8">
            <div class="chart-wrapper overview">
              <el-row :gutter="24" style="text-align: center">
                <el-col :span="24">
                  <el-button
                    type="text"
                    style="font-size: xx-large;
                    color: #234883;
                    margin-top: 3%"
                    @click="modifyK8s(item.k8s_id, item.k8s_name, item.alarm_channel, item.alarm_contacts)"
                  >
                    {{ item.k8s_name }}
                  </el-button>
                </el-col>
                <el-col :span="24">
                  <el-divider />
                </el-col>
                <el-col :span="24" style="margin-top:3%;margin-bottom:3%;font-size: small;color: green">
                  <el-tooltip :content="item.create_time|DateFormat" placement="top">
                    <span>{{ item.create_time|DateFormat|DateTimeFormat(0) }}加入平台</span>
                  </el-tooltip>
                </el-col>
                <el-col :span="8">
                  <router-link
                    :to="{ name:'nodes', params: { k8s_id: item.k8s_id, k8s_name: item.k8s_name } }"
                  >
                    <el-button type="text" style="color: #234883;">节点Nodes</el-button>
                  </router-link>
                </el-col>
                <el-col :span="8">
                  <router-link
                    :to="{ name:'namespace', params: { k8s_id: item.k8s_id, k8s_name: item.k8s_name } }"
                  >
                    <el-button type="text" style="color: #234883;">Namespaces</el-button>
                  </router-link>
                </el-col>
                <el-col :span="8">
                  <el-button type="text" style="color: red" @click="delCluster(item.k8s_id, item.k8s_name)">删除集群</el-button>
                </el-col>
              </el-row>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="chart-wrapper overview">
              <el-row :gutter="24" style="text-align: center">
                <el-button
                  type="text"
                  round
                  style="font-size: larger;color: #99a9bf;margin-top: 20%"
                  @click="uploadVisible=true"
                >
                  +新增k8s集群
                </el-button>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>
      <div v-if="list!==null" style="text-align: center;margin-top: 1%;font-size: smaller;color: dodgerblue">提示: 如node/pod无监控数据,需在k8s集群master执行 kubectl apply -f https://gitee.com/opsone/opsone/raw/main/metrics-server.yaml</div>
    </div>
    <el-dialog
      title="新增k8s集群配置信息"
      :before-close="handleClose"
      :visible.sync="uploadVisible"
      width="55%"
    >
      <div style="margin-left: 10%;margin-bottom:3%">
        <div style="text-align: left;margin-bottom: 1%;font-size: smaller;color: dodgerblue">
          提示: 需确定opsone-server容器pod网络可连接到被纳管k8s集群master
        </div>
        <div style="width: 85%;margin-bottom: 1%">
          <el-input v-model="k8sName" placeholder="请输入k8s集群名称(必填)" />
          <el-input
            v-model="k8sConfig"
            type="textarea"
            :rows="12"
            placeholder="请粘贴k8s集群config文件内容(必填)"
            style="margin-top: 5px"
          />
        </div>
        <div style="height: 50px;border: 1px dashed #234883;border-radius: 2px;padding: 16px 16px 0;width: 85%">
          选择报警渠道:
          <el-radio-group v-model="alarm_channel" style="margin-left: 5%">
            <el-radio disabled label="Email">邮件</el-radio>
            <el-radio disabled label="Sms">短信</el-radio>
            <el-radio label="DingDing">钉钉</el-radio>
            <el-radio disabled label="weiXin">企业微信</el-radio>
            <el-radio disabled label="phone">语音电话</el-radio>
          </el-radio-group>
        </div>
        <div style="height: 100px;border: 1px dashed #234883;border-radius: 2px;padding: 16px 16px 0;width: 85%;margin-top: 1%">
          <div>报警联系人:</div>
          <el-input
            v-model="alarm_contacts"
            placeholder="多个钉钉token以逗号分割,需提前设置机器人关键词:报警"
          />
        </div>
        <el-row :gutter="24" style="margin-top: 3%">
          <el-col :span="12" :push="8">
            <el-button
              v-if="k8sName===null || k8sConfig===null"
              type="primary"
              disabled
            >
              提交
            </el-button>
            <el-button
              v-else
              type="primary"
              @click="submitUpload(k8sName, k8sConfig)"
            >
              提交
            </el-button>
            <el-button @click="cancelUpload">取消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
    <el-dialog
      title="修改k8s集群配置信息"
      :before-close="handleClose"
      :visible.sync="modifyVisible"
      width="55%"
    >
      <div style="margin-left: 10%;margin-bottom:3%">
        <div>
          <div>k8s集群名称:</div>
          <el-input v-model="k8sName" :value="k8sName" style="width: 85%;margin-bottom: 3%" />
        </div>
        <div style="height: 50px;border: 1px dashed #234883;border-radius: 2px;padding: 16px 16px 0;width: 85%">
          选择报警渠道:
          <el-radio-group v-model="alarm_channel" style="margin-left: 5%">
            <el-radio disabled label="Email">邮件</el-radio>
            <el-radio disabled label="Sms">短信</el-radio>
            <el-radio label="DingDing">钉钉</el-radio>
            <el-radio disabled label="weiXin">企业微信</el-radio>
            <el-radio disabled label="phone">语音电话</el-radio>
          </el-radio-group>
        </div>
        <div style="height: 100px;border: 1px dashed #234883;border-radius: 2px;padding: 16px 16px 0;width: 85%;margin-top: 3%">
          <div>报警联系人:</div>
          <el-input
            v-model="alarm_contacts"
            placeholder="多个钉钉token以逗号分割,需提前设置机器人关键词:报警"
            :value="alarm_contacts"
          />
        </div>
        <el-row :gutter="24" style="margin-top: 3%">
          <el-col :span="12" :push="8">
            <el-button
              v-if="k8sName===null"
              type="primary"
              disabled
            >
              提交
            </el-button>
            <el-button
              v-else
              type="primary"
              @click="modifyK8sCluster"
            >
              提交
            </el-button>
            <el-button @click="handleClose">取消</el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DateFormat, DateTimeFormat, AddTime, getVersion, getYear } from '@/utils/filters'
import { delK8sCluster, getK8sCluster, putK8sCluster, uploadK8sCluster } from '@/api/k8s'

export default {
  inject: ['reload'],
  filters: {
    DateFormat,
    AddTime,
    DateTimeFormat
  },
  data() {
    return {
      upload_k8s_cluster_url: null,
      list: null,
      inputDisable: true,
      listLoading: true,
      fileList: [],
      buttonDisabled: true,
      uploadVisible: false,
      modifyVisible: false,
      k8sId: null,
      k8sName: null,
      k8sConfig: null,
      alarm_channel: 'DingDing',
      alarm_contacts: null,
      year: getYear(),
      version: getVersion()
    }
  },
  created() {
    this.getData()
    setInterval(this.getData, 30000)
  },
  methods: {
    submitUpload(k8sName, k8sConfig) {
      uploadK8sCluster({ k8s_name: k8sName, k8s_config: k8sConfig,
        alarm_channel: this.alarm_channel, alarm_contacts: this.alarm_contacts }).then((res) => {
        if (res.success) {
          this.$message({
            type: 'success',
            message: 'k8s配置文件上传完成'
          })
          this.k8sName = null
          this.k8sConfig = null
          this.alarm_contacts = null
          this.uploadVisible = false
          this.modifyVisible = false
          this.getData()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    modifyK8s(k8s_id, k8s_name, alarm_channel, alarm_contacts) {
      this.k8sId = k8s_id
      this.k8sName = k8s_name
      this.alarm_channel = alarm_channel
      this.alarm_contacts = alarm_contacts
      this.modifyVisible = true
    },
    modifyK8sCluster() {
      putK8sCluster({ k8s_id: this.k8sId, k8s_name: this.k8sName, alarm_channel: this.alarm_channel,
        alarm_contacts: this.alarm_contacts }).then((res) => {
        if (res.success) {
          this.$message({
            type: 'success',
            message: 'k8s集群修改成功'
          })
          this.k8sId = null
          this.k8sName = null
          this.alarm_contacts = null
          this.modifyVisible = false
          this.getData()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    cancelUpload() {
      this.fileList = []
      this.k8sName = null
      this.k8sConfig = null
      this.alarm_contacts = null
      this.uploadVisible = false
      this.modifyVisible = false
    },
    handleClose(done) {
      this.k8sId = null
      this.k8sName = null
      this.k8sConfig = null
      this.alarm_contacts = null
      this.uploadVisible = false
      this.modifyVisible = false
      done()
    },
    getData(params) {
      this.listLoading = true
      getK8sCluster(params).then((res) => {
        if (res.success) {
          this.list = res.data
        }
      })
      this.listLoading = false
    },
    delCluster(k8s_id, k8s_name) {
      this.$confirm('此操作将永久删除k8s配置文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delK8sCluster({ k8s_id: k8s_id, k8s_name: k8s_name }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: 'k8s配置文件已删除'
            })
            this.getData()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
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
