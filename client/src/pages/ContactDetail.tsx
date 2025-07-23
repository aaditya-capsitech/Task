import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink, useLocation } from "react-router-dom";
import {
  Text,
  Stack,
  Persona,
  PersonaSize,
  Link,
  Pivot,
  PivotItem,
  DetailsList,
  SearchBox,
  ActionButton,
  Panel,
  PanelType,
  Icon,
  IconButton,
  TextField,
  PrimaryButton,
} from "@fluentui/react";
import type { IColumn } from "@fluentui/react/lib/DetailsList";
import axios from "axios";
import BusinessLinkForm from "../components/BusinessLinkForm";

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

const ContactDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [contact, setContact] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editedContact, setEditedContact] = useState<any>({});

  const isAdmin = location.pathname.includes("/admin");
  const basePath = isAdmin ? "/admin/clients/business" : "/client/business";

  const fetchContactWithBusinesses = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5288/api/contacts/${id}/details`
      );
      const { contact, businesses } = res.data;
      setContact({ ...contact, _id: contact._id || contact.id });
      setBusinesses(businesses);
      setFilteredBusinesses(businesses);
    } catch (err) {
      console.error("Error fetching contact with business details:", err);
    }
  };

  useEffect(() => {
    if (id) fetchContactWithBusinesses();
  }, [id]);

  const handleSearch = (value: string) => {
    const filtered = businesses.filter((b) =>
      b.businessName?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredBusinesses(filtered);
  };


  const handleSaveEdit = async () => {
    try {
      await axios.post("http://localhost:5288/api/contacts/update", {
        id: contact.id, //lowercase 'id'
        email: editedContact.email,
        phone: editedContact.phone,
        designation: editedContact.designation,
        type: editedContact.type,
        story: editedContact.story,
      });


      setIsEditPanelOpen(false);
      fetchContactWithBusinesses();
    } catch (err) {
      console.error("Error saving contact info:", err);
    }
  };


  const businessColumns: IColumn[] = [
    {
      key: "sno",
      name: "S.No.",
      minWidth: 40,
      maxWidth: 50,
      onRender: (_item, index) => (index !== undefined ? index + 1 : ""),
    },
    {
      key: "clientId",
      name: "Client ID",
      fieldName: "clientId",
      minWidth: 80,
    },
    {
      key: "businessName",
      name: "Business Name",
      minWidth: 800,
      onRender: (item) => (
        <Link
          as={RouterLink}
          to={`${basePath}/${item._id || item.id}`}
          state={{ fromContactId: contact._id }}
        >
          {item.businessName}
        </Link>
      ),
    },
    {
      key: "type",
      name: "Type",
      fieldName: "type",
      minWidth: 100,
    },
    {
      key: "status",
      name: "Status",
      fieldName: "status",
      minWidth: 80,
      onRender: (item) => {
        let rawStatus = item.status;

        // Normalize status to string
        let statusText = "";
        if (typeof rawStatus === "number") {
          statusText = rawStatus === 1 ? "active" : "inactive";
        } else if (typeof rawStatus === "string") {
          const normalized = rawStatus.trim().toLowerCase();
          if (normalized === "1") statusText = "active";
          else if (normalized === "0") statusText = "inactive";
          else statusText = normalized;
        } else {
          statusText = "unknown";
        }

        const isActive = statusText === "active";

        return (
          <span
            style={{
              padding: "2px 8px",
              backgroundColor: isActive ? "#dff6dd" : "#fddede",
              color: isActive ? "#107c10" : "#a80000",
              borderRadius: 4,
              fontSize: 12,
              textTransform: "capitalize",
            }}
          >
            {statusText}
          </span>
        );
      },
    },
    {
      key: "designation",
      name: "Designation",
      fieldName: "designation",
      minWidth: 100,
    },
    {
      key: "edit",
      name: "",
      minWidth: 30,
      onRender: () => <Icon iconName="Edit" style={{ cursor: "pointer" }} />,
    },
  ];

  if (!contact) return <Text variant="large">Loading contact...</Text>;

  return (
    <Stack
      verticalFill
      styles={{
        root: {
          height: "100%",
          padding: 8,
          backgroundColor: "#fff",
          overflowY: "auto",
        },
      }}
    >
      {/* Header */}
      <Stack
        horizontal
        verticalAlign="center"
        tokens={{ childrenGap: 16 }}
        style={{ marginBottom: 16 }}
      >
        <Persona
          text={contact.name}
          secondaryText={contact.designation}
          size={PersonaSize.size72}
        />
        <Stack>
          <Text>{contact.businessName}</Text>
        </Stack>
      </Stack>

      <Pivot>
        <PivotItem headerText="Profile">
          <Stack style={cardStyle}>
            <Stack
              horizontal
              horizontalAlign="space-between"
              verticalAlign="center"
              style={{ marginBottom: 16 }}
            >
              <Text variant="xLarge">Contact Info</Text>
              <IconButton iconProps={{ iconName: "Edit" }}
                onClick={() => {
                  setEditedContact(contact);
                  setIsEditPanelOpen(true);
                }}
              />
            </Stack>

            <div style={rowStyle}>
              <div style={fieldStyle}>
                <Text variant="mediumPlus">Email</Text>
                <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
              </div>

              <div style={fieldStyle}>
                <Text variant="mediumPlus">Phone</Text>
                <Text>{contact.phone}</Text>
              </div>

              <div style={fieldStyle}>
                <Text variant="mediumPlus">Designation</Text>
                <Text>{contact.designation}</Text>
              </div>

              <div style={fieldStyle}>
                <Text variant="mediumPlus">Type</Text>
                <Text>{contact.type}</Text>
              </div>

              <div style={{ ...fieldStyle, flex: "1 1 100%" }}>
                <Text variant="mediumPlus">Story</Text>
                <Text>{contact.story || "No notes available."}</Text>
              </div>
            </div>
          </Stack>
        </PivotItem>

        <PivotItem headerText="Businesses">
          <Stack style={cardStyle}>
            <Stack
              horizontal
              tokens={{ childrenGap: 16 }}
              style={{ marginBottom: 16 }}
            >
              <ActionButton
                iconProps={{ iconName: "Add" }}
                text="Add"
                onClick={() => setIsPanelOpen(true)}
              />
              <ActionButton
                iconProps={{ iconName: "Refresh" }}
                text="Refresh"
                onClick={fetchContactWithBusinesses}
              />
              <SearchBox
                placeholder="Search businesses"
                onChange={(_, newValue) =>
                  handleSearch(newValue?.toLowerCase() || "")
                }
                styles={{ root: { width: 250 } }}
              />
            </Stack>

            <DetailsList
              items={filteredBusinesses}
              columns={businessColumns}
              selectionMode={0}
            />
          </Stack>
        </PivotItem>
      </Pivot>

      {/* Add Business Panel */}
      <Panel
        isOpen={isPanelOpen}
        onDismiss={() => setIsPanelOpen(false)}
        headerText="Add Business"
        closeButtonAriaLabel="Close"
        type={PanelType.medium}
      >
        <BusinessLinkForm
          contact={contact}
          isOpen={isPanelOpen}
          onDismiss={() => setIsPanelOpen(false)}
          onSave={() => {
            setIsPanelOpen(false);
            fetchContactWithBusinesses();
          }}
        />
      </Panel>
      {/* Edit Contact Panel */}
      <Panel
        isOpen={isEditPanelOpen}
        onDismiss={() => setIsEditPanelOpen(false)}
        headerText="Edit Contact Info"
        closeButtonAriaLabel="Close"
        type={PanelType.medium}
        onRenderFooterContent={() => (
          <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 8 }}>
            <PrimaryButton text="Save" onClick={handleSaveEdit} />
          </Stack>
        )}
        isFooterAtBottom
      >
        <Stack tokens={{ childrenGap: 16 }}>
          <TextField
            label="Email"
            value={editedContact.email || ""}
            onChange={(_, val?: string) =>
              setEditedContact((prev: any) => ({ ...prev, email: val }))
            }
          />
          <TextField
            label="Phone"
            value={editedContact.phone || ""}
            onChange={(_, val?: string) =>
              setEditedContact((prev: any) => ({ ...prev, phone: val }))
            }
          />
          <TextField
            label="Designation"
            value={editedContact.designation || ""}
            onChange={(_, val?: string) =>
              setEditedContact((prev: any) => ({ ...prev, designation: val }))
            }
          />
          <TextField
            label="Type"
            value={editedContact.type || ""}
            onChange={(_, val?: string) =>
              setEditedContact((prev: any) => ({ ...prev, type: val }))
            }
          />
          <TextField
            label="Story"
            multiline
            rows={4}
            value={editedContact.story || ""}
            onChange={(_, val?: string) =>
              setEditedContact((prev: any) => ({ ...prev, story: val }))
            }
          />
        </Stack>
      </Panel>

    </Stack>
  );
};

export default ContactDetail;
