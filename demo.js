import * as d3 from 'd3';

/*
 * Simple Demo Chart
 */
export default function () {
  // Link Demo to the helper object in helper.js
  const Demo = {};

  Demo.config = function config() {
    const vm = this;

    vm.target = 'chart';
    vm.margin = {
      top: 40, right: 20, bottom: 150, left: 80,
    };
    vm.colorsConfig = {};
    const defaultChartSize = {
      width: 500 - vm.margin.left - vm.margin.right,
      height: 500 - vm.margin.top - vm.margin.bottom,
    };

    vm.width = vm.configSize ? vm.configSize.width : defaultChartSize.width;
    vm.height = vm.configSize ? vm.configSize.height : defaultChartSize.height;

    vm.scales();
  };

  Demo.scales = function scales() {
    const vm = this;

    vm.x = d3.scaleBand()
      .range([0, vm.width])
      .padding(0.1);

    vm.y = d3.scaleLinear()
      .range([vm.height, 0]);
  };

  Demo.chart = function chart() {
    const vm = this;
    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    d3.select(`#${vm.target} svg`).remove();
    const svg = d3.select(`#${vm.target}`).append('svg')
      .attr('width', vm.width + vm.margin.left + vm.margin.right)
      .attr('height', vm.height + vm.margin.top + vm.margin.bottom)
      .append('g')
      .attr('transform', `translate(${vm.margin.left}, ${vm.margin.top})`);

    return svg;
  };

  // User called
  Demo.id = function id(target) {
    const vm = this;
    vm.target = target;
    return vm;
  };

  Demo.data = function data(dat) {
    const vm = this;
    const yValues = [];
    // format the data
    dat.forEach((d) => {
      d.y = +d.y;
      yValues.push(d.y);
    });
    vm._data = dat;
    // Scale the range of the data in the domains
    vm.x.domain(dat.map(d => d.x));
    vm.y.domain([0, d3.max(dat, d => d.y)]);
    vm.max_y = d3.max(yValues);
    vm.min_y = d3.min(yValues);
    return vm;
  };

  Demo.sortData = function sortData(sortBy) {
    const vm = this;
    switch (sortBy) {
      case 'alphab': // Alphabetical
        vm._data = _.sortBy(vm._data, [function (o) { return o.x; }]);
        vm.x.domain(vm._data.map(d => d.x));
        vm.y.domain([0, d3.max(vm._data, d => d.y)]);
        break;
      case 'asc': // Ascending
        vm._data = _.orderBy(vm._data, ['y'], ['asc']);
        vm.x.domain(vm._data.map(d => d.x));
        vm.y.domain([0, d3.max(vm._data, d => d.y)]);
        break;
      case 'desc': // Descending
        vm._data = _.orderBy(vm._data, ['y'], ['desc']);
        vm.x.domain(vm._data.map(d => d.x));
        vm.y.domain([0, d3.max(vm._data, d => d.y)]);
        break;
      default: // Ascending
        vm._data = _.orderBy(vm._data, ['y'], ['asc']);
        vm.x.domain(vm._data.map(d => d.x));
        vm.y.domain([0, d3.max(vm._data, d => d.y)]);
        break;
    }
    return vm;
  };

  /**
   * array of values used
   * @param {array or scale} columnName
   */
  Demo.colors = function (colors) {
    const vm = this;
    if (!colors) {
      vm.colorsConfig.array = ['#003f5c', '#374c80', '#7a5195', '#bc5090', '#ef5675', '#ff764a', '#ffa600'];
    } else if (Array.isArray(colors) && colors.length > 2) {
      // Using an array of colors for the range
      vm.colorsConfig.array = colors;
    } else {
      // Using a preconfigured d3.scale
      vm.colorsConfig.scale = d3.scaleLinear()
        .domain([vm.min_y, vm.max_y])
        .range([colors[0], colors[1]])
        .interpolate(d3.interpolateHcl); // interpolateHsl interpolateHcl interpolateRgb
    }
    return vm;
  };

  Demo.setChartSize = function (configSize) {
    const vm = this;
    vm.configSize = configSize;
    return vm;
  };

  Demo.draw = function draw() {
    const vm = this;
    // append the rectangles for the bar chart
    const svg = vm.chart();

    svg.selectAll('.bar')
      .data(vm._data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => vm.x(d.x))
      .attr('width', vm.x.bandwidth())
      .attr('y', d => vm.y(d.y))
      .attr('height', d => vm.height - vm.y(d.y))
      // .attr('fill', d => vm.colorsConfig.scale(d.x));
      .attr('fill', (d, i) => {
        if (vm.colorsConfig.hasOwnProperty('array')) {
          const scaleLength = vm.colorsConfig.array.length;
          return vm.colorsConfig.array[i % scaleLength];
        } if (vm.colorsConfig.hasOwnProperty('scale')) {
          return vm.colorsConfig.scale(d.y);
        }
      });

    svg.selectAll('.data-labels')
      .data(vm._data)
      .enter().append('text')
      .attr('x', d => vm.x(d.x) + vm.x.bandwidth() / 2)
      .attr('y', d => vm.y(d.y) - 5)
      .text(d => d.y);

    // add the x Axis
    svg.append('g')
      .attr('transform', `translate(0,${vm.height})`)
      .call(d3.axisBottom(vm.x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-65)');

    // add the y Axis
    svg.append('g')
      .call(d3.axisLeft(vm.y));

    return vm;
  };

  Demo.config();

  return Demo;
}
