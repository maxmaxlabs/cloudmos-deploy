import { makeStyles } from "@material-ui/core/styles";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import RefreshIcon from "@material-ui/icons/Refresh";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import { useWallet } from "./WalletProvider/WalletProviderContext";

const useStyles = makeStyles({
  root: {
    minWidth: 275
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },
  title: {
    fontSize: 14
  },
  pos: {
    marginBottom: 12
  }
});

export function WalletDisplay() {
  const classes = useStyles();

  const { address, balance, refreshBalance } = useWallet();

  // function importWallet() {
  //     history.push("/walletImport");
  // }

  return (
    <>
      <Card className={classes.root} variant="outlined">
        <CardHeader action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        } title={(
          <>
            <AccountBalanceWalletIcon />{balance / 1000000} AKT
            <IconButton onClick={() => refreshBalance()} aria-label="refresh">
              <RefreshIcon />
            </IconButton>
          </>
        )}
          subheader={address}
        ></CardHeader>
      </Card>
    </>
  );
}
