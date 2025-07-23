import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import { Outlet } from 'react-router-dom';
import { Stack } from '@fluentui/react';

const ClientLayout = () => {
  return (
    <Stack horizontal styles={{ root: { height: '100vh', width: '100vw', overflow: 'hidden' } }}>
      {/* Sidebar (fixed) */}
      <Sidebar />

      {/* Main layout */}
      <Stack grow verticalFill styles={{ root: { overflow: 'hidden' } }}>
        {/* Fixed top bar */}
        <Navbar />
        <Breadcrumbs />

        {/* Scrollable content only here */}
        <Stack
          grow
          styles={{
            root: {
              overflowY: 'auto',
              height: '100%',
              padding: 0,
              backgroundColor: '#f5f6fa',
            },
          }}
        >
          <Outlet />
        </Stack>
      </Stack>
    </Stack>

  );
};

export default ClientLayout;