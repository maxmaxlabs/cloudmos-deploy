import { Button, makeStyles, Container, Typography, ButtonGroup, TextareaAutosize, Box } from "@material-ui/core";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { generateNewWallet } from "../../shared/utils/walletUtils";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  root: { padding: "10% 0" },
  title: {
    fontWeight: "bold",
    fontSize: "3rem",
    textAlign: "center"
  },
  container: {
    paddingTop: "3rem",
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
  }
}));

export function NewWallet() {
  const classes = useStyles();
  const [numberOfWords, setNumberOfWords] = useState(12);
  const [newWallet, setNewWallet] = useState(null);
  const [isGeneratingNewWallet, setIsGeneratingNewWallet] = useState(false);

  useEffect(() => {
    const init = async () => {
      await genNewWallet(numberOfWords);
    };

    init();
  }, []);

  const genNewWallet = async (numOfWords) => {
    setIsGeneratingNewWallet(true);
    const wallet = await generateNewWallet(numOfWords);
    setNewWallet(wallet);
    const accounts = await wallet.getAccounts();
    debugger;

    setIsGeneratingNewWallet(false);
  };

  const onNumberChange = async (number) => {
    setNumberOfWords(number);
    await genNewWallet(number);
  };

  const onCreateWallet = () => {};

  return (
    <div className={classes.root}>
      <Typography variant="h1" className={classes.title}>
        Akashlytics Deploy
      </Typography>

      <Container maxWidth="xs" className={classes.container}>
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

        <Button component={Link} to={UrlService.register()} variant="contained" color="primary" disabled={isGeneratingNewWallet}>
          Next
        </Button>

        <Box marginTop="1rem">
          <Button component={Link} to={UrlService.register()}>
            Back
          </Button>
        </Box>
      </Container>
    </div>
  );
}
