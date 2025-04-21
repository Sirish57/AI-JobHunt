import React, { useState } from 'react';
import axios from 'axios';
import './EligibilityForm.css';

export default function EligibilityForm() {
    const [formData, setFormData] = useState({
        job_title: '',
        experience_level: '',
        resume: null
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [isEligible, setIsEligible] = useState(null);
    const [showCourses, setShowCourses] = useState(false);
    const [error, setError] = useState('');

    const relatedCourses = [
        'Advanced Python for Data Science',
        'System Design Fundamentals',
        'Mastering Software Development',
        'Job Interview Prep: Tech Edition'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.resume) {
            setError('Please upload a resume.');
            return;
        }

        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(formData.resume.type)) {
            setError('Invalid file format. Please upload a PDF, DOC, or DOCX.');
            return;
        }

        const form = new FormData();
        form.append('job_title', formData.job_title);
        form.append('experience_level', formData.experience_level);
        form.append('resume', formData.resume);

        try {
            const res = await axios.post('http://localhost:8000/api/v1/eligibility/check', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsEligible(res.data.eligible);
            setModalVisible(true);
            setShowCourses(false);
            setError('');
        } catch (error) {
            console.error('Error:', error);
            setError('There was an error checking eligibility.');
        }
    };

    return (
        <>
            <form className="eligibility-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="Job Title"
                    required
                />
                <input
                    type="text"
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    placeholder="Experience Level"
                    required
                />
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFormData({ ...formData, resume: e.target.files[0] })}
                    required
                />
                <button type="submit">Check Eligibility</button>
                {error && <p className="error">{error}</p>}
            </form>

            {modalVisible && (
                <div className="modal-backdrop">
                    <div className="modal">
                        {isEligible ? (
                            <>
                                <h2>You are eligible for this position with your experience!</h2>
                                <button onClick={() => setModalVisible(false)}>OK</button>
                            </>
                        ) : (
                            <>
                                <h2>Sorry, you are not eligible.</h2>
                                <p>Consider taking these related courses to improve your chances.</p>
                                <button className="check-courses-btn" onClick={() => setShowCourses(true)}>Check Courses</button>
                                <button className="close-btn" onClick={() => setModalVisible(false)}>Close</button>
                                {showCourses && (
                                    <ul>
                                        {relatedCourses.map((course, index) => (
                                            <li key={index}>{course}</li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
