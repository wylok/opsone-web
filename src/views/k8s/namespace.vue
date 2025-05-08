<template>
  <div class="app-container">
    <div class="app-div">
      <div class="namespace-container">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-page-header :content="k8s_name" style="margin-bottom: 10px" @back="goBack" />
          </el-col>
          <el-col :span="12" style="text-align: right;margin-top: -15px">
            <el-button type="text" style="color: green" @click="dialogVisible = true">创建namespace</el-button>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col v-for="(item,index) in list" :key="index" :span="6">
            <div class="chart-wrapper overview">
              <el-row :gutter="24" style="text-align: center">
                <el-col :span="24">
                  <router-link
                    :to="{ name:'application', params: { k8s_id: k8s_id, k8s_name: k8s_name, namespace: item.Name } }"
                  >
                    <el-button type="text" style="font-size: 22px;color: #234883">{{ item.Name }}</el-button>
                  </router-link>
                </el-col>
                <el-col :span="24" style="margin-top: 10px;font-size:small;color: #5a5e66">
                  <el-tooltip :content="item.CreationTime|DateFormat|AddTime" placement="top">
                    <span>{{ item.CreationTime|DateFormat|DateTimeFormat(8) }}</span>
                  </el-tooltip>
                </el-col>
              </el-row>
              <el-row :gutter="24" style="text-align: center">
                <el-col :span="12" style="margin-top: 10px;font-size: 15px;color: green">
                  {{ item.Phase }}
                </el-col>
                <el-col :span="12">
                  <el-button type="text" size="small" style="color: red" @click="delNameSpace(item.Name)">删除</el-button>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <el-dialog
      title="创建namespace"
      :visible.sync="dialogVisible"
      width="20%"
      :before-close="handleClose"
    >
      <el-input v-model="namespace" placeholder="请输入namespace" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createNameSpace">确 定</el-button>
      </span>
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DateFormat, DateTimeFormat, AddTime, getVersion, getYear } from '@/utils/filters'
import { addNameSpace, deleteNameSpace, getNameSpace } from '@/api/k8s'

export default {
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
      namespace: null,
      dialogVisible: false,
      multipleSelection: [],
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
    handleClose(done) {
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
    },
    getData() {
      getNameSpace({ k8s_id: this.k8s_id }).then((res) => {
        if (res.success) {
          this.list = res.data
        }
      })
    },
    createNameSpace() {
      addNameSpace({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
        if (res.success) {
          this.dialogVisible = false
          this.$message.success(this.namespace + '创建成功')
          this.getData()
        }
      })
    },
    delNameSpace(namespace) {
      this.$confirm('此操作将移除namespace' + namespace + '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteNameSpace({ k8s_id: this.k8s_id, namespace: namespace }).then((res) => {
          if (res.success) {
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
.namespace-container {
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
    background-image: url(../../img/namespace.png);
    background-size:30px 35px;
    background-repeat:no-repeat;
    background-position:300px 20px;
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
  height: 150px;
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
