import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";  // Import Plotly for charts
import './StatsCharts.css';  // Import the CSS for styling

const StatsCharts = () => {
    const [jobData, setJobData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("http://127.0.0.1:8000/api/v1/statscharts");
            const data = await response.json();
            setJobData(data);
        };
        fetchData();
    }, []);

    // Job Type Distribution (Pie Chart)
    const jobTypeData = jobData.reduce((acc, job) => {
        acc[job.contractType] = (acc[job.contractType] || 0) + 1;
        return acc;
    }, {});

    const jobTypeChart = {
        type: "pie",
        values: Object.values(jobTypeData),
        labels: Object.keys(jobTypeData),
        title: "Job Type Distribution"
    };

    // Job Count by Industry (Bar Chart)
    const sectorData = jobData.reduce((acc, job) => {
        acc[job.sector] = (acc[job.sector] || 0) + 1;
        return acc;
    }, {});

    const sectorChart = {
        type: "bar",
        x: Object.keys(sectorData),
        y: Object.values(sectorData),
        title: "Job Postings by Industry"
    };

    // Job Postings Over Time (Line Chart)
    const timeSeriesData = jobData.reduce((acc, job) => {
        const month = new Date(job.publishedAt).toLocaleString("en-us", { month: "short" });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});

    const timeSeriesChart = {
        type: "line",
        x: Object.keys(timeSeriesData),
        y: Object.values(timeSeriesData),
        title: "Job Postings Over Time"
    };

    return (
        <div className="stats-charts-container">
            <h1>Job Trends</h1>

            {/* Job Type Distribution */}
            <div className="chart-container">
                <h3>Job Type Distribution</h3>
                <Plot
                    data={[jobTypeChart]}
                    layout={{ title: "Job Type Distribution" }}
                />
            </div>

            {/* Job Count by Industry */}
            <div className="chart-container">
                <h3>Job Postings by Industry</h3>
                <Plot
                    data={[sectorChart]}
                    layout={{ title: "Job Postings by Industry" }}
                />
            </div>

            {/* Job Postings Over Time */}
            <div className="chart-container">
                <h3>Job Postings Over Time</h3>
                <Plot
                    data={[timeSeriesChart]}
                    layout={{ title: "Job Postings Over Time" }}
                />
            </div>
        </div>
    );
};

export default StatsCharts;
