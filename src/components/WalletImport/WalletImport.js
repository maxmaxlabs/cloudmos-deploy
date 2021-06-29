import { useState } from "react";
import { TextField, Container, Paper, makeStyles, Button } from "@material-ui/core";
import { importWallet } from "../../shared/utils/walletUtils";
import { useWallet } from "../../context/WalletProvider";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    // backgroundColor: "#f5f5f5",
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
  }
}));

export function WalletImport() {
  const [mnemonic, setMnemonic] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const classes = useStyles();
  const { setSelectedWallet } = useWallet();

  async function onImportSubmit(ev) {
    ev.preventDefault();
    
    const importedWallet = await importWallet(mnemonic, name, password);
    setSelectedWallet(importedWallet);
  }

  return (
    <div className={classes.root}>
      <Container maxWidth="sm" pt={2}>
        <Paper className={classes.paper} elevation={5}>
          <h1>Import an existing wallet</h1>
          <br />
          <form autoComplete="false" onSubmit={onImportSubmit}>
            <TextField
              label="Type your mnemonic / private key"
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

            {/* <Button variant="contained" color="default" onClick={onCancelClick}>Cancel</Button> */}
            <Button type="submit" variant="contained" color="primary">
              Import
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
