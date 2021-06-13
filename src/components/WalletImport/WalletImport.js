import { useState } from "react";
import { TextField, Container, Paper, makeStyles, Button } from "@material-ui/core";
import { importWallet } from "../../shared/utils/walletUtils";
import { useWallet } from "../../context/WalletProvider";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    // backgroundColor: "#f5f5f5",
    paddingTop: "20px",

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
  }
}));

export function WalletImport() {
  const [mnemonic, setMnemonic] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const classes = useStyles();
  const { setSelectedWallet } = useWallet();

  async function onImportClick() {
    const importedWallet = await importWallet(mnemonic, password);
    setSelectedWallet(importedWallet);
  }

  return (
    <div className={classes.root}>
      <Container maxWidth="sm" pt={2}>
        <Paper className={classes.paper}>
          <h1>Import an existing wallet</h1>
          <br />
          <form noValidate autoComplete="false">
            <TextField
              label="Type your mnemonic / private key"
              multiline
              fullWidth
              rows={4}
              value={mnemonic}
              onChange={(ev) => setMnemonic(ev.target.value)}
              variant="outlined"
            />

            <TextField label="Choose a name for this wallet" fullWidth rows={4} value={name} onChange={(ev) => setName(ev.target.value)} variant="outlined" />

            <TextField
              label="Choose a password to keep this wallet safe"
              fullWidth
              rows={4}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              type="password"
              variant="outlined"
            />

            {/* <Button variant="contained" color="default" onClick={onCancelClick}>Cancel</Button> */}
            <Button variant="contained" color="primary" onClick={onImportClick}>
              Import
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
