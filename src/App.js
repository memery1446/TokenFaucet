import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { Container, Alert, Navbar, Nav, Card, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import DepositTokens from './components/DepositTokens';
import Whitelist from './components/Whitelist';
import RequestTokens from './components/RequestTokens';
import WithdrawTokens from './components/WithdrawTokens';
import WalletConnection from './components/WalletConnection';
import Instructions from './components/Instructions';

function App() {
  const [status, setStatus] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const tokenAddresses = ['0x5FbDB2315678afecb367f032d93F642f64180aa3', '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'];

  const checkOwner = useCallback(async (web3Instance, address) => {
    try {
      const response = await fetch('/deployedAddresses.json');
      const addresses = await response.json();
      const faucetABI = [
        {
          "inputs": [],
          "name": "owner",
          "outputs": [{"name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      const faucet = new web3Instance.eth.Contract(faucetABI, addresses.FAUCET_ADDRESS);
      const owner = await faucet.methods.owner().call();
      setIsOwner(address.toLowerCase() === owner.toLowerCase());
    } catch (error) {
      console.error('Error checking owner:', error);
    }
  }, []);

  const handleConnect = useCallback((web3Instance, address) => {
    setWeb3(web3Instance);
    setUserAddress(address);
    checkOwner(web3Instance, address);
  }, [checkOwner]);

  const handleDisconnect = useCallback(() => {
    setWeb3(null);
    setUserAddress('');
    setIsOwner(false);
  }, []);

  const setStatusWithTimeout = useCallback((message) => {
    setStatus(message);
    setTimeout(() => setStatus(''), 5000); // Clear status after 5 seconds
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand href="#home">Token Faucet</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              {isOwner && <Nav.Link href="#admin">Admin</Nav.Link>}
            </Nav>
            <WalletConnection onConnect={handleConnect} onDisconnect={handleDisconnect} />
          </Navbar.Collapse>

        </Container>
      </Navbar>

      <Container className="py-5">
        <h1 className="text-center mb-5">URDEX Token Faucet</h1>
        
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

        <Row className="g-4">
          <Col xs={12}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Request Tokens</Card.Title>
                <RequestTokens setStatus={setStatusWithTimeout} web3={web3} userAddress={userAddress} />
              </Card.Body>
            </Card>
            <p></p>
            <Card className="shadow-sm">
             <Instructions isOwner={isOwner} tokenAddresses={tokenAddresses} />
            </Card>
          </Col>

          {isOwner && (
            <>
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <Card.Title>Deposit Tokens</Card.Title>
                    <DepositTokens setStatus={setStatusWithTimeout} web3={web3} userAddress={userAddress} />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <Card.Title>Withdraw Tokens</Card.Title>
                    <WithdrawTokens setStatus={setStatusWithTimeout} web3={web3} userAddress={userAddress} />
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12}>
                <Card className="shadow-sm">
                  <Card.Body>
                    <Card.Title>Manage Whitelist</Card.Title>
                    <Whitelist setStatus={setStatusWithTimeout} web3={web3} userAddress={userAddress} />
                  </Card.Body>
                </Card>
              </Col>
            </>
          )}
        </Row>

        <div className="mt-4 text-center">
          <small className="text-muted">
            Make sure you're connected to Hardhat Network (Chain ID: 31337)
          </small>
        </div>
      </Container>

      <footer className="mt-auto py-3 bg-light">
        <Container>
          <p className="text-center text-muted mb-0">© 2023 Token Faucet. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}

export default App;