import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell, CartesianGrid, ComposedChart, Area, AreaChart } from 'recharts';
import './JobTrends.css';

export default function JobTrends() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('http://localhost:8000/api/v1/statscharts');

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.error ||
                        errorData.message ||
                        `Server error: ${response.status}`
                    );
                }

                const result = await response.json();
                console.log("API Response: ", result); // Debugging line to check response
                setData(result[0]); // Access the first object in the array
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message || "Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    // Safely extract numbers from any format
    const extractNumber = (value) => {
        if (typeof value === 'number') return value;
        const num = typeof value === 'string'
            ? parseInt(value.replace(/\D/g, ''), 10)
            : 0;
        return isNaN(num) ? 0 : num;
    };

    // Process all data at once
    const processedData = data ? {
        contractTypes: data.contractTypes?.map(item => ({
            ...item,
            count: extractNumber(item.count)
        })),
        workTypes: data.workTypes?.map(item => ({
            ...item,
            count: extractNumber(item.count)
        })),
        experienceLevels: data.experienceLevels?.map(item => ({
            ...item,
            count: extractNumber(item.count)
        })),
        sectors: data.sectors?.map(item => ({
            ...item,
            count: extractNumber(item.count)
        })),
        locations: data.locations?.map(item => ({
            ...item,
            count: extractNumber(item.count)
        })),
        applicationsHistogram: data.applicationsHistogram?.map(item => ({
            ...item,
            count: extractNumber(item.count)
        })),
        trendsOverTime: data.trendsOverTime?.map(item => ({
            ...item,
            count: extractNumber(item.count)
        })),
        titles: data.titles?.map(item => ({
            ...item,
            count: extractNumber(item.count)
        })),
        companyNames: data.companyNames?.map(item => ({
            ...item,
            count: extractNumber(item.count)
        })),
    } : null;

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading job trends...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <h3>Error Loading Data</h3>
                <p>{error}</p>
                <button
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!processedData) {
        return <div className="no-data">No data available</div>;
    }
    console.log(processedData.locations);
    console.log(processedData.titles);
    console.log(processedData.applicationsCount);

    return (
        <div className="dashboard">

            {/* Experience Levels Chart */}
            {processedData.experienceLevels?.length > 0 && (
                <div className="chart-container">
                    <h3>Experience Level Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={processedData.experienceLevels}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Location Distribution (Bar Chart) */}
            {processedData.locations?.length > 0 && (
                <div className="chart-container">
                    <h3>Location Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={processedData.locations}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#FF8042" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Contract Types Chart */}
            {processedData.contractTypes?.length > 0 && (
                <div className="chart-container">
                    <h3>Contract Type Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart margin={{ top: 30, right: 30, left: 30, bottom: 30 }}>
                            <Pie
                                data={processedData.contractTypes}
                                dataKey="count"
                                nameKey="_id"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {processedData.contractTypes.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Work Types Chart */}
            {processedData.workTypes?.length > 0 && (
                <div className="chart-container">
                    <h3>Work Type Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={processedData.workTypes}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

           

            {/* Job Trends Over Time (Line Chart) */}
            {processedData.trendsOverTime?.length > 0 && (
                <div className="chart-container">
                    <h3>Job Trends Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={processedData.trendsOverTime}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Applications Count Distribution (Bar Chart) */}
            {processedData.applicationsHistogram?.length > 0 && (
                <div className="chart-container">
                    <h3>Applications Count Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={processedData.applicationsHistogram}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <XAxis dataKey="_id" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Sector Distribution (Pie Chart) */}
            {processedData.sectors?.length > 0 && (
                <div className="chart-container">
                    <h3>Sector Distribution</h3>
                    <ResponsiveContainer width="100%" height={2400}>
                        <PieChart margin={{ top: 30, right: 30, left: 30, bottom: 30 }}>
                            <Pie
                                data={processedData.sectors}
                                dataKey="count"
                                nameKey="_id"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {processedData.sectors.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Comparison: Contract Types vs Experience Levels (Composed Chart) */}
            {processedData.contractTypes?.length > 0 && processedData.experienceLevels?.length > 0 && (
                <div className="chart-container">
                    <h3>Contract Types vs Experience Levels</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart
                            data={processedData.contractTypes.map((item, idx) => ({
                                name: item._id,
                                contractCount: item.count,
                                experienceCount: processedData.experienceLevels[idx]?.count || 0
                            }))}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="contractCount" barSize={20} fill="#8884d8" name="Contract Count" />
                            <Line type="monotone" dataKey="experienceCount" stroke="#ff7300" name="Experience Count" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}


            {processedData.titles?.length > 0 && processedData.applicationsHistogram?.length > 0 && (
                <div className="chart-container">
                    <h3>Title vs Application Count (Bar Chart)</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={processedData.titles.map((item, idx) => ({
                            name: item._id,
                            titleCount: item.count,
                            applicationCount: processedData.applicationsHistogram[idx]?.count || 0
                        }))}>
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="titleCount" fill="#8884d8" name="Title Count" />
                            <Bar dataKey="applicationCount" fill="#ff7300" name="Application Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Comparison: Title vs CompanyName (BarChart) */}
            {processedData.titles?.length > 0 && processedData.companyNames?.length > 0 && (
                <div className="chart-container">
                    <h3>Title vs CompanyName</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={processedData.titles.map((item, idx) => ({
                            name: item._id,
                            titleCount: item.count,
                            companyNameCount: processedData.companyNames[idx]?.count || 0
                        }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="titleCount" fill="#8884d8" name="Title Count" />
                            <Bar dataKey="companyNameCount" fill="#82ca9d" name="Company Name Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Comparison: Applications Count vs Contract Type (LineChart) */}
            {processedData.contractTypes?.length > 0 && processedData.applicationsHistogram?.length > 0 && (
                <div className="chart-container">
                    <h3>Applications Count vs Contract Type</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={processedData.applicationsHistogram.map((item, idx) => ({
                            name: item._id,
                            applicationsCount: item.count,
                            contractTypeCount: processedData.contractTypes[idx]?.count || 0
                        }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="applicationsCount" stroke="#ff7300" name="Applications Count" />
                            <Line type="monotone" dataKey="contractTypeCount" stroke="#8884d8" name="Contract Type Count" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Comparison: Experience Level vs Work Type (ComposedChart) */}
            {processedData.experienceLevels?.length > 0 && processedData.workTypes?.length > 0 && (
                <div className="chart-container">
                    <h3>Experience Level vs Work Type</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart
                            data={processedData.experienceLevels.map((item, idx) => ({
                                name: item._id,
                                experienceCount: item.count,
                                workTypeCount: processedData.workTypes[idx]?.count || 0
                            }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="experienceCount" barSize={20} fill="#8884d8" name="Experience Level Count" />
                            <Area type="monotone" dataKey="workTypeCount" fill="#82ca9d" stroke="#82ca9d" name="Work Type Count" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Comparison: CompanyName vs Location (AreaChart) */}
            {processedData.companyNames?.length > 0 && processedData.locations?.length > 0 && (
                <div className="chart-container">
                    <h3>CompanyName vs Location</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={processedData.companyNames.map((item, idx) => ({
                            name: item._id,
                            companyNameCount: item.count,
                            locationCount: processedData.locations[idx]?.count || 0
                        }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="companyNameCount" fill="#8884d8" stroke="#8884d8" name="Company Name Count" />
                            <Area type="monotone" dataKey="locationCount" fill="#82ca9d" stroke="#82ca9d" name="Location Count" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}



        </div>
    );
}
