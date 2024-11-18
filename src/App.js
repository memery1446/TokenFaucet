import React, { useState } from 'react';
import Web3 from 'web3';
import { Container, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import DepositTokens from './components/DepositTokens';

function App() {
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);

  const requestTokens = async (isTK1) => {
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

      // Simple ABI for the faucet function
      const faucetABI = [{
        "inputs": [{"name": "isTK1", "type": "bool"}],
        "name": "requestTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }];

      setStatus('Requesting tokens...');
      const faucet = new web3.eth.Contract(faucetABI, addresses.FAUCET_ADDRESS);

      // Send transaction with explicit gas settings
      await faucet.methods.requestTokens(isTK1).send({
        from: userAddress,
        gas: 200000,
        gasPrice: web3.utils.toWei('1', 'gwei')
      });

      setStatus(`✅ Tokens sent! Check your wallet.`);
      
    } catch (error) {
      console.error('Error:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Container className="py-5 text-center">
      <h1>Token Faucet</h1>
      
      {status && (
        <Alert 
          variant={status.includes('✅') ? 'success' : 'info'} 
          className="my-4"
          dismissible
          onClose={() => setStatus('')}
        >
          {status}
        </Alert>
      )}

      <div className="d-grid gap-3" style={{ maxWidth: '200px', margin: '0 auto' }}>
        <Button 
          variant="primary"
          onClick={() => requestTokens(true)}
          disabled={processing}
        >
          {processing ? 'Processing...' : 'Get TK1'}
        </Button>
        
        <Button 
          variant="secondary"
          onClick={() => requestTokens(false)}
          disabled={processing}
        >
          {processing ? 'Processing...' : 'Get TK2'}
        </Button>
      </div>

      <div className="mt-4">
        <small className="text-muted">
          Make sure you're connected to Hardhat Network (Chain ID: 31337)
        </small>
      </div>

      <DepositTokens />
    </Container>
  );
}

export default App;