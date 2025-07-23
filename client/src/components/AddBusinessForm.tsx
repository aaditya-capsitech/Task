import React, { useState } from 'react';
import {
  TextField,
  Dropdown,
  PrimaryButton,
  DefaultButton,
  Panel,
  PanelType,
  Stack,
} from '@fluentui/react';
import type { IDropdownOption } from "@fluentui/react/lib/Dropdown";

interface AddBusinessFormProps {
  showPanel: boolean;
  setShowPanel: (show: boolean) => void;
  onSubmit: (data: any) => void;
}

const businessTypeOptions: IDropdownOption[] = [
  { key: 'LLP', text: 'LLP' },
  { key: 'Limited', text: 'Limited' },
  { key: 'Limited Partnership', text: 'Limited Partnership' },
  { key: 'Individual', text: 'Individual' },
  { key: 'Partnership', text: 'Partnership' },
];

const AddBusinessForm: React.FC<AddBusinessFormProps> = ({
  showPanel,
  setShowPanel,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    businessName: '',
    type: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    team: '',
    manager: '',
    firstResponse: '',
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);

const handleChange = (
  ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
  newValue?: string
) => {
  const fieldName = (ev.target as HTMLInputElement).name;

  let value = newValue || '';

  // Always uppercase for businessName
  if (fieldName === 'businessName') {
    value = value.toUpperCase();
  }
  // Capitalize first letter only for specific fields
  const capitalizeFields = ['contactPerson', 'team', 'manager', 'firstResponse'];
  if (capitalizeFields.includes(fieldName)) {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }

  setFormData((prev) => ({
    ...prev,
    [fieldName]: value,
  }));
};
  const handleSubmit = async () => {
    if (isSaving) return;

    if (!formData.businessName || !formData.type) {
      alert('Please fill in required fields like Business Name and Type.');
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert('You are not logged in. Please log in again.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('http://localhost:5288/api/BusinessData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save data');
      const result = await response.json();

      onSubmit({
        ...formData,
        id: result.id,
        clientId: result.clientId,
        status: 'active',
        createdBy: 'You',
      });

      setFormData({
        businessName: '',
        type: '',
        contactPerson: '',
        phoneNumber: '',
        email: '',
        team: '',
        manager: '',
        firstResponse: '',
        notes: '',
      });

      setShowPanel(false);
    } catch (error) {
      console.error('Error saving business data:', error);
      alert('Error saving business data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Panel
      isOpen={showPanel}
      onDismiss={() => setShowPanel(false)}
      headerText="Add Business"
      closeButtonAriaLabel="Close"
      type={PanelType.custom}
      customWidth="600px"
      onRenderFooterContent={() => (
        <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 10 }} styles={{ root: { paddingTop: 12 } }}>
          <DefaultButton text="Cancel" onClick={() => setShowPanel(false)} disabled={isSaving} />
          <PrimaryButton text={isSaving ? 'Saving...' : 'Save'} onClick={handleSubmit} disabled={isSaving} />
        </Stack>
      )}
      isFooterAtBottom={true}
    >
      <Stack tokens={{ childrenGap: 16 }}>
        {/* Row with Type and Business Name */}
        <Stack horizontal tokens={{ childrenGap: 12 }}>
          <Dropdown
            label="Type"
            placeholder="Select type"
            options={businessTypeOptions}
            selectedKey={formData.type}
            onChange={(_, option) =>
              option && setFormData((prev) => ({ ...prev, type: option.key.toString() }))
            }
            required
            styles={{ root: { width: '50%' } }}
          />

          <TextField
            label="Business Name"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            required
            styles={{ root: { width: '50%' } }}
          />
        </Stack>

        {/* Always-visible contact fields */}
        <Stack tokens={{ childrenGap: 12 }}>
          <TextField
            label="Contact Person"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
          />
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            label="Team"
            name="team"
            value={formData.team}
            onChange={handleChange}
          />
          <TextField
            label="Manager"
            name="manager"
            value={formData.manager}
            onChange={handleChange}
          />
          <TextField
            label="First Response"
            name="firstResponse"
            value={formData.firstResponse}
            onChange={handleChange}
          />
          <TextField
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            multiline
          />
        </Stack>
      </Stack>
    </Panel>
  );
};

export default AddBusinessForm;
