import { toast } from 'react-toastify';

// Local dev hits localhost:8080. On Vercel, set REACT_APP_API_URL in the
// frontend project's Environment Variables to your deployed backend URL
// (e.g. https://your-backend.vercel.app) — CRA bakes this in at build time.
export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const handleSuccess = (msg) => {
    toast.success(msg, {
        position: 'top-right'
    })
}

export const handleError = (msg) => {
    toast.error(msg, {
        position: 'top-right'
    })
}