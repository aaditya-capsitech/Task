import React, { useState, useEffect } from "react";
import {
  Stack,
  Text,
  DefaultButton,
  TextField,
  Pivot,
  PivotItem,
  IconButton,
  Dropdown,
  Panel,
  PanelType,
} from "@fluentui/react";
import { DatePicker } from "@fluentui/react";
import type { IDropdownOption } from "@fluentui/react/lib/Dropdown";

const formatAddress = (address: any): string => {
  if (!address) return "-";

  const { house, street, city, state, country, pincode } = address;

  return `${house} ${street}, ${city}, ${state}, ${country}, ${pincode}`
    .replace(/\s+/g, " ")
    .replace(/ ,/g, ",")
    .trim();
};
const ProfilePage = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState({
    house: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isPasswordPanelOpen, setIsPasswordPanelOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setEmail(user.email || "");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setGender(user.gender || "");
      setDob(user.dob || "");
      setAddress(user.address || {});
    }
  }, []);

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5288/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gender, dob, address }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Update failed.");

      alert("Profile updated successfully!");
      setIsEditPanelOpen(false);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const response = await fetch("http://localhost:5288/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update password.");
      }

      alert("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordPanelOpen(false);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };
  return (
    <Stack horizontal tokens={{ childrenGap: 32 }} styles={{ root: { padding: 24 } }}>
      <Stack grow>
        <Pivot>
          <PivotItem headerText="Profile">
            <Stack
              tokens={{ childrenGap: 12 }}
              styles={{
                root: {
                  backgroundColor: "#f9f9f9",
                  padding: 16,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  marginTop: 16,
                },
              }}
            >
              <Stack horizontal horizontalAlign="space-between">
                <Text variant="large" styles={{ root: { fontWeight: 600 } }}>
                  {firstName} {lastName}
                </Text>
                <IconButton iconProps={{ iconName: "Edit" }} onClick={() => setIsEditPanelOpen(true)} />
              </Stack>

              <Stack horizontal tokens={{ childrenGap: 60 }}>
                <Stack>
                  <Text variant="smallPlus" styles={{ root: { color: "#999" } }}>First name</Text>
                  <Text variant="medium">{firstName}</Text>

                  <Text variant="smallPlus" styles={{ root: { marginTop: 12, color: "#999" } }}>Gender</Text>
                  <Text variant="medium">{gender || "-"}</Text>

                  <Text variant="smallPlus" styles={{ root: { marginTop: 12, color: "#999" } }}>Date of birth</Text>
                  <Text variant="medium">{dob || "-"}</Text>
                </Stack>

                <Stack>
                  <Text variant="smallPlus" styles={{ root: { color: "#999" } }}>Last name</Text>
                  <Text variant="medium">{lastName}</Text>

                  <Text variant="smallPlus" styles={{ root: { marginTop: 12, color: "#999" } }}>Email</Text>
                  <Text variant="medium">{email}</Text>

                  <Text variant="smallPlus" styles={{ root: { marginTop: 12, color: "#999" } }}>Address</Text>
                  <Text variant="medium">{formatAddress(address)}</Text>


                </Stack>
              </Stack>

              <DefaultButton
                text="Change Password"
                iconProps={{ iconName: "PasswordField" }}
                onClick={() => setIsPasswordPanelOpen(true)}
                styles={{ root: { marginTop: 16, width: 180 } }}
              />
            </Stack>
          </PivotItem>

          <PivotItem headerText="Email Link">
            <Text styles={{ root: { marginTop: 16 } }}>Coming soon...</Text>
          </PivotItem>

          <PivotItem headerText="Theme">
            <Text styles={{ root: { marginTop: 16 } }}>Theme customization coming soon.</Text>
          </PivotItem>
        </Pivot>
      </Stack>

      {/* Edit Profile Panel */}
      <Panel
        headerText="Edit Profile Details"
        isOpen={isEditPanelOpen}
        onDismiss={() => setIsEditPanelOpen(false)}
        type={PanelType.medium}
        isFooterAtBottom
        onRenderFooterContent={() => (
          <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 10 }} styles={{ root: { padding: "0 16px" } }}>
            <DefaultButton text="Cancel" onClick={() => setIsEditPanelOpen(false)} />
            <DefaultButton text="Save" primary onClick={handleSaveProfile} />
          </Stack>
        )}
      >
        <Stack tokens={{ childrenGap: 12 }}>
          <Dropdown
            label="Gender"
            selectedKey={gender}
            options={[
              { key: "Male", text: "Male" },
              { key: "Female", text: "Female" },
              { key: "Other", text: "Other" },
            ]}
            onChange={(_, option) => setGender(option?.key as string)}
          />

          <DatePicker
            label="Date of Birth"
            placeholder="Select a date"
            value={dob ? new Date(dob) : undefined}
            onSelectDate={(date) => setDob(date ? date.toISOString().split("T")[0] : "")}  //to seperate,So ISOformat "2025-07-21T08:24:00.000Z", it extracts "2025-07-21".
            isRequired
            allowTextInput
          />

          {/* Address Fields */}
          <Text styles={{ root: { fontSize: 20, fontWeight: 600, marginTop: 16 } }}> Address </Text>
          <Stack horizontal tokens={{ childrenGap: 20 }} wrap>
            <TextField
              label="House No"
              value={address.house || ""}
              onChange={(_, val) =>
                setAddress((prev: any) => ({ ...prev, house: val || "" }))
              }
              styles={{ root: { width: 180 } }}
            />
            <TextField
              label="Street"
              value={address.street || ""}
              onChange={(_, val) =>
                setAddress((prev: any) => ({ ...prev, street: val || "" }))
              }
              styles={{ root: { width: 180 } }}
            />
            <TextField
              label="City"
              value={address.city || ""}
              onChange={(_, val) =>
                setAddress((prev: any) => ({ ...prev, city: val || "" }))
              }
              styles={{ root: { width: 180 } }}
            />
            <TextField
              label="State"
              value={address.state || ""}
              onChange={(_, val) =>
                setAddress((prev: any) => ({ ...prev, state: val || "" }))
              }
              styles={{ root: { width: 180 } }}
            />
            <TextField
              label="Pincode"
              value={address.pincode || ""}
              onChange={(_, val) =>
                setAddress((prev: any) => ({ ...prev, pincode: val || "" }))
              }
              styles={{ root: { width: 180 } }}
            />
            <TextField
              label="Country"
              value={address.country || ""}
              onChange={(_, val) =>
                setAddress((prev: any) => ({ ...prev, country: val || "" }))
              }
              styles={{ root: { width: 180 } }}
            />
          </Stack>
        </Stack>
      </Panel>
      {/* Change Password Panel */}
      <Panel
        headerText="Change Password"
        isOpen={isPasswordPanelOpen}
        onDismiss={() => {
          setIsPasswordPanelOpen(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }}
        type={PanelType.smallFixedFar}
        isFooterAtBottom
        onRenderFooterContent={() => (
          <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 10 }} styles={{ root: { padding: "0 16px" } }}>
            <DefaultButton text="Cancel" onClick={() => setIsPasswordPanelOpen(false)} />
            <DefaultButton text="Save" primary onClick={handlePasswordChange} />
          </Stack>
        )}
      >
        <Stack tokens={{ childrenGap: 12 }}>
          <TextField
            label="Current Password"
            type="password"
            canRevealPassword
            value={currentPassword}
            onChange={(_, val) => setCurrentPassword(val || "")}
          />
          <TextField
            label="New Password"
            type="password"
            canRevealPassword
            value={newPassword}
            onChange={(_, val) => setNewPassword(val || "")}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            canRevealPassword
            value={confirmPassword}
            onChange={(_, val) => setConfirmPassword(val || "")}
          />
        </Stack>
      </Panel>
    </Stack>
  );
};

export default ProfilePage;
