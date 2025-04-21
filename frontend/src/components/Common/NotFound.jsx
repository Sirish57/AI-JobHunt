import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import './Auth.css'; // Corrected import path

export default function NotFound() {
    return (
        <div className="auth-container error-container">
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist</p>
            <Link to="/dashboard" className="auth-button">
                <FaHome /> Return Home
            </Link>
        </div>
    );
}