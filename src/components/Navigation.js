import { useState } from 'react';
import { Navbar, Button, Dropdown, Nav, Container } from 'react-bootstrap';
import logo from '../logo.png';

const Navigation = ({ account, onDisconnect, onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectHandler = async () => {
    try {
      setIsConnecting(true);
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        await onConnect();
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
    <Navbar className='my-3'>
     <Container fluid className="px-3">
      <div className="d-flex align-items-center">
        <img
          alt="logo"
          src={logo}
          width="80"
          height="80"
          className="d-none d-sm-inline-block align-top mx-3"
        />
        <Navbar.Brand href="#">URDEX Faucet</Navbar.Brand>
      </div>

     <Nav className="mx-auto">
        <Button 
          href="#dex-aggregator" 
          variant="outline-primary"
          className="px-4 py-2"
        >
          Go to Dex Aggregator
        </Button>
      </Nav>
      <div className="ms-auto pe-3">
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
      </div>
     </Container>
    </Navbar>
  );
};

export default Navigation;