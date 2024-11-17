import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers';

// Components
import Navigation from './Navigation';
import Loading from './Loading';
import FaucetInterface from './FaucetInterface';

// ABIs
import FAUCET_ABI from '../abis/SimpleFaucet.json';
import TOKEN_ABI from '../abis/Token.json';

// Config
import config from '../config.json';

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [faucetContract, setFaucetContract] = useState(null);
  const [tk1Contract, setTk1Contract] = useState(null);
  const [tk2Contract, setTk2Contract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBlockchainData = async () => {
    try {
      // Initiate provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Fetch accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);

      // Fetch account balance
      let balance = await provider.getBalance(account);
      balance = ethers.utils.formatUnits(balance, 18);
      setBalance(balance);

      // Load contracts
      const faucet = new ethers.Contract(config.FAUCET_ADDRESS, FAUCET_ABI, signer);
      const tk1 = new ethers.Contract(config.TK1_ADDRESS, TOKEN_ABI, signer);
      const tk2 = new ethers.Contract(config.TK2_ADDRESS, TOKEN_ABI, signer);

      setFaucetContract(faucet);
      setTk1Contract(tk1);
      setTk2Contract(tk2);

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    // Clear all contract states
    setFaucetContract(null);
    setTk1Contract(null);
    setTk2Contract(null);
    
    // Clear account and balance
    setAccount(null);
    setBalance(0);
    
    // Clear from localStorage if you're storing any connection data
    localStorage.removeItem('walletConnected');
  };

  useEffect(() => {
    if (window.ethereum) {
      // Handle account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(ethers.utils.getAddress(accounts[0]));
          loadBlockchainData();
        } else {
          setAccount(null);
          setBalance(0);
        }
      });

      // Handle chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      // Initial load
      loadBlockchainData();
    }

    return () => {
      // Cleanup listeners when component unmounts
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  return (
    <Container>
      <Navigation 
        account={account}
        onDisconnect={handleDisconnect}
      />

      {!account ? (
        <div className="text-center my-5">
          <h2>Welcome to URDEX Faucet</h2>
          <p>Please connect your wallet to continue</p>
        </div>
      ) : isLoading ? (
        <Loading />
      ) : (
        <FaucetInterface 
          account={account}
          faucetContract={faucetContract}
          tk1Contract={tk1Contract}
          tk2Contract={tk2Contract}
        />
      )}
    </Container>
  );
}

export default App;