<template>
  <div class="app-container">
    <div class="app-div">
      <el-tabs v-model="activeName" type="border-card" @tab-click="getData({ asset_type: activeName })">
        <el-tab-pane label="待分配服务器" name="discoverServer">
          <div class="app-div-search" style="margin-bottom: 20px">
            <el-row :gutter="24">
              <el-col :span="8">
                <el-input v-model="searchData" :placeholder="serverPrefixSearch" class="input-with-select">
                  <el-select slot="prepend" v-model="serverSearchParams" placeholder="请选择">
                    <el-option v-for="(k,v) in serverLabels" :key="k" :label="k" :value="v" />
                  </el-select>
                  <el-button slot="append" icon="el-icon-search" @click="onSearch" />
                </el-input>
              </el-col>
              <el-col :span="4"><br></el-col>
              <el-col :span="12" style="text-align: right">
                <el-button round :disabled="buttonDisabled" @click="assignHosts">批量分配</el-button>
                <el-button round :disabled="buttonDisabled" @click="discardServers">批量下架</el-button>
                <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
              </el-col>
            </el-row>
          </div>
          <el-table
            v-loading="listLoading"
            :data="ServerData"
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
            <el-table-column label="主机名称" show-overflow-tooltip align="center" width="auto">
              <template slot-scope="scope">
                <router-link
                  :to="{ name:'hostDetail', params: { host_id: scope.row['host_id'] } }"
                >
                  <el-link type="primary">{{ scope.row['host_name'] }}</el-link>
                </router-link>
              </template>
            </el-table-column>
            <el-table-column label="主机类型" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['host_type_cn'] }}
              </template>
            </el-table-column>
            <el-table-column label="型号" width="auto" show-overflow-tooltip align="center">
              <template slot-scope="scope">
                {{ scope.row['product_name'] }}
              </template>
            </el-table-column>
            <el-table-column label="SN" width="auto" show-overflow-tooltip align="center">
              <template slot-scope="scope">
                {{ scope.row['sn'] }}
              </template>
            </el-table-column>
            <el-table-column label="CPU" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['cpu'] }}
              </template>
            </el-table-column>
            <el-table-column label="内存" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['memory'] / 1000 / 1024 / 1024 | Round }}G
              </template>
            </el-table-column>
            <el-table-column label="磁盘" width="auto" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row['disk'] / 1000 / 1024 / 1024 < 1000">
                  {{ scope.row['disk'] / 1000 / 1024 / 1024| Round }}G
                </span>
                <span v-else>{{ scope.row['disk'] / 1000 / 1000 / 1024 / 1024| Round }}T</span>
              </template>
            </el-table-column>
            <el-table-column label="主机IP" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['ip'] }}
              </template>
            </el-table-column>
            <el-table-column label="操作系统" width="auto" show-overflow-tooltip align="center">
              <template slot-scope="scope">
                {{ scope.row['platform'] }}{{ scope.row['platform_version'] }}
              </template>
            </el-table-column>
            <el-table-column label="在线状态" width="auto" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.online===true" type="success">在线中</el-tag>
                <el-tag v-else type="info">已离线</el-tag>
              </template>
            </el-table-column>
            <el-table-column class-name="status-col" label="资产状态" width="90" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.online===true" :type="scope.row['asset_status'] | statusFilter">{{
                  scope.row['asset_status']|statusCn
                }}
                </el-tag>
                <el-tag v-else type="info">已禁用</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="110px">
              <template slot-scope="scope">
                <el-button-group>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="分配"
                    placement="top-end"
                  >
                    <el-button
                      type="success"
                      icon="el-icon-position"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="assignHost(scope.row['host_id'],scope.row['department_id'])"
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="下架"
                    placement="top-end"
                  >
                    <el-button
                      type="danger"
                      icon="el-icon-delete-solid"
                      size="mini"
                      circle
                      @click.native.prevent="discardServer(scope.row['host_id'])"
                    />
                  </el-tooltip>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
          <el-dialog
            title="分配服务器"
            :visible.sync="dialogVisible"
            width="30%"
            :before-close="handleClose"
          >
            <span>选择业务组:<el-cascader-panel :options="options" @change="handleChange" /></span>
            <span>资产标签:<el-input v-model="asset_tag" /></span>
            <span slot="footer" class="dialog-footer">
              <el-button @click="dialogVisible = false">取 消</el-button>
              <el-button type="primary" :disabled="assignButton" @click="assignServerPool">确 定</el-button>
            </span>
          </el-dialog>
          <el-pagination
            :current-page="currentPage"
            :page-sizes="pageSizes"
            :page-size="PerPage"
            layout="->, total, sizes, prev, pager, next, jumper"
            :total="totalCount"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-tab-pane>
        <el-tab-pane label="配置服务器池" name="serverPool">
          <div class="app-div-search" style="margin-bottom: 20px">
            <el-row :gutter="24">
              <el-col :span="12">
                <div style="margin-top: 2%;color: dodgerblue;font-size: small">提示:平台自动扫描IP段内的可登录服务器并安装agent
                  <span style="margin-top: 2%;color:black;font-size: x-small">(IP段为24位子网掩码段)</span></div>
              </el-col>
              <el-col :span="12" style="text-align: right">
                <el-button round @click="addServerIpShow">新增服务器IP段</el-button>
                <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
              </el-col>
            </el-row>
          </div>
          <el-table
            v-loading="listLoading"
            :data="ServerIpData"
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
            <el-table-column label="起始IP" width="130px" align="center">
              <template slot-scope="scope">
                {{ scope.row['start_ip'] }}
              </template>
            </el-table-column>
            <el-table-column label="结束IP" width="130px" align="center">
              <template slot-scope="scope">
                {{ scope.row['end_ip'] }}
              </template>
            </el-table-column>
            <el-table-column label="SSH端口" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['ssh_port'] }}
              </template>
            </el-table-column>
            <el-table-column label="SSH用户" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['ssh_user'] }}
              </template>
            </el-table-column>
            <el-table-column label="SSH密码" width="auto" align="center">
              <span style="font-weight: bolder;font-size: larger">********</span>
            </el-table-column>
            <el-table-column label="SSH密钥" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['ssh_key_name'] }}
              </template>
            </el-table-column>
            <el-table-column label="发现数量" width="auto" align="center">
              <template slot-scope="scope">
                <span style="font-weight: bolder;color:dodgerblue">{{ scope.row['discover'] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="所属IDC" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['idc_cn'] }}
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center" width="80" prop="switch_port" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-tag :type="scope.row['status'] | statusFilter">{{ scope.row['status']|actionFilter }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="create_time" label="创建时间" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="el-icon-time" />
                <span> {{ scope.row['create_time'] | DateFormat }} </span>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="sync_time" label="同步时间" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="el-icon-time" />
                <span> {{ scope.row['sync_time'] | DateFormat }} </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template slot-scope="scope">
                <el-button-group>
                  <el-tooltip
                    v-if="scope.row['status']==='disable'"
                    class="item"
                    effect="light"
                    content="启用"
                    placement="top-end"
                  >
                    <el-button
                      type="success"
                      icon="el-icon-circle-check"
                      size="mini"
                      circle
                      @click.native.prevent="modifyServerIpStatus(scope.row['id'], 'enable')"
                    />
                  </el-tooltip>
                  <el-tooltip
                    v-if="scope.row['status']==='enable'"
                    class="item"
                    effect="light"
                    content="停用"
                    placement="top-end"
                  >
                    <el-button
                      type="warning"
                      icon="el-icon-circle-close"
                      size="mini"
                      circle
                      @click.native.prevent="modifyServerIpStatus(scope.row['id'], 'disable')"
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="变更"
                    placement="top-end"
                  >
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="modifyServerIpShow(scope.row['id'],scope.row['start_ip'], scope.row['end_ip'],
                                                                scope.row['ssh_port'], scope.row['ssh_user'],
                                                                scope.row['ssh_password'],scope.row['ssh_key_name'],
                                                                scope.row['idc_id'])"
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="删除"
                    placement="top-end"
                  >
                    <el-button
                      type="danger"
                      icon="el-icon-delete-solid"
                      size="mini"
                      circle
                      @click.native.prevent="deleteServerIp(scope.row['id'])"
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
        </el-tab-pane>
        <el-tab-pane label="配置交换机池" name="switchPool">
          <div class="app-div-search" style="margin-bottom: 20px">
            <el-row :gutter="24">
              <el-col :span="12">
                <div style="margin-top: 2%;color: dodgerblue;font-size: small">提示:平台自动扫描IP段内的可登录交换机并获取配置信息
                  <span style="margin-top: 2%;color:black;font-size: x-small">(IP段为24位子网掩码段)</span></div>
              </el-col>
              <el-col :span="12" style="text-align: right">
                <el-button round @click="addSwitchShow">新增交换机IP段</el-button>
                <el-button round icon="el-icon-refresh" @click="onSearch">刷新</el-button>
              </el-col>
            </el-row>
          </div>
          <el-table
            v-loading="listLoading"
            :data="SwitchData"
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
            <el-table-column label="起始IP" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['start_ip'] }}
              </template>
            </el-table-column>
            <el-table-column label="结束IP" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['end_ip'] }}
              </template>
            </el-table-column>
            <el-table-column label="SSH端口" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['switch_port'] }}
              </template>
            </el-table-column>
            <el-table-column label="SSH用户" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['switch_user'] }}
              </template>
            </el-table-column>
            <el-table-column label="SSH密码" width="auto" align="center">
              <span style="font-weight: bolder;font-size: larger">********</span>
            </el-table-column>
            <el-table-column label="发现数量" width="auto" align="center">
              <template slot-scope="scope">
                <span style="font-weight: bolder;color:dodgerblue">{{ scope.row['discover'] }}</span>
              </template>
            </el-table-column>
            <el-table-column label="所属IDC" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['idc_cn'] }}
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center" width="80" prop="switch_port" show-overflow-tooltip>
              <template slot-scope="scope">
                <el-tag :type="scope.row['switch_status'] | statusFilter">{{
                  scope.row['switch_status']|actionFilter
                }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="create_time" label="创建时间" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="el-icon-time" />
                <span> {{ scope.row['create_time'] | DateFormat }} </span>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="sync_time" label="同步时间" width="auto" show-overflow-tooltip>
              <template slot-scope="scope">
                <i class="el-icon-time" />
                <span> {{ scope.row['sync_time'] | DateFormat }} </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template slot-scope="scope">
                <el-button-group>
                  <el-tooltip
                    v-if="scope.row['switch_status']==='disable'"
                    class="item"
                    effect="light"
                    content="启用"
                    placement="top-end"
                  >
                    <el-button
                      type="success"
                      icon="el-icon-circle-check"
                      size="mini"
                      circle
                      @click.native.prevent="modifySwitchStatus(scope.row['id'],'enable')"
                    />
                  </el-tooltip>
                  <el-tooltip
                    v-if="scope.row['switch_status']==='enable'"
                    class="item"
                    effect="light"
                    content="停用"
                    placement="top-end"
                  >
                    <el-button
                      type="warning"
                      icon="el-icon-circle-close"
                      size="mini"
                      circle
                      @click.native.prevent="modifySwitchStatus(scope.row['id'],'disable')"
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="变更"
                    placement="top-end"
                  >
                    <el-button
                      type="primary"
                      icon="el-icon-edit"
                      size="mini"
                      circle
                      plain
                      @click.native.prevent="modifySwitchShow(scope.row['id'],scope.row['start_ip'], scope.row['end_ip'],
                                                              scope.row['switch_port'], scope.row['switch_user'],
                                                              scope.row['switch_password'],scope.row['idc_id'])"
                    />
                  </el-tooltip>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="删除"
                    placement="top-end"
                  >
                    <el-button
                      type="danger"
                      icon="el-icon-delete-solid"
                      size="mini"
                      circle
                      @click.native.prevent="alertDeleteSwitch(scope.row['id'])"
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
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog
      title="新增交换机IP段"
      :visible.sync="switchVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div style="margin-bottom: 20px">
        <el-form label-position="right" label-width="120px" :model="switchForm">
          <el-form-item label="起始IP(同网段)" required>
            <el-input v-model="switchForm.start_ip" class="switch_input" />
          </el-form-item>
          <el-form-item label="结束IP(同网段)" required>
            <el-input v-model="switchForm.end_ip" class="switch_input" />
          </el-form-item>
          <el-form-item label="SSH端口" required>
            <el-input v-model="switchForm.switch_port" type="number" class="switch_input" />
          </el-form-item>
          <el-form-item label="SSH用户" required>
            <el-input v-model="switchForm.switch_user" class="switch_input" />
          </el-form-item>
          <el-form-item label="SSH密码" required>
            <el-input
              v-model="switchForm.switch_password"
              class="switch_input"
            />
          </el-form-item>
          <el-form-item label="IDC数据中心" required>
            <el-select v-model="switchForm.idc_id" placeholder="请选择">
              <el-option
                v-for="item in idc_ids"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="addSwitch">增加</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="变更交换机IP段"
      :visible.sync="modifySwitchVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div style="margin-bottom: 20px">
        <el-form label-position="right" label-width="120px" :model="switchForm">
          <el-form-item label="起始IP(同网段)" required>
            <el-input v-model="switchForm.start_ip" class="switch_input" />
          </el-form-item>
          <el-form-item label="结束IP(同网段)" required>
            <el-input v-model="switchForm.end_ip" class="switch_input" />
          </el-form-item>
          <el-form-item label="SSH端口" required>
            <el-input v-model="switchForm.switch_port" type="number" class="switch_input" />
          </el-form-item>
          <el-form-item label="SSH用户" required>
            <el-input v-model="switchForm.switch_user" class="switch_input" />
          </el-form-item>
          <el-form-item label="SSH密码" required>
            <el-input
              v-model="switchForm.switch_password"
              class="switch_input"
            />
          </el-form-item>
          <el-form-item label="IDC数据中心" required>
            <el-select v-model="switchForm.idc_id" placeholder="请选择">
              <el-option
                v-for="item in idc_ids"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="modifySwitch">变更</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="新增服务器IP段"
      :visible.sync="serverIpVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div style="margin-bottom: 20px">
        <el-form label-position="right" label-width="120px" :model="serverIpForm">
          <el-form-item label="起始IP(同网段)" required>
            <el-input v-model="serverIpForm.start_ip" class="server_input" />
          </el-form-item>
          <el-form-item label="结束IP(同网段)" required>
            <el-input v-model="serverIpForm.end_ip" class="server_input" />
          </el-form-item>
          <el-form-item label="SSH端口" required>
            <el-input v-model="serverIpForm.ssh_port" type="number" class="server_input" />
          </el-form-item>
          <el-form-item label="SSH用户">
            <el-input v-model="serverIpForm.ssh_user" class="server_input" disabled />
          </el-form-item>
          <el-form-item label="SSH密码">
            <el-input
              v-model="serverIpForm.ssh_password"
              class="server_input"
            />
          </el-form-item>
          <el-form-item label="SSH密钥">
            <el-select v-model="serverIpForm.ssh_key_name" placeholder="请选择">
              <el-option
                v-for="item in key_names"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="IDC数据中心" required>
            <el-select v-model="serverIpForm.idc_id" placeholder="请选择">
              <el-option
                v-for="item in idc_ids"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="addServerIp">增加</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="变更服务器IP段"
      :visible.sync="modifyServerIpVisible"
      width="30%"
      :before-close="handleClose"
    >
      <div style="margin-bottom: 20px">
        <el-form label-position="right" label-width="120px" :model="serverIpForm">
          <el-form-item label="起始IP(同网段)" required>
            <el-input v-model="serverIpForm.start_ip" class="server_input" />
          </el-form-item>
          <el-form-item label="结束IP(同网段)" required>
            <el-input v-model="serverIpForm.end_ip" class="server_input" />
          </el-form-item>
          <el-form-item label="SSH端口" required>
            <el-input v-model="serverIpForm.ssh_port" type="number" class="server_input" />
          </el-form-item>
          <el-form-item label="SSH用户">
            <el-input v-model="serverIpForm.ssh_user" class="server_input" disabled />
          </el-form-item>
          <el-form-item label="SSH密码">
            <el-input
              v-model="serverIpForm.ssh_password"
              class="server_input"
            />
          </el-form-item>
          <el-form-item label="SSH密钥">
            <el-select v-model="serverIpForm.ssh_key_name" placeholder="请选择">
              <el-option
                v-for="item in key_names"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="IDC数据中心">
            <el-select v-model="serverIpForm.idc_id" placeholder="请选择">
              <el-option
                v-for="item in idc_ids"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleClose">取消</el-button>
        <el-button @click="modifyServerIp">变更</el-button>
      </span>
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>

