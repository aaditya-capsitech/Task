import React, { useState } from "react";
import {
  Panel,
  PanelType,
  Stack,
  TextField,
  PrimaryButton,
  DefaultButton,
  Spinner,
} from "@fluentui/react";
import axios from "axios";

interface ContactFormPanelProps {
  show: boolean;
  onHide: () => void;
  businessId: string;
  businessName?: string; // Optional: If you can pass the business name too
  onSaveSuccess: () => void;
  performedBy: string | null;
}

const ContactFormPanel: React.FC<ContactFormPanelProps> = ({
  show,
  onHide,
  businessId,
  businessName,
  onSaveSuccess,
  performedBy,
}) => {
  const [newContact, setNewContact] = useState({
    name: "",
    type: "",
    phone: "",
    email: "",
    designation: "",
    story: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setNewContact((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const { name, type, phone, email } = newContact;

    if (!name || !type || !phone || !email) {
      alert("Please fill all required fields (Name, Type, Phone, Email)");
      return;
    }

    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token || token.split(".").length !== 3) {
        alert("Invalid or missing token.");
        return;
      }

      setLoading(true);

      const payload = {
        ...newContact,
        businesses: [
          {
            id: businessId,
            name: businessName || "Unnamed Business",
          },
        ],
        performedBy: performedBy ?? "System",
      };

      await axios.post("/api/contacts", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLoading(false);
      onHide();
      onSaveSuccess();
    } catch (err: any) {
      console.error("Error saving contact:", err);
      setLoading(false);
      const errorMsg =
        err.response?.data?.message ||
        (typeof err.response?.data === "string"
          ? err.response?.data
          : JSON.stringify(err.response?.data)) ||
        err.message ||
        "Unknown error";

      alert(`Failed to save contact:\n${errorMsg}`);
    }
  };

  return (
    <Panel
      isOpen={show}
      onDismiss={onHide}
      headerText="Create Contact"
      type={PanelType.medium}
      closeButtonAriaLabel="Close"
    >
      <Stack tokens={{ childrenGap: 12 }}>
        <TextField
          label="Name"
          required
          styles={{ field: { textTransform: 'capitalize' } }}
          value={newContact.name}
          onChange={(_, v) => handleChange("name", v || "")}
        />
        <TextField
          label="Type"
          required
          styles={{ field: { textTransform: 'capitalize' } }}
          value={newContact.type}
          onChange={(_, v) => handleChange("type", v || "")}
        />
        <TextField
          label="Phone Number"
          required
          value={newContact.phone}
          onChange={(_, v) => handleChange("phone", v || "")}
        />
        <TextField
          label="Email"
          required
          value={newContact.email}
          onChange={(_, v) => handleChange("email", v || "")}
        />
        <TextField
          label="Designation"
          styles={{ field: { textTransform: 'capitalize' } }}
          value={newContact.designation}
          onChange={(_, v) => handleChange("designation", v || "")}
        />
        <TextField
          label="Story"
          multiline
          rows={3}
          value={newContact.story}
          onChange={(_, v) => handleChange("story", v || "")}
        />

        <Stack horizontal tokens={{ childrenGap: 12 }} style={{ marginTop: 20 }}>
          <DefaultButton text="Cancel" onClick={onHide} disabled={loading} />
          <PrimaryButton
            text={loading ? "Saving..." : "Save"}
            onClick={handleSave}
            disabled={loading}
          />
          {loading && <Spinner size={1} />}
        </Stack>
      </Stack>
    </Panel>
  );
};

export default ContactFormPanel;
