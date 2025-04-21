import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import './Register.css';

export default function Register() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Frontend validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match!");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:8000/api/v1/auth/register',
                {
                    full_name: formData.full_name,
                    email: formData.email,
                    password: formData.password
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    
                    timeout: 5000,
                    withCredentials: false  // Set to true if using cookies
                }
            );

            if (response.status === 201) {
                setSuccess(true); // This triggers the success message display
            } else {
                setError(response.data?.message || 'Registration failed');
            }
        } catch (err) {
            if (err.code === 'ECONNABORTED') {
                setError('Request timeout. Please try again.');
            } else if (err.response) {
                // Server responded with error status
                setError(err.response.data?.detail ||
                    err.response.data?.message ||
                    'Registration failed');
            } else if (err.request) {
                // Request was made but no response
                setError('Network error. Please check: \n1. Backend server is running\n2. No CORS issues\n3. Correct API URL');
            } else {
                setError('Unexpected error: ' + err.message);
            }
            console.error('Registration error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h1 className="auth-title">
                <span className="ai-text">AI</span> JobHub
            </h1>

            {error && (
                <div className="auth-error">
                    {error.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                    ))}
                </div>
            )}

            {!success ? (
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            required
                            autoComplete="name"
                        />
                    </div>

                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                            minLength={8}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button register-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registering...' : <><FaUserPlus /> Register</>}
                    </button>
                </form>
            ) : (
                <div className="success-message">
                    <h3>Registration Successful!</h3>
                    <p>You can now login with your credentials</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="auth-button"
                    >
                        OK
                    </button>
                </div>
            )}
        </div>
    );
}