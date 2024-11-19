import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';

const NetworkChecker = ({ web3 }) => {
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  useEffect(() => {
    const checkNetwork = async () => {
      if (!web3) return;
      
      try {
        const chainId = await web3.eth.getChainId();
        setIsCorrectNetwork(chainId === 11155111); // Sepolia chainId
      } catch (error) {
        console.error('Error checking network:', error);
        setIsCorrectNetwork(false);
      }
    };

    checkNetwork();
    
    // Set up network change listener
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        checkNetwork();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      }
    };
  }, [web3]);

  if (!isCorrectNetwork) {
    return (
      <Alert variant="warning" className="mt-3">
        Please switch to the Sepolia network to use this faucet.
        <button 
          className="btn btn-link p-0 ms-2"
          onClick={async () => {
            if (!window.ethereum) return;
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
              });
            } catch (error) {
              console.error('Error switching network:', error);
            }
          }}
        >
          Switch Network
        </button>
      </Alert>
    );
  }

  return null;
};

export default NetworkChecker;

