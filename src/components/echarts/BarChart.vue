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
    setOptions({ expectedData, tagData, legendName, FormatData } = {}) {
      if (FormatData == null) {
        FormatData = ''
      }
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          top: 10,
          left: '2%',
          right: '2%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [{
          type: 'category',
          data: tagData,
          axisTick: {
            alignWithLabel: true
          }
        }],
        yAxis: [{
          type: 'value',
          axisTick: {
            show: false
          },
          axisLabel: {
            formatter: '{value}' + FormatData
          }
        }],
        series: [{
          name: legendName,
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          },
          color: function () {
            // 定制显示（按顺序）
            const colorList = ['#5470c6','#91cc75', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
            return colorList[Math.floor((Math.random()*colorList.length-1)+1)]
          }(),
          barWidth: '60%',
          data: expectedData,
          animationDuration: 3000,
          animationEasing: 'cubicInOut'
        }]
      })
    }
  }
}
</script>
