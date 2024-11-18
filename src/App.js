import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Container, Alert, Navbar, Nav, Card, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import DepositTokens from './components/DepositTokens';
import Whitelist from './components/Whitelist';
import RequestTokens from './components/RequestTokens';
import WithdrawTokens from './components/WithdrawTokens';

function App() {
  const [status, setStatus] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwner = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          const accounts = await web3.eth.getAccounts();
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

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand href="#home">Token Faucet</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              {isOwner && <Nav.Link href="#admin">Admin</Nav.Link>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-5">
        <h1 className="text-center mb-5">Token Faucet</h1>
        
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
                <RequestTokens setStatus={setStatus} />
              </Card.Body>
            </Card>
          </Col>

          {isOwner && (
            <>
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <Card.Title>Deposit Tokens</Card.Title>
                    <DepositTokens />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <Card.Title>Withdraw Tokens</Card.Title>
                    <WithdrawTokens />
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12}>
                <Card className="shadow-sm">
                  <Card.Body>
                    <Card.Title>Manage Whitelist</Card.Title>
                    <Whitelist />
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