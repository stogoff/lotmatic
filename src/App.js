import './App.css';
import React, { useEffect, useState } from 'react';

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const chainId = "0x4";
  const chainParams = require('./chainParams.json');

  async function checkConnection(){
    console.log("checking connection...");
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        if (ethereum.isMetaMask){
          // https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider
          console.log('We have the Metamask object');
          console.log("isConnected:",ethereum.isConnected());
          const currentChainId = await ethereum.request({ method: 'eth_chainId' });
          console.log(currentChainId);
          //handleChainChanged(chainId);
          if (currentChainId!==chainId) {
            try {
              console.log("Before switching:",currentChainId);
              await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainId }],
              });
              console.log("Chain was switched");
            } catch (switchError) {
              // This error code indicates that the chain has not been added to MetaMask.
              if (switchError.code === 4902) {
                try {
                  console.log("Trying to add network");
                  await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: chainParams[chainId],
                  });
                } catch (addError) {
                  console.log("Network add error");
                }
              }
              console.log("Network switch error");
            }
          }
          //ethereum.on('chainChanged', handleChainChanged);

          const accounts = await ethereum.request({ method: 'eth_accounts' });
          console.log(accounts);
          if (accounts.length !== 0) {
            const account = accounts[0];
            console.log('Found an authorized account:', account);
            setCurrentAccount(account);
          } else {
            console.log('No authorized account found');
          }
/////////////////
          let currentAccount = null;
          ethereum
            .request({ method: 'eth_accounts' })
            .then(handleAccountsChanged)
            .catch((err) => {
              // Some unexpected error.
              // For backwards compatibility reasons, if no accounts are available,
              // eth_accounts will return an empty array.
              console.error(err);
            });

          // Note that this event is emitted on page load.
          // If the array of accounts is non-empty, you're already
          // connected.
          ethereum.on('accountsChanged', handleAccountsChanged);

          // For now, 'eth_accounts' will continue to always return an array
          function handleAccountsChanged(accounts) {
            if (accounts.length === 0) {
              // MetaMask is locked or the user has not connected any accounts
              console.log('Please connect to MetaMask.');
            } else if (accounts[0] !== currentAccount) {
              currentAccount = accounts[0];
              // Do any other work!
            }
          }


////////////


        } else {
          console.log("We have another wallet.");
          return;
        }
        
      }

    } catch(ex) {
      console.log(ex);
    }
  }

  async function connectWallet(){
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  function handleChainChanged(chainId){
    console.log("chain was changed to ", chainId);
    window.location.reload();
  }
  return (
    <div className="App">
      <header className="App-header">
        
        <button id="connectButton" onClick={checkConnection}>
        checkConnection
        </button>
        <button id="connectButton" onClick={connectWallet}>
          Connect wallet
        </button>
      </header>
    </div>
  );
}

export default App;
