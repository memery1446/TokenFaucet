import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Button, Form, Alert } from 'react-bootstrap';

const faucetABI = [
  {
    "inputs": [{"name": "user", "type": "address"}, {"name": "isTK1", "type": "bool"}],
    "name": "removeFromWhitelist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function Whitelist() {
  const [address, setAddress] = useState('');
  const [isTK1, setIsTK1] = useState(true);
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwner = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          const accounts = await web3.eth.getAccounts();
          const response = await fetch('/deployedAddresses.json');
          const addresses = await response.json();
          const faucet = new web3.eth.Contract(faucetABI, addresses.FAUCET_ADDRESS);
          const owner = await faucet.methods.owner().call();
          setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
        } catch (error) {
          console.error('Error checking owner:', error);
        }
      }
    };
    checkOwner();
  }, []);

  const removeFromWhitelist = async (e) => {
    e.preventDefault();
    if (processing) return;
    setProcessing(true);

    try {
      setStatus('Connecting...');
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(window.ethereum);

      // Load contract addresses
      const response = await fetch('/deployedAddresses.json');
      const addresses = await response.json();

      // Get user address
      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];

      setStatus('Removing from whitelist...');
      const faucet = new web3.eth.Contract(faucetABI, addresses.FAUCET_ADDRESS);

      // Remove from whitelist
      const gasEstimate = await faucet.methods.removeFromWhitelist(address, isTK1).estimateGas({ from: userAddress });
      await faucet.methods.removeFromWhitelist(address, isTK1).send({ 
        from: userAddress,
        gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer to gas estimate
      });

      setStatus(`✅ Address removed from ${isTK1 ? 'TK1' : 'TK2'} whitelist successfully!`);
      setAddress('');

    } catch (error) {
      console.error('Error:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOwner) {
    return <Alert variant="warning">Only the contract owner can access this functionality.</Alert>;
  }

  return (
    <div className="mt-5">
      <h2>Remove Address from Whitelist</h2>
      <Form onSubmit={removeFromWhitelist}>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Enter Ethereum address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            aria-label="Ethereum address to remove from whitelist"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Remove from TK1 whitelist (unchecked for TK2)"
            checked={isTK1}
            onChange={(e) => setIsTK1(e.target.checked)}
            aria-label="Toggle between TK1 and TK2 whitelist"
          />
        </Form.Group>
        <Button variant="danger" type="submit" disabled={processing}>
          {processing ? 'Processing...' : 'Remove from Whitelist'}
        </Button>
      </Form>
      {status && (
        <Alert
          variant={status.includes('✅') ? 'success' : 'danger'}
          className="mt-3"
          dismissible
          onClose={() => setStatus('')}
        >
          {status}
        </Alert>
      )}
    </div>
  );
}