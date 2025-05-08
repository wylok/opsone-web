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
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'left',
          bottom: '10',
          data: tagData
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        series: [{
          name: legendName,
          type: 'pie',
          radius: [20, 120],
          center: ['50%', '50%'],
          roseType: 'area',
          emphasis: {
            label: {
              show: false
            }
          },
          itemStyle: {
            borderRadius: 5
          },
          data: expectedData,
          animationEasing: 'cubicInOut',
          animationDuration: 3000
        }]
      })
    }
  }
}
</script>