import {
  DeleteServerIpPool,
  DeleteServerPool,
  deleteSwitchPool,
  getIdc,
  GetServerIpPool,
  GetServerPool,
  getSshKey,
  getSwitchPool,
  PostServerIpPool,
  PostServerPool,
  postSwitchPool,
  PutServerIpPool,
  putSwitchPool
} from '@/api/cmdb'
import { actionFilter, DateFormat, getVersion, getYear, Round, statusFilter } from '@/utils/filters'
import { GetDepartment } from '@/api/auth'

export default {
  inject: ['reload'],
  filters: {
    statusCn(status) {
      const statusMap = {
        available: '可分配',
        disable: '已禁用'
      }
      return statusMap[status]
    },
    Round,
    DateFormat,
    actionFilter,
    statusFilter
  },
  data() {
    return {
      ServerData: null,
      ServerIpData: [],
      SwitchData: [],
      activeName: 'discoverServer',
      listLoading: true,
      dialogVisible: false,
      assignServers: [],
      assignButton: true,
      departments: {},
      options: [],
      businessId: '',
      departmentId: '',
      asset_tag: '',
      buttonDisabled: true,
      switchVisible: false,
      serverIpVisible: false,
      modifySwitchVisible: false,
      modifyServerIpVisible: false,
      multipleSelection: [],
      serverPrefixSearch: '搜索服务器名称',
      serverLabels: { host_name: '服务器名称' },
      searchData: '',
      serverSearchParams: 'host_name',
      switchForm: {
        id: 0,
        start_ip: '',
        end_ip: '',
        switch_port: 22,
        switch_user: '',
        switch_password: '',
        idc_id: 'none'
      },
      serverIpForm: {
        id: 0,
        start_ip: '',
        end_ip: '',
        ssh_port: 22,
        ssh_user: 'root',
        ssh_password: 'none',
        ssh_key_name: 'none',
        idc_id: 'none'
      },
      key_names: [{ value: 'none', label: '无' }],
      idc_ids: [{ value: 'none', label: '无' }],
      passwordType: 'password',
      idcNames: {},
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
  created() {
    const params = { asset_type: this.activeName, pre_page: this.PerPage, page: this.currentPage }
    if (this.$route.params['asset_id'] !== undefined) {
      params['asset_id'] = this.$route.params['asset_id']
    }
    GetDepartment().then((res) => {
      if (res.success) {
        this.departments = res.data
        for (const id in this.departments) {
          if (this.departments[id] !== undefined) {
            if (this.departments[id]['business']) {
              const children = []
              for (const k in this.departments[id]['business_group']) {
                children.push({ value: k, label: this.departments[id]['business_group'][k] })
              }
              if (children) {
                this.options.push({ value: id, label: this.departments[id]['department_name'], children: children })
              }
            }
          }
        }
      }
    })
    getSshKey({ pre_page: 100, page: 1 }).then((res) => {
      if (res.success) {
        if (res.data !== null) {
          for (const v of res.data) {
            this.key_names.push({ value: v['key_name'], label: v['key_name'] })
          }
        }
      }
    })
    getIdc({ pre_page: 100, page: 1 }).then((res) => {
      if (res.success) {
        if (res.data !== null) {
          for (const v of res.data) {
            if (v != null) {
              this.idc_ids.push({ label: v['idc_cn'] + '-' + v['region_cn'] + '-' + v['data_center'], value: v['idc_id'] })
              this.idcNames[v['idc_id']] = v['idc_cn']
            }
          }
        }
      }
    })
    this.getData(params)
  },
  methods: {
    handleChange(value) {
      this.departmentId = value[[value.length - 2]]
      this.businessId = value[[value.length - 1]]
      this.assignButton = false
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.buttonDisabled = this.multipleSelection.length <= 1
      // 其它方法可以处理已选择的行数据
    },
    onSearch() {
      const params = { asset_type: this.activeName, pre_page: this.PerPage, page: this.currentPage }
      if (this.searchParams !== '' && this.searchData !== '') {
        params[this.searchParams] = this.searchData
      }
      this.currentPage = 1
      this.getData(params)
    },
    // 获取主机资产列表
    getData(params) {
      this.listLoading = true
      if (params['asset_type'] === 'discoverServer') {
        GetServerPool(params).then((res) => {
          if (res.success) {
            this.ServerData = res.data
            this.totalCount = res.pages.totalCount
            this.listLoading = false
          }
        })
      }
      if (params['asset_type'] === 'serverPool') {
        GetServerIpPool(params).then((res) => {
          if (res.success) {
            if (res.data !== null) {
              this.ServerIpData = []
              for (const v of res.data) {
                v['idc_cn'] = this.idcNames[v['idc_id']]
                this.ServerIpData.push(v)
              }
            }
            this.totalCount = res.pages.totalCount
            this.listLoading = false
          }
        })
      }
      if (params['asset_type'] === 'switchPool') {
        getSwitchPool(params).then((res) => {
          if (res.success) {
            this.SwitchData = []
            for (const v of res.data) {
              v['idc_cn'] = this.idcNames[v['idc_id']]
              this.SwitchData.push(v)
            }
            this.totalCount = res.pages.totalCount
            this.listLoading = false
          }
        })
      }
    },
    handleClose(done) {
      this.multipleSelection = []
      this.switchVisible = false
      this.serverIpVisible = false
      this.modifyServerIpVisible = false
      this.modifySwitchVisible = false
      done()
    },
    assignHost(host_id, department_id) {
      this.dialogVisible = true
      this.assignServers.push(host_id)
      if (department_id !== undefined) {
        for (const v of this.options) {
          if (v.value === department_id) {
            this.options = v
          }
        }
      }
    },
    assignHosts() {
      if (this.multipleSelection.length > 1) {
        this.multipleSelection.forEach((v) => {
          this.assignServers.push(v['host_id'])
        })
        for (const v of this.options) {
          if (v.value === this.multipleSelection[0]['department_id']) {
            this.options = v
          }
        }
        this.dialogVisible = true
      }
    },
    assignServerPool() {
      if (this.businessId === null || this.departmentId === null) {
        this.$message.error('请先选择部门及所属业务组')
      } else {
        PostServerPool({
          asset_ids: this.assignServers,
          asset_tag: this.asset_tag,
          department_id: this.departmentId,
          business_id: this.businessId
        }).then((res) => {
          if (res.success) {
            this.dialogVisible = false
            this.asset_tag = null
            this.assignServers = []
            this.multipleSelection = []
            this.$message.success('资源池服务器分配完成!')
            this.onSearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      }
    },
    discardServer(host_id) {
      this.$confirm('此操作将永久删除所选服务器, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        DeleteServerPool({ asset_ids: [host_id] }).then((res) => {
          if (res.success) {
            this.$message.success('资源池服务器下架完成!')
            this.onSearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    discardServers() {
      const hostIds = []
      this.$confirm('此操作将永久删除所选服务器, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.multipleSelection.length > 1) {
          this.multipleSelection.forEach((v) => {
            hostIds.push(v['host_id'])
          })
        }
        DeleteServerPool({ asset_ids: hostIds }).then((res) => {
          if (res.success) {
            this.multipleSelection = []
            this.$message.success('所选资源池服务器全部下架完成!')
            this.onSearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    alertDeleteSwitch(id) {
      this.$confirm('此操作将删除交换机IP段信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSwitchPool({ id: id }).then((res) => {
          if (res.success) {
            this.onSearch()
            this.$message({
              type: 'success',
              message: '删除成功'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    addSwitchShow() {
      this.switchForm.id = null
      this.switchForm.start_ip = null
      this.switchForm.end_ip = null
      this.switchForm.switch_port = null
      this.switchForm.switch_user = null
      this.switchForm.switch_password = null
      this.switchForm.idc_id = 'none'
      this.switchVisible = true
    },
    addSwitch() {
      this.switchForm.switch_port = parseInt(this.switchForm.switch_port)
      postSwitchPool(this.switchForm).then((res) => {
        if (res.success) {
          this.switchVisible = false
          this.$message.success('新增交换机IP段信息成功')
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    modifySwitchShow(id, start_ip, end_ip, switch_port, switch_user, switch_password, idc_id) {
      this.switchForm.id = id
      this.switchForm.start_ip = start_ip
      this.switchForm.end_ip = end_ip
      this.switchForm.switch_port = parseInt(switch_port)
      this.switchForm.switch_user = switch_user
      this.switchForm.switch_password = switch_password
      this.switchForm.idc_id = idc_id
      this.modifySwitchVisible = true
    },
    modifySwitch() {
      putSwitchPool(this.switchForm).then((res) => {
        if (res.success) {
          this.$message.success('变更交换机IP段成功')
          this.onSearch()
        }
        this.modifySwitchVisible = false
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    modifySwitchStatus(id, status) {
      putSwitchPool({ id: id, switch_status: status }).then((res) => {
        if (res.success) {
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    addServerIpShow() {
      this.serverIpForm.start_ip = null
      this.serverIpForm.end_ip = null
      this.serverIpForm.ssh_port = 22
      this.serverIpForm.ssh_password = null
      this.serverIpForm.idc_id = 'none'
      this.serverIpVisible = true
    },
    addServerIp() {
      this.serverIpForm.ssh_port = parseInt(this.serverIpForm.ssh_port)
      PostServerIpPool(this.serverIpForm).then((res) => {
        if (res.success) {
          this.$message.success('新增服务器IP段成功')
          this.onSearch()
        }
        this.serverIpVisible = false
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    modifyServerIpShow(id, start_ip, end_ip, ssh_port, ssh_user, ssh_password, ssh_key_name, idc_id) {
      this.serverIpForm.id = id
      this.serverIpForm.start_ip = start_ip
      this.serverIpForm.end_ip = end_ip
      this.serverIpForm.ssh_port = parseInt(ssh_port)
      this.serverIpForm.ssh_user = ssh_user
      this.serverIpForm.ssh_password = ssh_password
      this.serverIpForm.ssh_key_name = ssh_key_name
      this.serverIpForm.idc_id = idc_id
      this.modifyServerIpVisible = true
    },
    modifyServerIp() {
      PutServerIpPool(this.serverIpForm).then((res) => {
        if (res.success) {
          this.$message.success('变更服务器IP段成功')
          this.onSearch()
        }
        this.modifyServerIpVisible = false
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    modifyServerIpStatus(id, status) {
      PutServerIpPool({ id: id, status: status }).then((res) => {
        if (res.success) {
          this.onSearch()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    deleteServerIp(id) {
      this.$confirm('此操作将删除服务器IP段信息, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        DeleteServerIpPool({ id: id }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: '删除成功'
            })
            this.onSearch()
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    // 每页显示的条数
    handleSizeChange(val) {
      // 改变每页显示的条数
      this.PerPage = val
      // 注意：在改变每页显示的条数时，要将页码显示到第一页
      this.currentPage = 1
      // 点击每页显示的条数时，显示第一页
      this.getData({ pre_page: this.PerPage, page: this.currentPage })
    },
    // 显示第几页
    handleCurrentChange(page) {
      // 切换页码时，要获取每页显示的条数
      this.currentPage = page
      const params = { asset_type: this.activeName, pre_page: this.PerPage, page: this.currentPage }
      if (this.searchData !== null && this.searchData !== '' && this.searchData !== undefined) {
        params[this.searchParams] = this.searchData
      }
      this.getData(params)
    }
  }
}
</script>
<style lang="scss" scoped>
.switch_input {
  width: 80%
}

.server_input {
  width: 80%
}
</style>
