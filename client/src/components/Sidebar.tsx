import { useState, useEffect } from 'react';
import {
  NavigationRegular,
  MailRegular,
  CalendarLtrRegular,
  TaskListLtrRegular,
  DocumentRegular,
  PeopleRegular,
  GridRegular,
} from '@fluentui/react-icons';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [basePath, setBasePath] = useState('/user');

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role === 'Admin') {
        setBasePath('/admin');
      }
    }
  }, []);

  const menuItems = [
    { icon: <GridRegular fontSize={20} />, label: 'Dashboard', to: `${basePath}/dashboard` },
    { icon: <PeopleRegular fontSize={20} />, label: 'Client', to: `${basePath}/clients` },
    { icon: <MailRegular fontSize={20} />, label: 'Email', to: `${basePath}/email` },
    { icon: <CalendarLtrRegular fontSize={20} />, label: 'Calendar', to: `${basePath}/calendar` },
    { icon: <TaskListLtrRegular fontSize={20} />, label: 'Tasks', to: `${basePath}/tasks` },
    { icon: <DocumentRegular fontSize={20} />, label: 'Documents', to: `${basePath}/documents` },
    //{ icon: <PeopleRegular fontSize={20} />, label: 'Contacts', to: `${basePath}/contacts` },
  ];

  return (
    <div
      className="d-flex flex-column bg-white border-end"
      style={{
        width: collapsed ? '70px' : '220px',
        height: '100vh',
        transition: 'width 0.3s ease-in-out',
        position: 'relative',
      }}
    >
      {/* Toggle Button */}
      <div style={{ padding: '12px' }}>
        <button
          className="btn btn-sm btn-light border-0"
          onClick={() => setCollapsed(!collapsed)}
          style={{ backgroundColor: 'transparent', boxShadow: 'none', padding: 0, margin: 0 }}
        >
          <NavigationRegular fontSize={24} />
        </button>
      </div>

      {/* Sidebar Items */}
      <ul className="list-group list-group-flush">
        {menuItems.map((item) => (
          <Link to={item.to} key={item.label} className="text-decoration-none text-dark">
            <li
              className={`list-group-item border-0 d-flex align-items-center ${
                location.pathname === item.to ? 'bg-light fw-bold' : ''
              }`}
            >
              {item.icon}
              {!collapsed && <span className="ms-3">{item.label}</span>}
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
