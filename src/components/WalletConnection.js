import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Button } from 'react-bootstrap';

const WalletConnection = ({ onConnect, onDisconnect }) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          setConnected(true);
          setAddress(accounts[0]);
          onConnect(web3, accounts[0]);
        }
      }
    };
    checkConnection();
  }, [onConnect]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        setConnected(true);
        setAddress(accounts[0]);
        onConnect(web3, accounts[0]);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setAddress('');
    onDisconnect();
  };

  return (
    <div className="d-flex align-items-center">
      {connected ? (
        <>
          <span className="me-2">Connected: {`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
          <Button variant="outline-danger" size="sm" onClick={disconnectWallet}>Disconnect</Button>
        </>
      ) : (
        <Button variant="outline-primary" size="sm" onClick={connectWallet}>Connect Wallet</Button>
      )}
    </div>
  );
};

export default WalletConnection;
