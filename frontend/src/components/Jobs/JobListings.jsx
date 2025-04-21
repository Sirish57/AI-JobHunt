import React, { useState, useEffect } from 'react';
import './JobListings.css';

export default function JobListings() {
    const [jobListings, setJobListings] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [company, setCompany] = useState('');
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [contractType, setContractType] = useState('');
    const [workType, setWorkType] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [sector, setSector] = useState('');

    useEffect(() => {
        // Fetch all job listings initially
        const fetchJobListings = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/v1/jobs/all'); 
                const data = await response.json();
                setJobListings(data);
                setFilteredJobs(data);
            } catch (error) {
                console.error("Error fetching job listings:", error);
            }
        };

        fetchJobListings();
    }, []);

    useEffect(() => {
        // Apply filters dynamically
        const filtered = jobListings.filter(job => {
            return (
                (company ? job.companyName.toLowerCase().includes(company.toLowerCase()) : true) &&
                (title ? job.title.toLowerCase().includes(title.toLowerCase()) : true) &&
                (location ? job.location.toLowerCase().includes(location.toLowerCase()) : true) &&
                (contractType ? job.contractType.toLowerCase().includes(contractType.toLowerCase()) : true) &&
                (workType ? job.workType.toLowerCase().includes(workType.toLowerCase()) : true) &&
                (experienceLevel ? job.experienceLevel.toLowerCase().includes(experienceLevel.toLowerCase()) : true) &&
                (sector ? job.sector.toLowerCase().includes(sector.toLowerCase()) : true)
            );
        });
        setFilteredJobs(filtered);
    }, [company, title, location, contractType, workType, experienceLevel, sector, jobListings]);

    return (
        <div className="job-listings-container">
            <div className="filters">
                <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                <input type="text" placeholder="Contract Type" value={contractType} onChange={(e) => setContractType(e.target.value)} />
                <input type="text" placeholder="Work Type" value={workType} onChange={(e) => setWorkType(e.target.value)} />
                <input type="text" placeholder="Experience Level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} />
                <input type="text" placeholder="Sector" value={sector} onChange={(e) => setSector(e.target.value)} />
            </div>


            <div className="job-list">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, index) => (
                        <div key={index} className="job-card">
                            <h3>{job.title}</h3>
                            <p><strong>Company:</strong> {job.companyName}</p>
                            <p><strong>Location:</strong> {job.location}</p>
                            <p><strong>Contract Type:</strong> {job.contractType}</p>
                            <p><strong>Work Type:</strong> {job.workType}</p>
                            <p><strong>Experience Level:</strong> {job.experienceLevel}</p>
                            <p><strong>Sector:</strong> {job.sector}</p>
                            <p><strong>Description:</strong> {job.description}</p>
                        </div>
                    ))
                ) : (
                    <p>No jobs found with the applied filters.</p>
                )}
            </div>
        </div>
    );
}
