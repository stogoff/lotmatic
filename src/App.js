import './App.css';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import LoadingIndicator from './Components/LoadingIndicator';
import { CONTRACT_ADDRESS, CHAIN_ID } from './constants';
import { Button, TextField, FormControl, OutlinedInput, InputAdornment, FormHelperText } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import SmallComponent from "./Components/SmallComponent";
import Switch from "@material-ui/core/Switch";

import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ShareIcon from "@material-ui/icons/Share";
import Grid from "@material-ui/core/Grid";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Paper    from "@material-ui/core/Paper";

function App() {
  const [provider, setProvider] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lotteryContract, setLotteryContract] = useState(null);
  const [explorer, setExplorer] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState(null);
  const [tick, setTick] = useState(0);
  const [lotParams, setLotParams] =  useState({
                                        lotteryState: null,
                                        manager: null, 
                                        numPlayers: null,
                                        poolSize: null,
                                        recentWinner: null,
                                        minUsd: null,
                                        minMatic: null,
                                    });
  const [toggleDark, settoggleDark] = useState(false);
  const myTheme=createMuiTheme({
      // Theme settings
      palette:{
        type: toggleDark ? 'dark' : 'light',
      }
  });

  const handleModeChange = () => {
    settoggleDark(!toggleDark);
  };

  const useStyles = makeStyles((theme) => ({
  
    // Styling material components
    root: {
      width: "100%",
      height: "100vh",
      backgroundColor: theme.palette.background.default,
      [theme.breakpoints.down("xs")]: {
        paddingTop: theme.spacing(2),
      },
    },
    media: {
      height: 56,
      paddingTop: "56.25%", // 16:9
    },
    avatar: {
      backgroundColor: red[500],
    },
  }));

  const classes = useStyles();

  
  async function showMessage(msg) {
    setMessage(msg);
  };

  

  async function enter(event){
    event.preventDefault();
    setIsLoading(true);
    
    showMessage("Waiting on transaction success...") ;
    try {
      const txn = await lotteryContract.enter({
        from: currentAccount,
        value: ethers.utils.parseEther(amount.toString()),
      });
      await txn.wait();
      setTick(Date.now() );
      
      
      showMessage("You have been entered!");
    }
    catch  (ex) {
      console.log(ex)
      showMessage("");
    }
    setIsLoading(false);
    
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
  }


  function renderContent() {

    function amountChange(event) {
      setAmount(event.target.value);
    }
    if (isLoading){
      return <LoadingIndicator />
    }
    if (!currentAccount) {
      //className="cta-button connect-wallet-button"
      return (
        <div className="connect-wallet-container">
          <p>img</p>
          <Button
            color="primary"
            variant="contained"
            onClick={connectWallet}
          >
            Connect Wallet To Get Started
          </Button>
        </div>
      );
    } else {
      let buffer = []
      buffer.push(
        <div >
          <div className="wrapper">
            <div className="box1">
              <p className="sub-text">  
              Contract address is: 
              <b>
                <a className=" text-blue-300 hover:text-blue-500" target="_blank" rel="noreferrer" href={explorer}>
                  {CONTRACT_ADDRESS}
                </a>
              </b>
              </p>
              </div>
            <div className="box2">
              <p className="sub-text">
                Lottery is {lotParams.lotteryState}
              </p>
            </div>
            <div className="box3">
              <p className="sub-text">
                Lottery pool:  {lotParams.poolSize} MATIC
              </p>
            </div>
            <div className="box4">
              <p className="sub-text">
                Players:  {lotParams.numPlayers}
              </p>
            </div>
            <div className="box5">
              <p className="sub-text">
                Minimal fee is:<br/>  
                {lotParams.minMatic} MATIC<br/>
                (~{lotParams.minUsd} USD)
              </p>
            </div>
          </div>   
          
          {lotParams.lotteryState==="CLOSED" &&
            <p className="sub-text">  Recent winner is: {lotParams.recentWinner}</p>
          }
          

        </div>
      );
      if (lotParams.lotteryState==="OPEN"){
        buffer.push(
          <form onSubmit={enter}>
            <h4>Want to try your luck?</h4>
                      <div>
                        <FormControl size="small">
                        <OutlinedInput
                            size="small"
                            value={amount}
                            onChange={amountChange} 
                            endAdornment={<InputAdornment position="end">MATIC</InputAdornment>}
                            
                          />
                          <FormHelperText>Amount to enter</FormHelperText>
                        
                        <Button
                          type="submit"
                          color="primary"
                          variant="contained"
                        >
                          Enter
                        </Button>
                        </FormControl>
                      </div>
          </form>
        );
        
      }
      return (
        <div className="container">
            {buffer}
        </div>
      );
    }
  }

  useEffect(() => {
    async function checkWalletConnection(){
      /*
        returns:
        1: connected to wallet and have an account
        0: not connected, but ready to connect
        -1: have another wallet
        -2: don't have any wallet
        -3: switching chain error
        -4: adding chain error
        -5: general error
      */
      const chainParams = require('./chainParams.json');
      console.log("checking connection...");
      try {
        const { ethereum } = window;
        if (!ethereum) {
          console.log('Make sure you have MetaMask!');
          setIsLoading(false);
          return -2; // don't have a wallet
        } else {
          if (ethereum.isMetaMask){
            console.log('We have the Metamask object');
            const currentChainId = await ethereum.request({ method: 'eth_chainId' });
            console.log("chain:",currentChainId);
            if (currentChainId!==CHAIN_ID) {
              try {
                console.log("Before switching:",currentChainId);
                await ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: CHAIN_ID }],
                });
                console.log("Chain was switched");
              } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                  try {
                    console.log("Trying to add network");
                    await ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: chainParams[CHAIN_ID],
                    });
                  } catch (addError) {
                    console.log("Network add error");
  
                  }
                }
                console.log("Network switch error");
                setIsLoading(false);
                return -3; // switching chain error
              }
            } else {
              console.log("chain is OK");
            }
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            console.log(accounts);
            if (accounts.length !== 0) {
              const account = accounts[0];
              console.log('Found an authorized account:', account);
              setCurrentAccount(account);
              setExplorer(chainParams[CHAIN_ID][0]["blockExplorerUrls"] + "/address/" + CONTRACT_ADDRESS);
              setIsLoading(false);
              return 1;
            } else {
              console.log('No authorized account found');
              setIsLoading(false);
              return 0;
            }
          } else {
            console.log("We have another wallet.");
            setIsLoading(false);
            return -1; // have another wallet
          }
        }
      } catch(ex) {
        console.log(ex);
        setIsLoading(false);
        return -5; // general error
      }
    }
    checkWalletConnection();
  }, []);

  useEffect(() => {
    /*
    * The function we will call that interacts with out smart contract
    */
    const abi = require('./abi.json');
    async function getContract() {
      console.log('Checking for contract ');

      const prov = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(prov)
      const signer = prov.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi,
        signer
      );
      setLotteryContract(contract);
      setTick(Date.now());
      
      
    };

    /*
    * We only want to run this, if we have a connected wallet
    */
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      getContract();
    }
  }, [currentAccount]);

  useEffect(() => {
    async function fetchContractData() {
      const contract = lotteryContract;
      let s = await contract.lotteryState();
      switch (s) {
        case 0:
          s="OPEN";
          break;
        case 1:
          s="CLOSED";
          break;
        case 2:
          s="CALCULATING WINNER";
          break;
        default:
          console.log("Sorry, " + s + " is undef");
      }
      let m  =  await contract.owner();
      var p;
      try {
        p = await contract.getPlayers();
        console.log("players:",p.length);
      } catch(ex) {
        p = [];
      }
      var pool = await provider.getBalance(CONTRACT_ADDRESS);
      var winner = await contract.recentWinner();
      var attousd = await contract.attousdEntryFee();
      var fee = await contract.getEntranceFee();
      
      setLotParams({
        lotteryState: s,
        manager:m,
        numPlayers:p.length,
        poolSize: pool/1000000000000000000,
        recentWinner: winner,
        minUsd: attousd/1000000000000000000,
        minMatic: (Number(fee/1000000000000000000)+0.00001).toFixed(5),
      })
      // ...lotParams,
    }
    
    if (lotteryContract)  fetchContractData();    
  }, [tick]);

  return (
    // Wrapping code in ThemeProvider
    <ThemeProvider theme={myTheme}>
      <Paper >
    
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text mt-4 text-yellow-300 ">LotMatic</p>
          
          <p className="sub-text">sub</p>
          {/* This is where our button and image code used to be!
           *	Remember we moved it into the render method.
           */}
          {renderContent()}
        </div>
        <div className="footer-container">
          <h4 className="mt-4 text-yellow-300">{message}</h4>
        </div>
        <Switch
            checked={toggleDark}
            onChange={handleModeChange}
            name="toggleDark"
            color="default"
          />
      </div>
    </div>
    
    </Paper>
    </ThemeProvider>
  );
}

export default App;
