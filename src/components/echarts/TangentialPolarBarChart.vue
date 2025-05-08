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
    setOptions({ expectedData, tagData, title, max } = {}) {
      this.chart.setOption(
        {
          title: [
            {
              text: title,
              textStyle: {
                fontSize: 14
              }
            }
          ],
          tooltip: {
            trigger: 'axis',
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          polar: {
            radius: [30, '80%']
          },
          angleAxis: {
            max: max,
            startAngle: 75,
            show: true,
            axisLabel: {
              show: true
            }
          },
          radiusAxis: {
            type: 'category',
            data: tagData
          },
          series: {
            name: title,
            type: 'bar',
            data: expectedData,
            color: function () {
              // 定制显示（按顺序）
              const colorList = ['#5470c6','#91cc75', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
              return colorList[Math.floor((Math.random()*colorList.length-1)+1)]
            }(),
            coordinateSystem: 'polar',
            label: {
              show: true,
              position: 'middle',
              formatter: '{b}:{c}'
            },
            animationDuration: 3000,
            animationEasing: 'cubicInOut'
          }
        }
      )
    }
  }
}
</script>
