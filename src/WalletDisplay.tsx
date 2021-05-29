import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { apiEndpoint } from "./shared/constants";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import RefreshIcon from "@material-ui/icons/Refresh";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export function WalletDisplay(props) {
  const [balance, setBalance] = useState(null);
  const classes = useStyles();

  const { address } = props;

  // function importWallet() {
  //     history.push("/walletImport");
  // }

  const loadBalance = useCallback(async () => {
    const response = await fetch(
      apiEndpoint + "/cosmos/bank/v1beta1/balances/" + address
    );
    const data = await response.json();
    const balance = data.balances[0].amount;
    setBalance(balance);
  }, [address]);

  useEffect(() => {
    loadBalance();
  }, [address, loadBalance]);

  return (
    <>
      <Card className={classes.root} variant="outlined">
        <CardHeader
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
          title={
            <>
              <AccountBalanceWalletIcon />
              {balance} uakt
              <IconButton onClick={() => loadBalance()} aria-label="refresh">
                <RefreshIcon />
              </IconButton>
            </>
          }
          subheader={address}
        ></CardHeader>
      </Card>
    </>
  );
}
