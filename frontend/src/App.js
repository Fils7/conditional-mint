import { useState } from 'react';
import logo from './logo.svg';
import { ethers } from 'ethers';

import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contractABI = require('./Conditional.json').abi;
  const contractPrice = ethers.parseEther("0.01");

  const items = [
    { name: 'Pluma', image: 'https://cdn2.thecatapi.com/images/MTY3ODIyMQ.jpg' },
    { name: 'Jack', image: 'https://placedog.net/200/200' },
    { name: 'Pixel', image: 'https://loremflickr.com/200/200/parrot' },
  ];

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (err) {
        alert('Connection to wallet was rejected.');
      }
    } else {
      alert('Wallet is not installed!');
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };
  const confirmPurchase = async () => {
    if (!account) {
      alert('Please connect your wallet first.');
      return;
    }
    if (!selectedItem) {
      alert('Please select an item.');
      return;
    }

    setLoading(true);
    setMessage('Initiating purchase...');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.purchase({ value: contractPrice });
      setMessage(`Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      setMessage(`Purchase confirmed! Transaction Hash: ${receipt.hash}`);
      console.log("Transaction Receipt:", receipt);

      closeModal();

    } catch (err) {
      console.error("Purchase failed:", err);
      setMessage(`Purchase failed: ${err.message || err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Conditional Mint Demo</h1>
        {account ? (
          <>
            <p>Connected: {account}</p>
            <button onClick={openModal}>Buy Item</button>
          </>
        ) : (
          <button onClick={connectWallet} disabled={loading}>Connect Wallet</button>
        )}
      </header>
      {loading && <p>{message}</p>}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320 }}>
            <h2>Select an Item</h2>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              {items.map((item, idx) => (
                <div
                  key={item.name}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    border: selectedItem?.name === item.name ? '2px solid #007bff' : '1px solid #ccc',
                    borderRadius: 8,
                    padding: 8,
                    cursor: 'pointer',
                    textAlign: 'center',
                    background: selectedItem?.name === item.name ? '#e6f0ff' : '#fafafa'
                  }}
                >
                  <img src={item.image} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ marginTop: 8 }}>{item.name}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={closeModal} disabled={loading}>Cancel</button>
            <button onClick={confirmPurchase} disabled={!selectedItem || loading}>Confirm Purchase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
