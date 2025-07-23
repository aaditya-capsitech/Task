import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CommandBarComponent } from '../components/CommandBarComponent';
import AddBusinessForm from '../components/AddBusinessForm';
import { IconButton } from '@fluentui/react/lib/Button';
import ContactCreateForm from '../components/ContactCreateForm';
import ClientsContactsTab from '../components/ClientsContactsTab';
import { BusinessStatus, FilterCriteria } from '../types/Enums';
import type { FilterCriteriaType } from '../types/Enums';
import axios from 'axios';
import {
  Stack,
  Pivot,
  PivotItem,
  DetailsList,
  TextField,
  CommandBar,
  DetailsListLayoutMode,
  SelectionMode,
} from '@fluentui/react';
import type { IColumn } from '@fluentui/react/lib/DetailsList';

axios.defaults.baseURL = 'http://localhost:5288';
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const ITEMS_PER_PAGE = 10;

const ClientHome = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [businessData, setBusinessData] = useState<any[]>([]);
  const [originalBusinessData, setOriginalBusinessData] = useState<any[]>([]);
  const [contactsData, setContactsData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<BusinessStatus>(BusinessStatus.Active);
  const [currentPage, setCurrentPage] = useState(1);
  const [showContactPanel, setShowContactPanel] = useState(false);
  const [activeFilter, setActiveFilter] = useState<{ criteria: FilterCriteriaType; value: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false); //  Loading state for refresh
  const [contacts, setContacts] = useState<any[]>([]); //for contacts in clientsContactsTab.tsx
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);


  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.includes('/admin') ? '/admin/clients' : '/client';

  const fetchBusinessData = async () => {
    try {
      setIsRefreshing(true);

      const params: any = {
        status: statusFilter,
        page,
        pageSize,
      };

      if (activeFilter && activeFilter.value?.trim()) {
        if (activeFilter.criteria === FilterCriteria.BusinessType) {
          params.type = activeFilter.value;
        }
      }

      const res = await axios.get('/api/businessdata', { params });

      if (Array.isArray(res.data?.data)) {
        setBusinessData(res.data.data);
        setOriginalBusinessData(res.data.data);
        setTotalCount(res.data.totalCount || 0); // Update total count for pagination
      } else {
        setBusinessData([]);
        setOriginalBusinessData([]);
      }
    } catch (err) {
      console.error(err);
      setBusinessData([]);
      setOriginalBusinessData([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchAllContacts = async () => {
    const res = await axios.get('/api/contacts/all');
    setContactsData(res.data);
  };

  const handleAction = async (id: string, action: 'delete' | 'restore') => {
    try {
      if (action === 'delete') {
        await axios.post(`/api/businessdata/delete/${id}`);
      } else if (action === 'restore') {
        await axios.post(`/api/businessdata/restore/${id}`);
      }
      fetchBusinessData();
    } catch (err) {
      console.error(`${action} failed:`, err);
    }
  };

  const handleApplyFilter = (criteria: FilterCriteriaType, value: string) => {
    if (!value?.trim()) return;
    setActiveFilter({ criteria, value });
    setPage(1);
    //fetchBusinessData();
  };

  const handleClearFilter = () => {
    setActiveFilter(null);
    setPage(1);
    // fetchBusinessData();
  };

  //Fetching contacts only once when component mounts
  useEffect(() => {
    fetchAllContacts();
  }, []);
  //Fetching business data whenever filters change
  useEffect(() => {
    fetchBusinessData();
  }, [page, statusFilter, activeFilter]);

  const filteredBusinesses = businessData.filter((b) =>
    b.businessName?.toLowerCase().includes(searchText.toLowerCase()) ||
    b.clientId?.toLowerCase().includes(searchText.toLowerCase())
  );
  const businessesWithSno = filteredBusinesses.map((b, i) => ({ ...b, sno: i + 1 }));

  const contactsWithSno = contactsData
    .map((c, i) => ({ ...c, sno: i + 1 }))
    .filter(c => c.name?.toLowerCase().includes(searchText.toLowerCase()));

  const businessColumns: IColumn[] = [
    { key: 'sno', name: 'S.No.', fieldName: 'sno', minWidth: 40, maxWidth: 50 },
    {
      key: 'clientId',
      name: 'Client ID',
      fieldName: 'clientId',
      minWidth: 90,
      maxWidth: 100,
      onRender: (item) => (
        <span
          style={{ color: '#0078d4', textDecoration: 'underline', cursor: 'pointer', paddingRight: 16 }}
          onClick={() => navigate(`${basePath}/business/${item.id}`)}
        >
          {item.clientId}
        </span>
      ),
    },
    {
      key: 'businessName',
      name: 'Business Name',
      fieldName: 'businessName',
      minWidth: 220,
      onRender: (item) => (
        <span
          style={{ color: '#0078d4', textDecoration: 'underline', cursor: 'pointer', paddingLeft: 8 }}
          onClick={() => navigate(`${basePath}/business/${item.id}`)}
        >
          {item.businessName}
        </span>
      ),
    },
    { key: 'type', name: 'Type', fieldName: 'type', minWidth: 120 },
    { key: 'contactPerson', name: 'Contact person', fieldName: 'contactPerson', minWidth: 120 },
    { key: 'team', name: 'Team', fieldName: 'team', minWidth: 80 },
    { key: 'manager', name: 'Manager', fieldName: 'manager', minWidth: 100 },
    { key: 'firstResponse', name: 'First response', fieldName: 'firstResponse', minWidth: 100 },
    { key: 'email', name: 'Email', fieldName: 'email', minWidth: 150 },
    {
      key: 'actions',
      name: 'Actions',
      fieldName: 'actions',
      minWidth: 50,
      maxWidth: 50,
      onRender: (item) => (
        <IconButton
          iconProps={{ iconName: statusFilter === BusinessStatus.Inactive ? 'Refresh' : 'Delete' }}
          title={statusFilter === BusinessStatus.Inactive ? 'Restore' : 'Soft delete'}
          ariaLabel={statusFilter === BusinessStatus.Inactive ? 'Restore' : 'Delete'}
          onClick={() => handleAction(item.id, statusFilter === BusinessStatus.Inactive ? 'restore' : 'delete')}
          styles={{
            root: { height: 24, width: 24 },
            icon: { color: statusFilter === BusinessStatus.Inactive ? 'green' : 'red' },
          }}
        />
      ),
    },
  ];

  const contactColumns: IColumn[] = [
    { key: 'sno', name: 'S.No.', fieldName: 'sno', minWidth: 50 },
    { key: 'name', name: 'Name', fieldName: 'name', minWidth: 150 },
    { key: 'designation', name: 'Designation', fieldName: 'designation', minWidth: 120 },
    { key: 'email', name: 'Email', fieldName: 'email', minWidth: 180 },
    { key: 'phone', name: 'Phone', fieldName: 'phone', minWidth: 100 },
    { key: 'type', name: 'Type', fieldName: 'type', minWidth: 80 },
    { key: 'businessName', name: 'Business', fieldName: 'businessName', minWidth: 150 },
  ];

  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedBusinesses = businessesWithSno; // already paginated from backend

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <Pivot>
        <PivotItem headerText="Businesses">
          <CommandBarComponent
            items={[
              {
                key: 'add',
                text: 'Add',
                iconProps: { iconName: 'Add' },
                onClick: () => setShowPanel(true),
              },
              {
                key: 'refresh',
                text: 'Refresh',
                iconProps: { iconName: 'Refresh' },
                onClick: fetchBusinessData,
              },
            ]}
            onSearch={(val) => setSearchText(val)}
            onStatusFilterChange={(val) => setStatusFilter(val as BusinessStatus)}
            currentStatusFilter={statusFilter}
            onApplyFilter={handleApplyFilter}
            onClearFilter={handleClearFilter}
            activeFilter={activeFilter}
            onRefresh={fetchBusinessData}  //to refresh the page
          />
          {isRefreshing ? (
            <div style={{ padding: 20, textAlign: 'center', fontWeight: 500 }}>Refreshing data...</div>
          ) : (
            <DetailsList
              items={paginatedBusinesses}
              columns={businessColumns}
              setKey="businessList"
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
            />
          )}

          <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: 8 }}>
            <span>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount}
            </span>
            <Stack horizontal tokens={{ childrenGap: 4 }}>
              {Array.from({ length: totalPages }, (_, index) => (
                <span
                  key={index}
                  onClick={() => setPage(index + 1)}
                  style={{
                    padding: '2px 8px',
                    cursor: 'pointer',
                    borderRadius: 4,
                    backgroundColor: page === index + 1 ? '#e5f1fb' : 'transparent',
                    fontWeight: page === index + 1 ? 'bold' : 'normal',
                    border: '1px solid #ccc',
                  }}
                >
                  {index + 1}
                </span>
              ))}
            </Stack>
          </Stack>

          <AddBusinessForm showPanel={showPanel} setShowPanel={setShowPanel} onSubmit={fetchBusinessData} />
        </PivotItem>
        <PivotItem headerText="Contacts">
          <ClientsContactsTab />
          <ContactCreateForm
            isOpen={showContactPanel}
            onDismiss={() => setShowContactPanel(false)}
            onSave={() => {
              setShowContactPanel(false);
              fetchAllContacts();
            }}
          />
        </PivotItem>
      </Pivot>
    </Stack>
  );
};

export default ClientHome;
