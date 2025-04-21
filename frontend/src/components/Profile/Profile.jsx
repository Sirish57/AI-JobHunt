import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user, logout } = useAuth();

    return (
        <div className="profile">
            <h2>My Profile</h2>
            <p>Email: {user?.email}</p>
            <button onClick={logout}>Logout</button>
        </div>
    );
}