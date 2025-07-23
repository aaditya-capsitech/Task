import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column">
        <Navbar />
        <div className="p-3" style={{ overflowY: 'auto', flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
