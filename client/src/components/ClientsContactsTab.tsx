import React, { useEffect, useState, useRef } from 'react';
import {
  CommandBar,
  DetailsList,
  DetailsListLayoutMode,
  TextField,
  Panel,
  PanelType,
  PrimaryButton,
  Dropdown,
  Stack,
  DefaultButton,
} from '@fluentui/react';
import type { IDropdownOption } from '@fluentui/react/lib/Dropdown';
import axios from 'axios';
import type { IColumn } from '@fluentui/react/lib/DetailsList';
import ContactCreateForm from "./ContactCreateForm";
import { Link } from 'react-router-dom';

const PAGE_SIZE = 10;

const ClientsContactsTab = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const hasFetchedRef = useRef(false);
  const [businessOptions, setBusinessOptions] = useState<IDropdownOption[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    designation: '',
    businessId: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

const fetchContacts = async () => {
  try {
    setLoading(true);
    setContacts([]);
    setFilteredContacts([]);

    const res = await axios.get('/api/contacts/all');
    setContacts(res.data);
    setFilteredContacts(res.data);
    setCurrentPage(1);
  } catch (err) {
    console.error('Failed to fetch contacts:', err);
  } finally {
    setLoading(false);
  }
};

const handleRefresh = async () => {
  try {
    setLoading(true);
    setContacts([]);
    setFilteredContacts([]);

    // First call backend refresh
    await axios.post('/api/contacts/refresh');

    // Then fetch updated data
    await fetchContacts();
  } catch (error) {
    console.error("Refresh failed:", error);
  } finally {
    setLoading(false);
  }
};


  const fetchBusinessOptions = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.get('/api/businessdata/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const businessList = Array.isArray(res.data) ? res.data : [];

      const options = businessList.map((b: any) => ({
        key: b.id,
        text: b.businessName,
      }));

      setBusinessOptions(options);
    } catch (err) {
      console.error('Failed to fetch business options:', err);
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchContacts();
      // fetchBusinessOptions();
      hasFetchedRef.current = true;
    }
  }, []);

  const onSearchChange = (_: any, newValue?: string) => {
    const value = newValue ?? '';
    setSearchTerm(value);
    const filtered = contacts.filter(c =>
      c.name?.toLowerCase().includes(value.toLowerCase()) ||
      c.email?.toLowerCase().includes(value.toLowerCase()) ||
      c.phone?.toLowerCase().includes(value.toLowerCase()) ||
      c.businesses?.some((b: any) => b.name.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredContacts(filtered);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveContact = async () => {
    const { name, type, phone, email, designation, businessId } = formData;

    if (!name || !type || !phone || !email || !businessId) {
      alert("Please fill all required fields.");
      return;
    }

    const businessName = businessOptions.find((b) => b.key === businessId)?.text || '';

    const contactPayload = {
      name,
      email,
      phone,
      type,
      designation,
      businesses: [
        {
          id: businessId,
          name: businessName,
        },
      ],
    };

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token || token.split('.').length !== 3) {
        alert('Invalid or missing token.');
        return;
      }

      await axios.post('/api/contacts', contactPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowAddPanel(false);
      await fetchContacts();

      setFormData({
        name: '',
        email: '',
        phone: '',
        type: '',
        designation: '',
        businessId: '',
      });
    } catch (err: any) {
      console.error('Error saving contact:', err);
      alert('Error saving contact. Check console.');
    }
  };
  const columns: IColumn[] = [
    { key: 'sno', name: 'S.No', fieldName: 'sno', minWidth: 30, maxWidth: 40 },
    {
      key: 'name', name: 'Name', fieldName: 'name', minWidth: 250,
      onRender: (item) => <Link to={`/admin/contact/${item.id}`} style={{ textDecoration: 'none', color: '#0078d4' }}>{item.name}</Link>
    },
    { key: 'designation', name: 'Designation', fieldName: 'designation', minWidth: 120 },
    { key: 'email', name: 'Email', fieldName: 'email', minWidth: 180 },
    { key: 'phone', name: 'Phone', fieldName: 'phone', minWidth: 130 },
    { key: 'type', name: 'Type', fieldName: 'type', minWidth: 120 },
    {
      key: 'business', name: 'Business', minWidth: 180,
      onRender: (item: any) => item.businesses?.length > 0 ? item.businesses.map((b: any) => b.name).join(", ") : "—"
    }
  ];
  // Pagination logic
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedItems = filteredContacts
    .slice(startIndex, startIndex + PAGE_SIZE)
    .map((item, index) => ({
      ...item,
      sno: startIndex + index + 1,
    }));
  const totalPages = Math.ceil(filteredContacts.length / PAGE_SIZE);

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <CommandBar
        items={[
          {
            key: 'addContact',
            text: 'Add',
            iconProps: { iconName: 'Add' },
            onClick: () => setShowAddPanel(true),
          },
          {
            key: 'refresh',
            text: 'Refresh',
            iconProps: { iconName: 'Refresh' },
            onClick: handleRefresh,
          },
        ]}
        farItems={[
          {
            key: 'searchBox',
            onRender: () => (
              <TextField
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={onSearchChange}
                styles={{
                  root: { width: 250 },
                }}
              />
            ),
          },
        ]}
      />
      <DetailsList
        items={paginatedItems}
        columns={columns}
        layoutMode={DetailsListLayoutMode.fixedColumns}
        selectionPreservedOnEmptyClick
        isHeaderVisible={true}
      />
      {/* Pagination Controls */}
      <Stack horizontal verticalAlign="center" horizontalAlign="space-between" styles={{ root: { padding: '10px 0' } }}>
        <span>
          Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filteredContacts.length)} of {filteredContacts.length}
        </span>

        <Stack horizontal tokens={{ childrenGap: 6 }} horizontalAlign="center">
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            const isSelected = page === currentPage;

            return (
              <DefaultButton
                key={page}
                text={page.toString()}
                onClick={() => setCurrentPage(page)}
                styles={{
                  root: { minWidth: 16, height: 16, padding: 0 },
                }}
              />
            );
          })}
        </Stack>
      </Stack>
      <ContactCreateForm
        isOpen={showAddPanel}
        onDismiss={() => setShowAddPanel(false)}
        onSave={() => {
          fetchContacts();        // Refresh list after saving
          setShowAddPanel(false); // Close panel
        }}
      />
    </Stack>
  );
};

export default ClientsContactsTab;
