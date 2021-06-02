import { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import { Button, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { openWallet } from "./walletHelper";
import { useCertificate } from './CertificateProvider/CertificateProviderContext';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: "20px",

    '& .MuiTextField-root': {
      marginBottom: "20px"
    },
    '& .MuiButton-root': {
      marginLeft: "5px",
      marginRight: "5px"
    }
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  }
}));

export default function WalletOpen(props) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const classes = useStyles();
  const { loadLocalCert } = useCertificate();

  async function onOpenClick(ev) {
    ev.preventDefault();
    setIsLoading(true);

    try {
      const wallet = await openWallet(password);
      const address = (await wallet.getAccounts())[0].address;
      loadLocalCert(address, password);

      props.onWalletOpen(wallet);
    } catch (err) {
      console.error(err);
      //enqueueSnackbar(err, { variant: "error" });
      //debugger;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={classes.root}>
      <Container maxWidth="sm" pt={2}>
        <Paper className={classes.paper}>
          <h1>Opening your wallet</h1>
          <br />
          <form noValidate autoComplete={"false"} onSubmit={onOpenClick}>

            <TextField
              label="Enter your password"
              fullWidth
              rows={4}
              value={password}
              onChange={ev => setPassword(ev.target.value)}
              type="password"
              variant="outlined"
              autoFocus
            />

            {isLoading && <CircularProgress />}
            {/* <Button variant="contained" color="default" onClick={onCancelClick}>Cancel</Button> */}
            {!isLoading && <Button type="submit" variant="contained" color="primary">Open</Button>}
          </form>
        </Paper>
      </Container>
    </div>
  );
}