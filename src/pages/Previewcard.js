import React from 'react'
import './Previewcard.css';

// Props: { _id, questionText, options, index, onRemove }
function PreviewCard({ _id, questionText, options, index, onRemove, removing }) {
    return (
        <div className="preview-card">
            <div className="preview-card-main">
                <span className="preview-card-index">Question {index + 1}</span>
                <p className="preview-card-text">{questionText}</p>

                <div className="preview-options">
                    {(options || []).map((opt, i) => (
                        <div className="preview-option" key={i}>
                            <span className="option-bullet" />
                            <span>{opt}</span>
                        </div>
                    ))}
                </div>
            </div>

            <button
                className="remove-btn"
                onClick={() => onRemove(_id)}
                disabled={removing}
                title="Remove from preview"
            >
                {removing ? '…' : '✕'} Remove
            </button>
        </div>
    )
}

export default PreviewCard;
