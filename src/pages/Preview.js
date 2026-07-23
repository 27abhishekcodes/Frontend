import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess, API_BASE } from '../utils';
import Previewcard from './Previewcard.js';
import './Preview.css';

// GET    /preview               -> fetch all questions the user has selected
// DELETE /preview/:questionId   -> remove one question from the preview
// Both require: Authorization: Bearer <token>


function Preview() {
    const navigate = useNavigate();

    const [previewQuestions, setPreviewQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);

    const authHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    

    const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');

    handleSuccess('User Loggedout');

    setTimeout(() => {
        navigate('/login');
    }, 1000);
};

    const fetchPreview = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/preview`, {
                headers: authHeaders()
            });
            const result = await response.json();
            setPreviewQuestions(result.questions || []);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const removeQuestion = async (id) => {
        try {
            setRemovingId(id);
            const response = await fetch(`${API_BASE}/preview/${id}`, {
                method: "DELETE",
                headers: authHeaders()
            });
            const result = await response.json();

            if (result.success) {
                handleSuccess(result.message || 'Question removed from preview');
                setPreviewQuestions(prev => prev.filter(q => q._id !== id));
            } else {
                handleError(result.message || 'Could not remove question');
            }
        } catch (err) {
            handleError(err);
        } finally {
            setRemovingId(null);
        }
    };

    const downloadDocx = async () => {

    const response = await fetch(
        `${API_BASE}/preview/download-docx`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "PreviewQuestions.docx";

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);
    };

    

    return (
        <div className="preview-page">
            <div className="preview-header">
                <div>
                    <p className="eyebrow">Selected Questions</p>
                    <h1>Preview Panel</h1>
                </div>
                <div className="preview-header-right">
                    <button className="logout-btn" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </div>

            <div className="preview-toolbar">
                <div>
                    <button className="back-btn" onClick={() => navigate('/UserBoard')}>
                        Back to Modules
                    </button>
                    {!loading && <span className="preview-total" style={{ marginLeft: 14 }}>{previewQuestions.length} selected</span>}
                </div>
                <button
                    className="download-btn"
                    onClick={downloadDocx}
                    disabled={loading || previewQuestions.length === 0}
                >
                    Download DOCX
                </button>
            </div>

            <div className="preview-content">
                {loading ? (
                    <div className="loading-state">Loading preview...</div>
                ) : previewQuestions.length > 0 ? (
                    previewQuestions.map((q, i) => (
                        <Previewcard
                            key={q._id}
                            _id={q._id}
                            questionText={q.questionText}
                            options={q.options}
                            index={i}
                            onRemove={removeQuestion}
                            removing={removingId === q._id}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        No questions selected yet. Go back to a module and click "+" on a question to add it here.
                    </div>
                )}
            </div>

            <ToastContainer />
        </div>
    )
}

export default Preview;
