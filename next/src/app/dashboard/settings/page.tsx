'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/api/auth';
import { Card } from '@/components/ui';
import { Input, Button } from '@/components/bb/ui';
import { Container, Stack, Flex, Divider } from '@/components/bb/layout';
import { Alert } from '@/components/bb/feedback';
import { Tabs, TabPanel } from '@/components/bb/navigation';
import { FormField, FormGroup } from '@/components/bb/forms';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });


  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUser({
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
      });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      setSaving(false);
      return;
    }

    try {
      // TODO: Implement API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setError('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="py-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: 'profile', label: 'Profile' },
            { id: 'password', label: 'Password' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="mt-6">
          <TabPanel tabId="profile" activeTab={activeTab}>
            <Card>
              <form onSubmit={handleProfileSubmit}>
                <Stack gap="lg">
                  <FormGroup title="Profile Information" description="Update your personal details.">
                    <Flex gap="md" className="flex-col sm:flex-row">
                      <FormField label="First Name" htmlFor="firstName" className="flex-1">
                        <Input
                          id="firstName"
                          name="firstName"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          placeholder="John"
                        />
                      </FormField>
                      <FormField label="Last Name" htmlFor="lastName" className="flex-1">
                        <Input
                          id="lastName"
                          name="lastName"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          placeholder="Doe"
                        />
                      </FormField>
                    </Flex>
                  </FormGroup>
                  <Divider />
                  <Flex justify="end">
                    <Button type="submit" variant="primary" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Flex>
                </Stack>
              </form>
            </Card>
          </TabPanel>

          <TabPanel tabId="password" activeTab={activeTab}>
            <Card>
              <form onSubmit={handlePasswordSubmit}>
                <Stack gap="lg">
                  <FormGroup title="Change Password" description="Update your password to keep your account secure.">
                    <FormField label="Current Password" htmlFor="currentPassword">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </FormField>

                    <FormField label="New Password" htmlFor="newPassword">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </FormField>

                    <FormField label="Confirm New Password" htmlFor="confirmPassword">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </FormField>
                  </FormGroup>

                  <Divider />

                  <Flex justify="end">
                    <Button type="submit" variant="primary" disabled={saving}>
                      {saving ? 'Changing...' : 'Change Password'}
                    </Button>
                  </Flex>
                </Stack>
              </form>
            </Card>
          </TabPanel>
        </div>
        {success && (
        <Alert variant="success" className="mt-6" onClose={() => setSuccess(null)}>
            {success}
        </Alert>
        )}

        {error && (
        <Alert variant="error" className="mt-6" onClose={() => setError(null)}>
            {error}
        </Alert>
        )}


      </Container>
    </main>
  );
}
