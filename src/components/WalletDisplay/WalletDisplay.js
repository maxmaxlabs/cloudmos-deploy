import { makeStyles, Box, Card, CardHeader, CircularProgress } from "@material-ui/core";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import RefreshIcon from "@material-ui/icons/Refresh";
import IconButton from "@material-ui/core/IconButton";
import { useWallet } from "../../context/WalletProvider";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    height: "100%",
    borderRadius: 0,
    border: "none",
    minHeight: 110
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

  const { address, balance, refreshBalance, isRefreshingBalance } = useWallet();

  // function importWallet() {
  //     history.push("/walletImport");
  // }

  return (
    <Card className={classes.root} variant="outlined">
      <CardHeader
        // action={
        //   <IconButton aria-label="settings">
        //     <MoreVertIcon />
        //   </IconButton>
        // }
        title={
          <Box display="flex" alignItems="center">
            <AccountBalanceWalletIcon />
            <Box component="span" marginLeft="5px">
              {balance / 1000000} AKT
            </Box>
            <Box marginLeft="1rem">
              <IconButton onClick={() => refreshBalance(true)} aria-label="refresh" disabled={isRefreshingBalance}>
                {isRefreshingBalance ? <CircularProgress size="1.5rem" /> : <RefreshIcon />}
              </IconButton>
            </Box>
          </Box>
        }
        subheader={address}
      ></CardHeader>
    </Card>
  );
}
