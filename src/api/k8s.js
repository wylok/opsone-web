import request from '@/utils/request'
import { Host } from '@/utils/kits'

const base_url = 'http://' + Host() + '/api/v1/k8s'
export function getNodes(params) {
  return request({
    url: base_url + '/nodes',
    method: 'get',
    params: params
  })
}
export function getNodeDetail(params) {
  return request({
    url: base_url + '/node/detail',
    method: 'get',
    params: params
  })
}
export function getNodeYaml(params) {
  return request({
    url: base_url + '/node/yaml',
    method: 'get',
    params: params
  })
}
export function getNameSpace(params) {
  return request({
    url: base_url + '/namespaces',
    method: 'get',
    params: params
  })
}
export function deleteNameSpace(data) {
  return request({
    url: base_url + '/namespace',
    method: 'delete',
    data
  })
}
export function addNameSpace(data) {
  return request({
    url: base_url + '/namespace',
    method: 'post',
    data
  })
}
export function getDeployment(params) {
  return request({
    url: base_url + '/deployments',
    method: 'get',
    params: params
  })
}
export function getDeploymentYaml(params) {
  return request({
    url: base_url + '/deployment/yaml',
    method: 'get',
    params: params
  })
}
export function getDaemonSet(params) {
  return request({
    url: base_url + '/daemonSets',
    method: 'get',
    params: params
  })
}
export function getDaemonSetYaml(params) {
  return request({
    url: base_url + '/daemonSet/yaml',
    method: 'get',
    params: params
  })
}
export function getServiceYaml(params) {
  return request({
    url: base_url + '/service/yaml',
    method: 'get',
    params: params
  })
}
export function getConfigMapYaml(params) {
  return request({
    url: base_url + '/configMap/yaml',
    method: 'get',
    params: params
  })
}
export function getStatefulSetYaml(params) {
  return request({
    url: base_url + '/statefulSet/yaml',
    method: 'get',
    params: params
  })
}
export function getStatefulSet(params) {
  return request({
    url: base_url + '/statefulSets',
    method: 'get',
    params: params
  })
}
export function getService(params) {
  return request({
    url: base_url + '/services',
    method: 'get',
    params: params
  })
}
export function getIngress(params) {
  return request({
    url: base_url + '/ingress',
    method: 'get',
    params: params
  })
}
export function getEndpoint(params) {
  return request({
    url: base_url + '/endpoints',
    method: 'get',
    params: params
  })
}
export function getEvent(params) {
  return request({
    url: base_url + '/events',
    method: 'get',
    params: params
  })
}
export function getConfigMap(params) {
  return request({
    url: base_url + '/configMaps',
    method: 'get',
    params: params
  })
}
export function addConfigMap(data) {
  return request({
    url: base_url + '/configMap',
    method: 'post',
    data
  })
}
export function updateConfigMap(data) {
  return request({
    url: base_url + '/configMap',
    method: 'put',
    data
  })
}
export function getSecret(params) {
  return request({
    url: base_url + '/secrets',
    method: 'get',
    params: params
  })
}
export function addSecret(data) {
  return request({
    url: base_url + '/secret',
    method: 'post',
    data
  })
}
export function getJobs(params) {
  return request({
    url: base_url + '/jobs',
    method: 'get',
    params: params
  })
}
export function getCronJobs(params) {
  return request({
    url: base_url + '/cronjobs',
    method: 'get',
    params: params
  })
}
export function getLimitRanges(params) {
  return request({
    url: base_url + '/limitRanges',
    method: 'get',
    params: params
  })
}
export function getServiceAccounts(params) {
  return request({
    url: base_url + '/serviceAccounts',
    method: 'get',
    params: params
  })
}
export function getAutoScalers(params) {
  return request({
    url: base_url + '/autoScalers',
    method: 'get',
    params: params
  })
}
export function uploadAutoScaler(data) {
  return request({
    url: base_url + '/autoScaler',
    method: 'put',
    data
  })
}
export function deleteAutoScaler(data) {
  return request({
    url: base_url + '/autoScaler',
    method: 'delete',
    data
  })
}
export function getK8sCluster(params) {
  return request({
    url: base_url + '/cluster',
    method: 'get',
    params: params
  })
}
export function getK8sPods(params) {
  return request({
    url: base_url + '/pods',
    method: 'get',
    params: params
  })
}
export function getPodEvent(params) {
  return request({
    url: base_url + '/pod/event',
    method: 'get',
    params: params
  })
}
export function getClusterRoles(params) {
  return request({
    url: base_url + '/role/cluster',
    method: 'get',
    params: params
  })
}
export function getClusterRoleBinding(params) {
  return request({
    url: base_url + '/role/cluster/binding',
    method: 'get',
    params: params
  })
}
export function uploadK8sCluster(data) {
  return request({
    url: base_url + '/cluster',
    method: 'post',
    data
  })
}
export function updateNode(data) {
  return request({
    url: base_url + '/node',
    method: 'put',
    data
  })
}
export function nodeTaint(data) {
  return request({
    url: base_url + '/node/taint',
    method: 'post',
    data
  })
}
export function updateDaemonSet(data) {
  return request({
    url: base_url + '/daemonSet',
    method: 'put',
    data
  })
}
export function updateDeployment(data) {
  return request({
    url: base_url + '/deployment',
    method: 'put',
    data
  })
}
export function deleteDaemonSet(data) {
  return request({
    url: base_url + '/daemonSet',
    method: 'delete',
    data
  })
}
export function deleteStatefulSet(data) {
  return request({
    url: base_url + '/statefulSet',
    method: 'delete',
    data
  })
}
export function deleteService(data) {
  return request({
    url: base_url + '/service',
    method: 'delete',
    data
  })
}
export function delK8sCluster(data) {
  return request({
    url: base_url + '/cluster',
    method: 'delete',
    data
  })
}
export function deletePod(data) {
  return request({
    url: base_url + '/pod',
    method: 'delete',
    data
  })
}
export function deleteNode(data) {
  return request({
    url: base_url + '/node',
    method: 'delete',
    data
  })
}
export function deleteDeployment(data) {
  return request({
    url: base_url + '/deployment',
    method: 'delete',
    data
  })
}
export function deleteConfigMap(data) {
  return request({
    url: base_url + '/configMap',
    method: 'delete',
    data
  })
}
export function deleteSecret(data) {
  return request({
    url: base_url + '/secret',
    method: 'delete',
    data
  })
}
export function deleteEndpoint(data) {
  return request({
    url: base_url + '/endpoint',
    method: 'delete',
    data
  })
}
export function deleteEvent(data) {
  return request({
    url: base_url + '/event',
    method: 'delete',
    data
  })
}
export function deleteIngress(data) {
  return request({
    url: base_url + '/ingress',
    method: 'delete',
    data
  })
}
export function deleteLimitRange(data) {
  return request({
    url: base_url + '/limitRange',
    method: 'delete',
    data
  })
}
export function deleteServiceAccount(data) {
  return request({
    url: base_url + '/serviceAccount',
    method: 'delete',
    data
  })
}
export function restartDeployment(data) {
  return request({
    url: base_url + '/deployment/restart',
    method: 'post',
    data
  })
}
export function restartDaemonSet(data) {
  return request({
    url: base_url + '/daemonSet/restart',
    method: 'post',
    data
  })
}
export function restartStatefulSet(data) {
  return request({
    url: base_url + '/statefulSet/restart',
    method: 'post',
    data
  })
}
export function getReplicaSets(params) {
  return request({
    url: base_url + '/replicaSets',
    method: 'get',
    params: params
  })
}
export function getMetricChart(params) {
  return request({
    url: base_url + '/metric',
    method: 'get',
    params: params
  })
}
export function getK8sOverview(params) {
  return request({
    url: base_url + '/overview',
    method: 'get',
    params: params
  })
}
export function putK8sCluster(data) {
  return request({
    url: base_url + '/cluster',
    method: 'put',
    data
  })
}
