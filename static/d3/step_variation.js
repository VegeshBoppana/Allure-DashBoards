function renderStepVariationChart(containerId = "#stepVariationChart", loaderId = null) {
    d3.json("/static/allure_data.json").then(data => {
        const svgWidth = 1200;
        const svgHeight = 600;
        const margin = { top: 50, right: 50, bottom: 200, left: 100 };
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;

        const allSteps = new Set();
        const chartData = [];
        const stepCountMap = new Map();

        data.forEach(tc => {
            tc.steps.forEach(step => {
                allSteps.add(step[0]);
                chartData.push({
                    step: step[0],
                    duration: step[1] / 1000,
                    tcid: tc.tcid,
                    tags: tc.tags.join(" | ")
                });
                stepCountMap.set(step[0], (stepCountMap.get(step[0]) || 0) + 1);
            });
        });

        const stepNames = Array.from(allSteps);

        const svg = d3.select(containerId)
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(stepNames)
            .range([0, chartWidth])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.duration)])
            .nice()
            .range([chartHeight, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "13px")
            .style("fill", "#2ecc71");

        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d => `${d}s`))
            .selectAll("text")
            .style("fill", "#2ecc71");

        const colorPalette = d3.scaleOrdinal()
            .domain(chartData.map(d => d.tcid))
            .range(["#3498db", "#9b59b6", "#f1c40f", "#1abc9c", "#2980b9", "#8e44ad", "#f39c12", "#16a085", "#27ae60", "#e67e22"]);

        svg.selectAll(".bar")
            .data(chartData)
            .enter()
            .append("rect")
            .attr("x", d => x(d.step))
            .attr("y", d => y(d.duration))
            .attr("width", x.bandwidth())
            .attr("height", d => Math.max(2, chartHeight - y(d.duration)))
            .attr("fill", d => colorPalette(d.tcid))
            .append("title")
            .html(d => `TCID: <strong>${d.tcid}</strong>\nTag: ${d.tags}\nStep: ${d.step}\nTime: ${d.duration.toFixed(2)}s`);

        // Add count labels above each step
        svg.selectAll(".label")
            .data(stepNames)
            .enter()
            .append("text")
            .attr("x", step => x(step) + x.bandwidth() / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "#34495e")
            .text(step => stepCountMap.get(step));

        if (loaderId) {
            document.querySelector(loaderId).style.display = "none";
        }
    }).catch(error => {
        console.error("Step Variation Chart Error:", error);
    });
}
