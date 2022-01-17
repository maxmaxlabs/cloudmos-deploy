import { useEffect, useState } from "react";
import { makeStyles, Box, Card, CardHeader, CircularProgress, Menu, MenuItem } from "@material-ui/core";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import RefreshIcon from "@material-ui/icons/Refresh";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import SendIcon from "@material-ui/icons/Send";
import { useWallet } from "../../context/WalletProvider";
import { useSettings } from "../../context/SettingsProvider";
import { DeleteWalletConfirm } from "../../shared/components/DeleteWalletConfirm";
import { useHistory } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { Address } from "../../shared/components/Address";
import { SendModal } from "../SendModal";
import { useTransactionModal } from "../../context/TransactionModal";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    height: "100%",
    borderRadius: 0,
    border: "none",
    minHeight: 80
  },
  headerAction: {
    margin: 0
  },
  headerRoot: {
    padding: "8px 16px 12px"
  }
});

export function WalletDisplay() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isShowingConfirmationModal, setIsShowingConfirmationModal] = useState(false);
  const [isShowingSendModal, setIsShowingSendModal] = useState(false);
  const { address, balance, refreshBalance, isRefreshingBalance, deleteWallet } = useWallet();
  const { sendTransaction } = useTransactionModal();
  const classes = useStyles();
  const { settings } = useSettings();
  const history = useHistory();
  const { apiEndpoint } = settings;

  useEffect(() => {
    refreshBalance();
  }, [apiEndpoint, refreshBalance]);

  function deleteWalletClick() {
    handleCloseMenu();
    setIsShowingConfirmationModal(true);
  }

  function handleCloseMenu() {
    setAnchorEl(null);
  }

  function handleMenuClick(ev) {
    setAnchorEl(ev.currentTarget);
  }

  function handleConfirmDelete(deleteDeployments) {
    deleteWallet(address, deleteDeployments);
    history.push(UrlService.walletImport());
  }

  const sendClick = () => {
    handleCloseMenu();
    setIsShowingSendModal(true);
  };

  const onSendTransaction = async (recipient, amount) => {
    setIsShowingSendModal(false);

    try {
      const message = TransactionMessageData.getSendTokensMsg(address, recipient, amount);

      const response = await sendTransaction([message]);

      if (response) {
        refreshBalance();
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <Card className={classes.root} variant="outlined">
        <CardHeader
          classes={{ action: classes.headerAction, root: classes.headerRoot }}
          title={
            <Box display="flex" alignItems="center">
              <AccountBalanceWalletIcon />
              <Box component="span" marginLeft="5px">
                {balance / 1000000} AKT
              </Box>
              <Box marginLeft="1rem">
                <IconButton onClick={() => refreshBalance(true)} aria-label="refresh" disabled={isRefreshingBalance} size="small">
                  {isRefreshingBalance ? <CircularProgress size="1.5rem" /> : <RefreshIcon />}
                </IconButton>
              </Box>
              <Box marginLeft=".5rem">
                <IconButton aria-label="settings" onClick={handleMenuClick} size="small">
                  <MoreHorizIcon fontSize="large" />
                </IconButton>
              </Box>
            </Box>
          }
          subheader={<Address address={address} isCopyable />}
        ></CardHeader>
        <Menu
          id="wallet-menu"
          anchorEl={anchorEl}
          keepMounted
          getContentAnchorEl={null}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right"
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
        >
          <MenuItem onClick={() => sendClick()}>
            <SendIcon />
            &nbsp;Send
          </MenuItem>
          <MenuItem onClick={() => deleteWalletClick()}>
            <DeleteForeverIcon />
            &nbsp;Delete Wallet
          </MenuItem>
        </Menu>
      </Card>

      <DeleteWalletConfirm
        isOpen={isShowingConfirmationModal}
        address={address}
        balance={balance}
        handleCancel={() => setIsShowingConfirmationModal(false)}
        handleConfirmDelete={handleConfirmDelete}
      />
      {isShowingSendModal && <SendModal onClose={() => setIsShowingSendModal(false)} onSendTransaction={onSendTransaction} />}
    </>
  );
}
