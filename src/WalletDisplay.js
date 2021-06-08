import { makeStyles, Box, Card, CardHeader } from "@material-ui/core";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import RefreshIcon from "@material-ui/icons/Refresh";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { useWallet } from "./WalletProvider/WalletProviderContext";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    height: "100%"
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
    <Card className={classes.root} variant="outlined">
      <CardHeader
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={
          <Box display="flex" alignItems="center">
            <AccountBalanceWalletIcon />
            <Box component="span" marginLeft="5px">{balance / 1000000} AKT</Box>
            <IconButton onClick={() => refreshBalance()} aria-label="refresh">
              <RefreshIcon />
            </IconButton>
          </Box>
        }
        subheader={address}
      ></CardHeader>
    </Card>
  );
}
