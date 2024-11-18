import React from 'react';
import { Alert } from 'react-bootstrap';

export default function Instructions({ isOwner, tokenAddresses }) {
  if (isOwner) {
    return null;
  }

  return (
    <Alert variant="warning" className="mt-3">
      <Alert.Heading>Important Instructions</Alert.Heading>
      <p>
        Please import these token addresses into your MetaMask and clear your activity tab data:
      </p>
      <ul>
        {tokenAddresses.map((address, index) => (
          <li key={index}>{address}</li>
        ))}
      </ul>
      <hr />
      <p className="mb-0">
        After importing the tokens, or if you encounter errors, make sure to clear your MetaMask activity tab data to ensure smooth interactions with the faucet.
      </p>
      <p className="mb-0">
       <p></p>
        For support, paste this url in another browser: 
        <p></p>
        https://support.metamask.io/managing-my-tokens/custom-tokens/how-to-display-tokens-in-metamask/
      </p>
    </Alert>
  );
}

