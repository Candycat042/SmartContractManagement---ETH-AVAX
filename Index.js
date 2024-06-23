import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Paper,
  CssBaseline,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [showAccount, setShowAccount] = useState(false);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  useEffect(() => {
    getWallet();
  }, []);

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account.length > 0) {
      console.log("Account connected: ", account);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // Once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(balance.toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        let tx = await atm.deposit(1);
        await tx.wait();
        getBalance();
        toast.success("Deposit successful!");
      } catch (error) {
        toast.error("Deposit failed: " + error.message);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(1);
        await tx.wait();
        getBalance();
        toast.success("Withdrawal successful!");
      } catch (error) {
        toast.error("Withdrawal failed: " + error.message);
      }
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <Typography variant="body1">Please install MetaMask to use this ATM.</Typography>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <Button variant="contained" color="primary" onClick={connectAccount}>Connect MetaMask</Button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <Box>
        <Typography variant="h6">
          <strong>Account:</strong> {showAccount ? account : '************'}
          <Tooltip title={showAccount ? "Hide Account" : "Show Account"}>
            <IconButton onClick={() => setShowAccount(!showAccount)}>
              {showAccount ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Tooltip>
        </Typography>
        <Typography variant="h6"><strong>Balance:</strong> {balance} GO</Typography>
        <Button variant="contained" color="primary" onClick={deposit} sx={{ m: 1 }}>Deposit 1 GO</Button>
        <Button variant="contained" color="secondary" onClick={withdraw} sx={{ m: 1 }}>Withdraw 1 GO</Button>
      </Box>
    );
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ minHeight: '100vh', backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Metaverse ATM
          </Typography>
        </Toolbar>
      </AppBar>
      <Paper elevation={3} sx={{ p: 3, mt: 3, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
        {initUser()}
      </Paper>
      <ToastContainer />
    </Container>
  );
}
