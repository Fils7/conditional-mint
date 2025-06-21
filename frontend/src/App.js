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
  const [toast, setToast] = useState({ show: false, text: '', type: 'info' });

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contractABI = require('./Conditional.json').abi;
  const contractPrice = ethers.parseEther("0.01");

  const items = [
    { name: 'Pluma', image: 'ipfs://bafkreideqxawk2zhhqyxmvqynnouk23hnb27bsn2xvdyotnz5z5bwysl54' },
    { name: 'Jack', image: 'ipfs://bafkreidevenvb6zdljcnnsgpdpg6himlfkygp2im4mpe5zds3zkujkevbi' },
    { name: 'Pixel', image: 'ipfs://bafkreiag27hd437dyd43fzhofhhbkogye3ftilogj57jxokvm55zdmvlyy' },
  ];

  const showToast = (text, type = 'info') => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: '', type: 'info' }), 3500);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        showToast('Wallet connected!', 'success');
      } catch (err) {
        showToast('Connection to wallet was rejected.', 'error');
      }
    } else {
      showToast('Wallet is not installed!', 'error');
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };
  const confirmPurchase = async () => {
    if (!account) {
      showToast('Please connect your wallet first.', 'error');
      return;
    }
    if (!selectedItem) {
      showToast('Please select an item.', 'error');
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
      showToast('Transaction sent! Waiting for confirmation...', 'info');

      await fetch('http://localhost:3001/purchase-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: tx.hash,
          name: selectedItem.name,
          image: selectedItem.image
        })
      });

      const receipt = await tx.wait();
      setMessage(`Purchase confirmed! Transaction Hash: ${receipt.hash}`);
      showToast('Purchase confirmed! NFT will be minted if approved.', 'success');
      closeModal();

    } catch (err) {
      console.error("Purchase failed:", err);
      setMessage(`Purchase failed: ${err.message || err.toString()}`);
      showToast(`Purchase failed: ${err.message || err.toString()}`, 'error');
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
            <button onClick={openModal} disabled={loading}>Buy Item</button>
          </>
        ) : (
          <button onClick={connectWallet} disabled={loading}>Connect Wallet</button>
        )}
      </header>
      {loading && <p style={{ color: '#007bff', fontWeight: 'bold' }}>{message}</p>}
      {toast.show && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          background: toast.type === 'error' ? '#ffdddd' : toast.type === 'success' ? '#d4edda' : '#e6f0ff',
          color: toast.type === 'error' ? '#a94442' : toast.type === 'success' ? '#155724' : '#004085',
          border: '1px solid #ccc', borderRadius: 8, padding: '12px 24px', minWidth: 200,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>{toast.text}</div>
      )}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', textAlign: 'center' }}>
            {loading ? (
              <div>
                <h2 style={{ marginBottom: '16px' }}>Processing Transaction</h2>
                <div className="spinner"></div>
                <p style={{ color: '#555', wordBreak: 'break-all', padding: '0 20px' }}>{message}</p>
              </div>
            ) : (
              <>
                <h2 style={{ marginBottom: 24 }}>Select an Item</h2>
                <div style={{ display: 'flex', gap: 20, marginBottom: 24, justifyContent: 'center' }}>
                  {items.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => setSelectedItem(item)}
                      style={{
                        border: selectedItem?.name === item.name ? '2px solid #007bff' : '1px solid #ccc',
                        borderRadius: 10,
                        padding: 10,
                        cursor: 'pointer',
                        background: selectedItem?.name === item.name ? '#e6f0ff' : '#fafafa',
                        minWidth: 100
                      }}
                    >
                      <img src={item.image.startsWith('ipfs://') ? item.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/') : item.image} alt={item.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                      <div style={{ marginTop: 8, fontWeight: 'bold' }}>{item.name}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button onClick={closeModal} style={{ padding: '8px 16px', borderRadius: 6 }}>Cancel</button>
                  <button onClick={confirmPurchase} disabled={!selectedItem} style={{ padding: '8px 16px', borderRadius: 6, background: '#007bff', color: '#fff', border: 'none' }}>Confirm Purchase</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
