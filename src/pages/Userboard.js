import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess, API_BASE } from '../utils';
import './UserBoard.css';

// API flow implemented here:
//   GET  /modules              -> modules for the logged-in user's category
//   GET  /questions/:moduleId  -> questions belonging to the selected module
//   POST /preview              -> add a question ({ questionId }) to the preview panel
//   GET  /preview              -> used once on mount to know which questions are
//                                 already in the preview panel, so the "+" buttons
//                                 render correctly as "added" without needing the
//                                 preview page itself.
// All requests below send: Authorization: <token>  (as stored by the login flow).

function Userboard() {
    const navigate = useNavigate();

    const [modules, setModules] = useState([]);
    const [loadingModules, setLoadingModules] = useState(true);

    const [selectedModule, setSelectedModule] = useState(null); // { _id, moduleName, description }
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    const [previewIds, setPreviewIds] = useState(new Set());
    const [addingId, setAddingId] = useState(null);

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

    

    const fetchModules = async () => {
        try {
            
            setLoadingModules(true);
            const response = await fetch(`${API_BASE}/modules`, {
                headers: authHeaders()
            });

            


            const result = await response.json();
            console.log("API Response:", result);
            setModules(Array.isArray(result) ? result : result.modules || []);
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingModules(false);
        }
    };

    const fetchPreviewIds = async () => {
        try {
            const response = await fetch(`${API_BASE}/preview`, {
                headers: authHeaders()
            });
            const result = await response.json();
            const existing = result?.questions || [];
            setPreviewIds(new Set(existing.map(q => q._id)));
        } catch (err) {
            // non-blocking: preview state just won't be pre-marked
            console.error(err);
        }
    };

    useEffect(() => {
        fetchModules();
        fetchPreviewIds();
    }, []);

    const handleSelectModule = async (module) => {
        setSelectedModule(module);
        setQuestions([]);
        try {
            setLoadingQuestions(true);
            const response = await fetch(`${API_BASE}/questions/${module._id}`, {
                headers: authHeaders()
            });
            const result = await response.json();
            console.log("Questions Response:", result);
            setQuestions(Array.isArray(result) ? result : result.questions || []);
        } catch (err) {
            handleError(err);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleAddToPreview = async (questionId) => {
        if (previewIds.has(questionId)) return;

        try {
            setAddingId(questionId);
            const response = await fetch(`${API_BASE}/preview`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders()
                },
                body: JSON.stringify({ questionId })
            });
            const result = await response.json();

            if (result.success) {
                setPreviewIds(prev => new Set(prev).add(questionId));
                handleSuccess(result.message || 'Question added to preview');
            } else {
                handleError(result.message || 'Could not add question');
            }
        } catch (err) {
            handleError(err);
        } finally {
            setAddingId(null);
        }
    };

    return (
        <div className="board-page">
            <div className="board-header">
                <div>
                    <p className="eyebrow">Your Modules</p>
                    <h1>Question Bank</h1>
                </div>
                <div className="board-header-right">
                    <button className="preview-btn" onClick={() => navigate('/preview')}>
                        Preview Panel
                        <span className="preview-count">{previewIds.size}</span>
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </div>

            <div className="board-content">

                {selectedModule && (
                    <p className="crumb">
                        <button onClick={() => { setSelectedModule(null); setQuestions([]); }}>
                            Modules
                        </button>
                        {' / '}{selectedModule.moduleName}
                    </p>
                )}

                {!selectedModule && (
                    <>
                        <p className="section-label">Select a Module</p>
                        {loadingModules ? (
                            <div className="loading-state">Loading modules...</div>
                        ) : modules.length > 0 ? (
                            <div className="modules-grid">
                                {modules.map((module, i) => (
                                    <button
                                        key={module._id}
                                        className="module-card"
                                        onClick={() => handleSelectModule(module)}
                                    >
                                        <span className="module-index">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <h3>{module.moduleName}</h3>
                                        <p>{module.description}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">No modules assigned yet.</div>
                        )}
                    </>
                )}
                {selectedModule && (
                    <>
                        <p className="section-label">{selectedModule.moduleName} — Questions</p>
                        {loadingQuestions ? (
                            <div className="loading-state">Loading questions...</div>
                        ) : questions.length > 0 ? (
                            <div>
                                {questions.map((q, i) => {
                                    const isAdded = previewIds.has(q._id);
                                    const isLoading = addingId === q._id;
                                    return (
                                        <div className={`question-card ${isAdded ? 'added' : ''}`} key={q._id}>
                                            <div className="question-main">
                                                <span className="question-index">
                                                    Question {i + 1}
                                                </span>
                                                <p className="question-text">{q.questionText}</p>
                                                <div className="options-row">
                                                    {(q.options || []).map((opt, idx) => (
                                                        <span className="option-chip" key={idx}>{opt}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                className={`add-btn ${isAdded ? 'added' : ''}`}
                                                onClick={() => handleAddToPreview(q._id)}
                                                disabled={isAdded || isLoading}
                                                title={isAdded ? 'Added to preview' : 'Add to preview'}
                                            >
                                                {isAdded ? '✓' : '+'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="empty-state">No questions found for this module.</div>
                        )}
                    </>
                )}

            </div>

            <ToastContainer />
        </div>
    )
}

export default Userboard;
