import { useState } from 'react';
import { Navbar, Button } from 'react-bootstrap';
import { ethers } from 'ethers';
import logo from '../logo.png';

const Navigation = ({ account }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectHandler = async () => {
    try {
      setIsConnecting(true);
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Function to truncate address for display
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Navbar className='my-3 d-flex justify-content-between'>
      <div className="d-flex align-items-center">
        <img
          alt="logo"
          src={logo}
          width="40"
          height="40"
          className="d-inline-block align-top mx-3"
        />
        <Navbar.Brand href="#">URDEX Faucet</Navbar.Brand>
      </div>
      
      <Button
        onClick={connectHandler}
        disabled={isConnecting}
        variant={account ? "outline-success" : "primary"}
      >
        {isConnecting ? 'Connecting...' : 
         account ? truncateAddress(account) : 'Connect Wallet'}
      </Button>
    </Navbar>
  );
}

export default Navigation;
