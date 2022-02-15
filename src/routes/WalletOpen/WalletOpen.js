import { useState } from "react";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import { Box, TextField, Container, Button, CircularProgress, makeStyles, FormControl, Typography } from "@material-ui/core";
import { useCurrentWalletFromStorage, openWallet } from "../../shared/utils/walletUtils";
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

const useStyles = makeStyles((theme) => ({
  root: { padding: "5% 0" },
  container: {
    paddingTop: "2rem",
    display: "flex",
    flexDirection: "column"
  },
  title: {
    marginBottom: "1rem",
    fontWeight: "bold"
  },
  walletAddress: {
    display: "block",
    marginBottom: "1rem"
  },
  formControl: {
    marginBottom: "1rem"
  },
  alertRoot: {
    borderColor: theme.palette.primary.main
  },
  alertIcon: {
    "&&": {
      color: theme.palette.primary.main
    }
  }
}));

export function WalletOpen() {
  const [isShowingConfirmationModal, setIsShowingConfirmationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const classes = useStyles();
  const { setSelectedWallet, deleteWallet } = useWallet();
  const { loadLocalCert } = useCertificate();
  const { enqueueSnackbar } = useSnackbar();
  const currentWallet = useCurrentWalletFromStorage();
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

  function handleCancel() {
    setIsShowingConfirmationModal(false);
  }

  function handleConfirmDelete(deleteDeployments) {
    deleteWallet(currentWallet?.address, deleteDeployments);
    setIsShowingConfirmationModal(false);

    history.replace(UrlService.register());
  }

  async function onSubmit({ password }) {
    clearErrors();

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
        enqueueSnackbar(<Snackbar title="Invalid password" />, { variant: "error" });
      } else {
        console.error(err);
        enqueueSnackbar(<Snackbar title="Error while decrypting wallet" />, { variant: "error" });
      }
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className={classes.root}>
        <TitleLogo />

        <Container maxWidth="xs" className={classes.container}>
          <Typography variant="h6" color="textSecondary" className={classes.title}>
            Open account
          </Typography>

          <Box marginBottom="2rem">
            <Alert icon={<AccountBalanceWalletIcon />} variant="outlined" classes={{ root: classes.alertRoot, icon: classes.alertIcon }}>
              <Typography variant="body1">
                <strong>{currentWallet?.name}</strong>
              </Typography>
              <Typography variant="caption">
                <Address address={currentWallet?.address} />
              </Typography>
            </Alert>
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
            address={currentWallet?.address}
            handleCancel={handleCancel}
            handleConfirmDelete={handleConfirmDelete}
          />
        </Container>
      </div>
    </Layout>
  );
}
