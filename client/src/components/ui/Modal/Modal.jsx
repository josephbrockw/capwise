import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from '../Button/Button';
import './Modal.css';

/**
 * Modal component for displaying content in a dialog
 *
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Content to display inside the modal
 * @param {string} props.title Modal title
 * @param {boolean} props.visible Whether the modal is visible
 * @param {Function} props.onClose Function to call when modal is closed
 * @param {boolean} props.dismissable Whether clicking outside closes the modal
 * @param {React.ReactNode} props.footer Custom footer content
 * @param {string} props.className Additional CSS class
 */
const Modal = ({
  children,
  title,
  visible = false,
  onClose,
  dismissable = true,
  footer,
  className = ''
}) => {
  const modalRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && dismissable && visible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dismissable, onClose, visible]);

  // Close on outside click
  const handleOverlayClick = (e) => {
    if (dismissable && e.target === modalRef.current) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`modal-overlay ${visible ? 'visible' : ''}`}
      ref={modalRef}
      onClick={handleOverlayClick}
    >
      <div className={`modal-container ${className}`}>
        <div className="modal-header">
          {title && <h3 className="modal-title">{title}</h3>}
          <Button
            icon="pi pi-times"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        <div className="modal-content">
          {children}
        </div>

        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  dismissable: PropTypes.bool,
  footer: PropTypes.node,
  className: PropTypes.string
};

export default Modal;
