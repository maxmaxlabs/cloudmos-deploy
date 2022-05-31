import { useEffect, useState } from "react";
import { makeStyles, Box, CircularProgress, Menu, Typography, Button } from "@material-ui/core";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import RefreshIcon from "@material-ui/icons/Refresh";
import IconButton from "@material-ui/core/IconButton";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import SendIcon from "@material-ui/icons/Send";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import KeyIcon from "@material-ui/icons/VpnKey";
import EditIcon from "@material-ui/icons/Edit";
import { useWallet } from "../../context/WalletProvider";
import { useSettings } from "../../context/SettingsProvider";
import { DeleteWalletConfirm } from "../../shared/components/DeleteWalletConfirm";
import { useHistory } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { Address } from "../../shared/components/Address";
import { SendModal } from "../SendModal";
import { useTransactionModal } from "../../context/TransactionModal";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import { DepositModal } from "../DepositModal";
import { uaktToAKT } from "../../shared/utils/priceUtils";
import { PriceValue } from "../../shared/components/PriceValue";
import { usePasswordConfirmationModal } from "../../context/ConfirmPasswordModal";
import { MnemonicModal } from "./MnemonicModal";
import { ChangeAccountNameModal } from "./ChangeAccountNameModal";
import { accountBarHeight } from "../../shared/constants";
import { CustomMenuItem } from "../../shared/components/CustomMenuItem";
import { GrantModal } from "../GrantModal";
import { AccountsModal } from "../AccountsModal";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

const useStyles = makeStyles((theme) => ({
  root: {
    maxHeight: `${accountBarHeight}px`
  },
  walletButton: {
    padding: "2px 4px",
    textTransform: "initial"
  },
  delete: {
    color: theme.palette.secondary.main
  }
}));

export function WalletDisplay() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isShowingConfirmationModal, setIsShowingConfirmationModal] = useState(false);
  const [isShowingSendModal, setIsShowingSendModal] = useState(false);
  const [isShowingGrantModal, setIsShowingGrantModal] = useState(false);
  const [isShowingDepositModal, setIsShowingDepositModal] = useState(false);
  const [isShowingMnemonicModal, setIsShowingMnemonicModal] = useState(false);
  const [isShowinChangeAccountNameModal, setIsShowingChangeAccountNameModal] = useState(false);
  const [isShowingAccountsModal, setIsShowingAccountsModal] = useState(false);
  const { address, balance, refreshBalance, isRefreshingBalance, deleteWallet, selectedWallet, setSelectedWallet } = useWallet();
  const { sendTransaction } = useTransactionModal();
  const classes = useStyles();
  const { settings } = useSettings();
  const history = useHistory();
  const { apiEndpoint } = settings;
  const { askForPasswordConfirmation } = usePasswordConfirmationModal();

  useEffect(() => {
    refreshBalance();
  }, [apiEndpoint, refreshBalance]);

  function onDeleteAccountClick() {
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
  }

  const onSendClick = () => {
    handleCloseMenu();
    setIsShowingSendModal(true);
  };

  const onDepositClick = () => {
    handleCloseMenu();
    setIsShowingDepositModal(true);
  };

  const onSignOutClick = () => {
    setSelectedWallet(null);
    history.replace(UrlService.walletOpen());
  };

  const onViewMnemonic = async () => {
    handleCloseMenu();

    const password = await askForPasswordConfirmation();
    if (!password) {
      return;
    }

    setIsShowingMnemonicModal(true);
  };

  const onChangeAccountName = () => {
    handleCloseMenu();
    setIsShowingChangeAccountNameModal(true);
  };

  const onAuthorizeSpendingClick = () => {
    handleCloseMenu();
    setIsShowingGrantModal(true);
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
      <div className={classes.root}>
        <Box display="flex" alignItems="center">
          <Button onClick={() => setIsShowingAccountsModal(true)} size="small" className={classes.walletButton}>
            {selectedWallet?.name && (
              <Box marginRight=".5rem">
                <Typography variant="caption">
                  <strong>{selectedWallet?.name}</strong>
                </Typography>
              </Box>
            )}
            <AccountBalanceWalletIcon fontSize="small" />
            <Box component="span" marginLeft=".5rem" marginRight="2px">
              {balance / 1000000} AKT
            </Box>
            <ArrowDropDownIcon fontSize="small" color="inherit" />
          </Button>

          <Box marginLeft="1rem">
            <IconButton onClick={() => refreshBalance(true)} aria-label="refresh" disabled={isRefreshingBalance} size="small">
              {isRefreshingBalance ? <CircularProgress size="1.5rem" /> : <RefreshIcon />}
            </IconButton>
          </Box>
          <Box marginLeft=".2rem">
            <IconButton aria-label="settings" onClick={handleMenuClick} size="small">
              <MoreHorizIcon />
            </IconButton>
          </Box>
        </Box>

        <Box display="flex" alignItems="center">
          <Box marginRight=".5rem" fontWeight="bold">
            <Typography variant="caption">
              Balance:{" "}
              <strong>
                <PriceValue value={uaktToAKT(balance, 6)} />
              </strong>
            </Typography>
          </Box>
          <Box marginLeft="1rem">
            <Typography variant="caption" color="textSecondary">
              <Address address={address} isCopyable />
            </Typography>
          </Box>
        </Box>
      </div>

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
        <CustomMenuItem onClick={() => onSendClick()} icon={<SendIcon fontSize="small" />} text="Send" />
        <CustomMenuItem onClick={() => onDepositClick()} icon={<MoveToInboxIcon fontSize="small" />} text="Deposit" />
        <CustomMenuItem onClick={() => onAuthorizeSpendingClick()} icon={<AccountBalanceIcon fontSize="small" />} text="Authorize Spending" />
        <CustomMenuItem onClick={() => onViewMnemonic()} icon={<KeyIcon fontSize="small" />} text="View Mnemonic" />
        <CustomMenuItem onClick={() => onChangeAccountName()} icon={<EditIcon fontSize="small" />} text="Change Account Name" />
        <CustomMenuItem onClick={() => onSignOutClick()} icon={<ExitToAppIcon fontSize="small" />} text="Sign Out" />
        <CustomMenuItem onClick={() => onDeleteAccountClick()} icon={<DeleteForeverIcon fontSize="small" />} text="Delete Account" className={classes.delete} />
      </Menu>

      <DeleteWalletConfirm
        isOpen={isShowingConfirmationModal}
        address={address}
        balance={balance}
        handleCancel={() => setIsShowingConfirmationModal(false)}
        handleConfirmDelete={handleConfirmDelete}
      />
      {isShowingSendModal && <SendModal onClose={() => setIsShowingSendModal(false)} onSendTransaction={onSendTransaction} />}
      {isShowingDepositModal && address && <DepositModal address={address} onClose={() => setIsShowingDepositModal(false)} />}
      {isShowingMnemonicModal && <MnemonicModal onClose={() => setIsShowingMnemonicModal(false)} />}
      {isShowinChangeAccountNameModal && <ChangeAccountNameModal onClose={() => setIsShowingChangeAccountNameModal(false)} />}
      {isShowingGrantModal && <GrantModal address={address} onClose={() => setIsShowingGrantModal(false)} />}
      {isShowingAccountsModal && <AccountsModal onClose={() => setIsShowingAccountsModal(false)} />}
    </>
  );
}
