import { useState } from 'react';
import { api } from '@/lib/api';

export const RegistrationControl = ({ semester }) => {
  const [registrationOpen, setRegistrationOpen] = useState(semester.registrationOpen);
  const [minAverage, setMinAverage] = useState(semester.minAverage || '');
  const [noFailedSubjects, setNoFailedSubjects] = useState(semester.noFailedSubjects || false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.patch(`/api/semesters/${semester.id}/registration`, {
        registrationOpen,
        minAverage: minAverage === '' ? null : Number(minAverage),
        noFailedSubjects,
      });
      setMessage('Registration settings updated!');
    } catch (err) {
      setMessage('Failed to update settings.');
    }
    setSaving(false);
  };

  return (
    <div>
      <h3>Registration Control</h3>
      <label>
        <input
          type="checkbox"
          checked={registrationOpen}
          onChange={e => setRegistrationOpen(e.target.checked)}
        />
        Registration Open
      </label>
      <br />
      <label>
        Minimum Average (%):
        <input
          type="number"
          value={minAverage}
          onChange={e => setMinAverage(e.target.value)}
          min={0}
          max={100}
        />
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          checked={noFailedSubjects}
          onChange={e => setNoFailedSubjects(e.target.checked)}
        />
        No Failed Subjects Required
      </label>
      <br />
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
      {message && <div>{message}</div>}
    </div>
  );
};