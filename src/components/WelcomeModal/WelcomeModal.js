import { makeStyles, Button, Dialog, DialogContent, DialogActions, Typography, Box } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { LinkTo } from "../../shared/components/LinkTo";
import { Address } from "../../shared/components/Address";
import { useWallet } from "../../context/WalletProvider";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: "1rem"
  },
  subTitle: {
    lineHeight: "1.5rem",
    marginBottom: "1rem"
  },
  ul: {
    "& li": {
      listStyle: "square"
    }
  }
}));

export const WelcomeModal = ({ open, onClose }) => {
  const classes = useStyles();
  const { address } = useWallet();

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogContent className={classes.dialogContent}>
        <Typography variant="h3">
          <strong>Welcome!</strong>
        </Typography>
        <Typography variant="h6" className={classes.subTitle} color="textSecondary">
          You need to get some <LinkTo onClick={() => window.electron.openUrl("https://coinmarketcap.com/currencies/akash-network/")}>$AKT</LinkTo> in order to
          deploy the Akash Network.
        </Typography>
        <Typography variant="caption">Here are some places to acquire some:</Typography>

        <ul className={classes.ul}>
          <li>
            <LinkTo onClick={() => window.electron.openUrl("https://docs.akash.network/token/funding")}>Get free tokens</LinkTo>
          </li>
          <li>
            <LinkTo onClick={() => window.electron.openUrl("https://docs.akash.network/token/buy")}>Buy tokens</LinkTo>
          </li>
          <Box marginTop="1rem">
            <hr />
          </Box>
          <Typography variant="caption">
            <strong>Exchanges</strong>
          </Typography>
          <li>
            <LinkTo onClick={() => window.electron.openUrl("https://app.osmosis.zone/")}>Osmosis (DEX)</LinkTo>
          </li>
          <li>
            <LinkTo onClick={() => window.electron.openUrl("https://emeris.com/")}>Emeris (DEX)</LinkTo>
          </li>
          <li>
            <LinkTo onClick={() => window.electron.openUrl("https://dex.sifchain.finance/")}>Sifchain (DEX)</LinkTo>
          </li>
          <li>
            <LinkTo onClick={() => window.electron.openUrl("https://www.kraken.com/")}>Kraken (CEX)</LinkTo>
          </li>
          <li>
            <LinkTo onClick={() => window.electron.openUrl("https://ascendex.com/")}>Ascendex (CEX)</LinkTo>
          </li>
          <li>
            <LinkTo onClick={() => window.electron.openUrl("https://global.bittrex.com/")}>Bittrex (CEX)</LinkTo>
          </li>
          <li>
            <LinkTo onClick={() => window.electron.openUrl("https://www.bitmart.com/")}>Bitmart (CEX)</LinkTo>
          </li>
          <li>
            <LinkTo onClick={() => window.electron.openUrl("https://www.digifinex.com/")}>Digifinex (CEX)</LinkTo>
          </li>
          <li>
            <LinkTo onClick={() => window.electron.openUrl("https://www.bitglobal.com/")}>Bitglobal (CEX)</LinkTo>
          </li>
        </ul>

        <Box marginBottom=".5rem">
          <Typography variant="caption">Once you have $AKT, you can send it to your address:</Typography>
        </Box>

        <Alert icon={false} variant="outlined">
          <Address address={address} isCopyable />
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose} type="button" color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};
