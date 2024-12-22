import React from 'react';
import logo from './images/Renovo(1).png'; // Import the logo image

const Navbar = () => {
  const navBarStyle = {
    position: 'fixed', // Makes the navbar stick to the top
    top: '0',
    left: '0',
    width: '100%',
    zIndex: '1000', // Ensures it stays above other content
    background: '#FFDB89',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Adds a subtle shadow for better visibility
    // padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  };

  const navItemStyle = {
    listStyle: 'none',
    display: 'inline-block',
    margin: '0 15px',
    fontSize: '30px',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: '#6f0e0e',
    transition: 'color 0.3s, transform 0.3s',
  };

  return (
    <nav style={navBarStyle}>
      {/* Logo */}
      <div>
        <img src="./images/Renovo(1).png" alt="Logo" style={{ height: '50px', cursor: 'pointer' }} />
      </div>

      {/* Navigation Links */}
      <ul style={{ display: 'flex', padding: '0', margin: '0' }}>
        {['Gifts', 'Kids', 'Routes', 'Tired'].map((category, index) => (
          <li key={index} style={navItemStyle}>
            <a href={`#${category}`} style={navItemStyle}>
              {category}
            </a>
          </li>
        ))}
      </ul>


    </nav>
  );
};

export default Navbar;