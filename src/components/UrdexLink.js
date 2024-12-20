import React from 'react';
import { Button } from 'react-bootstrap';

const UrdexLink = () => {
  return (
    <a 
      href="https://dex-aggregator-theta.vercel.app/swap"  // Added /swap to the URL
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none' }}
    >
      <Button 
        variant="primary" 
        size="lg"
        className="fw-bold"
        style={{
          backgroundColor: '#00796b',
          borderColor: '#004d40',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        Swap on URDEX
      </Button>
    </a>
  );
};

export default UrdexLink;