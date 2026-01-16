// Footer.tsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-white p-1">
      <div className="text-center">
        <p>&copy; {new Date().getFullYear()} VSAV MANAGEMENTS. All Rights Reserved.</p>
        <br />
        Developed and Maintained by Abhinav Jha
      </div>
    </footer>
  );
};

export default Footer;