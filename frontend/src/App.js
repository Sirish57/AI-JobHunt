import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import Navbar from './components/Common/Navbar';
import Home from './components/Dashboard/Home';
import JobListings from './components/Jobs/JobListings';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import EligibilityForm from './components/Eligibility/EligibilityForm';
import JobTrends from './components/Dashboard/JobTrends';
import NotFound from './components/Common/NotFound';
import Application from './components/Jobs/Application';
import StatsCharts from './components/Dashboard/StatsCharts';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Navigate to="/login" replace />} /> {/* Redirect root to login */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/home" element={<Home />} /> {/* Main landing after login */}
                        <Route path="/apply" element={<Application />} />
                        <Route path="/jobs" element={<JobListings />} />
                        <Route path="/trends" element={<JobTrends />} />
                        <Route path="/stats" element={<StatsCharts />} />
                        <Route path="/eligibility" element={<EligibilityForm />} />
                    </Route>

                    {/* Error Handling */}
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}