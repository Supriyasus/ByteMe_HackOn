import React from 'react';

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.logoSection}>
        <img src="/favicon-32x32.png" alt="Amazon Logo" style={styles.logoImg} />
        <span style={styles.logoText}>amazon</span>
      </div>

      <div style={styles.navLinks}>
        <a href="/" style={styles.link}>Home</a>
        <a href="/seller" style={styles.link}>Dashboard</a>
        <a href="/add-product" style={styles.link}>Add Product</a>
        <a href="/admin-dashboard" style={styles.link}>Admin</a>
      </div>

      <div style={styles.profile}>
        <span style={styles.greeting}>Hello, Seller</span>
        <button style={styles.logoutBtn} onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}>
          Logout
        </button>
      </div>
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
