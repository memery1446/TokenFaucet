import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Button, Form, Alert } from 'react-bootstrap';

const faucetABI = [
  {
    "inputs": [{ "name": "isTK1", "type": "bool" }, { "name": "amount", "type": "uint256" }],
    "name": "withdrawTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function WithdrawTokens() {
  const [amount, setAmount] = useState('');
  const [isTK1, setIsTK1] = useState(true);
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwner = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
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

  const withdrawTokens = async (e) => {
    e.preventDefault();
    if (processing) return;
    setProcessing(true);

    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];

      const response = await fetch('/deployedAddresses.json');
      const addresses = await response.json();
      const faucet = new web3.eth.Contract(faucetABI, addresses.FAUCET_ADDRESS);

      setStatus('Withdrawing tokens...');
      const amountInWei = web3.utils.toWei(amount, 'ether');
      const withdrawGasEstimate = await faucet.methods.withdrawTokens(isTK1, amountInWei).estimateGas({ from: userAddress });
      
      await faucet.methods.withdrawTokens(isTK1, amountInWei).send({ 
        from: userAddress,
        gas: Math.floor(withdrawGasEstimate * 1.2) // Add 20% buffer to gas estimate
      });

      setStatus(`✅ Tokens withdrawn successfully!`);
      setAmount('');
    } catch (error) {
      console.error('Error:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOwner) {
    return null; // Don't render anything if the user is not the owner
  }

  return (
    <div className="mt-5">
      <h2>Withdraw Tokens (Owner Only)</h2>
      <Form onSubmit={withdrawTokens}>
        <Form.Group className="mb-3">
          <Form.Control
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Withdraw TK1 (unchecked for TK2)"
            checked={isTK1}
            onChange={(e) => setIsTK1(e.target.checked)}
          />
        </Form.Group>
        <Button variant="warning" type="submit" disabled={processing}>
          {processing ? 'Processing...' : 'Withdraw'}
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

