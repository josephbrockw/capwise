import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@/components/ui/Button/Button';
import FloatLabel from '@/components/ui/FloatLabel/FloatLabel';
import Toast from '@/components/ui/Toast/Toast';
import storageHelper from '@/utils/storageHelper';
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

  useEffect(() => {
    const loadUserData = async () => {
      const userData = await storageHelper.getUserData();
      if (userData) {
        const { first_name, last_name, preferred_name } = userData;
        setFormData({ first_name: first_name || '', last_name: last_name || '', preferred_name: preferred_name || '' });
        setOriginalData({ first_name, last_name, preferred_name });
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
    setToast(null);
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

    const changes = getChangedFields();

    // Only make the request if there are actual changes
    if (Object.keys(changes).length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const token = storageHelper.getItem('token');
      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/me`,
        changes,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setOriginalData(prev => ({ ...prev, ...changes }));
        storageHelper.setItem('userData', response.data.data);
        setToast({
          type: 'success',
          message: 'Profile updated successfully!'
        });
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'An error occurred while updating your profile'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="account-tab">
      <h2>Account Settings</h2>
      <p>Update your profile information below.</p>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
          data-cy={`${toast.type}-message`}
        />
      )}

      <form onSubmit={handleSubmit} className="account-form">
        <div className="form-group">
          <FloatLabel
            type="text"
            name="first_name"
            label="First Name"
            value={formData.first_name}
            onChange={handleInputChange}
            data-cy="first-name-input"
          />
        </div>

        <div className="form-group">
          <FloatLabel
            type="text"
            name="last_name"
            label="Last Name"
            value={formData.last_name}
            onChange={handleInputChange}
            data-cy="last-name-input"
          />
        </div>

        <div className="form-group">
          <FloatLabel
            type="text"
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
          disabled={isLoading || Object.keys(getChangedFields()).length === 0}
          data-cy="save-profile-button"
        />
      </form>
    </div>
  );
};

export default AccountTab;
