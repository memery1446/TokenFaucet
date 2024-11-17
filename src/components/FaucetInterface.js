import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';

const FaucetInterface = ({ account, faucetContract, tk1Contract, tk2Contract }) => {
  const [tk1Balance, setTk1Balance] = useState('0');
  const [tk2Balance, setTk2Balance] = useState('0');
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Format time remaining into hours, minutes, seconds
  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return 'Ready!';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  useEffect(() => {
    const updateBalances = async () => {
      if (tk1Contract && tk2Contract && account) {
        try {
          const bal1 = await tk1Contract.balanceOf(account);
          const bal2 = await tk2Contract.balanceOf(account);
          setTk1Balance(ethers.utils.formatUnits(bal1, 18));
          setTk2Balance(ethers.utils.formatUnits(bal2, 18));
        } catch (err) {
          console.error('Error fetching balances:', err);
        }
      }
    };

    const updateCooldown = async () => {
      if (faucetContract && account) {
        try {
          const timeLeft = await faucetContract.getTimeUntilNextRequest(account);
          setCooldownTime(timeLeft.toNumber());
        } catch (err) {
          console.error('Error fetching cooldown:', err);
        }
      }
    };

    // Initial updates
    updateBalances();
    updateCooldown();
    
    // Set up interval for cooldown timer
    const interval = setInterval(updateCooldown, 1000);
    
    // Clean up interval
    return () => clearInterval(interval);
  }, [account, tk1Contract, tk2Contract, faucetContract]);

  const handleRequest = async () => {
    try {
      setIsRequesting(true);
      setError('');
      setSuccess('');
      
      // Request tokens from faucet
      const tx = await faucetContract.requestTokens();
      await tx.wait();
      
      // Update balances after successful request
      const bal1 = await tk1Contract.balanceOf(account);
      const bal2 = await tk2Contract.balanceOf(account);
      setTk1Balance(ethers.utils.formatUnits(bal1, 18));
      setTk2Balance(ethers.utils.formatUnits(bal2, 18));
      
      setSuccess('Tokens successfully claimed! Check your wallet.');
    } catch (err) {
      setError(err.message || 'Failed to request tokens');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Container className="mt-4">
      <Card className="shadow">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Token Faucet</h4>
          <small>Get TK1 and TK2 tokens for testing the DEX Aggregator</small>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <Card className="text-center h-100">
                <Card.Body>
                  <Card.Title>TK1 Balance</Card.Title>
                  <h3>{tk1Balance}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="text-center h-100">
                <Card.Body>
                  <Card.Title>TK2 Balance</Card.Title>
                  <h3>{tk2Balance}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="text-center mb-4">
            <p className="text-muted">
              <i className="bi bi-clock"></i> Time until next request: {formatTimeRemaining(cooldownTime)}
            </p>
          </div>

          <Button 
            variant="primary"
            className="w-100 mb-3"
            onClick={handleRequest}
            disabled={isRequesting || cooldownTime > 0}
          >
            {isRequesting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Requesting...
              </>
            ) : (
              'Request Tokens'
            )}
          </Button>

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mt-3">
              {success}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FaucetInterface;
