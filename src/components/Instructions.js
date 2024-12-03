import React from 'react';
import { Alert } from 'react-bootstrap';

export default function Instructions({ isOwner, tokenAddresses }) {
  if (isOwner) {
    return null;
  }

  return (
    <Alert variant="warning" className="mt-3">
      <Alert.Heading>To use the URDEX Faucet:</Alert.Heading>
      <p>
        1. Link your Metamask to the Sepolia Network. 
      </p>
      <p>
        2. Import the TK1 and TK2 addresses into your Metamask wallet:
      </p>      
      <ul>
        {tokenAddresses.map((address, index) => (
          <li key={index}>{address}</li>
        ))}
      </ul>
      <p>
        3. Clear your Metamask activity tab data. 
      </p>
      <p>
        Note: Each address may request both tokens one time. Owner can renew eligibility. 
      </p>      
      <hr />
      <p className="mb-0">
        ERRORS? Clear your MetaMask activity tab data.
      </p>
            <p className="mb-0">
        QUESTIONS? Email: markemerydev@gmail.com
      </p>
    </Alert>
  );
}

