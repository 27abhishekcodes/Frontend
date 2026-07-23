import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess, API_BASE } from '../utils';
import './AdminHome.css';

// NOTE ON ENDPOINTS:
// This assumes your backend exposes admin-only routes:
//   GET  /admin/users        -> returns array of all users (protected, admin token required)
//   POST /admin/create-user  -> creates a user with { name, email, password, category }
// Adjust these two URLs to match whatever routes you wire up on the backend.

function AdminHome() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [createUserInfo, setCreateUserInfo] = useState({
        name: '',
        email: '',
        password: '',
        category: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');

        handleSuccess('User Loggedout');

        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const url = `${API_BASE}/products`;
            const token = localStorage.getItem("token");
            const headers = {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            };

            const response = await fetch(url, headers);
            const result = await response.json();

            setUsers(Array.isArray(result) ? result : result.users || []);
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCreateUserInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const { name, email, password, category } = createUserInfo;

        if (!name || !email || !password || !category) {
            return handleError('name, email, password and category are all required');
        }

        try {
            const url = `${API_BASE}/auth/signup`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: localStorage.getItem('token')
                },
                body: JSON.stringify(createUserInfo)
            });

            const result = await response.json();
            const { success, message, error } = result;

            if (success) {
                handleSuccess(message || `User "${name}" created`);
                setCreateUserInfo({ name: '', email: '', password: '', category: '' });
                fetchUsers();
            } else if (error) {
                const details = error?.details?.[0]?.message;
                handleError(details || 'Failed to create user');
            } else {
                handleError(message || 'Failed to create user');
            }
        } catch (err) {
            handleError(err);
        }
    };

    const renderTag = (category) => {
        if (!category) return <span className="tag none">Unassigned</span>;
        const cls = category === 'NEET' ? 'neet' : 'cbse';
        return <span className={`tag ${cls}`}>{category}</span>;
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <p className="eyebrow">Administrator Console</p>
                    <h1>Student Register</h1>
                </div>
                <div className="admin-header-right">
                    <span className="welcome-tag">Signed in as {loggedInUser}</span>
                    <button className="logout-btn" onClick={handleLogout}>Log Out</button>
                </div>
            </div>

            <div className="admin-grid">

                {/* Left - Create User */}
                <div className="panel">
                    <p className="panel-label">New Entry</p>
                    <h2>Create User</h2>

                    <form onSubmit={handleCreateUser}>
                        <div className="field">
                            <label htmlFor='name'>Name</label>
                            <input
                                onChange={handleChange}
                                type='text'
                                name='name'
                                placeholder='Enter name...'
                                value={createUserInfo.name}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor='email'>Email</label>
                            <input
                                onChange={handleChange}
                                type='email'
                                name='email'
                                placeholder='Enter email...'
                                value={createUserInfo.email}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor='password'>Password</label>
                            <input
                                onChange={handleChange}
                                type='password'
                                name='password'
                                placeholder='Enter password...'
                                value={createUserInfo.password}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor='category'>Assign Category</label>
                            <select
                                onChange={handleChange}
                                name='category'
                                value={createUserInfo.category}
                            >
                                <option value="" disabled>Select category</option>
                                <option value="VIII CBSE">VIII CBSE</option>
                                <option value="NEET">NEET</option>
                            </select>
                        </div>
                        <button className="submit-btn" type='submit'>Create User</button>
                    </form>
                </div>

                {/* Right - All Users */}
                <div className="panel">
                    <p className="panel-label">
                        Roster
                        {!loadingUsers && <span className="roster-count">{users.length} total</span>}
                    </p>
                    <h2>All Users</h2>

                    {loadingUsers ? (
                        <div className="loading-state">Loading roster...</div>
                    ) : users.length > 0 ? (
                        <table className="roster-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{renderTag(user.category)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">No users yet — create the first one.</div>
                    )}
                </div>

            </div>

            <ToastContainer />
        </div>
    )
}

export default AdminHome;
