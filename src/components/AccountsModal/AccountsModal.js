import { makeStyles, Button, Dialog, DialogContent, DialogActions, DialogTitle, List, ListItem, ListItemIcon, ListItemText, Box } from "@material-ui/core";
import { useStorageWallets, updateStorageWallets } from "../../shared/utils/walletUtils";
import { useWallet } from "../../context/WalletProvider";
import CheckIcon from "@material-ui/icons/Check";
import { UrlService } from "../../shared/utils/urlUtils";
import { useHistory } from "react-router-dom";
import { useCertificate } from "../../context/CertificateProvider";

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dialogContent: {
    padding: "0 .5rem"
  },
  dialogActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  }
}));

export const AccountsModal = ({ onClose }) => {
  const classes = useStyles();
  const { address, setSelectedWallet, wallets, setWallets } = useWallet();
  const { localCerts, setLocalCert, setValidCertificates, setSelectedCertificate } = useCertificate();
  const { wallets: storageWallets } = useStorageWallets();
  const history = useHistory();

  const handleSelectAccount = (wallet) => {
    if (wallet.address !== address) {
      const newWallet = wallets.find((w) => w.address === wallet.address);

      // Update memory wallets
      for (let i = 0; i < wallets.length; i++) {
        wallets[i].selected = wallets[i].address === wallet.address;
      }

      // Update storage wallets
      const newStorageWallets = storageWallets.map((w) => ({ ...w, selected: w.address === wallet.address }));
      const localCert = localCerts.find((c) => c.address === wallet.address);

      updateStorageWallets(newStorageWallets);
      setWallets(wallets);
      setSelectedWallet(newWallet);
      setValidCertificates([]);
      setSelectedCertificate(null);

      if (localCert) {
        setLocalCert(localCert);
      }

      onClose();

      history.replace(UrlService.dashboard());
    }
  };

  const handleAddAccount = () => {
    history.push(UrlService.register(true));
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <span className={classes.dialogTitle}>
          Accounts
          <Button variant="contained" size="small" color="primary" onClick={handleAddAccount}>
            Add account
          </Button>
        </span>
      </DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <List className={classes.list}>
          {storageWallets.map((wallet) => {
            return (
              <ListItem key={wallet.address} dense button onClick={() => handleSelectAccount(wallet)}>
                <ListItemIcon>{wallet.address === address && <CheckIcon color="primary" />}</ListItemIcon>
                <ListItemText
                  classes={{ secondary: classes.secondaryText }}
                  primary={
                    <Box display="flex" alignItems="center" justifyContent="space-between" fontSize="1rem">
                      {wallet.name}
                    </Box>
                  }
                  secondary={wallet.address}
                />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} type="button" autoFocus variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
