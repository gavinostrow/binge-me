import React from 'react';

// Import fonts
import '../styles/fonts.css';

// Metadata
export const metadata = {
  title: 'Binge Me',
  description: 'Your ultimate binge-watching guide',
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;