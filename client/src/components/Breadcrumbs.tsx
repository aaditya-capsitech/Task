import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '@fluentui/react/lib/Breadcrumb';
import type { IBreadcrumbItem } from '@fluentui/react/lib/Breadcrumb';
import axios from 'axios';

const Breadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [lastName, setLastName] = useState<string | null>(null);

  const segments = location.pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  useEffect(() => {
    if (lastSegment.length === 24) {
      const isContact = location.pathname.includes('/contact/');
      const endpoint = isContact ? 'contacts' : 'businessdata';

      axios.get(`/api/${endpoint}/${lastSegment}`).then((res) => {
        if (isContact && res.data?.name) {
          setLastName(res.data.name);
        } else if (!isContact && res.data?.businessName) {
          setLastName(res.data.businessName);
        }
      });
    }
  }, [location.pathname, lastSegment]);

  const breadcrumbItems: IBreadcrumbItem[] = [
    {
      text: 'Home',
      key: 'home',
      href: '/client/dashboard',
    },
  ];

  if (segments.includes('clients')) {
    breadcrumbItems.push({
      text: 'Clients',
      key: 'clients',
      href: '/user/clients',
    });
  }

  if (segments.includes('contact')) {
    const id = segments[segments.length - 1];
    breadcrumbItems.push({
      text: 'Contact',
      key: 'contact',
      href: `/user/contact/${id}`,
    });
  }
  // Add last name (businessName or contact name)
  if (lastSegment.length === 24 && lastName) {
    breadcrumbItems.push({
      text: lastName,
      key: lastName,
      isCurrentItem: true,
    });
  }

  return (
    <div style={{ padding: '0px 16px', fontSize: '13px', background: '#fff' }}>
      <Breadcrumb
        items={breadcrumbItems}
        maxDisplayedItems={4}
        overflowAriaLabel="More links"
      />
    </div>
  );
};

export default Breadcrumbs;
