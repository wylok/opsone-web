<template>
  <div class="app-container">
    <div class="app-div">
      <el-page-header :content="content" style="margin-bottom: 10px" @back="goBack" />
      <el-tabs v-model="activeName" type="border-card" @tab-click="getData(k8s_id, namespace, activeName)">
        <el-tab-pane v-for="(k,v) in activeNames" :key="k" :label="k" :name="v">
          <el-table
            v-if="activeName===k"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="180px">
              <template slot-scope="scope">
                <router-link
                  :to="{ name:activeName, params: { k8s_id: k8s_id, k8s_name: k8s_name, namespace: namespace, name: scope.row['Name'] } }"
                >
                  <el-link underline>{{ scope.row['Name'] }}</el-link>
                </router-link>
              </template>
            </el-table-column>
            <el-table-column label="Ready" width="auto" align="center">
              <template slot-scope="scope">
                <el-tag type="success">{{ scope.row['ReadyReplicas'] }} / {{ scope.row['Replicas'] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="available" width="auto" align="center">
              <template slot-scope="scope">
                <el-tag>{{ scope.row['AvailableReplicas'] }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="updated" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['UpdatedReplicas'] }}
              </template>
            </el-table-column>
            <el-table-column label="image" width="600px" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                <div style="text-align: left">{{ scope.row['Container']['image'] }}</div>
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template slot-scope="scope">
                <el-tooltip content="查看/编辑yaml">
                  <el-button
                    v-if="activeName==='deployment'"
                    type="success"
                    icon="el-icon-tickets"
                    size="mini"
                    circle
                    plain
                    @click.native.prevent="deploymentYaml(scope.row['Name'])"
                  />
                </el-tooltip>
                <el-button
                  v-if="activeName==='deployment'"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delDeployment(scope.row['Name'])"
                />
                <el-tooltip content="查看/编辑yaml">
                  <el-button
                    v-if="activeName==='daemonSet'"
                    type="success"
                    icon="el-icon-tickets"
                    size="mini"
                    circle
                    plain
                    @click.native.prevent="daemonSetYaml(scope.row['Name'])"
                  />
                </el-tooltip>
                <el-button
                  v-if="activeName==='daemonSet'"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delDaemonSet(scope.row['Name'])"
                />
                <el-tooltip content="查看/编辑yaml">
                  <el-button
                    v-if="activeName==='statefulSet'"
                    type="success"
                    icon="el-icon-tickets"
                    size="mini"
                    circle
                    plain
                    @click.native.prevent="statefulSetYaml(scope.row['Name'])"
                  />
                </el-tooltip>
                <el-button
                  v-if="activeName==='statefulSet'"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delStatefulSet(scope.row['Name'])"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="service" name="service">
          <el-table
            v-if="activeName==='service'"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="180px">
              <template slot-scope="scope">
                {{ scope.row['name'] }}
              </template>
            </el-table-column>
            <el-table-column label="type" width="180px" align="center">
              <template slot-scope="scope">
                {{ scope.row['type'] }}
              </template>
            </el-table-column>
            <el-table-column label="clusterIP" width="180px" align="center">
              <template slot-scope="scope">
                {{ scope.row['ClusterIP'] }}
              </template>
            </el-table-column>
            <el-table-column label="selector" width="auto" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                {{ scope.row['Selector'] }}
              </template>
            </el-table-column>
            <el-table-column label="ports" width="200px" align="center" show-overflow-tooltip>
              <template slot-scope="scope">
                <div style="text-align: left">
                  <el-tag>{{ scope.row['TargetPort'] }}</el-tag>
                  <el-tag v-if="scope.row['NodePort']!==0" type="warning">{{ scope.row['NodePort'] }}</el-tag>
                  <el-tag type="success">{{ scope.row['Protocol'] }}</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="150px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="150px">
              <template slot-scope="scope">
                <el-tooltip content="查看/编辑yaml">
                  <el-button
                    v-if="activeName==='service'"
                    type="success"
                    icon="el-icon-tickets"
                    size="mini"
                    circle
                    plain
                    @click.native.prevent="serviceYaml(scope.row['name'])"
                  />
                </el-tooltip>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delService(scope.row['name'])"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="ingress" name="ingress">
          <el-table
            v-if="activeName==='ingress'"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="180px">
              <template slot-scope="scope">
                {{ scope.row['name'] }}
              </template>
            </el-table-column>
            <el-table-column label="LoadBalancer" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['LoadBalancer'] }}
              </template>
            </el-table-column>
            <el-table-column label="Rules" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['Rules'] }}
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="auto">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="150px">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delIngress(scope.row['name'])"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="autoScalers" name="autoScalers">
          <el-table
            v-if="activeName==='autoScalers'"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="200px">
              <template slot-scope="scope">
                {{ scope.row['Name'] }}
              </template>
            </el-table-column>
            <el-table-column label="当前CPU利用率" align="center" width="auto">
              <template slot-scope="scope">
                <el-tag v-if="scope.row['CurrentCPUUtilizationPercentage']<=scope.row['CPUUtilizationPercentage']*0.7" type="success">
                  {{ scope.row['CurrentCPUUtilizationPercentage'] }}%
                </el-tag>
                <el-tag v-else type="warning">
                  {{ scope.row['CurrentCPUUtilizationPercentage'] }}%
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="目标CPU利用率" align="center" width="auto">
              <template slot-scope="scope">
                <el-tag>{{ scope.row['CPUUtilizationPercentage'] }}%</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="最小副本数" align="center" width="auto">
              <template slot-scope="scope">
                {{ scope.row['MinReplicas'] }}
              </template>
            </el-table-column>
            <el-table-column label="最大副本数" align="center" width="auto">
              <template slot-scope="scope">
                {{ scope.row['MaxReplicas'] }}
              </template>
            </el-table-column>
            <el-table-column label="当前副本数" align="center" width="auto">
              <template slot-scope="scope">
                {{ scope.row['CurrentReplicas'] }}
              </template>
            </el-table-column>
            <el-table-column label="期望副本数" align="center" width="auto">
              <template slot-scope="scope">
                {{ scope.row['DesiredReplicas'] }}
              </template>
            </el-table-column>
            <el-table-column label="LastScaleTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['LastScaleTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['LastScaleTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delScaler(scope.row['Name'])"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="endpoint" name="endpoint">
          <el-table
            v-if="activeName==='endpoint'"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="180px">
              <template slot-scope="scope">
                {{ scope.row['name'] }}
              </template>
            </el-table-column>
            <el-table-column label="address" align="center" width="auto">
              <template slot-scope="scope">
                <el-row :gutter="24">
                  <el-col
                    v-for="(item,index) in scope.row['address']"
                    :key="index"
                    :span="4"
                    style="margin-bottom: 15px"
                  >
                    <el-tag>{{ item }}</el-tag>
                  </el-col>
                </el-row>
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="180px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delEndpoint(scope.row['name'])"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="events" name="events">
          <el-table
            v-if="activeName==='events'"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="350px">
              <template slot-scope="scope">
                {{ scope.row['Name'] }}
              </template>
            </el-table-column>
            <el-table-column label="message" align="center" show-overflow-tooltip width="auto">
              <template slot-scope="scope">
                {{ scope.row['Message'] }}
              </template>
            </el-table-column>
            <el-table-column label="reason" align="center" show-overflow-tooltip width="200px">
              <template slot-scope="scope">
                {{ scope.row['Reason'] }}
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="150px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delEvent(scope.row['Name'])"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="jobs" name="jobs">
          <el-table
            v-if="activeName==='jobs'"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="auto">
              <template slot-scope="scope">
                {{ scope.row['Name'] }}
              </template>
            </el-table-column>
            <el-table-column label="Active" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['Active'] }}
              </template>
            </el-table-column>
            <el-table-column label="Succeeded" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['Succeeded'] }}
              </template>
            </el-table-column>
            <el-table-column label="StartTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['StartTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['StartTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="CompletionTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CompletionTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CompletionTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent=""
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="cronjobs" name="cronjobs">
          <el-table
            v-if="activeName==='cronjobs'"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="auto">
              <template slot-scope="scope">
                {{ scope.row['Name'] }}
              </template>
            </el-table-column>
            <el-table-column label="Schedule" width="auto" align="center">
              <template slot-scope="scope">
                {{ scope.row['Schedule'] }}
              </template>
            </el-table-column>
            <el-table-column label="Suspend" width="auto" align="center">
              <template slot-scope="scope">
                <el-tag v-if="scope.row['Suspend']===false" type="success">{{ scope.row['Suspend']|Status }}</el-tag>
                <el-tag v-else type="danger">{{ scope.row['Suspend']|Status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="LastScheduleTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['LastScheduleTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['LastScheduleTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="LastSuccessfulTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['LastSuccessfulTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['LastSuccessfulTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent=""
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="configMap" name="configMap">
          <div style="text-align: right">
            <el-button type="text" @click="configMapVisible=true">创建configMap</el-button>
          </div>
          <el-table
            v-if="activeName==='configMap'"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="300px">
              <template slot-scope="scope">
                {{ scope.row['Name'] }}
              </template>
            </el-table-column>
            <el-table-column label="Data" align="center" width="auto">
              <template slot-scope="scope">
                <el-tabs :tab-position="tabPosition" style="height: 100%">
                  <el-tab-pane v-for="(v,k) in scope.row['Data']" :key="k" :label="k" :name="v">
                    <div>{{ v }}</div>
                  </el-tab-pane>
                </el-tabs>
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="160px">
              <template slot-scope="scope">
                <el-tooltip content="查看/编辑yaml">
                  <el-button
                    v-if="activeName==='configMap'"
                    type="success"
                    icon="el-icon-tickets"
                    size="mini"
                    circle
                    plain
                    @click.native.prevent="configMapYaml(scope.row['Name'])"
                  />
                </el-tooltip>
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="configMapModify(scope.row['Name'],scope.row['Stages'])"
                />
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delConfigMap(scope.row['Name'])"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="secret" name="secret">
          <div style="text-align: right">
            <el-button type="text" @click="secretVisible=true">创建secret</el-button>
          </div>
          <el-table
            v-if="activeName==='secret'"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="300px">
              <template slot-scope="scope">
                {{ scope.row['Name'] }}
              </template>
            </el-table-column>
            <el-table-column label="Data" align="center" width="auto">
              <template slot-scope="scope">
                <el-tabs :tab-position="tabPosition" style="height: 100%">
                  <el-tab-pane v-for="(v,k) in scope.row['Data']" :key="k" :label="k" :name="v">
                    <div>{{ v }}</div>
                  </el-tab-pane>
                </el-tabs>
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delSecret(scope.row['Name'])"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="limitRanges" name="limitRanges">
          <el-table
            v-if="activeName==='limitRanges'"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="300px">
              <template slot-scope="scope">
                {{ scope.row['Name'] }}
              </template>
            </el-table-column>
            <el-table-column label="Limits" align="center" width="auto">
              <template slot-scope="scope">
                {{ scope.row['Limits'] }}
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delLimitRange(scope.row['Name'])"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="serviceAccounts" name="serviceAccounts">
          <el-table
            v-if="activeName==='serviceAccounts'"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="300px">
              <template slot-scope="scope">
                {{ scope.row['Name'] }}
              </template>
            </el-table-column>
            <el-table-column label="Secrets" align="center" width="auto">
              <template slot-scope="scope">
                <div v-for="(k,v) in scope.row['Secrets']" :key="v">{{ k['name'] }}</div>
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delServiceAccount(scope.row['Name'])"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="clusterRoles" name="clusterRoles">
          <el-table
            v-if="activeName==='clusterRoles'"
            :data="list"
            border
            fit
            highlight-current-row
          >
            <el-table-column label="name" align="center" show-overflow-tooltip width="300px">
              <template slot-scope="scope">
                {{ scope.row['Name'] }}
              </template>
            </el-table-column>
            <el-table-column label="Labels" align="center" width="auto">
              <template slot-scope="scope">
                <el-tag v-for="(k,v) in scope.row['Labels']" :key="k" style="margin-right: 5px;margin-bottom: 5px">{{ k +':'+v }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="AggregationRule" align="center" width="150px">
              <template slot-scope="scope">
                {{ scope.row['AggregationRule'] }}
              </template>
            </el-table-column>
            <el-table-column label="rules" align="center" width="100px">
              <template slot-scope="scope">
                <el-button v-if="scope.row['Rules']!==undefined" type="text" @click="showRules(scope.row['Rules'])">{{ scope.row['Rules'].length }}</el-button>
                <el-button v-else type="text" />
              </template>
            </el-table-column>
            <el-table-column label="creationTime" align="center" width="170px">
              <template slot-scope="scope">
                <el-tooltip :content="scope.row['CreationTime']|DateFormat|AddTime" placement="top">
                  <span>{{ scope.row['CreationTime']|DateFormat|DateTimeFormat(8) }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="120px">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  plain
                  @click.native.prevent="delServiceAccount(scope.row['Name'])"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog
      :title="yamlTitle"
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
      title="创建secret"
      :visible.sync="secretVisible"
      width="45%"
      :before-close="handleClose"
    >
      <el-row :gutter="20">
        <el-col :span="12">名称空间:{{ namespace }}</el-col>
        <el-col :span="12">
          <el-input v-model="secretData.name" placeholder="请输入secret名称">
            <template slot="prepend">名称(必填)</template>
          </el-input>
        </el-col>
      </el-row>
      <div>
        docker server
        <el-input v-model="secretData.data.dockerServer" placeholder="请输入docker仓库地址,以http://或者https://开头">
          <template slot="prepend">必填</template>
        </el-input>
      </div>
      <div style="margin-top: 15px">
        docker username
        <el-input v-model="secretData.data.dockerUser" placeholder="请输入docker仓库用户名">
          <template slot="prepend">必填</template>
        </el-input>
      </div>
      <div style="margin-top: 15px">
        docker password
        <el-input v-model="secretData.data.dockerPassword" placeholder="请输入docker仓库密码">
          <template slot="prepend">必填</template>
        </el-input>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="creatSecret">创 建</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="创建|更新configMap"
      :visible.sync="configMapVisible"
      width="45%"
      autosize
      :before-close="handleClose"
    >
      <el-row :gutter="24">
        <el-col :span="6">名称空间:{{ namespace }}</el-col>
        <el-col :span="12">
          <el-input v-model="configMapData.name" placeholder="请输入configMap名称">
            <template slot="prepend">名称(必填)</template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="text" @click="addStage">新增条目</el-button>
        </el-col>
      </el-row>
      <el-form ref="configMapData" :model="configMapData">
        <el-form-item
          v-for="(stage, index) in configMapData.Stages"
          :key="index"
          :label="index|addIndex"
          :prop="'Stages.' + index + '.value'+ '.value'"
        >
          <div style="margin-top: 15px">
            <el-row :gutter="24">
              <el-col :span="20" style="margin-left: 10px">
                <el-input v-model="stage.key" placeholder="请输入数据条目key">
                  <template slot="prepend">必填</template>
                </el-input>
              </el-col>
              <el-col :span="2">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  plain
                  circle
                  :disabled="deleteButton"
                  @click.prevent="removeStage(index)"
                />
              </el-col>
            </el-row>
            <el-row :gutter="24" style="margin-top: 10px">
              <el-col :span="20" offset="2">
                <el-input
                  v-model="stage.value"
                  type="textarea"
                  autosize
                  placeholder="请输入数据条目数据"
                />
              </el-col>
            </el-row>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button v-if="modifyMap===false" type="primary" @click="creatConfigMap">创 建</el-button>
        <el-button v-else type="primary" @click="modifyConfigMap">更 新</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="ClusterRules"
      :visible.sync="ruleVisible"
      width="65%"
      :before-close="handleClose"
    >
      <el-table
        :data="rules"
        border
        fit
        highlight-current-row
      >
        <el-table-column label="apiGroups" align="center" width="auto">
          <template slot-scope="scope">
            <el-row>
              <el-col v-if="scope.row['apiGroups'][0]===''">v1</el-col>
              <div v-else>
                <el-col v-for="(v,k) in scope.row['apiGroups']" :key="k">{{ v }}</el-col>
              </div>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="resources" align="center" width="auto">
          <template slot-scope="scope">
            <el-col v-for="(v,k) in scope.row['resources'] " :key="k">{{ v }}</el-col>
          </template>
        </el-table-column>
        <el-table-column label="verbs" align="center" show-overflow-tooltip width="auto">
          <template slot-scope="scope">
            <el-col v-for="(v,k) in scope.row['verbs'] " :key="k">{{ v }}</el-col>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>

<script>
import { DateFormat, DateTimeFormat, AddTime, getVersion, getYear } from '@/utils/filters'
import {
  getDaemonSet,
  getDeployment,
  getEndpoint,
  getEvent,
  getService,
  getIngress,
  getStatefulSet,
  getConfigMap,
  getSecret,
  getJobs,
  getCronJobs,
  getLimitRanges,
  getServiceAccounts,
  getAutoScalers,
  deleteDeployment,
  deleteDaemonSet,
  deleteStatefulSet,
  deleteService,
  getDeploymentYaml,
  getDaemonSetYaml,
  getServiceYaml,
  getConfigMapYaml,
  deleteConfigMap,
  deleteSecret,
  deleteEndpoint,
  deleteEvent,
  deleteIngress,
  deleteLimitRange,
  deleteServiceAccount,
  deleteAutoScaler,
  addSecret,
  addConfigMap,
  updateConfigMap,
  getStatefulSetYaml, getClusterRoles
} from '@/api/k8s'

export default {
  inject: ['reload'],
  filters: {
    DateFormat,
    AddTime,
    DateTimeFormat,
    addIndex(val) {
      val = val + 1
      return '条目' + val
    },
    Status(v) {
      const date = { false: '未挂起', true: '已挂起' }
      return date[v]
    }
  },
  data() {
    return {
      list: [],
      rules: [],
      k8s_id: null,
      k8s_name: null,
      namespace: null,
      content: null,
      textarea: null,
      yamlTitle: '',
      tabPosition: 'left',
      activeName: 'deployment',
      activeNames: { 'deployment': 'deployment', 'daemonSet': 'daemonSet', 'statefulSet': 'statefulSet' },
      secretData: {
        k8s_id: null,
        namespace: null,
        name: null,
        type: 'kubernetes.io/dockerconfigjson',
        data: {
          dockerServer: null,
          dockerUserName: null,
          dockerPassword: null
        }
      },
      configMapData: {
        name: null,
        Stages: [{ key: null, value: null }]
      },
      yamlVisible: false,
      yamlModify: false,
      secretVisible: false,
      configMapVisible: false,
      ruleVisible: false,
      modifyMap: false,
      deleteButton: false,
      year: getYear(),
      version: getVersion()
    }
  },
  created() {
    this.k8s_id = this.$route.params['k8s_id']
    this.k8s_name = this.$route.params['k8s_name']
    this.namespace = this.$route.params['namespace']
    this.content = this.k8s_name + ' | ' + this.namespace
    this.secretData.k8s_id = this.k8s_id
    this.secretData.namespace = this.namespace
    this.getData()
    setInterval(this.getData, 30000)
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    handleClose(done) {
      this.ruleVisible = false
      this.yamlVisible = false
      this.yamlModify = false
      this.yamlTitle = ''
      this.secretVisible = false
      this.configMapVisible = false
      this.modifyMap = false
      this.configMapData.name = null
      this.configMapData.Stages = [{ key: null, value: null }]
      done()
    },
    getData() {
      if (this.activeName === 'deployment') {
        getDeployment({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'daemonSet') {
        getDaemonSet({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'statefulSet') {
        getStatefulSet({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'service') {
        getService({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'ingress') {
        getIngress({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'endpoint') {
        getEndpoint({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'events') {
        getEvent({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'configMap') {
        getConfigMap({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'secret') {
        getSecret({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'jobs') {
        getJobs({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'cronjobs') {
        getCronJobs({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'limitRanges') {
        getLimitRanges({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'serviceAccounts') {
        getServiceAccounts({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'autoScalers') {
        getAutoScalers({ k8s_id: this.k8s_id, namespace: this.namespace }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
      if (this.activeName === 'clusterRoles') {
        getClusterRoles({ k8s_id: this.k8s_id }).then((res) => {
          if (res.success) {
            this.list = res.data
          }
        })
      }
    },
    deploymentYaml(deployment) {
      this.textarea = null
      this.yamlTitle = 'DeploymentYaml'
      getDeploymentYaml({ k8s_id: this.k8s_id, namespace: this.namespace, name: deployment }).then((res) => {
        if (res.success) {
          this.textarea = res.data
        }
      })
      this.yamlVisible = true
    },
    daemonSetYaml(daemonSet) {
      this.textarea = null
      this.yamlTitle = 'DaemonSetYaml'
      getDaemonSetYaml({ k8s_id: this.k8s_id, namespace: this.namespace, name: daemonSet }).then((res) => {
        if (res.success) {
          this.textarea = res.data
        }
      })
      this.yamlVisible = true
    },
    statefulSetYaml(statefulSet) {
      this.textarea = null
      this.yamlTitle = 'DaemonSetYaml'
      getStatefulSetYaml({ k8s_id: this.k8s_id, namespace: this.namespace, name: statefulSet }).then((res) => {
        if (res.success) {
          this.textarea = res.data
        }
      })
      this.yamlVisible = true
    },
    serviceYaml(service) {
      this.textarea = null
      this.yamlTitle = 'ServiceYaml'
      getServiceYaml({ k8s_id: this.k8s_id, namespace: this.namespace, name: service }).then((res) => {
        if (res.success) {
          this.textarea = res.data
        }
      })
      this.yamlVisible = true
    },
    configMapYaml(configMap) {
      this.textarea = null
      this.yamlTitle = 'ConfigMapYaml'
      getConfigMapYaml({ k8s_id: this.k8s_id, namespace: this.namespace, name: configMap }).then((res) => {
        if (res.success) {
          this.textarea = res.data
        }
      })
      this.yamlVisible = true
    },
    delDeployment(deployment) {
      this.$confirm('此操作将移除' + deployment + '并销毁所属pod,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDeployment({ k8s_id: this.k8s_id, namespace: this.namespace, name: deployment }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: deployment + '已移除'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delDaemonSet(daemonSet) {
      this.$confirm('此操作将移除' + daemonSet + '并销毁所属pod,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDaemonSet({ k8s_id: this.k8s_id, namespace: this.namespace, name: daemonSet }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: daemonSet + '已移除'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delStatefulSet(statefulSet) {
      this.$confirm('此操作将移除' + statefulSet + '并销毁所属pod,是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteStatefulSet({ k8s_id: this.k8s_id, namespace: this.namespace, name: statefulSet }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: statefulSet + '已移除'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delService(service) {
      this.$confirm('此操作将移除' + service, '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteService({ k8s_id: this.k8s_id, namespace: this.namespace, name: service }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: service + '已移除'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delConfigMap(configMap) {
      this.$confirm('此操作将移除' + configMap, '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteConfigMap({ k8s_id: this.k8s_id, namespace: this.namespace, name: configMap }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: configMap + '已移除'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delSecret(secret) {
      this.$confirm('此操作将移除' + secret, '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSecret({ k8s_id: this.k8s_id, namespace: this.namespace, name: secret }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: secret + '已移除'
            })
          }
          this.getData()
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delEndpoint(endpoint) {
      this.$confirm('此操作将移除' + endpoint, '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteEndpoint({ k8s_id: this.k8s_id, namespace: this.namespace, name: endpoint }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: endpoint + '已移除'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delEvent(event) {
      this.$confirm('此操作将移除' + event, '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteEvent({ k8s_id: this.k8s_id, namespace: this.namespace, name: event }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: event + '已移除'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delIngress(ingress) {
      this.$confirm('此操作将移除' + ingress, '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteIngress({ k8s_id: this.k8s_id, namespace: this.namespace, name: ingress }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: ingress + '已移除'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delLimitRange(limitRange) {
      this.$confirm('此操作将移除' + limitRange, '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteLimitRange({ k8s_id: this.k8s_id, namespace: this.namespace, name: limitRange }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: limitRange + '已移除'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delServiceAccount(serviceAccount) {
      this.$confirm('此操作将移除' + serviceAccount, '是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteServiceAccount({ k8s_id: this.k8s_id, namespace: this.namespace, name: serviceAccount }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: serviceAccount + '已移除'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    delScaler(scaler) {
      this.$confirm('此操作将关闭' + scaler + '，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteAutoScaler({ k8s_id: this.k8s_id, namespace: this.namespace, name: scaler }).then((res) => {
          if (res.success) {
            this.$message({
              type: 'success',
              message: scaler + '关闭成功'
            })
          }
        }).catch(function(err) {
          if (err.toString().includes('403')) {
            alert('用户无权限进行操作,请联系管理员')
          }
        })
      })
    },
    creatSecret() {
      addSecret(this.secretData).then((res) => {
        if (res.success) {
          this.$message({
            type: 'success',
            message: this.secretData.name + '创建成功'
          })
          this.handleClose()
          this.getData()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    creatConfigMap() {
      addConfigMap({ k8s_id: this.k8s_id, namespace: this.namespace,
        name: this.configMapData.name, data: this.configMapData.Stages }).then((res) => {
        if (res.success) {
          this.$message({
            type: 'success',
            message: this.configMapData.name + '创建成功'
          })
          this.handleClose()
          this.getData()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    configMapModify(name, stages) {
      this.modifyMap = true
      this.configMapVisible = true
      this.configMapData.name = name
      this.configMapData.Stages = stages
    },
    modifyConfigMap() {
      updateConfigMap({ k8s_id: this.k8s_id, namespace: this.namespace,
        name: this.configMapData.name, data: this.configMapData.Stages }).then((res) => {
        if (res.success) {
          this.$message({
            type: 'success',
            message: this.configMapData.name + '更新成功'
          })
          this.handleClose()
          this.getData()
        }
      }).catch(function(err) {
        if (err.toString().includes('403')) {
          alert('用户无权限进行操作,请联系管理员')
        }
      })
    },
    addStage() {
      this.configMapData.Stages.push({ key: null, value: null })
      this.deleteButton = this.configMapData.Stages.length <= 1
    },
    removeStage(index) {
      if (index !== -1) {
        this.configMapData.Stages.splice(index, 1)
        this.deleteButton = this.configMapData.Stages.length <= 1
      }
    },
    showRules(rules) {
      this.rules = rules
      this.ruleVisible = true
    }
  }
}
</script>
