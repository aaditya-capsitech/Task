import React, { useState, useRef } from "react";
import {
  Persona,
  PersonaSize,
  PersonaPresence,
  Stack,
  DefaultButton,
  Callout,
  DirectionalHint,
  IconButton,
} from "@fluentui/react";
import { useNavigate, useLocation } from "react-router-dom";

const UserProfileDropdown = () => {
  const [isCalloutVisible, setIsCalloutVisible] = useState(false);
  const avatarButtonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const onSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleProfileClick = () => {
    const isAdmin = location.pathname.includes("/admin");
    setIsCalloutVisible(false);
    navigate(isAdmin ? "/admin/settings/profile" : "/client/settings/profile");
  };

  return (
    <div>
      <IconButton
        iconProps={{ iconName: "Contact" }}
        styles={{
          root: {
            borderRadius: "50%",
            backgroundColor: "#6200ee",
            color: "#fff",
            width: 40,
            height: 40,
          },
        }}
        title="User Profile"
        onClick={() => setIsCalloutVisible(!isCalloutVisible)}
        componentRef={avatarButtonRef}
      >
        GM
      </IconButton>

      {isCalloutVisible && (
        <Callout
          target={avatarButtonRef}
          onDismiss={() => setIsCalloutVisible(false)}
          directionalHint={DirectionalHint.bottomRightEdge}
          setInitialFocus
        >
          <Stack tokens={{ childrenGap: 10 }} styles={{ root: { padding: 16, width: 280 } }}>
            {/* <Persona
              text="Google Meet"
              secondaryText="Admin"
              size={PersonaSize.size40}
              imageInitials="GM"
              initialsColor={6}
              presence={PersonaPresence.online}
            /> */}

            <Stack
              horizontal
              horizontalAlign="center"
              tokens={{ childrenGap: 8 }}
              styles={{
                root: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "nowrap",
                },
              }}
            >
              <DefaultButton
                text="Profile"
                iconProps={{ iconName: "ContactInfo" }}
                onClick={handleProfileClick}
                styles={{ root: { width: "auto", flexShrink: 0 } }}
              />
              <DefaultButton
                text="Sign Out"
                iconProps={{ iconName: "SignOut" }}
                onClick={onSignOut}
                styles={{ root: { width: "auto", flexShrink: 0 } }}
              />
            </Stack>
          </Stack>
        </Callout>
      )}
    </div>
  );
};

export default UserProfileDropdown;
