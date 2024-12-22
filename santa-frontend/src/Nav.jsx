import React from 'react';

const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <a href="/" style={styles.logoLink}>MyPlatform</a>
      </div>
      <ul style={styles.navList}>
        <li style={styles.navItem}><a href="#about" style={styles.navLink}>About</a></li>
        <li style={styles.navItem}><a href="#features" style={styles.navLink}>Features</a></li>
        <li style={styles.navItem}><a href="#pricing" style={styles.navLink}>Pricing</a></li>
        <li style={styles.navItem}><a href="#contact" style={styles.navLink}>Contact</a></li>
      </ul>
      <div style={styles.authButtons}>
        <button style={styles.loginButton} onClick={() => alert('Login Clicked')}>Login</button>
        <button style={styles.signupButton} onClick={() => alert('Sign Up Clicked')}>Sign Up</button>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 50px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  logoLink: {
    textDecoration: 'none',
    color: '#007BFF',
  },
  navList: {
    display: 'flex',
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    gap: '20px',
  },
  navItem: {},
  navLink: {
    textDecoration: 'none',
    color: '#333',
    fontSize: '1rem',
    transition: 'color 0.3s',
  },
  navLinkHover: {
    color: '#007BFF',
  },
  authButtons: {
    display: 'flex',
    gap: '15px',
  },
  loginButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    color: '#007BFF',
    backgroundColor: '#fff',
    border: '2px solid #007BFF',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  signupButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    color: '#fff',
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default Navbar;
