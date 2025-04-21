import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css'; // Create this file for styles

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar-container">
            <Link to="/home" className="navbar-brand">
                <span className="ai-text">AI</span> JobHub
            </Link>

            {user ? (
                <div className="nav-links">
                    <Link to="/home" className="nav-link">Home</Link>
                    <Link to="/jobs" className="nav-link">Job Listings</Link>
                    <Link to="/trends" className="nav-link">Job Trends</Link>
                    <Link to="/eligibility" className="nav-link">Eligibility Checker</Link>

                    <button
                        onClick={handleLogout}
                        className="logout-button"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <div className="auth-links">
                    <Link to="/login" className="auth-link">Login</Link>
                    <Link to="/register" className="auth-link">Register</Link>
                </div>
            )}
        </nav>
    );
}