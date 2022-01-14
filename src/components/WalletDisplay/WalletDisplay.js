import { useEffect, useState } from "react";
import { makeStyles, Box, Card, CardHeader, CircularProgress, Menu, MenuItem } from "@material-ui/core";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import RefreshIcon from "@material-ui/icons/Refresh";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import { useWallet } from "../../context/WalletProvider";
import { useSettings } from "../../context/SettingsProvider";
import { DeleteWalletConfirm } from "../../shared/components/DeleteWalletConfirm";
import { useHistory } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { Address } from "../../shared/components/Address";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    height: "100%",
    borderRadius: 0,
    border: "none",
    minHeight: 110
  },
  headerAction: {
    margin: 0
  }
});

export function WalletDisplay() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isShowingConfirmationModal, setIsShowingConfirmationModal] = useState(false);
  const { address, balance, refreshBalance, isRefreshingBalance, deleteWallet } = useWallet();
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

  function handleCancel() {
    setIsShowingConfirmationModal(false);
  }

  function handleConfirmDelete(deleteDeployments) {
    deleteWallet(address, deleteDeployments);
    history.push(UrlService.walletImport());
  }

  return (
    <>
      <Card className={classes.root} variant="outlined">
        <CardHeader
          classes={{ action: classes.headerAction }}
          action={
            <IconButton aria-label="settings" onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
          }
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
        handleCancel={handleCancel}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
