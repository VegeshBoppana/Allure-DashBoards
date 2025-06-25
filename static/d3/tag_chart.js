function drawTagChart(done, filter = "all", containerId = "#chart") {
    d3.json("/static/allure_data.json").then(data => {
        const chartData = data.map(tc => ({
            id: tc.tcid,
            tags: tc.tags.join(" | "),
            duration: tc.steps.reduce((a, b) => a + b[1], 0) / 1000
        }));

        const width = Math.max(900, chartData.length * 80);
        const height = 500;
        const margin = { top: 50, right: 30, bottom: 250, left: 100 };

        const svg = d3.select(containerId)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(chartData.map(d => d.tags))
            .range([0, width])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.duration)])
            .range([height, 0]);

        svg.selectAll("rect")
            .data(chartData)
            .enter().append("rect")
            .attr("x", d => x(d.tags))
            .attr("y", d => y(d.duration))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.duration))
            .attr("fill", "#3498db")
            .append("title")
            .text(d => `${d.id}\nTags: ${d.tags}\nTime: ${d.duration.toFixed(2)} sec`);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "12px");

        svg.append("g")
            .call(d3.axisLeft(y).ticks(10).tickFormat(d => `${d} s`));

        if (done) done();
    }).catch(err => {
        console.error("Error in drawTagChart:", err);
    });
}
