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
  const [transactionResult, setTransactionResult] = useState(null);

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
    setTransactionResult(null);
  };

  const checkTransactionStatus = async (txHash) => {
    try {
      const response = await fetch(`http://localhost:3001/status/${txHash}`);
      if (response.ok) {
        const status = await response.json();
        console.log('Status check result:', status);
        return status;
      }
      console.log('Status check failed:', response.status);
      return null;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return null;
    }
  };

  const pollTransactionStatus = async (txHash) => {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const status = await checkTransactionStatus(txHash);
      
      if (status && status.status !== 'pending') {
        return status;
      }
      
      attempts++;
      console.log(`Polling attempt ${attempts}/${maxAttempts} - Status: ${status?.status || 'null'}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    }
    
    return { status: 'timeout', error: 'Transaction status check timed out' };
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
    setTransactionResult(null);

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
      setMessage(`Purchase confirmed! Checking approval status...`);
      showToast('Purchase confirmed! Checking approval status...', 'info');

      // Poll for the final result
      const result = await pollTransactionStatus(tx.hash);
      setTransactionResult(result);
      
      if (result.status === 'approved') {
        setMessage(`NFT Minted Successfully!`);
        showToast('NFT minted successfully!', 'success');
      } else if (result.status === 'rejected') {
        setMessage(`❌ Purchase Rejected - Refund Processed`);
        showToast('Purchase was rejected and refunded.', 'info');
      } else if (result.status === 'mint_failed') {
        setMessage(`⚠️ Mint Failed: ${result.error}`);
        showToast(`Mint failed: ${result.error}`, 'error');
      } else if (result.status === 'refund_failed') {
        setMessage(`⚠️ Refund Failed: ${result.error}`);
        showToast(`Refund failed: ${result.error}`, 'error');
      } else if (result.status === 'timeout') {
        setMessage(`⏰ Status check timed out. Please check manually.`);
        showToast('Status check timed out. Please check manually.', 'warning');
      } else {
        setMessage(`❓ Unknown status: ${result.status}`);
        showToast(`Unknown status: ${result.status}`, 'warning');
      }

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
          background: toast.type === 'error' ? '#ffdddd' : toast.type === 'success' ? '#d4edda' : toast.type === 'warning' ? '#fff3cd' : '#e6f0ff',
          color: toast.type === 'error' ? '#a94442' : toast.type === 'success' ? '#155724' : toast.type === 'warning' ? '#856404' : '#004085',
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
            ) : transactionResult ? (
              <div>
                <h2 style={{ marginBottom: '16px' }}>
                  {transactionResult.status === 'approved' ? '🎉 Success!' :
                   transactionResult.status === 'rejected' ? '❌ Rejected' : '⚠️ Issue'}
                </h2>
                <p style={{ marginBottom: '10px', fontWeight: 'bold', color: '#555' }}>{message}</p>
                {transactionResult.status === 'approved' && (
                  <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>
                    Your NFT has been minted and is now in your wallet!
                  </p>
                )}
                {transactionResult.status === 'rejected' && (
                  <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>
                    Your purchase was not approved. The funds have been refunded to your wallet.
                  </p>
                )}
                {transactionResult.error && (
                  <p style={{ fontSize: '12px', opacity: 0.7, marginBottom: '20px' }}>
                    Error: {transactionResult.error}
                  </p>
                )}
                <button onClick={closeModal} style={{ padding: '8px 16px', borderRadius: 6, background: '#007bff', color: '#fff', border: 'none' }}>
                  Close
                </button>
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