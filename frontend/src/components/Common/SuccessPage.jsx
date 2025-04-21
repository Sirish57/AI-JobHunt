import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaHome } from 'react-icons/fa';
import './Auth.css';

export default function SuccessPage({ type = "registration" }) {
    const messages = {
        registration: {
            title: "Registration Successful!",
            text: "Your account has been created successfully"
        },
        application: {
            title: "Application Submitted!",
            text: "Your job application has been received"
        }
    };

    return (
        <div className="auth-container success-container">
            <FaCheckCircle className="success-icon" />
            <h1>{messages[type].title}</h1>
            <p>{messages[type].text}</p>
            <Link to="/dashboard" className="auth-button">
                <FaHome /> Go to Dashboard
            </Link>
        </div>
    );
}