import "./App.css";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import LoadingIndicator from "./Components/LoadingIndicator";
import { CONTRACT_ADDRESS, CHAIN_ID } from "./constants";
import CloseIcon from "@mui/icons-material/Close";
import MaterialUISwitch from "./MUISwitch";

import {
  AppBar,
  FormGroup,
  FormControlLabel,
  Box,
  Toolbar,
  IconButton,
  Button,
  FormControl,
  OutlinedInput,
  InputAdornment,
  FormHelperText,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Snackbar,
  Paper,
  Link,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

function App() {
  const [dark, setDark] = useState(false);
  const [provider, setProvider] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lotteryContract, setLotteryContract] = useState(null);
  const [explorer, setExplorer] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(null);
  const [tick, setTick] = useState(0);

  const [lotParams, setLotParams] = useState({
    lotteryState: null,
    manager: null,
    numPlayers: null,
    poolSize: null,
    recentWinner: null,
    minUsd: null,
    minMatic: null,
  });

  const mode = dark ? "dark" : "light";
  const myTheme = createTheme({
    //spacing: 8,
    palette: {
      mode: mode,
    },
  });

  function handleChangeTheme() {
    setDark(!dark);
  }
  async function showMessage(msg) {
    setMessage(msg);
    setSnackbarOpen(true);
  }

  function isManager() {
    if (!lotParams.manager) return false;
    if (!currentAccount) return false;

    if (currentAccount.toUpperCase() === lotParams.manager.toUpperCase())
      return true;
    else return false;
  }

  function closeSnackbar(event, reason) {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
    //alert(document.body.clientHeight);
    //alert(document.body.clientWidth);
  }

  async function enter(event) {
    event.preventDefault();
    setIsLoading(true);

    showMessage("Waiting on transaction success...");
    try {
      const txn = await lotteryContract.enter({
        from: currentAccount,
        value: ethers.utils.parseEther(amount.toString()),
      });
      await txn.wait();
      setTick(Date.now());

      showMessage("You have been entered!");
    } catch (ex) {
      console.log(ex);
      try {
        showMessage(ex.data.message);
      } catch (e) {
        try {
          showMessage(ex.message);
        } catch (ee) {
          console.log("cannot resolve error message ");
        }
      }
    }
    setIsLoading(false);
  }

  async function start() {
    setIsLoading(true);
    showMessage("Waiting on transaction success...");
    try {
      const txn = await lotteryContract.startLottery({
        from: currentAccount,
      });
      await txn.wait();
      setTick(Date.now());

      showMessage("Lottery has been started!");
    } catch (ex) {
      console.log(ex);
      try {
        showMessage(ex.data.message);
      } catch (e) {
        try {
          showMessage(ex.message);
        } catch (ee) {
          console.log("cannot resolve error message ");
        }
      }
    }
    setIsLoading(false);
  }

  async function stop() {
    setIsLoading(true);
    showMessage("Waiting on transaction success...");
    try {
      const txn = await lotteryContract.endLottery({
        from: currentAccount,
      });
      await txn.wait();
      setTick(Date.now());

      showMessage("Lottery has been stopped!");
    } catch (ex) {
      console.log(ex);
      try {
        showMessage(ex.data.message);
      } catch (e) {
        try {
          showMessage(ex.message);
        } catch (ee) {
          console.log("cannot resolve error message ");
        }
      }
    }
    setIsLoading(false);
  }

  async function connectWallet() {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      const currentChainId = await ethereum.request({
        method: "eth_chainId",
      });
      if (currentChainId !== CHAIN_ID) {
        alert("approve Metamask to switch network!");
        setCurrentAccount(null);
        return;
      }

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log("Connected", accounts[0], currentChainId);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  function renderContent() {
    function amountChange(event) {
      event.preventDefault();
      setAmount(event.target.value);
    }

    if (isLoading) {
      return <LoadingIndicator />;
    }
    if (!currentAccount) {
      return (
        <Box m="auto" sx={{ maxWidth: "sm" }}>
          <Card elevation={12}>
            <CardMedia component="img" image="polygon-matic.gif"></CardMedia>
            <CardContent>
              <Typography variant="h6">
                Our lottery uses Polygon Blockhain and MATIC token
              </Typography>

              <Button onClick={connectWallet} variant="contained">
                Connect Wallet To Get Started
              </Button>
            </CardContent>
          </Card>
        </Box>
      );
    } else {
      isManager();
      return (
        <div>
          <Grid container spacing={2} columns={20}>
            <Grid item xs={1} />
            <Grid item xs={18}>
              <Card elevation={12}>
                <CardContent>
                  <Typography variant="subtitle2">Contract address:</Typography>
                  <Typography variant="caption">
                    <Link target="_blank" href={explorer + CONTRACT_ADDRESS}>
                      {CONTRACT_ADDRESS}
                    </Link>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={1} />
            <Grid item xs={6}>
              <Card elevation={12}>
                <Grid
                  container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  style={{ minHeight: "16vh" }}
                >
                  <Grid item>
                    <Typography variant="subtitle2">Lottery:</Typography>
                    {lotParams.lotteryState === "CALCULATING WINNER" && (
                      <Typography variant="caption" color="orange">
                        {lotParams.lotteryState}{" "}
                      </Typography>
                    )}

                    {lotParams.lotteryState === "OPEN" && (
                      <Typography variant="h6" color="green">
                        {lotParams.lotteryState}{" "}
                      </Typography>
                    )}
                    {lotParams.lotteryState === "CLOSED" && (
                      <Typography variant="h6" color="red">
                        {lotParams.lotteryState}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card elevation={12}>
                <Grid
                  container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  style={{ minHeight: "16vh" }}
                >
                  <Grid item>
                    <Typography variant="subtitle2">Pool: </Typography>
                    <Typography variant="h6">
                      {lotParams.poolSize}
                      <Typography variant="caption"> MATIC</Typography>
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card elevation={12}>
                <Grid
                  container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  style={{ minHeight: "16vh" }}
                >
                  <Grid item>
                    <Typography variant="subtitle2">Players:</Typography>
                    <Typography variant="h6">{lotParams.numPlayers}</Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={1} />
            {lotParams.lotteryState === "CLOSED" && (
              <>
                <Grid item xs={1} />
                <Grid item xs={18}>
                  <Card elevation={12}>
                    <CardContent>
                      <Typography variant="subtitle2">
                        Recent winner is:
                      </Typography>
                      <Typography variant="caption">
                        <Link
                          target="_blank"
                          href={
                            explorer + lotParams.recentWinner + "#internaltx"
                          }
                        >
                          {lotParams.recentWinner}
                        </Link>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={1} />
              </>
            )}
            {lotParams.lotteryState === "OPEN" && (
              <>
                <Grid item xs={1} md={4} />
                <Grid item xs={18} md={12}>
                  <Card elevation={12}>
                    <CardContent>
                      <form onSubmit={enter}>
                        <h4>Want to try your luck?</h4>

                        <FormControl size="small">
                          <OutlinedInput
                            name="amount"
                            size="small"
                            value={amount}
                            onChange={amountChange}
                            endAdornment={
                              <InputAdornment position="end">
                                MATIC
                              </InputAdornment>
                            }
                          />
                          <FormHelperText>
                            Amount to enter (min {lotParams.minMatic} MATIC = ~
                            {lotParams.minUsd} USD)
                          </FormHelperText>

                          <Button type="submit" variant="contained">
                            Enter
                          </Button>
                        </FormControl>
                      </form>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={1} md={4} />
              </>
            )}

            {isManager() && (
              <>
                <Grid item xs={4} />
                <Grid item xs={12}>
                  <Box>
                    {lotParams.lotteryState === "CLOSED" && (
                      <Button
                        color="success"
                        variant="contained"
                        onClick={start}
                      >
                        Start
                      </Button>
                    )}
                    {lotParams.lotteryState === "OPEN" && (
                      <Button color="error" variant="contained" onClick={stop}>
                        Stop
                      </Button>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={4} />
              </>
            )}

            <Grid item xs={20}>
              <Box
                sx={{
                  height: 100,
                }}
              />
            </Grid>
          </Grid>
        </div>
      );
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }
  });

  useEffect(() => {
    // checkWalletConnection is here
    async function checkWalletConnection() {
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
      const chainParams = require("./chainParams.json");

      try {
        const { ethereum } = window;
        if (!ethereum) {
          alert("Get MetaMask!");
          setIsLoading(false);
          return -2; // don't have a wallet
        } else {
          if (ethereum.isMetaMask) {
            console.log("We have the Metamask object");
            const currentChainId = await ethereum.request({
              method: "eth_chainId",
            });
            console.log("chain:", currentChainId);
            if (currentChainId !== CHAIN_ID) {
              try {
                console.log("Before switching:", currentChainId);
                await ethereum.request({
                  method: "wallet_switchEthereumChain",
                  params: [{ chainId: CHAIN_ID }],
                });
                console.log("Chain was switched");
              } catch (switchError) {
                console.log("switch error #", switchError.code);
                // This error code indicates that the chain has not been added to MetaMask.

                //switchError.code === 4902
                try {
                  console.log("Trying to add network");
                  await ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: chainParams[CHAIN_ID],
                  });
                } catch (addError) {
                  console.log("Network add error");
                }

                setIsLoading(false);
                return -3; // switching chain error
              }
            } else {
              console.log(
                process.env.REACT_APP_NAME,
                process.env.REACT_APP_VERSION
              );
            }
            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length !== 0) {
              const account = accounts[0];
              console.log("Found an authorized account:", account);
              setCurrentAccount(account);
              setExplorer(
                chainParams[CHAIN_ID][0]["blockExplorerUrls"] + "/address/"
              );
              setIsLoading(false);
              return 1;
            } else {
              console.log("No authorized account found");
              setIsLoading(false);
              return 0;
            }
          } else {
            console.log("We have another wallet. Get Metamask");
            setIsLoading(false);
            return -1; // have another wallet
          }
        }
      } catch (ex) {
        console.log(ex);
        setIsLoading(false);
        return -5; // general error
      }
    }
    checkWalletConnection();
  }, []);

  useEffect(() => {
    // get currentAccount is here
    /*
     * The function we will call that interacts with out smart contract
     */
    const abi = require("./abi.json");
    async function getContract() {
      console.log("Checking for contract ");

      const prov = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(prov);
      const signer = prov.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      setLotteryContract(contract);
      setTick(Date.now());
    }

    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      getContract();
    }
  }, [currentAccount]);

  useEffect(() => {
    // fetchContractData
    async function fetchContractData() {
      const contract = lotteryContract;
      let s = await contract.lotteryState();
      switch (s) {
        case 0:
          s = "OPEN";
          break;
        case 1:
          s = "CLOSED";
          break;
        case 2:
          s = "CALCULATING WINNER";
          break;
        default:
          console.log("Sorry, " + s + " is undef");
      }
      let m = await contract.owner();
      var p;
      try {
        p = await contract.getPlayers();
        console.log("players:", p.length);
      } catch (ex) {
        p = [];
      }
      var pool = await provider.getBalance(CONTRACT_ADDRESS);
      var winner = await contract.recentWinner();
      var attousd = await contract.attousdEntryFee();
      var fee = await contract.getEntranceFee();

      setLotParams({
        lotteryState: s,
        manager: m,
        numPlayers: p.length,
        poolSize: pool / 1000000000000000000,
        recentWinner: winner,
        minUsd: attousd / 1000000000000000000,
        minMatic: (Number(fee / 1000000000000000000) + 0.00001).toFixed(5),
      });
      // ...lotParams,
    }

    if (lotteryContract) fetchContractData();
  }, [tick]);

  return (
    // Wrapping code in ThemeProvider
    <ThemeProvider theme={myTheme}>
      <Paper sx={{ textAlign: "center", height: "100vh" }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <FormGroup>
              <FormControlLabel
                control={<MaterialUISwitch sx={{ m: 1 }} />}
                label=""
                checked={dark}
                onChange={handleChangeTheme}
              />
            </FormGroup>
            <Typography variant="h6" color="inherit" component="div">
              LotMatic v.{process.env.REACT_APP_VERSION}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box m="auto" sx={{ maxWidth: "md" }}>
          <div className="header-container">
            <Typography variant="caption" gutterBottom component="div">
              This decentralized lottery app gets random numbers from the&nbsp;
              <Link target="_blank" href="https://chain.link/">
                Chainlink Oracle
              </Link>
              . You can check results on the Polygon blockchain. The contract
              collects a fixed 3% fee.
            </Typography>
            {/* This is where our button and image code used to be!
             *	Remember we moved it into the render method.
             */}
            {renderContent()}
          </div>
          <div className="footer-container">
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={1000}
              message={message}
              sx={{ bottom: { xs: 90, sm: 0 } }}
              action={
                <React.Fragment>
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    sx={{ p: 0.5 }}
                    onClick={closeSnackbar}
                  >
                    <CloseIcon />
                  </IconButton>
                </React.Fragment>
              }
            />
          </div>
        </Box>
      </Paper>
    </ThemeProvider>
  );
}

export default App;
