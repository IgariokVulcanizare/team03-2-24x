import React from 'react';

const Navbar = () => {
  const navItemStyle = {
    listStyle: 'none',
    display: 'inline-block',
    margin: '0 20px',
    fontSize: '22px',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: '#FFD700',
    transition: 'color 0.3s, transform 0.3s',
  };

  const navItemHoverStyle = {
    color: '#FFD700',
    transform: 'scale(1.1)',
  };

  const handleMouseEnter = (e) => {
    Object.assign(e.target.style, navItemHoverStyle);
  };

  const handleMouseLeave = (e) => {
    Object.assign(e.target.style, navItemStyle);
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
      <div>
        <img src="Renovo(1).png" alt="Logo" style={{ height: '50px', cursor: 'pointer' }} />
      </div>
      <ul style={{ display: 'flex', padding: '0', margin: '0' }}>
        {['Gifts', 'Kids', 'Routes', 'Tired'].map((category, index) => (
          <li key={index} style={navItemStyle}>
            <a
              href={`#${category}`}
              style={navItemStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {category}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;