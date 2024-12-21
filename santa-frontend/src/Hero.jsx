import React from "react";

function Hero() {
  return (
    <div style={styles.heroContainer}>
      <div style={styles.content}>
        <h1 style={styles.title}>Welcome everyone</h1>
        <p style={styles.description}>
         Learn how to deliver gifts with Santa
        </p>
        <button style={styles.button}>Let's Go</button>
      </div>
    </div>
  );
}

const styles = {
  heroContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    // backgroundColor: "#f4f4f4",
    backgroundImage: "url('./src/images/background.webp')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  content: {
    textAlign: "center",
    backgroundColor: "rgba(255, 193, 193, 0.8)",
    padding: "2rem",
    // borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "3rem",
    color: "#333",
    marginBottom: "1rem",
  },
  description: {
    fontSize: "1.2rem",
    color: "#555",
    marginBottom: "1.5rem",
  },
  button: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "0.8rem 1.5rem",
    fontSize: "1rem",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Hero;
