import { Button, makeStyles, Container, Typography, ButtonGroup, TextareaAutosize, Box, FormControl, TextField, CircularProgress } from "@material-ui/core";
import { useEffect, useState, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { generateNewWallet } from "../../shared/utils/walletUtils";
import Alert from "@material-ui/lab/Alert";
import { useWallet } from "../../context/WalletProvider";
import { useForm, Controller } from "react-hook-form";
import { TitleLogo } from "../../shared/components/TitleLogo";
import { importWallet } from "../../shared/utils/walletUtils";
import { analytics } from "../../shared/utils/analyticsUtils";

const useStyles = makeStyles((theme) => ({
  root: { padding: "5% 0" },
  container: {
    paddingTop: "2rem",
    display: "flex",
    flexDirection: "column"
  },
  textArea: {
    width: "100%",
    maxWidth: "100%",
    minWidth: "100%",
    fontSize: "1.3rem",
    marginBottom: "1rem"
  },
  alert: {
    marginBottom: "2rem"
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
  }
}));

export function NewWallet() {
  const classes = useStyles();
  const [error, setError] = useState("");
  const [numberOfWords, setNumberOfWords] = useState(12);
  const [newWallet, setNewWallet] = useState(null);
  const [shuffledMnemonic, setShuffledMnemonic] = useState([]);
  const [isGeneratingNewWallet, setIsGeneratingNewWallet] = useState(false);
  const [isKeyValidating, setIsKeyValidating] = useState(false);
  const [isKeyValidated, setIsKeyValidated] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const formRef = useRef();
  const history = useHistory();
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setError: setFormError,
    clearErrors
  } = useForm({
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: ""
    }
  });
  const { password } = watch();
  const { setSelectedWallet } = useWallet();

  useEffect(() => {
    const init = async () => {
      await genNewWallet(numberOfWords);
    };

    if (!isKeyValidating) {
      init();
    }
  }, []);

  const genNewWallet = async (numOfWords) => {
    setIsGeneratingNewWallet(true);
    const wallet = await generateNewWallet(numOfWords);
    setNewWallet(wallet);
    // const accounts = await wallet.getAccounts();
    const shuffled = wallet.mnemonic
      .split(" ")
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

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
        newWords = prevWords.filter((w) => w !== word);
      }

      if (newWords.length === newWallet.mnemonic.split(" ").length) {
        // TODO validate the order of the words
        setIsKeyValidated(true);
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
      history.push(UrlService.register());
    }
  };

  /**
   * First send to key validation
   * Create new wallet
   */
  const onSubmit = async ({ name, password }) => {
    clearErrors();

    if (!password) {
      setFormError(`You must set a password.`);
      return;
    }

    if (isKeyValidated) {
      try {
        setIsCreatingWallet(true);

        const importedWallet = await importWallet(newWallet.mnemonic, name, password);
        setSelectedWallet(importedWallet);

        await analytics.event("deploy", "create wallet");

        history.replace(UrlService.dashboard());
      } catch (error) {
        console.error(error);
        setError(error.message);
        setIsCreatingWallet(false);
      }
    } else {
      setIsKeyValidating(true);
    }
  };

  return (
    <div className={classes.root}>
      <TitleLogo />

      <Container maxWidth="xs" className={classes.container}>
        <form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
          {isKeyValidating ? (
            <>
              <div>
                {selectedWords.map((word, i) => (
                  <Button
                    onClick={() => onWordClick(word, false)}
                    variant="contained"
                    color="primary"
                    className={classes.wordButton}
                    key={`selected_word_${i}`}
                  >
                    {word}
                  </Button>
                ))}
              </div>

              <hr />

              <div>
                {shuffledMnemonic
                  .filter((w) => !selectedWords.some((_) => _ === w))
                  .map((word, i) => (
                    <Button onClick={() => onWordClick(word, true)} className={classes.wordButton} variant="outlined" size="small" key={`word_${i}`}>
                      {word}
                    </Button>
                  ))}
              </div>
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

              <div>
                <TextareaAutosize value={newWallet?.mnemonic} className={classes.textArea} rowsMin={5} contentEditable={false} />
              </div>

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
            </>
          )}

          {error && (
            <Alert className={classes.alert} severity="warning">
              {error}
            </Alert>
          )}

          <Box display="flex" alignItems="center" justifyContent="space-between" marginTop="1rem">
            <Box>
              <Button onClick={onBackClick}>Back</Button>
            </Box>
            <Button
              variant="contained"
              color="primary"
              disabled={isGeneratingNewWallet || isCreatingWallet || (isKeyValidating && !isKeyValidated)}
              type="submit"
            >
              {isGeneratingNewWallet || isCreatingWallet ? <CircularProgress size="1.5rem" className={classes.loading} /> : <>Next</>}
            </Button>
          </Box>
        </form>
      </Container>
    </div>
  );
}
