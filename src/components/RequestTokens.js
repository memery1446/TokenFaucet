import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Button } from 'react-bootstrap';

const faucetABI = [
  {
    "inputs": [{"name": "isTK1", "type": "bool"}],
    "name": "requestTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "address"}],
    "name": "hasReceivedTK1",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "address"}],
    "name": "hasReceivedTK2",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function RequestTokens({ setStatus }) {
  const [processing, setProcessing] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [faucetContract, setFaucetContract] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          setUserAddress(accounts[0]);

          const response = await fetch('/deployedAddresses.json');
          const addresses = await response.json();
          const faucet = new web3Instance.eth.Contract(faucetABI, addresses.FAUCET_ADDRESS);
          setFaucetContract(faucet);
        } catch (error) {
          console.error('Error initializing Web3', error);
          setStatus('❌ Error: Unable to connect to the network. Please check your MetaMask connection.');
        }
      } else {
        setStatus('❌ Error: Please install MetaMask to use this application.');
      }
    };
    initWeb3();
  }, [setStatus]);

  const checkEligibility = async (isTK1) => {
    if (!faucetContract || !userAddress) return false;
    try {
      const hasReceived = await faucetContract.methods[isTK1 ? 'hasReceivedTK1' : 'hasReceivedTK2'](userAddress).call();
      return !hasReceived;
    } catch (error) {
      console.error('Error checking eligibility:', error);
      return false;
    }
  };

  const requestTokens = async (isTK1) => {
    if (processing || !web3 || !faucetContract) return;
    setProcessing(true);
    
    try {
      const isEligible = await checkEligibility(isTK1);
      if (!isEligible) {
        setStatus(`❌ Error: You have already received ${isTK1 ? 'TK1' : 'TK2'} tokens.`);
        setProcessing(false);
        return;
      }

      setStatus('Requesting tokens...');

      // Estimate gas
      const gasEstimate = await faucetContract.methods.requestTokens(isTK1).estimateGas({ from: userAddress });

      // Send transaction with estimated gas
      await faucetContract.methods.requestTokens(isTK1).send({
        from: userAddress,
        gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer to gas estimate
      });

      setStatus(`✅ ${isTK1 ? 'TK1' : 'TK2'} tokens sent! Check your wallet.`);
    } catch (error) {
      console.error('Error:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="d-grid gap-3" style={{ maxWidth: '200px', margin: '0 auto' }}>
      <Button 
        variant="primary"
        onClick={() => requestTokens(true)}
        disabled={processing || !web3}
      >
        {processing ? 'Processing...' : 'Get TK1'}
      </Button>
      
      <Button 
        variant="secondary"
        onClick={() => requestTokens(false)}
        disabled={processing || !web3}
      >
        {processing ? 'Processing...' : 'Get TK2'}
      </Button>
    </div>
  );
}