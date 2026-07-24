import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess, API_BASE } from '../utils';
import './Auth.css';

function Login() {

    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    })

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copyLoginInfo = { ...loginInfo };
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
            return handleError('email and password are required')
        }
        try {
            const url = `${API_BASE}/auth/login`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;
            if (success) {
                handleSuccess(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                setTimeout(() => {
                    if (name === "Admin") {
                        navigate("/home"); // Home page for admin
                    } else {
                        navigate("/userboard"); // User dashboard
                    }
                }, 1000)
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
        } catch (err) {
            handleError(err);
        }
    }

    return (
        <div className='auth-page'>
            <div className='auth-card' data-slip="SIGN-IN SLIP">
                <h1>Admin Log In</h1>
                <form onSubmit={handleLogin}>
                    <div className="auth-field">
                        <label htmlFor='email'>Email</label>
                        <input
                            onChange={handleChange}
                            type='email'
                            name='email'
                            autoFocus
                            placeholder='Enter your email...'
                            value={loginInfo.email}
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor='password'>Password</label>
                        <input
                            onChange={handleChange}
                            type='password'
                            name='password'
                            placeholder='Enter your password...'
                            value={loginInfo.password}
                        />
                    </div>
                    <button className="auth-submit" type='submit'>Log In</button>
                    <span className="auth-switch">
                        Don't have an account?
                        <Link to="/signup">Signup</Link>
                    </span>
                </form>
            </div>
            <ToastContainer />
        </div>
    )
}

export default Login
