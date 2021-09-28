import { useState } from "react";
import { CircularProgress, TextField, Container, Paper, makeStyles, Button, Box } from "@material-ui/core";
import { importWallet } from "../../shared/utils/walletUtils";
import { useWallet } from "../../context/WalletProvider";
import Alert from "@material-ui/lab/Alert";
import { analytics } from "../../shared/utils/analyticsUtils";
import { Link, useHistory } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";

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
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  alert: {
    marginBottom: "1rem"
  },
  loading: {
    color: "#fff"
  }
}));

export function WalletImport() {
  const [mnemonic, setMnemonic] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const classes = useStyles();
  const { setSelectedWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  async function onImportSubmit(ev) {
    ev.preventDefault();
    setError("");

    setIsLoading(true);

    try {
      const trimmedMnemonic = mnemonic.trim();

      const importedWallet = await importWallet(trimmedMnemonic, name, password);
      setSelectedWallet(importedWallet);

      await analytics.event("deploy", "import wallet");

      history.replace(UrlService.dashboard());
    } catch (error) {
      console.error(error);
      setError(error.message);
      setIsLoading(false);
    }
  }

  return (
    <div className={classes.root}>
      <Container maxWidth="sm" pt={2}>
        <Paper className={classes.paper} elevation={5}>
          <h1>Import an existing wallet</h1>
          <br />
          <form autoComplete="false" onSubmit={onImportSubmit}>
            <TextField
              label="Type your mnemonic"
              required
              multiline
              fullWidth
              rows={4}
              value={mnemonic}
              onChange={(ev) => setMnemonic(ev.target.value)}
              variant="outlined"
            />

            <TextField
              label="Choose a name for this wallet"
              required
              fullWidth
              rows={4}
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              variant="outlined"
            />

            <TextField
              label="Choose a password to keep this wallet safe"
              required
              fullWidth
              rows={4}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              type="password"
              variant="outlined"
            />

            {error && (
              <Alert className={classes.alert} severity="warning">
                {error}
              </Alert>
            )}

            <Box display="flex" justifyContent="space-between">
              <Button component={Link} to={UrlService.register()}>
                Back
              </Button>

              <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                {isLoading ? <CircularProgress size="1.5rem" className={classes.loading} /> : <>Import</>}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
