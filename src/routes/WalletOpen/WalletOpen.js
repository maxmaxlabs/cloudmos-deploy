import { useState } from "react";
import { Box, TextField, Container, Button, CircularProgress, makeStyles, Paper, Typography } from "@material-ui/core";
import { getCurrentWalletFromStorage, openWallet } from "../../shared/utils/walletUtils";
import { useCertificate } from "../../context/CertificateProvider";
import { useWallet } from "../../context/WalletProvider";
import { useSnackbar } from "notistack";
import { analytics } from "../../shared/utils/analyticsUtils";
import { DeleteWalletConfirm } from "../../shared/components/DeleteWalletConfirm";
import { UrlService } from "../../shared/utils/urlUtils";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
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
    color: theme.palette.text.secondary,
    textAlign: "center"
  },
  title: {
    fontSize: "2rem",
    marginBottom: ".5rem",
    fontWeight: "bold"
  },
  walletAddress: {
    display: "block",
    marginBottom: "1rem"
  }
}));

export function WalletOpen() {
  const [isShowingConfirmationModal, setIsShowingConfirmationModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const classes = useStyles();
  const { setSelectedWallet, deleteWallet } = useWallet();
  const { loadLocalCert } = useCertificate();
  const { enqueueSnackbar } = useSnackbar();
  const currentWallet = getCurrentWalletFromStorage();
  const history = useHistory();

  async function onOpenClick(ev) {
    ev.preventDefault();
    setIsLoading(true);

    try {
      const wallet = await openWallet(password);
      const address = (await wallet.getAccounts())[0].address;

      loadLocalCert(address, password);

      await analytics.event("deploy", "open wallet");

      setSelectedWallet(wallet);

      history.push(UrlService.dashboard());
    } catch (err) {
      if (err.message === "ciphertext cannot be decrypted using that key") {
        enqueueSnackbar("Invalid password", { variant: "error" });
      } else {
        console.error(err);
        enqueueSnackbar("Error while decrypting wallet", { variant: "error" });
      }
      setIsLoading(false);
    }
  }

  function handleCancel() {
    setIsShowingConfirmationModal(false);
  }

  function handleConfirmDelete(deleteCert, deleteDeployments) {
    deleteWallet(currentWallet?.address, deleteCert, deleteDeployments);
    setIsShowingConfirmationModal(false);

    history.replace(UrlService.walletImport());
  }

  return (
    <div className={classes.root}>
      <Container maxWidth="sm" pt={2}>
        <Paper className={classes.paper} elevation={5}>
          <Typography variant="h5" className={classes.title}>
            Open your wallet
          </Typography>

          <Typography variant="caption" className={classes.walletAddress}>
            {currentWallet?.address}
          </Typography>

          <form noValidate autoComplete={"false"} onSubmit={onOpenClick}>
            <TextField
              label="Enter your password"
              fullWidth
              disabled={isLoading}
              rows={4}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              type="password"
              variant="outlined"
              autoFocus
            />

            {isLoading && <CircularProgress />}

            {!isLoading && (
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button variant="outlined" color="secondary" onClick={() => setIsShowingConfirmationModal(true)}>
                  Delete wallet
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={!password}>
                  Open
                </Button>
              </Box>
            )}
          </form>
        </Paper>

        <DeleteWalletConfirm
          isOpen={isShowingConfirmationModal}
          address={currentWallet?.address}
          handleCancel={handleCancel}
          handleConfirmDelete={handleConfirmDelete}
        />
      </Container>
    </div>
  );
}
