import React, { Component, PropTypes } from 'react'
import d3 from 'd3'
import _ from 'lodash'
import moment from 'moment'
import './index.scss'

export default class LineChart extends Component {
  componentDidMount() {
    this.init()
    this.update(this.props.data)
  }

  shouldComponentUpdate(nextProps) {
    return ! _.isEqual(nextProps, this.props)
  }

  componentDidUpdate() {
    this.update(this.props.data)
  }

  init() {
    const { chart } = this.refs
    const { data, formatX, formatY, width, height, margin, radius } = this.props

    let x = d3.scale.ordinal().rangePoints([0, width - margin * 2])
    let y = d3.scale.ordinal().rangePoints([height - margin * 2, 0])

    this.x = x
    this.y = y
    this.xAxis = d3.svg.axis().scale(x).tickFormat(formatX)
    this.yAxis = d3.svg.axis().scale(y).orient('left').tickFormat(formatY)

    this.chart = d3.select(chart)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin}, ${margin})`)

    this.chart.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height - margin * 2})`)

    this.chart.append('g')
      .attr('class', 'y axis')

    this.line = d3.svg.line()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .interpolate('linear')

    this.zeroLine = d3.svg.line()
      .x(d => x(d.x))
      .y(d => height - 2 * margin)
      .interpolate('linear')

    this.area = d3.svg.area()
      .x(d => x(d.x))
      .y0(d => height - margin * 2)
      .y1(d => y(d.y))
      .interpolate('linear')
    
    this.zeroArea = d3.svg.area()
      .x(d => x(d.x))
      .y0(d => height - margin * 2)
      .y1(d => height - 2 * margin)
      .interpolate('linear')
  }

  update(data) {
    const { x, y, chart, line, zeroLine, area, zeroArea } = this
    const { radius, domainX, domainY } = this.props

    // axises
    x.domain(domainX(_.map(data, 'x')))
    y.domain(domainY(_.map(data, 'y')))
    chart.select('.x.axis').call(this.xAxis)
    chart.select('.y.axis').call(this.yAxis)

    // lines
    let lines = chart.selectAll('.line').data([data])

    lines.enter()
      .append('path')
      .attr('class', 'line')
      .attr('d', zeroLine(data))

    lines.transition()
      .duration(1000)
      .attr('d', line)

    lines.enter()
      .append('path')
      .attr('class', 'area')
      .attr('d', zeroArea(data))

    lines.exit().remove()

    let areas = chart.select('.area').data([data])

    areas.transition()
      .duration(1000)
      .attr('d', area)

    areas.exit().remove()
   
    // circles
    let circles = chart.selectAll('.point').data(data)

    circles.enter()
      .append('circle')
      .attr('class', 'point')

    circles
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', radius)

    circles.exit().remove()
  }

  render() {
    return (
      <div className="LineChart">
        <svg ref="chart" />
      </div>
    )
  }
}

LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    x: PropTypes.date,
    y: PropTypes.number
  })),
  formatX: PropTypes.func,
  formatY: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  margin: PropTypes.number,
  radius: PropTypes.number,
  domainX: PropTypes.func,
  domainY: PropTypes.func
}

LineChart.defaultProps = {
  data: [
    { y: 2, x: new Date(Date.now() + 1000) },
    { y: 2, x: new Date(Date.now() + 2000) },
    { y: 1, x: new Date(Date.now() + 3000) },
    { y: 3, x: new Date(Date.now() + 4000) },
    { y: 4, x: new Date(Date.now() + 5000) },
    { y: 1, x: new Date(Date.now() + 6000) },
    { y: 2, x: new Date(Date.now() + 7000) },
    { y: 3, x: new Date(Date.now() + 8000) },
    { y: 2, x: new Date(Date.now() + 9000) },
    { y: 4, x: new Date(Date.now() + 10000) }
  ],
  formatX: x => moment(x).format('MM/DD'),
  formatY: y => {
    switch (y) {
      case 1: return '不合格'
      case 2: return '合格'
      case 3: return '良好'
      case 4: return '优秀'
    }
  },
  domainX: xs => xs,
  domainY: ys => _.sortBy(ys),
  width: 800,
  height: 400,
  margin: 60,
  radius: 5
}