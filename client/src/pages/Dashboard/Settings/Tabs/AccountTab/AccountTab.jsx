import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button/Button';
import FloatLabel from '@/components/ui/FloatLabel/FloatLabel';
import Toast from '@/components/ui/Toast/Toast';
import { useAuthStore } from '@/stores';
import './AccountTab.css';

const AccountTab = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    preferred_name: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { updateUser } = useAuthStore();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await useAuthStore.getState().fetchUserData();
        if (userData) {
          const { first_name, last_name, preferred_name } = userData;
          setFormData({
            first_name: first_name || '',
            last_name: last_name || '',
            preferred_name: preferred_name || ''
          });
          setOriginalData({ first_name, last_name, preferred_name });
        }
      } catch (err) {
        setToast({
          type: 'error',
          message: err.message || 'Failed to load user data'
        });
      }
    };
    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getChangedFields = () => {
    const changes = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalData[key]) {
        changes[key] = formData[key];
      }
    });
    return changes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);

    try {
      const changedFields = getChangedFields();
      await updateUser(changedFields);

      setOriginalData({ ...formData });
      setToast({
        type: 'success',
        message: 'User information updated successfully.'
      });
    } catch (err) {
      console.error('Update error:', err);
      setToast({
        type: 'error',
        message: err.message || 'Failed to update user data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = Object.keys(getChangedFields()).length > 0;

  return (
    <div className="account-tab">
      <h2>Account Settings</h2>
      <p>Update your profile information below.</p>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          data-cy={`toast-${toast.type}`}
        />
      )}

      <form onSubmit={handleSubmit} className="account-form">
        <div className="form-group">
          <FloatLabel
            id="first-name"
            name="first_name"
            label="First Name"
            value={formData.first_name}
            onChange={handleInputChange}
            data-cy="first-name-input"
            required
          />
        </div>

        <div className="form-group">
          <FloatLabel
            id="last-name"
            name="last_name"
            label="Last Name"
            value={formData.last_name}
            onChange={handleInputChange}
            data-cy="last-name-input"
            required
          />
        </div>

        <div className="form-group">
          <FloatLabel
            id="preferred-name"
            name="preferred_name"
            label="Preferred Name"
            value={formData.preferred_name}
            onChange={handleInputChange}
            data-cy="preferred-name-input"
          />
        </div>

        <Button
          type="submit"
          label={isLoading ? 'Saving...' : 'Save Changes'}
          disabled={isLoading || !hasChanges}
          data-cy="save-profile-button"
        >
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default AccountTab;
