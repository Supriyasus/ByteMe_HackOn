import React from 'react';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const isAdminRoute = pathname === "/admin-board";
  const isHomeRoute = pathname === "/";

  return (
    <nav style={styles.navbar}>
      <div style={styles.logoSection}>
        <img src="/favicon-32x32.png" alt="Amazon Logo" style={styles.logoImg} />
        <span style={styles.logoText}>
          amazon{isAdminRoute ? ' | Admin Trust & Safety Dashboard' : ''}
        </span>
      </div>

      {/* Show nothing else on homepage */}
      {!isHomeRoute && !isAdminRoute && (
        <>
          <div style={styles.navLinks}>
            <a href="/seller" style={styles.link}>Dashboard</a>
            <a href="/add-product" style={styles.link}>Add Product</a>
          </div>

          <div style={styles.profile}>
            <span style={styles.greeting}>Hello, Seller</span>
            <button
              style={styles.logoutBtn}
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#232f3e',
    color: '#fff',
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: '20px'
  },
  logoImg: {
    width: '24px',
    height: '24px',
    marginRight: '8px'
  },
  logoText: {
    color: '#fff',
    textDecoration: 'none'
  },
  navLinks: {
    display: 'flex',
    gap: '20px'
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px'
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  greeting: {
    fontSize: '14px'
  },
  logoutBtn: {
    backgroundColor: '#febd69',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default Navbar;
