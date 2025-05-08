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
          type: 'category'
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}' + FormatData
          }
        },
        legend: {
          data: [legendName]
        },
        series: [{
          name: legendName,
          areaStyle: {},
          color: function () {
            // 定制显示（按顺序）
            const colorList = ['#5470c6','#91cc75', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
            return colorList[Math.floor((Math.random()*colorList.length-1)+1)]
          }(),
          emphasis: {
            focus: 'series'
          },
          markPoint: {
            data: [
              { type: 'max', name: 'max' },
              { type: 'min', name: 'min' }
            ]
          },
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
