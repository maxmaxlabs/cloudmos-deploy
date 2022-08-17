import { Button, makeStyles, Container, Typography, ButtonGroup, Box, FormControl, TextField, CircularProgress } from "@material-ui/core";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { generateNewWallet, importWallet, validateWallets } from "../../shared/utils/walletUtils";
import Alert from "@material-ui/lab/Alert";
import { useWallet } from "../../context/WalletProvider";
import { useForm, Controller } from "react-hook-form";
import { TitleLogo } from "../../shared/components/TitleLogo";
import { analytics } from "../../shared/utils/analyticsUtils";
import { useSnackbar } from "notistack";
import { Snackbar } from "../../shared/components/Snackbar";
import { HdPath } from "../../shared/components/HdPath";
import { MnemonicTextarea } from "../../shared/components/MnemonicTextarea";
import { Layout } from "../../shared/components/Layout";
import { useQueryParams } from "../../hooks/useQueryParams";
import { useCertificate } from "../../context/CertificateProvider";
import isEqual from "lodash/isEqual";

const useStyles = makeStyles((theme) => ({
  root: { padding: "5% 0" },
  container: {
    paddingTop: "2rem",
    display: "flex",
    flexDirection: "column"
  },
  alert: {
    marginBottom: "1.5rem"
  },
  alertTitle: {
    fontSize: "1rem"
  },
  alertList: {
    paddingLeft: "1.5rem",
    "& li": {
      listStyle: "disc"
    }
  },
  wordButton: {
    margin: "2px"
  },
  formControl: {
    marginBottom: "1rem"
  },
  loading: {
    color: "#fff"
  },
  wordBox: {
    minHeight: 100,
    border: `1px dashed ${theme.palette.grey[400]}`,
    padding: "4px"
  }
}));

