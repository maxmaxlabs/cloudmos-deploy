import { Button, makeStyles, Container, Typography, ButtonGroup, TextareaAutosize, Box } from "@material-ui/core";
import { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { generateNewWallet } from "../../shared/utils/walletUtils";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  root: { padding: "5% 0" },
  title: {
    fontWeight: "bold",
    fontSize: "3rem",
    textAlign: "center"
  },
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
  alertList: {
    "& li": {
      listStyle: "disc"
    }
  },
  wordButton: {
    margin: "2px"
  }
}));

export function NewWallet() {
  const classes = useStyles();
  const [numberOfWords, setNumberOfWords] = useState(12);
  const [newWallet, setNewWallet] = useState(null);
  const [isGeneratingNewWallet, setIsGeneratingNewWallet] = useState(false);
  const [isKeyValidating, setIsKeyValidating] = useState(false);
  const [isKeyValidated, setIsKeyValidated] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const history = useHistory();

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

  const onCreateWallet = () => {
    if (isKeyValidated) {
      history.replace(UrlService.dashboard());
    } else {
      setIsKeyValidating(true);
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h1" className={classes.title}>
        Akashlytics Deploy
      </Typography>

      <Container maxWidth="xs" className={classes.container}>
        {isKeyValidating ? (
          <>
            <div>
              {selectedWords.map((word) => (
                <Button onClick={() => onWordClick(word, false)} variant="contained" color="primary" className={classes.wordButton}>
                  {word}
                </Button>
              ))}
            </div>

            <hr />

            <div>
              {newWallet.mnemonic
                .split(" ")
                .filter((w) => !selectedWords.some((_) => _ === w))
                .map((word) => (
                  <Button onClick={() => onWordClick(word, true)} className={classes.wordButton} variant="outline" size="small">
                    {word}
                  </Button>
                ))}
            </div>
          </>
        ) : (
          <>
            <Alert variant="filled" color="error" className={classes.alert} icon={false}>
              <Typography>Backup your mnemonic seed securely</Typography>

              <ul className={classes.alertList}>
                <li>Anyone with your mnemonic seed can take your assets.</li>
                <li>Lost mnemonic seed can't be recovered.</li>
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
          </>
        )}

        <Button variant="contained" color="primary" disabled={isGeneratingNewWallet || (isKeyValidating && !isKeyValidated)} onClick={onCreateWallet}>
          Next
        </Button>

        <Box marginTop="1rem">
          <Button onClick={onBackClick}>Back</Button>
        </Box>
      </Container>
    </div>
  );
}
