<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import * as echarts from './mixins/echarts'
import resize from './mixins/resize'

require('./theme/shine') // echarts theme

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'shine')
      this.setOptions(this.chartData)
    },
    setOptions({ expectedData, legendName, FormatData } = {}) {
      if (FormatData == null) {
        FormatData = ''
      }
      this.chart.setOption({
        tooltip: {
          trigger: 'item'
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        legend: {
          top: '5%',
          left: 'left'
        },
        series: [{
          name: legendName,
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: false,
              fontSize: 14
            }
          },
          labelLine: {
            show: false
          },
          color: function () {
            // 定制显示（按顺序）
            const colorList = ['#5470c6','#91cc75', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
            return colorList[Math.floor((Math.random()*colorList.length-1)+1)]
          }(),
          data: expectedData,
          animationEasing: 'cubicInOut',
          animationDuration: 3000
        }]
      })
    }
  }
}
</script>
