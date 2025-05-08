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
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
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
    setOptions({ expectedData, tagData, legendName, FormatData } = {}) {
      if (FormatData == null) {
        FormatData = ''
      }
      this.chart.setOption({
        xAxis: {
          data: tagData,
          boundaryGap: false,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 10,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10]
        },
        toolbox: {
          right: 10,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
          }
        },
        dataZoom: [
          {
            startValue: tagData[0]
          },
          {
            type: 'inside'
          }
        ],
        yAxis: {
          type: 'value',
          axisTick: {
            show: false
          },
          axisLabel: {
            formatter: '{value}' + FormatData
          }
        },
        legend: {
          data: [legendName]
        },
        series: [{
          name: legendName,
          markPoint: {
            data: [
              { type: 'max', name: 'max' },
              { type: 'min', name: 'min' }
            ]
          },
          color: function () {
            // 定制显示（按顺序）
            const colorList = ['#5470c6','#91cc75', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
            return colorList[Math.floor((Math.random()*colorList.length-1)+1)]
          }(),
          smooth: true,
          type: 'line',
          data: expectedData,
          animationDuration: 3000,
          animationEasing: 'cubicInOut'
        }]
      })
    }
  }
}
</script>
