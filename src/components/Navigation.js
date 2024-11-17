import { useState } from 'react';
import { Navbar, Button, Dropdown } from 'react-bootstrap';
import { ethers } from 'ethers';
import logo from '../logo.png';

const Navigation = ({ account, onDisconnect }) => {
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
          width="100"
          height="100"
          className="d-inline-block align-top mx-3"
        />
        <Navbar.Brand href="#">URDEX Faucet</Navbar.Brand>
      </div>
      
      {!account ? (
        <Button
          onClick={connectHandler}
          disabled={isConnecting}
          variant="primary"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      ) : (
        <Dropdown>
          <Dropdown.Toggle variant="outline-success" id="dropdown-basic">
            {truncateAddress(account)}
          </Dropdown.Toggle>

          <Dropdown.Menu align="end">
            <Dropdown.Item 
              href={`https://sepolia.etherscan.io/address/${account}`} 
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Etherscan
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item 
              onClick={onDisconnect} 
              className="text-danger"
            >
              Disconnect
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </Navbar>
  );
};

export default Navigation;