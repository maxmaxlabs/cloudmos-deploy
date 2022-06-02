import { useEffect, useState } from "react";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { Box, TextField, Container, Button, CircularProgress, makeStyles, FormControl, Typography, Select, MenuItem } from "@material-ui/core";
import { getStorageWallets, updateStorageWallets, validateWallets, getSelectedStorageWallet } from "../../shared/utils/walletUtils";
import { useCertificate } from "../../context/CertificateProvider";
import { useWallet } from "../../context/WalletProvider";
import { useSnackbar } from "notistack";
import { analytics } from "../../shared/utils/analyticsUtils";
import { DeleteWalletConfirm } from "../../shared/components/DeleteWalletConfirm";
import { UrlService } from "../../shared/utils/urlUtils";
import { useHistory } from "react-router-dom";
import { Snackbar } from "../../shared/components/Snackbar";
import { TitleLogo } from "../../shared/components/TitleLogo";
import { Address } from "../../shared/components/Address";
import { useForm, Controller } from "react-hook-form";
import Alert from "@material-ui/lab/Alert";
import { Layout } from "../../shared/components/Layout";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: { padding: "5% 0" },
  container: {
    paddingTop: "2rem",
    display: "flex",
    flexDirection: "column"
  },
  walletAddress: {
    display: "block",
    marginBottom: "1rem"
  },
  formControl: {
    marginBottom: "1rem"
  },
  alertRoot: {
    border: "none",
    padding: 0
  },
  alertIcon: {
    "&&": {
      color: theme.palette.primary.main,
      alignItems: "center"
    }
  },
  alertMessage: {
    padding: 0
  }
}));

export function WalletOpen() {
  const [isShowingConfirmationModal, setIsShowingConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const classes = useStyles();
  const [selectedWalletAddress, setSelectedWalletAddress] = useState();
  const { setSelectedWallet, deleteWallet, setWallets } = useWallet();
  const { loadLocalCert } = useCertificate();
  const { enqueueSnackbar } = useSnackbar();
  const storageWallets = getStorageWallets();
  const selectedStorageWallet = getSelectedStorageWallet();
  const history = useHistory();
  const {
    handleSubmit,
    control,
    formState: { errors },
    clearErrors,
    watch
  } = useForm({
    defaultValues: {
      password: ""
    }
  });
  const { password } = watch();

  useEffect(() => {
    if (selectedStorageWallet && !selectedWalletAddress) {
      setSelectedWalletAddress(selectedStorageWallet.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStorageWallet, selectedWalletAddress]);

  function handleCancel() {
    setIsShowingConfirmationModal(false);
  }

  function handleConfirmDelete(deleteDeployments) {
    const newWallets = deleteWallet(selectedStorageWallet?.address, deleteDeployments);
    setIsShowingConfirmationModal(false);

    const newSelectedWallet = newWallets.find((w) => w.selected);

    if (newSelectedWallet) {
      setSelectedWalletAddress(newSelectedWallet.address);
    }
  }

  const handleWalletChange = (event) => {
    const value = event.target.value;

    let storageWallets = getStorageWallets();
    storageWallets = storageWallets.map((w) => ({
      ...w,
      selected: w.address === value
    }));
    updateStorageWallets(storageWallets);
    setSelectedWalletAddress(value);
  };

  async function onSubmit({ password }) {
    clearErrors();

    setIsLoading(true);

    try {
      const wallets = await validateWallets(password);
      const selectedWallet = wallets.find((w) => w.selected) || wallets[0];

      setWallets(wallets);
      setSelectedWallet(selectedWallet);

      // Load local certificates
      loadLocalCert(password);

      await analytics.event("deploy", "open wallet");

      history.push(UrlService.dashboard());
    } catch (err) {
      if (err.message === "ciphertext cannot be decrypted using that key") {
        enqueueSnackbar(<Snackbar title="Invalid password" iconVariant="error" />, { variant: "error" });
      } else {
        console.error(err);
        enqueueSnackbar(<Snackbar title="Error while decrypting wallet" iconVariant="error" />, { variant: "error" });
      }
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className={classes.root}>
        <TitleLogo />

        <Container maxWidth="xs" className={classes.container}>
          <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
            <Typography variant="h6" color="textPrimary">
              Open account
            </Typography>

            <Button variant="contained" size="small" color="primary" component={Link} to={UrlService.register(true)}>
              Add account
            </Button>
          </Box>

          <Box marginBottom="1rem">
            <FormControl variant="outlined" className={classes.formControl} fullWidth>
              <Select
                fullWidth
                value={selectedWalletAddress || ""}
                onChange={handleWalletChange}
                renderValue={(value) => {
                  const _wallet = storageWallets.find((w) => w.address === value);
                  return <WalletValue wallet={_wallet} />;
                }}
              >
                {storageWallets.map((wallet) => {
                  return (
                    <MenuItem value={wallet.address} key={wallet.address}>
                      <WalletValue wallet={wallet} />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>

          <form autoComplete={"false"} onSubmit={handleSubmit(onSubmit)}>
            <FormControl error={!errors.password} className={classes.formControl} fullWidth>
              <Controller
                control={control}
                name="password"
                rules={{
                  required: true
                }}
                render={({ fieldState, field }) => {
                  const helperText = "Password is required.";

                  return (
                    <TextField
                      {...field}
                      type="password"
                      variant="outlined"
                      label="Password"
                      autoFocus
                      error={!!fieldState.invalid}
                      helperText={fieldState.invalid && helperText}
                    />
                  );
                }}
              />
            </FormControl>

            {isLoading && (
              <Box textAlign="center">
                <CircularProgress />
              </Box>
            )}

            {!isLoading && (
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button color="secondary" onClick={() => setIsShowingConfirmationModal(true)}>
                  Delete wallet
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={!password}>
                  Open
                </Button>
              </Box>
            )}
          </form>

          <DeleteWalletConfirm
            isOpen={isShowingConfirmationModal}
            address={selectedWalletAddress}
            handleCancel={handleCancel}
            handleConfirmDelete={handleConfirmDelete}
          />
        </Container>
      </div>
    </Layout>
  );
}

const WalletValue = ({ wallet }) => {
  const classes = useStyles();
  return (
    <Alert icon={<AccountBalanceWalletIcon />} variant="outlined" classes={{ root: classes.alertRoot, icon: classes.alertIcon, message: classes.alertMessage }}>
      <Typography variant="body1">
        <strong>{wallet.name}</strong>
      </Typography>
      <Typography variant="caption">
        <Address address={wallet.address} />
      </Typography>
    </Alert>
  );
};
