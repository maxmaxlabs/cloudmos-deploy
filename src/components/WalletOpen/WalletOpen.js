import { useState } from "react";
import { TextField, Container, Button, CircularProgress, makeStyles, Paper } from "@material-ui/core";
import { openWallet } from "../../shared/utils/walletUtils";
import { useCertificate } from "../../context/CertificateProvider";
import { useWallet } from "../../context/WalletProvider";
import { useSnackbar } from "notistack";
import { useGA4React } from "ga-4-react";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    // backgroundColor: "#f5f5f5",
    padding: "4rem 0",

    "& .MuiTextField-root": {
      marginBottom: "20px"
    },
    "& .MuiButton-root": {
      marginLeft: "5px",
      marginRight: "5px"
    }
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  }
}));

export function WalletOpen() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const classes = useStyles();
  const { setSelectedWallet } = useWallet();
  const { loadLocalCert } = useCertificate();
  const { enqueueSnackbar } = useSnackbar();
  const ga4React = useGA4React();

  async function onOpenClick(ev) {
    ev.preventDefault();
    setIsLoading(true);

    try {
      const wallet = await openWallet(password);
      const address = (await wallet.getAccounts())[0].address;
      loadLocalCert(address, password);

      setSelectedWallet(wallet);

      ga4React.event("open wallet");
    } catch (err) {
      if (err.message === "ciphertext cannot be decrypted using that key") {
        enqueueSnackbar("Invalid password", { variant: "error" });
      } else {
        console.error(err);
        enqueueSnackbar("Error while decrypting wallet", { variant: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={classes.root}>
      <Container maxWidth="sm" pt={2}>
        <Paper className={classes.paper} elevation={5}>
          <h1>Open your wallet</h1>
          <br />
          <form noValidate autoComplete={"false"} onSubmit={onOpenClick}>
            <TextField
              label="Enter your password"
              fullWidth
              rows={4}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              type="password"
              variant="outlined"
              autoFocus
            />

            {isLoading && <CircularProgress />}
            {/* <Button variant="contained" color="default" onClick={onCancelClick}>Cancel</Button> */}
            {!isLoading && (
              <Button type="submit" variant="contained" color="primary">
                Open
              </Button>
            )}
          </form>
        </Paper>
      </Container>
    </div>
  );
}
