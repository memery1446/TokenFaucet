import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Button, Form, Alert } from 'react-bootstrap';

const erc20ABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  }
];

const faucetABI = [
  {
    "inputs": [{ "name": "isTK1", "type": "bool" }, { "name": "amount", "type": "uint256" }],
    "name": "depositTokens",
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

export default function DepositTokens() {
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

  const depositTokens = async (e) => {
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

      setStatus('Preparing deposit...');
      const faucet = new web3.eth.Contract(faucetABI, addresses.FAUCET_ADDRESS);
      const tokenAddress = isTK1 ? addresses.TK1_ADDRESS : addresses.TK2_ADDRESS;
      const token = new web3.eth.Contract(erc20ABI, tokenAddress);

      // Check if the user is the contract owner
      const owner = await faucet.methods.owner().call();
      if (userAddress.toLowerCase() !== owner.toLowerCase()) {
        throw new Error("Only the contract owner can deposit tokens");
      }

      const amountInWei = web3.utils.toWei(amount, 'ether');

      // Approve the faucet to spend tokens
      setStatus('Approving token spend...');
      const approveGasEstimate = await token.methods.approve(addresses.FAUCET_ADDRESS, amountInWei).estimateGas({ from: userAddress });
      await token.methods.approve(addresses.FAUCET_ADDRESS, amountInWei).send({ 
        from: userAddress,
        gas: Math.floor(approveGasEstimate * 1.2) // Add 20% buffer to gas estimate
      });

      // Deposit tokens
      setStatus('Depositing tokens...');
      const depositGasEstimate = await faucet.methods.depositTokens(isTK1, amountInWei).estimateGas({ from: userAddress });
      await faucet.methods.depositTokens(isTK1, amountInWei).send({ 
        from: userAddress,
        gas: Math.floor(depositGasEstimate * 1.2) // Add 20% buffer to gas estimate
      });

      setStatus(`✅ Tokens deposited successfully!`);
      setAmount('');

    } catch (error) {
      console.error('Error:', error);
      let errorMessage = error.message;
      if (error.code === -32603) {
        errorMessage = "Transaction failed. Please check your balance and try again.";
      }
      setStatus(`❌ Error: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOwner) {
    return null; // Don't render anything if the user is not the owner
  }

  return (
    <div className="mt-5">
      <h2>Deposit Tokens</h2>
      <Form onSubmit={depositTokens}>
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
            label="Deposit TK1 (unchecked for TK2)"
            checked={isTK1}
            onChange={(e) => setIsTK1(e.target.checked)}
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={processing}>
          {processing ? 'Processing...' : 'Deposit'}
        </Button>
      </Form>
      {status && (
        <Alert
          variant={status.includes('✅') ? 'success' : 'info'}
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