export function NewWallet() {
  const classes = useStyles();
  const walletsRef = useRef();
  const { enqueueSnackbar } = useSnackbar();
  const [numberOfWords, setNumberOfWords] = useState(12);
  const [error, setError] = useState("");
  const [newWallet, setNewWallet] = useState(null);
  const [shuffledMnemonic, setShuffledMnemonic] = useState([]);
  const [isGeneratingNewWallet, setIsGeneratingNewWallet] = useState(false);
  const [isKeyValidating, setIsKeyValidating] = useState(false);
  const [isKeyValidated, setIsKeyValidated] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const queryParams = useQueryParams();
  const isAddAccount = !!queryParams.get("add");
  const [hdPath, setHdPath] = useState({ account: 0, change: 0, addressIndex: 0 });
  const history = useHistory();
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    clearErrors
  } = useForm({
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: ""
    }
  });
  const { password } = watch();
  const { setSelectedWallet, setWallets } = useWallet();
  const { setLocalCert, setValidCertificates, setSelectedCertificate, loadLocalCert } = useCertificate();

  useEffect(() => {
    const init = async () => {
      await genNewWallet(numberOfWords);
    };

    if (!isKeyValidating) {
      init();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const genNewWallet = async (numOfWords) => {
    setIsGeneratingNewWallet(true);
    const wallet = await generateNewWallet(numOfWords);
    setNewWallet(wallet);
    const shuffled = wallet.mnemonic
      .split(" ")
      .map((value, i) => ({ value, sort: Math.random(), originalIndex: i }))
      .sort((a, b) => a.sort - b.sort);

    setShuffledMnemonic(shuffled);

    setIsGeneratingNewWallet(false);
  };

  const onNumberChange = async (number) => {
    setNumberOfWords(number);
    await genNewWallet(number);
  };

  const onWordClick = (word, shouldAdd) => {
    setSelectedWords((prevWords) => {
      let newWords;
      if (shouldAdd) {
        newWords = prevWords.concat([word]);
      } else {
        newWords = prevWords.filter((w) => w.originalIndex !== word.originalIndex);
      }

      const originalMnemonic = newWallet.mnemonic.split(" ");
      if (newWords.length === originalMnemonic.length) {
        if (
          isEqual(
            newWords.map((w) => w.value),
            originalMnemonic
          )
        ) {
          setIsKeyValidated(true);
          setError("");
        } else {
          setError("The sequence of words is incorrect.");
        }
      } else {
        setError("");
      }

      return newWords;
    });
  };

  const onBackClick = () => {
    if (isKeyValidating) {
      setIsKeyValidating(false);
      setIsKeyValidated(false);
      setSelectedWords([]);
    } else {
      history.goBack();
    }
  };

  const onHdPathChange = (account, change, addressIndex) => {
    setHdPath({ account, change, addressIndex });
  };

  /**
   * First send to key validation
   * Create new wallet
   */
  const onSubmit = async ({ name, password }) => {
    clearErrors();

    try {
      if (isKeyValidated) {
        setIsCreatingWallet(true);

        const { account, change, addressIndex } = hdPath;

        const importedWallet = await importWallet(newWallet.mnemonic, name, password, account, change, addressIndex);
        const newWallets = walletsRef.current.concat([importedWallet]);

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

        await analytics.event("deploy", "create wallet");

        history.replace(UrlService.dashboard());
      } else {
        setIsCreatingWallet(true);

        // validate that all wallets have the same password
        walletsRef.current = await validateWallets(password);

        setIsKeyValidating(true);
        setIsCreatingWallet(false);
      }
    } catch (error) {
      if (error.message === "ciphertext cannot be decrypted using that key") {
        enqueueSnackbar(<Snackbar title="Invalid password" iconVariant="error" />, { variant: "error" });
      } else {
        console.error(error);
        enqueueSnackbar(<Snackbar title="An error has occured" subTitle={error.message} iconVariant="error" />, { variant: "error" });
      }

      setIsCreatingWallet(false);
    }
  };

  return (
    <Layout>
      <div className={classes.root}>
        <TitleLogo />

        <Container maxWidth="xs" className={classes.container}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {isKeyValidating ? (
              <>
                <Typography variant="h6" color="textSecondary">
                  Click your mnemonic seed in the right order
                </Typography>
                <div className={classes.wordBox}>
                  {selectedWords.map((word, i) => (
                    <Button
                      onClick={() => onWordClick(word, false)}
                      variant="contained"
                      color="primary"
                      className={classes.wordButton}
                      key={`selected_word_${i}`}
                      size="small"
                    >
                      {word.value}
                    </Button>
                  ))}
                </div>

                <hr />

                <div>
                  {shuffledMnemonic
                    .filter((w) => !selectedWords.some((_) => _.value === w.value && _.originalIndex === w.originalIndex))
                    .map((word, i) => (
                      <Button onClick={() => onWordClick(word, true)} className={classes.wordButton} variant="outlined" size="small" key={`word_${i}`}>
                        {word.value}
                      </Button>
                    ))}
                </div>

                <Box marginTop="1rem">
                  {error && (
                    <Alert severity="error" variant="filled">
                      {error}
                    </Alert>
                  )}
                </Box>
              </>
            ) : (
              <>
                <Alert variant="outlined" color="warning" className={classes.alert} icon={false}>
                  <Typography variant="h6" className={classes.alertTitle}>
                    <strong>Backup your mnemonic seed securely</strong>
                  </Typography>

                  <ul className={classes.alertList}>
                    <li>Anyone with your mnemonic seed can take your assets.</li>
                    <li>Lost mnemonic seed can't be recovered.</li>
                    <li>Make sure to write it down somewhere secure.</li>
                    <li>Never share the mnemonic with others or enter it in unverified sites.</li>
                  </ul>
                </Alert>

                <Box display="flex" justifyContent="space-between" marginBottom="1rem">
                  <Typography variant="h5">Mnemonic Seed</Typography>
                  <ButtonGroup variant="contained" size="small">
                    <Button onClick={() => onNumberChange(12)} size="small" color={numberOfWords === 12 ? "primary" : "default"}>
                      12 words
                    </Button>
                    <Button onClick={() => onNumberChange(24)} size="small" color={numberOfWords === 24 ? "primary" : "default"}>
                      24 words
                    </Button>
                  </ButtonGroup>
                </Box>

                <Box marginBottom="1rem">
                  <MnemonicTextarea mnemonic={newWallet?.mnemonic} />
                </Box>

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
                          autoFocus
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
              </>
            )}

            <Box display="flex" alignItems="center" justifyContent="space-between" marginTop="1rem">
              <Box>
                <Button onClick={onBackClick}>Back</Button>
              </Box>

              <Box display="flex" alignItems="center">
                {isKeyValidating && selectedWords.length > 0 && (
                  <Box marginRight=".5rem" display="flex" justifyContent="flex-end">
                    <Button size="small" color="primary" variant="contained" onClick={() => setSelectedWords([])}>
                      Reset
                    </Button>
                  </Box>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  disabled={isGeneratingNewWallet || isCreatingWallet || (isKeyValidating && !isKeyValidated)}
                  type="submit"
                >
                  {isGeneratingNewWallet || isCreatingWallet ? <CircularProgress size="1.5rem" color="primary" /> : <>Next</>}
                </Button>
              </Box>
            </Box>
          </form>
        </Container>
      </div>
    </Layout>
  );
}
