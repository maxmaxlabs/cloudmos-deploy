import { useState } from "react";
import { CircularProgress, TextField, Container, makeStyles, Button, Box, FormControl, Typography } from "@material-ui/core";
import { importWallet } from "../../shared/utils/walletUtils";
import { useWallet } from "../../context/WalletProvider";
import { analytics } from "../../shared/utils/analyticsUtils";
import { Link, useHistory } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { useForm, Controller } from "react-hook-form";
import { TitleLogo } from "../../shared/components/TitleLogo";
import { useSnackbar } from "notistack";
import { Snackbar } from "../../shared/components/Snackbar";
import { HdPath } from "../../shared/components/HdPath";

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
  const { setSelectedWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();
  const [hdPath, setHdPath] = useState({ account: 0, change: 0, addressIndex: 0 });
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
      const trimmedMnemonic = mnemonic.trim();
      const { account, change, addressIndex } = hdPath;

      const importedWallet = await importWallet(trimmedMnemonic, name, password, account, change, addressIndex);
      setSelectedWallet(importedWallet);

      await analytics.event("deploy", "import wallet");

      history.replace(UrlService.dashboard());
    } catch (error) {
      console.error(error);
      enqueueSnackbar(<Snackbar title="An error has occured" subTitle={error.message} iconVariant="error" />, { variant: "error" });
      setIsLoading(false);
    }
  }

  return (
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

          <HdPath onChange={onHdPathChange} />

          <Box display="flex" alignItems="center" justifyContent="space-between" marginTop="1rem">
            <Button component={Link} to={UrlService.register()}>
              Back
            </Button>

            <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
              {isLoading ? <CircularProgress size="1.5rem" color="primary" /> : <>Import</>}
            </Button>
          </Box>
        </form>
      </Container>
    </div>
  );
}
