import React, { useState, useEffect, useRef } from 'react';
import {
  Icon,
  Callout,
  Persona,
  PersonaSize,
  PersonaPresence,
  PersonaInitialsColor,
  Stack,
  DirectionalHint
} from '@fluentui/react';
import { useNavigate } from 'react-router-dom';

const getInitials = (firstName: string, lastName: string) => {
  const fInitial = firstName ? firstName[0].toUpperCase() : '';
  const lInitial = lastName ? lastName[0].toUpperCase() : '';
  return fInitial + lInitial;
};

const Navbar = () => {
  const navigate = useNavigate();
  const avatarRef = useRef(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState(''); //  Added role state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setRole(user.role || ''); //  Read and set role dynamically
      } catch {
        // ignore
      }
    }
  }, []);

  const initials = getInitials(firstName, lastName) || 'AT';

  const handleModulesClick = () => {
    console.log('Modules clicked');
  };

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary opacity-75 px-4 py-2 shadow-sm">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <span className="navbar-brand h5 mb-0">Acting Office - Dev</span>

        <div className="d-flex align-items-center" style={{ gap: '10px' }}>
          {/* Search */}
          <div
            style={{ maxWidth: '300px', width: '100%' }}
            className="d-flex align-items-center bg-white rounded px-2"
          >
            <Icon iconName="Search" style={{ fontSize: 16, marginRight: 8 }} />
            <input
              type="text"
              placeholder="Search..."
              className="form-control border-0"
              style={{ boxShadow: 'none' }}
            />
          </div>

          {/* Waffle */}
          <button
            className="btn btn-sm bg-primary text-white rounded-circle d-flex justify-content-center align-items-center"
            style={{ width: 32, height: 32 }}
            title="Modules"
            onClick={handleModulesClick}
          >
            <Icon iconName="Waffle" style={{ fontSize: 14 }} />
          </button>

          {/* Icon Buttons */}
          <div className="d-flex align-items-center" style={{ gap: '6px' }}>
            {[
              { icon: 'ReportLibraryMirrored', title: 'Support' },
              { icon: 'Ringer', title: "What's New" },
              { icon: 'DoubleBookmark', title: 'Bookmark' },
              { icon: 'Headset', title: 'Live Calls' },
              { icon: 'QuickNote', title: 'Sticky Notes' },
              { icon: 'Video', title: 'Google Meet' },
            ].map((btn, i) => (
              <button
                key={i}
                className="btn btn-sm bg-primary text-white rounded-circle d-flex justify-content-center align-items-center"
                style={{ width: 32, height: 32 }}
                title={btn.title}
              >
                <Icon iconName={btn.icon} style={{ fontSize: 14 }} />
              </button>
            ))}
          </div>

          {/* Avatar Dropdown */}
          <div
            className="position-relative"
            style={{ marginLeft: 8, cursor: 'pointer' }}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            title="Open Profile Menu"
            ref={avatarRef}
          >
            <div
              className="rounded-circle text-white d-flex justify-content-center align-items-center"
              style={{
                backgroundColor: '#321353',
                width: '36px',
                height: '36px',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              {initials}
            </div>
            <span
              className="position-absolute"
              style={{
                bottom: 0,
                right: 0,
                width: '10px',
                height: '10px',
                backgroundColor: '#28a745',
                borderRadius: '50%',
                border: '2px solid white',
              }}
            />
          </div>

          {/* Profile Callout */}
          {isProfileOpen && (
            <Callout
              target={avatarRef}
              onDismiss={() => setIsProfileOpen(false)}
              directionalHint={DirectionalHint.bottomRightEdge}
              setInitialFocus
            >
              <Stack tokens={{ childrenGap: 12 }} styles={{ root: { padding: 16, width: 240 } }}>
                <Persona
                  text={`${firstName} ${lastName}`}
                  secondaryText={role} // ✅ Role shown dynamically
                  size={PersonaSize.size48}
                  presence={PersonaPresence.online}
                  initialsColor={PersonaInitialsColor.purple}
                  styles={{
                    primaryText: { textTransform: 'capitalize' },
                  }}
                />

                {/* Inline Action Row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <div
                    onClick={() => {
                      setIsProfileOpen(false);
                      const isAdmin = window.location.pathname.includes('/admin');
                      navigate(isAdmin ? '/admin/settings/profile' : '/user/settings/profile');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon iconName="Permissions" />
                    <span style={{ fontSize: 14 }}>Profile</span>
                  </div>

                  <div
                    onClick={handleSignOut}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon iconName="SignOut" />
                    <span style={{ fontSize: 14 }}>Sign Out</span>
                  </div>
                </div>
              </Stack>
            </Callout>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
