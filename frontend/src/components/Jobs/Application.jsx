import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Apply() {
    const location = useLocation();
    const navigate = useNavigate();
    const jobDetails = location.state?.jobDetails;

    const [resume, setResume] = useState(null);
    const [coverLetter, setCoverLetter] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleResumeChange = (e) => setResume(e.target.files[0]);
    const handleCoverLetterChange = (e) => setCoverLetter(e.target.files[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (resume && coverLetter) {
            setSubmitted(true);
        } else {
            alert('Please upload both your resume and cover letter');
        }
    };

    const handleGoHome = () => navigate('/');

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            {jobDetails && (
                <h2 style={{ marginBottom: '2rem' }}>
                    You are applying for <strong>{jobDetails.title}</strong> at <strong>{jobDetails.companyName}</strong>
                </h2>
            )}

            {!submitted ? (
                <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Upload Resume:</label><br />
                        <input type="file" onChange={handleResumeChange} accept=".pdf,.doc,.docx" required />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Upload Cover Letter:</label><br />
                        <input type="file" onChange={handleCoverLetterChange} accept=".pdf,.doc,.docx" required />
                    </div>
                    <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Submit Application
                    </button>
                </form>
            ) : (
                <div>
                    <h3 style={{ color: 'green', marginTop: '2rem' }}>Your application is submitted.</h3>
                    <p>Thanks for your interest!</p>
                </div>
            )}

            <button
                onClick={handleGoHome}
                style={{ marginTop: '2rem', padding: '0.5rem 1rem', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}
            >
                Go to Home
            </button>
        </div>
    );
}
