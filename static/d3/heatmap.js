function renderHeatmapChart(containerId = "#heatmapChart") {
    d3.json("/static/allure_data.json").then(data => {
        const allSteps = new Set();
        const allTcids = new Set();
        const chartData = [];

        data.forEach(tc => {
            allTcids.add(tc.tcid);
            tc.steps.forEach(step => {
                allSteps.add(step[0]);
                chartData.push({
                    tcid: tc.tcid,
                    step: step[0],
                    duration: step[1] / 1000
                });
            });
        });

        const steps = Array.from(allSteps);
        const tcids = Array.from(allTcids);

        const margin = { top: 100, right: 40, bottom: 150, left: 160 },
              width = Math.max(1000, steps.length * 40),
              height = Math.max(500, tcids.length * 30);

        const svg = d3.select(containerId)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(steps)
            .padding(0.05);

        const y = d3.scaleBand()
            .range([0, height])
            .domain(tcids)
            .padding(0.05);

        const colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateYlOrRd)
            .domain([0, d3.max(chartData, d => d.duration)]);

        svg.append("g")
            .attr("transform", `translate(0, 0)`)
            .call(d3.axisTop(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "start")
            .style("font-size", "12px");

        svg.append("g")
            .attr("transform", `translate(0, 0)`)
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "12px");

        svg.selectAll()
            .data(chartData, d => d.tcid + ':' + d.step)
            .enter()
            .append("rect")
            .attr("x", d => x(d.step))
            .attr("y", d => y(d.tcid))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", d => colorScale(d.duration))
            .append("title")
            .text(d => `TCID: ${d.tcid}\nStep: ${d.step}\nTime: ${d.duration.toFixed(2)}s`);

        svg.selectAll(".border")
            .data(chartData)
            .enter()
            .append("rect")
            .attr("x", d => x(d.step))
            .attr("y", d => y(d.tcid))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", "none")
            .style("stroke", "#fff");
    }).catch(err => {
        console.error("Error loading heatmap data:", err);
    });
}