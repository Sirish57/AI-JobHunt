import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Home() {
    const [company, setCompany] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [jobDetails, setJobDetails] = useState(null);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleApply = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/jobs?company=${company}&job_title=${jobTitle}`);
            if (response.ok) {
                const data = await response.json();
                setJobDetails(data);
                setError('');
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Job not found');
                setJobDetails(null);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setError('An error occurred while fetching job details');
            setJobDetails(null);
        }
    };

    const handleNavigateToApplication = () => {
        navigate('/apply', { state: { jobDetails } });
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Welcome to AI JobHub!</h1>
            </div>

            <div className="dashboard-extra">
                <div className="welcome-form" style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <h2>Welcome to the Employment Analytics App!</h2>

                    <form style={{ marginTop: '1.5rem' }} onSubmit={handleApply}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label htmlFor="company">Company Name</label><br />
                            <input
                                type="text"
                                id="company"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder='e.g., "Wesper"'
                                style={{ padding: "0.5rem", width: "250px", marginTop: "0.5rem" }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label htmlFor="job">Job Title</label><br />
                            <input
                                type="text"
                                id="job"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder='e.g., "AI Engineer"'
                                style={{ padding: "0.5rem", width: "250px", marginTop: "0.5rem" }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                padding: "0.5rem 1rem",
                                marginTop: "1rem",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                cursor: "pointer"
                            }}
                        >
                            Search
                        </button>
                    </form>

                    {error && <div className="error-message">{error}</div>}

                    {jobDetails && (
                        <div style={{ marginTop: '2rem' }}>
                            <h3>Job Details</h3>
                            <div className="job-details-card">
                                <p><strong>Company:</strong> {jobDetails.companyName}</p>
                                <p><strong>Title:</strong> {jobDetails.title}</p>
                                <p><strong>Location:</strong> {jobDetails.location}</p>
                                <p><strong>Published At:</strong> {jobDetails.publishedAt}</p>
                                <p><strong>Description:</strong> {jobDetails.description}</p>
                                <p><strong>Applications Count:</strong> {jobDetails.applicationsCount}</p>
                                <p><strong>Contract Type:</strong> {jobDetails.contractType}</p>
                                <p><strong>Experience Level:</strong> {jobDetails.experienceLevel}</p>
                                <p><strong>Work Type:</strong> {jobDetails.workType}</p>
                                <p><strong>Sector:</strong> {jobDetails.sector}</p>

                                <button
                                    onClick={handleNavigateToApplication}
                                    style={{
                                        marginTop: '1rem',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#007BFF',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}