import React, { useState, useEffect } from 'react';
import { DetailsList } from '@fluentui/react/lib/DetailsList';
import type { IColumn } from '@fluentui/react/lib/DetailsList';
import { Stack } from '@fluentui/react/lib/Stack';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import AddBusinessForm from './AddBusinessForm';

// Type for business data rows (match AddBusinessForm)
interface BusinessRow {
  sno: string;
  clientId: string;
  businessName: string;
  type: string;
  contactPerson: string;
  team: string;
  manager: string;
  firstResponse: string;
  email: string;
  phoneNumber: string;
}

const ClientTable: React.FC = () => {
  const [data, setData] = useState<BusinessRow[]>([]);
  const [showForm, setShowForm] = useState(false);

  //   Fetch business data from backend
  const fetchBusinessData = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        alert('You are not logged in. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:5288/api/BusinessData', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch business data');

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching business data:', error);
      alert('Could not load data.');
    }
  };

  //   Load data on initial render
  useEffect(() => {
    fetchBusinessData();
  }, []);

  //   After form submit, re-fetch data
  const handleSave = () => {
    fetchBusinessData();
  };

  const columns: IColumn[] = [
    { key: 'sno', name: 'S.No', fieldName: 'sno', minWidth: 60 },
    { key: 'clientId', name: 'Client ID', fieldName: 'clientId', minWidth: 100 },
    { key: 'businessName', name: 'Business Name', fieldName: 'businessName', minWidth: 150 },
    { key: 'type', name: 'Type', fieldName: 'type', minWidth: 100 },
    { key: 'contactPerson', name: 'Contact Person', fieldName: 'contactPerson', minWidth: 120 },
    { key: 'team', name: 'Team', fieldName: 'team', minWidth: 100 },
    { key: 'manager', name: 'Manager', fieldName: 'manager', minWidth: 100 },
    { key: 'firstResponse', name: 'First Response', fieldName: 'firstResponse', minWidth: 120 },
    { key: 'email', name: 'Email', fieldName: 'email', minWidth: 150 },
    { key: 'phoneNumber', name: 'Phone Number', fieldName: 'phoneNumber', minWidth: 120 },
  ];

  return (
    <Stack styles={{ root: { padding: '20px 20px 20px 0' } }} tokens={{ childrenGap: 20 }}>
      <PrimaryButton text="Add Business" onClick={() => setShowForm(true)} />
      <DetailsList items={data} columns={columns} />
      {showForm && (
        <AddBusinessForm
          showPanel={showForm}
          setShowPanel={setShowForm}
          onSubmit={handleSave}
        />
      )}
    </Stack>
  );
};

export default ClientTable;