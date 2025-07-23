import { useParams, Link, useLocation, useNavigate } from "react-router-dom"; //   ADDED useLocation, useNavigate
import { useEffect, useState, useRef } from "react";
import {
  Text,
  Stack,
  IconButton,
  Panel,
  PanelType,
  TextField,
  PrimaryButton,
  DefaultButton,
  DetailsList,
  Persona,
  PersonaSize,
} from "@fluentui/react";
import type { IColumn } from "@fluentui/react/lib/DetailsList";
import axios from "axios";
import ContactFormPanel from "./ContactFormPanel";
import BusinessHistory from "./BusinessHistory";

const getCurrentUserEmail = (): string | null => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.email || null;
  } catch {
    return null;
  }
};

const labelStyle = {
  fontWeight: 600,
  display: "inline-block",
  minWidth: 100,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: 24,
  borderRadius: 8,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  marginBottom: 24,
};

const fieldStyle: React.CSSProperties = {
  flex: "1 1 calc(33.333% - 16px)",
  display: "flex",
  flexDirection: "column",
  paddingRight: 16,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 24,
};

const tabStyle = {
  display: "flex",
  gap: 24,
  margin: "16px 0 24px 0",
  borderBottom: "1px solid #ddd",
  paddingBottom: 8,
};

const BusinessDetail = () => {
  const { id } = useParams();
  const location = useLocation(); //Get location for state
  const navigate = useNavigate();
  const fromContactId = location.state?.fromContactId || null; // Get contact ID if passed

  const [business, setBusiness] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Profile");
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);

  const tabs = ["Profile", "History", "Billings", "Contacts", "AML"];

  const fetchBusiness = async () => {
    try {
      const res = await axios.get(`http://localhost:5288/api/businessdata/${id}`);
      setBusiness(res.data);
    } catch (err) {
      console.error("Error fetching business:", err);
    }
  };

  const fetchContacts = async () => {
    const res = await axios.get(`http://localhost:5288/api/contacts?businessId=${id}`);
    const contactsWithSno = res.data.map((c: any, index: number) => ({ ...c, sno: index + 1 }));
    setContacts(contactsWithSno);
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5288/api/history?businessId=${id}`);
      const logs = res.data.sort(
        (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setHistoryLogs(logs);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchBusiness();
    //fetchContacts();
    //fetchHistory();
  }, [id]);

  const openPanel = () => {
    setFormData(business);
    setIsPanelOpen(true);
  };

  const saveForm = async () => {
    try {
      await axios.post(`http://localhost:5288/api/businessdata/update/${business.id}`, formData);
      setBusiness(formData);
      setIsPanelOpen(false);
      await fetchHistory();
    } catch (err) {
      console.error("Error updating business:", err);
    }
  };

  const renderField = (label: string, key: keyof typeof business) => (
    <div style={fieldStyle}>
      <Text variant="mediumPlus">{label}</Text>
      <Text>{business?.[key] || "—"}</Text>
    </div>
  );

  const contactColumns: IColumn[] = [
    { key: "sno", name: "Serial No", fieldName: "sno", minWidth: 50, maxWidth: 80 },
    {
      key: "name",
      name: "Name",
      fieldName: "name",
      minWidth: 100,
      onRender: (item: any) => (
        <Link
          to={`/contact/${item.id}`}
          state={{ fromBusinessId: business?.id }} // Pass business context back
        >
          {item.name}
        </Link>
      ),
    },
    { key: "type", name: "Type", fieldName: "type", minWidth: 380 },
    { key: "phone", name: "Phone Number", fieldName: "phone", minWidth: 280 },
    { key: "email", name: "Email", fieldName: "email", minWidth: 150 },
  ];

  const handleSearchChange = (_: any, value?: string) => {
    setSearchText(value || "");
    axios.get(`http://localhost:5288/api/contacts?businessId=${id}`).then((res) => {
      const filtered = res.data.filter((c: any) =>
        c.name.toLowerCase().includes((value || "").toLowerCase())
      );
      setContacts(filtered);
    });
  };

  const onCancel = () => {
    setIsPanelOpen(false);      // closes the Panel
    setFormData(business);      // optionally reset form to original business data
  };

  if (!business) return <Text variant="large">Loading...</Text>;

  return (
    <Stack
      verticalFill
      styles={{
        root: {
          height: "100%",
          width: "100%",
          overflowX: "hidden",
          overflowY: "auto",
          backgroundColor: "#ffffff",
          padding: 8,
        },
      }}
    >
      {/*   Back to Contact Link if coming from a Contact */}
      {fromContactId && (
        <Text style={{ marginBottom: 16 }}>
          ←{" "}
          <Link to={`/contact/${fromContactId}`} style={{ fontWeight: 600 }}>
            Back to Contact
          </Link>
        </Text>
      )}

      <Persona text={business.businessName} secondaryText={business.clientId} size={PersonaSize.size40} />

      <div style={tabStyle}>
        {tabs.map((tab) => (
          <Text
            key={tab}
            onClick={() => setSelectedTab(tab)}
            style={{
              cursor: "pointer",
              fontWeight: selectedTab === tab ? 600 : 400,
              borderBottom: selectedTab === tab ? "3px solid #0078d4" : "none",
              paddingBottom: 4,
            }}
          >
            {tab}
          </Text>
        ))}
      </div>

      {selectedTab === "Profile" && (
        <div style={cardStyle}>
          <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
            <Text variant="xLarge">Basic Details</Text>
            <IconButton iconProps={{ iconName: "Edit" }} onClick={openPanel} />
          </Stack>
          <div style={rowStyle}>
            {renderField("Client ID", "clientId")}
            {renderField("Business Name", "businessName")}
            {renderField("Type", "type")}
            {renderField("Contact Person", "contactPerson")}
            {renderField("Team", "team")}
            {renderField("Manager", "manager")}
            {renderField("First Response", "firstResponse")}
            {renderField("Email", "email")}
            {renderField("Phone", "phoneNumber")}
          </div>
        </div>
      )}

      {selectedTab === "Contacts" && (
        <div style={cardStyle}>
          <Stack horizontal tokens={{ childrenGap: 8 }} style={{ marginBottom: 16 }}>
            <DefaultButton text="Add Contact" iconProps={{ iconName: "Add" }} onClick={() => setIsContactFormOpen(true)} />
            <DefaultButton text="Refresh" iconProps={{ iconName: "Refresh" }} onClick={fetchContacts} />
            <TextField
              placeholder="Search contacts..."
              value={searchText}
              onChange={handleSearchChange}
              style={{ maxWidth: 240 }}
            />
          </Stack>
          <DetailsList items={contacts} columns={contactColumns} setKey="set" />
          <ContactFormPanel
            show={isContactFormOpen}
            onHide={() => setIsContactFormOpen(false)}
            businessId={id!}
            businessName={business?.businessName}
            onSaveSuccess={() => {
              fetchContacts();
              fetchHistory(); // also update history tab
            }}
            performedBy={getCurrentUserEmail()}
          />
        </div>
      )}

      {selectedTab === "History" && (
        <div style={cardStyle}>
          <Text variant="xLarge">History Logs</Text>
          <BusinessHistory businessId={business?.id} />
        </div>
      )}

      <Panel
        isOpen={isPanelOpen}
        onDismiss={() => setIsPanelOpen(false)}
        headerText="Edit Business Info"
        type={PanelType.custom}
        customWidth="500px"
        closeButtonAriaLabel="Close"
      >
        <Stack tokens={{ childrenGap: 12 }}>
          {/*  Client ID and Type are  read-only */}
          <TextField label="Client ID" value={formData.clientId} readOnly />
          <TextField label="Type" value={formData.type} readOnly />
          <TextField label="Business Name" value={formData.businessName} onChange={(_, v) => setFormData({ ...formData, businessName: v })} />
          <TextField label="Contact Person" value={formData.contactPerson} onChange={(_, v) => setFormData({ ...formData, contactPerson: v })} />
          <TextField label="Team" value={formData.team} onChange={(_, v) => setFormData({ ...formData, team: v })} />
          <TextField label="Manager" value={formData.manager} onChange={(_, v) => setFormData({ ...formData, manager: v })} />
          <TextField label="First Response" value={formData.firstResponse} onChange={(_, v) => setFormData({ ...formData, firstResponse: v })} />
          <TextField label="Email" value={formData.email} onChange={(_, v) => setFormData({ ...formData, email: v })} />
          <TextField label="Phone" value={formData.phoneNumber} onChange={(_, v) => setFormData({ ...formData, phoneNumber: v })} />
          <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 8 }}>
            <DefaultButton text="Cancel" onClick={onCancel} />
            <PrimaryButton text="Save" onClick={saveForm} />
          </Stack>
        </Stack>
      </Panel>
    </Stack>
  );
};

export default BusinessDetail;
