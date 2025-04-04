import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import './ConfirmationModal.css';

/**
 * Reusable confirmation modal component.
 * Used for confirming user actions like deletion, etc.
 */
const ConfirmationModal = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmButtonClass = 'button-danger',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  // Create footer with action buttons
  const renderFooter = () => (
    <>
      <Button
        label={cancelLabel}
        className="button-text"
        onClick={onCancel}
        disabled={isLoading}
      />
      <Button
        label={confirmLabel}
        className={confirmButtonClass}
        onClick={onConfirm}
        disabled={isLoading}
        loading={isLoading}
      />
    </>
  );

  return (
    <Modal
      title={title}
      visible={visible}
      onClose={onCancel}
      footer={renderFooter()}
      className="confirmation-modal"
    >
      <div className="confirmation-modal-content">
        <p>{message}</p>
      </div>
    </Modal>
  );
};

ConfirmationModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  confirmButtonClass: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default ConfirmationModal;
