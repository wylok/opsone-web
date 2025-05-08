<template>
  <div class="app-container">
    <div class="app-div-search" style="margin-bottom: 20px">
      <el-page-header :content="host_title" @back="goBack" />
    </div>
    <div v-if="HostInfo!==null">
      <div class="app-div" style="margin-bottom: 20px">
        <div style="font-size: 16px;font-weight: 700;margin-bottom: 20px">硬件信息</div>
        <el-table
          :data="[HostInfo]"
          border
          style="width: 100%;"
          :header-cell-style="{background:'#F8F8FA',color:'#606266',fontSize:'13px',fontWeight:'bold'}"
        >
          <el-table-column
            prop="host.host_id"
            label="UUID"
            width="auto"
          />
          <el-table-column
            prop="host.sn"
            label="服务编号"
            width="auto"
          />
          <el-table-column
            prop="host.host_type_cn"
            label="主机类型"
            width="auto"
          />
          <el-table-column
            prop="host.manufacturer"
            label="制造商"
            width="auto"
          />
        </el-table>
        <el-table
          :data="[HostInfo]"
          border
          style="width: 100%;"
          :header-cell-style="{background:'#F8F8FA',color:'#606266',fontSize:'13px',fontWeight:'bold'}"
        >
          <el-table-column
            prop="host.cpu_info"
            label="CPU信息"
            width="auto"
          />
          <el-table-column
            prop="host.cpu"
            label="CPU核数"
            width="auto"
          />
          <el-table-column
            label="主机内存"
            width="auto"
          >
            <template slot-scope="scope">
              {{ scope.row.host.memory / 1000 / 1024 / 1024| Round }}G
            </template>
          </el-table-column>
          <el-table-column
            label="主机硬盘"
            width="auto"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.host.disk / 1000 / 1024 / 1024 < 1000">
                {{ scope.row.host.disk / 1000 / 1024 / 1024| Round }}G
              </span>
              <span v-else>{{ scope.row.host.disk / 1000 / 1000 / 1024 / 1024| Round }}T</span>
            </template>
          </el-table-column>
        </el-table>
        <el-table
          :data="[HostInfo]"
          border
          style="width: 100%;"
          :header-cell-style="{background:'#F8F8FA',color:'#606266',fontSize:'13px',fontWeight:'bold'}"
        >
          <el-table-column
            prop="extend.buy_time"
            label="采购时间"
            width="auto"
          />
          <el-table-column
            prop="extend.expired_time"
            label="过保时间"
            width="auto"
          />
          <el-table-column
            prop="extend.ipmi"
            label="IPMI"
            width="auto"
          />
          <el-table-column
            prop="host.asset_tag"
            label="资产标签"
            width="auto"
          />
        </el-table>
      </div>
      <el-row :gutter="24">
        <el-col :span="12">
          <div class="app-div" style="margin-bottom: 20px; margin-right: 5px">
            <div style="font-size: 16px;font-weight: 700;margin-bottom: 20px">系统信息</div>
            <el-table
              :data="[HostInfo.host]"
              border
              style="width: 100%;"
              :header-cell-style="{background:'#F8F8FA',color:'#606266',fontSize:'13px',fontWeight:'bold'}"
            >
              <el-table-column
                prop="host_name"
                label="主机名称"
                show-overflow-tooltip
                width="auto"
              />
              <el-table-column
                prop="os"
                label="系统类型"
                width="80px"
              />
              <el-table-column
                prop="platform"
                label="操作系统"
                width="100px"
              />
              <el-table-column
                prop="platform_version"
                label="系统版本"
                show-overflow-tooltip
                width="auto"
              />
              <el-table-column
                prop="kernel_version"
                label="内核版本"
                show-overflow-tooltip
                width="auto"
              />
              <el-table-column
                prop="internet_ip"
                label="公网出口IP"
                width="auto"
              />
            </el-table>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="app-div" style="margin-bottom: 20px">
            <div style="font-size: 16px;font-weight: 700;margin-bottom: 20px">机房信息</div>
            <el-table
              :data="[HostInfo]"
              border
              style="width: 100%;"
              :header-cell-style="{background:'#F8F8FA',color:'#606266',fontSize:'13px',fontWeight:'bold'}"
            >
              <el-table-column
                prop="idc.idc_cn"
                label="IDC名称"
                width="auto"
              />
              <el-table-column
                prop="idc.region_cn"
                label="区域"
                width="auto"
              />
              <el-table-column
                prop="idc.data_center"
                label="数据中心"
                width="auto"
              />
              <el-table-column
                prop="extend.cabinet"
                label="机柜"
                width="auto"
              />
            </el-table>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col :span="12">
          <div class="app-div" style="margin-bottom: 20px; margin-right: 5px">
            <div style="font-size: 16px;font-weight: 700;margin-bottom: 20px">磁盘信息</div>
            <el-table
              :data="HostInfo.disk"
              border
              style="width: 100%;"
              :header-cell-style="{background:'#F8F8FA',color:'#606266',fontSize:'13px',fontWeight:'bold'}"
            >
              <el-table-column
                prop="disk_name"
                label="磁盘名称"
                width="auto"
              />
              <el-table-column
                prop="fs_type"
                label="磁盘系统"
                width="auto"
              />
              <el-table-column
                prop="disk_size"
                label="磁盘容量"
                width="auto"
              >
                <template slot-scope="scope">
                  <span v-if="scope.row.disk_size / 1000 / 1024 / 1024 < 1000">
                    {{ scope.row.disk_size / 1000 / 1024 / 1024| Round }}G
                  </span>
                  <span v-else>{{ scope.row.disk_size / 1000 / 1000 / 1024 / 1024| Round }}T</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="mount_point"
                label="挂载点"
                width="auto"
              />
            </el-table>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="app-div" style="margin-bottom: 20px">
            <div style="font-size: 16px;font-weight: 700;margin-bottom: 20px">网络信息</div>
            <el-table
              :data="HostInfo.net"
              border
              style="width:100%"
              :header-cell-style="{background:'#F8F8FA',color:'#606266',fontSize:'13px',fontWeight:'bold'}"
            >
              <el-table-column
                prop="name"
                label="网卡名称"
                width="auto"
              />
              <el-table-column
                prop="ip"
                label="IP地址"
                width="auto"
              />
              <el-table-column
                prop="netmask"
                label="子网掩码"
                width="auto"
              />
              <el-table-column
                prop="addr"
                label="MAC地址"
                width="auto"
              />
            </el-table>
          </div>
        </el-col>
      </el-row>
    </div>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { getServer } from '@/api/cmdb'
import { DateFormat, getVersion, getYear, Round } from '@/utils/filters'

export default {
  filters: {
    Round,
    DateFormat
  },
  data() {
    return {
      host_title: '',
      HostInfo: null,
      year: getYear(),
      version: getVersion()
    }
  },
  created() {
    getServer({ host_ids: this.$route.params['host_id'], detail: true }).then((res) => {
      if (res.success) {
        this.HostInfo = res.data[0]
        this.host_title = this.HostInfo.host.host_name + '主机详情'
      }
    })
  },
  methods: {
    goBack() {
      this.$router.back()
    }
  }
}
</script>
