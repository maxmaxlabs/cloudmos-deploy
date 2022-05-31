import { useState } from "react";
import { CircularProgress, TextField, Container, makeStyles, Button, Box, FormControl, Typography } from "@material-ui/core";
import { importWallet, validateWallets } from "../../shared/utils/walletUtils";
import { useWallet } from "../../context/WalletProvider";
import { analytics } from "../../shared/utils/analyticsUtils";
import { useHistory } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { useForm, Controller } from "react-hook-form";
import { TitleLogo } from "../../shared/components/TitleLogo";
import { useSnackbar } from "notistack";
import { Snackbar } from "../../shared/components/Snackbar";
import { HdPath } from "../../shared/components/HdPath";
import { useQueryParams } from "../../hooks/useQueryParams";
import { Layout } from "../../shared/components/Layout";
import { useCertificate } from "../../context/CertificateProvider";

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
  alert: {
    marginBottom: "1rem"
  },
  formControl: {
    marginBottom: "1rem"
  }
}));

export function WalletImport() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { setSelectedWallet, setWallets } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const queryParams = useQueryParams();
  const isAddAccount = !!queryParams.get("add");
  const [hdPath, setHdPath] = useState({ account: 0, change: 0, addressIndex: 0 });
  const { setLocalCert, setValidCertificates, setSelectedCertificate, loadLocalCert } = useCertificate();
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    clearErrors
  } = useForm({
    defaultValues: {
      mnemonic: "",
      name: "",
      password: "",
      confirmPassword: ""
    }
  });
  const { password } = watch();

  const onHdPathChange = (account, change, addressIndex) => {
    setHdPath({ account, change, addressIndex });
  };

  /**
   * Import new wallet
   */
  async function onSubmit({ mnemonic, name, password }) {
    clearErrors();

    try {
      setIsLoading(true);

      // validate that all wallets have the same password
      const wallets = await validateWallets(password);

      const trimmedMnemonic = mnemonic.trim();
      const { account, change, addressIndex } = hdPath;

      const importedWallet = await importWallet(trimmedMnemonic, name, password, account, change, addressIndex);
      const newWallets = wallets.concat([importedWallet]);

      for (let i = 0; i < newWallets.length; i++) {
        newWallets[i].selected = newWallets[i].address === importedWallet.address;
      }

      setWallets(newWallets);
      setSelectedWallet(importedWallet);
      setValidCertificates([]);
      setSelectedCertificate(null);
      setLocalCert(null);

      // Load local certificates
      loadLocalCert(password);

      await analytics.event("deploy", "import wallet");

      history.replace(UrlService.dashboard());
    } catch (error) {
      if (error.message === "ciphertext cannot be decrypted using that key") {
        enqueueSnackbar(<Snackbar title="Invalid password" iconVariant="error" />, { variant: "error" });
      } else {
        console.error(error);
        enqueueSnackbar(<Snackbar title="An error has occured" subTitle={error.message} iconVariant="error" />, { variant: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className={classes.root}>
        <TitleLogo />

        <Container maxWidth="xs" className={classes.container}>
          <Typography variant="h6" color="textSecondary" className={classes.title}>
            Import your seed
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl error={!errors.name} className={classes.formControl} fullWidth>
              <Controller
                control={control}
                name="mnemonic"
                rules={{
                  required: true
                }}
                render={({ fieldState, field }) => {
                  const helperText = "Mnemonic is required.";

                  return (
                    <TextField
                      {...field}
                      type="text"
                      variant="outlined"
                      label="Type your mnemonic"
                      multiline
                      autoFocus
                      rows={4}
                      error={!!fieldState.invalid}
                      helperText={fieldState.invalid && helperText}
                    />
                  );
                }}
              />
            </FormControl>

            <FormControl error={!errors.name} className={classes.formControl} fullWidth>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: true
                }}
                render={({ fieldState, field }) => {
                  const helperText = "Account name is required.";

                  return (
                    <TextField
                      {...field}
                      type="text"
                      variant="outlined"
                      label="Account name"
                      error={!!fieldState.invalid}
                      helperText={fieldState.invalid && helperText}
                    />
                  );
                }}
              />
            </FormControl>

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
                      error={!!fieldState.invalid}
                      helperText={fieldState.invalid && helperText}
                    />
                  );
                }}
              />
            </FormControl>

            {!isAddAccount && (
              <FormControl error={!errors.confirmPassword} className={classes.formControl} fullWidth>
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: true,
                    validate: (value) => !!value && value === password
                  }}
                  render={({ fieldState, field }) => {
                    const helperText = fieldState.error?.type === "validate" ? "Password doesn't match." : "Confirm password is required.";

                    return (
                      <TextField
                        {...field}
                        type="password"
                        variant="outlined"
                        label="Confirm password"
                        error={!!fieldState.invalid}
                        helperText={fieldState.invalid && helperText}
                      />
                    );
                  }}
                />
              </FormControl>
            )}

            <HdPath onChange={onHdPathChange} />

            <Box display="flex" alignItems="center" justifyContent="space-between" marginTop="1rem">
              <Button onClick={() => history.goBack()}>Back</Button>

              <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                {isLoading ? <CircularProgress size="1.5rem" color="primary" /> : <>Import</>}
              </Button>
            </Box>
          </form>
        </Container>
      </div>
    </Layout>
  );
}
