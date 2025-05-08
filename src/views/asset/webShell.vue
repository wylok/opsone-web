<template>
  <div class="app-container">
    <div class="terminal-wrapper">
      <div class="control-bar">
        <el-row :gutter="24">
          <el-col :span="4">
            <el-page-header style="margin-top: 5px;color: #409EFF" @back="goBack" />
          </el-col>
          <el-col :span="14" style="text-align: center">
            <div style="font-size: large;margin-top: 1%">{{ asset_name }}主机控制台</div>
          </el-col>
          <el-col :span="6" style="text-align: right">
            <el-button type="primary" size="small" plain @click="clearTerminal">清屏</el-button>
          </el-col>
        </el-row>
      </div>
      <div id="terminal" class="terminal-container" />
    </div>
    <footer class="footer">{{ version }} © 2022–{{ year }}</footer>
  </div>
</template>
<script>
import { Terminal } from '@/utils/xterm'
import { AttachAddon } from '@/utils/xterm-addon-attach'
import { FitAddon } from '@/utils/xterm-addon-fit'
import { getVersion, getYear } from '@/utils/filters'
import { cookieGet } from '@/utils/cookie'
import { Host } from '@/utils/kits'
import '@/styles/xterm.css'
export default {
  data() {
    return {
      term: null,
      cols: 190,
      rows: 850,
      asset_type: null,
      asset_id: null,
      asset_name: null,
      pod: null,
      container: null,
      year: getYear(),
      version: getVersion()
    }
  },
  created() {
    this.asset_type = this.$route.params['asset_type']
    this.asset_name = this.$route.params['asset_name']
    this.asset_id = this.$route.params['asset_id']
  },
  mounted() {
    this.webShell()
  },
  methods: {
    goBack() {
      this.$router.back()
    },
    clearTerminal() {
      this.term.clear()
    },
    webShell() {
      const url = 'ws://' + Host() + '/api/v1/cmdb/connect?' + 'asset_type=' + this.asset_type + '&asset_id=' + this.asset_id +
        '&token=' + cookieGet('token') + '&cols=' + this.cols + '&rows=' + this.rows
      const socket = new WebSocket(url)
      const attachAddon = new AttachAddon(socket)
      const fitAddon = new FitAddon()
      this.term = new Terminal({
        theme: {
          background: '#1a1a1a',
          cursor: '#00ff00'
        },
        cursorBlink: true,
        fontSize: 14,
        cols: this.cols,
        rows: this.rows,
        convertEol: true,
        wrapMode: true,
        allowProposedApi: true,
        allowTransparency: true
      })
      this.term.loadAddon(fitAddon)
      // Attach the WebSocket to the terminal
      this.term.loadAddon(attachAddon)
      // Open the terminal in the #terminal div
      this.term.open(document.getElementById('terminal'))
      fitAddon.fit()
      // Connect to WebSocket
      socket.addEventListener('open', () => {
        this.term.write('\x1b[32m' + this.asset_name + '主机连接成功!\x1b[0m\r\n')
        this.term.write('\x1b[32m您在终端界面中执行的操作将被全程录屏!\x1b[0m\r\n')
      })
      // Handle WebSocket connection close
      socket.onclose = () => {
        this.term.write('\r\n' + '\x1b[32m' + this.asset_name + '主机连接已断开!\x1b[0m')
      }
    }
  }
}
</script>
<style scoped>
.terminal-container {
  width: 100%;
  height: 750px;
  padding: 10px;
  background: #1a1a1a;
  overflow: hidden;
  box-sizing: border-box
}
.terminal-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
