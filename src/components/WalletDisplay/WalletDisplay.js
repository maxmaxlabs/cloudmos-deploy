import { useEffect, useState } from "react";
import {
  makeStyles,
  Box,
  Card,
  CardHeader,
  Checkbox,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import RefreshIcon from "@material-ui/icons/Refresh";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import { useWallet } from "../../context/WalletProvider";

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    height: "100%",
    borderRadius: 0,
    border: "none",
    minHeight: 110
  }
});

export function WalletDisplay() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isShowingConfirmationModal, setIsShowingConfirmationModal] = useState(false);
  const [isConfirmationChecked, setIsConfirmationChecked] = useState(false);

  const classes = useStyles();

  const { address, balance, refreshBalance, isRefreshingBalance, deleteWallet } = useWallet();

  // function importWallet() {
  //     history.push("/walletImport");
  // }

  useEffect(() => {
    setIsConfirmationChecked(false);
  }, [isShowingConfirmationModal]);

  function deleteWalletClick() {
    handleCloseMenu();
    setIsShowingConfirmationModal(true);
  }

  function handleCloseMenu() {
    setAnchorEl(null);
  };

  function handleMenuClick(ev) {
    setAnchorEl(ev.currentTarget);
  }

  function handleCancel() {
    setIsShowingConfirmationModal(false);
  }

  function handleConfirmDelete() {
    deleteWallet();
  }

  return (
    <>
      <Card className={classes.root} variant="outlined">
        <CardHeader
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
          subheader={address}
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
      <Dialog disableBackdropClick disableEscapeKeyDown maxWidth="sm" aria-labelledby="confirmation-dialog-title" open={isShowingConfirmationModal}>
        <DialogTitle id="confirmation-dialog-title">Delete Wallet</DialogTitle>
        <DialogContent dividers>
          Are you sure you want to delete this wallet?
          <br />
          <p>
            Address: <strong>{address}</strong>
            <br />
            Balance: <strong>{balance / 1000000} AKT</strong>
          </p>
          <Alert severity="warning">
            This wallet will be completely removed from Akashlytics Deploy along with your local certificate and deployments data. If you want to keep access to this wallet, make sure you have a backup of the seed
            phrase or private key.
          </Alert>
          <br />
          <FormControlLabel
            control={<Checkbox name="checkedC" checked={isConfirmationChecked} onChange={(ev, value) => setIsConfirmationChecked(value)} />}
            label="I understand the wallet will be completely removed and I have all the backups I need."
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} disabled={!isConfirmationChecked} variant="contained" color="secondary">
            Delete Wallet
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
