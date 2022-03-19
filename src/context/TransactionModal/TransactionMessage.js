import { ListItem, ListItemAvatar, Avatar, ListItemText, makeStyles } from "@material-ui/core";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import PowerOffIcon from "@material-ui/icons/PowerOff";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import PublishIcon from "@material-ui/icons/Publish";
import ReceiptIcon from "@material-ui/icons/Receipt";
import CancelIcon from "@material-ui/icons/Cancel";
import AddBoxIcon from "@material-ui/icons/AddBox";
import SendIcon from "@material-ui/icons/Send";
import { uaktToAKT } from "../../shared/utils/priceUtils";
import { FormattedDate, FormattedTime } from "react-intl";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: ".5rem",
    paddingBottom: ".5rem",
    borderBottom: "1px solid rgba(0,0,0,0.2)",
    wordBreak: "break-word",
    overflowWrap: "break-word"
  },
  avatarRoot: {
    height: "2rem",
    width: "2rem"
  },
  avatarIcon: {
    fontSize: "1rem"
  },
  listItemPrimaryText: {
    fontWeight: "bold"
  }
}));

export const TransactionMessage = ({ message }) => {
  const classes = useStyles();
  const mgs = getMessage(message, classes);

  return <ListItem classes={{ root: classes.root }}>{mgs}</ListItem>;
};

const getMessage = (message, classes) => {
  switch (message.typeUrl) {
    case TransactionMessageData.Types.MSG_CLOSE_DEPLOYMENT:
      return (
        <>
          <ListItemAvatar>
            <Avatar classes={{ root: classes.avatarRoot }}>
              <PowerOffIcon classes={{ root: classes.avatarIcon }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Close Deployment"
            secondary={`Close deployment with dseq: ${message.value.id.dseq}`}
            classes={{ primary: classes.listItemPrimaryText }}
          />
        </>
      );
    case TransactionMessageData.Types.MSG_CREATE_CERTIFICATE:
      return (
        <>
          <ListItemAvatar>
            <Avatar classes={{ root: classes.avatarRoot }}>
              <VerifiedUserIcon classes={{ root: classes.avatarIcon }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Create Certificate" classes={{ primary: classes.listItemPrimaryText }} />
        </>
      );
    case TransactionMessageData.Types.MSG_CREATE_DEPLOYMENT:
      return (
        <>
          <ListItemAvatar>
            <Avatar classes={{ root: classes.avatarRoot }}>
              <PublishIcon classes={{ root: classes.avatarIcon }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Create Deployment"
            secondary={
              <>
                New deployment with dseq <strong>{message.value.id.dseq}</strong> and a deposit of <strong>{uaktToAKT(message.value.deposit.amount)}AKT</strong>
              </>
            }
            classes={{ primary: classes.listItemPrimaryText }}
          />
        </>
      );
    case TransactionMessageData.Types.MSG_UPDATE_DEPLOYMENT:
      return (
        <>
          <ListItemAvatar>
            <Avatar classes={{ root: classes.avatarRoot }}>
              <PublishIcon classes={{ root: classes.avatarIcon }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Update Deployment"
            secondary={
              <>
                Update deployment with dseq <strong>{message.value.id.dseq}</strong>
              </>
            }
            classes={{ primary: classes.listItemPrimaryText }}
          />
        </>
      );
    case TransactionMessageData.Types.MSG_DEPOSIT_DEPLOYMENT:
      return (
        <>
          <ListItemAvatar>
            <Avatar classes={{ root: classes.avatarRoot }}>
              <AddBoxIcon classes={{ root: classes.avatarIcon }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Deposit Deployment"
            secondary={
              <>
                Add funds of <strong>{uaktToAKT(message.value.amount.amount)}AKT</strong> to deployment with dseq <strong>{message.value.id.dseq}</strong>
              </>
            }
            classes={{ primary: classes.listItemPrimaryText }}
          />
        </>
      );
    case TransactionMessageData.Types.MSG_CREATE_LEASE:
      return (
        <>
          <ListItemAvatar>
            <Avatar classes={{ root: classes.avatarRoot }}>
              <ReceiptIcon classes={{ root: classes.avatarIcon }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Create Lease"
            secondary={
              <>
                New Lease with provider <strong>{message.value.bid_id.provider}</strong>, dseq: <strong>{message.value.bid_id.dseq}</strong>, gseq:{" "}
                <strong>{message.value.bid_id.gseq}</strong>, oseq: <strong>{message.value.bid_id.oseq}</strong>.
              </>
            }
            classes={{ primary: classes.listItemPrimaryText }}
          />
        </>
      );
    case TransactionMessageData.Types.MSG_REVOKE_CERTIFICATE:
      return (
        <>
          <ListItemAvatar>
            <Avatar classes={{ root: classes.avatarRoot }}>
              <CancelIcon classes={{ root: classes.avatarIcon }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Revoke Certificate" secondary={`Serial: ${message.value.id.serial}`} classes={{ primary: classes.listItemPrimaryText }} />
        </>
      );
    case TransactionMessageData.Types.MSG_SEND_TOKENS:
      return (
        <>
          <ListItemAvatar>
            <Avatar classes={{ root: classes.avatarRoot }}>
              <SendIcon classes={{ root: classes.avatarIcon }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Send"
            secondary={
              <>
                <strong>{message.value.toAddress}</strong> will receive <strong>{uaktToAKT(message.value.amount[0].amount, 6)}AKT</strong>
              </>
            }
            classes={{ primary: classes.listItemPrimaryText }}
          />
        </>
      );
    case TransactionMessageData.Types.MSG_GRANT:
      return (
        <>
          <ListItemAvatar>
            <Avatar classes={{ root: classes.avatarRoot }}>
              <AccountBalanceIcon classes={{ root: classes.avatarIcon }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary="Authorize Spend"
            secondary={
              <>
                <strong>{message.value.grantee}</strong> will be able to spend up to{" "}
                <strong>{uaktToAKT(message.value.grant.authorization.value.spend_limit.amount, 6)}AKT</strong> on your behalf. Expires:{" "}
                <FormattedDate value={new Date(message.value.grant.expiration.seconds * 1_000)} />
                &nbsp;
                <FormattedTime value={new Date(message.value.grant.expiration.seconds * 1_000)} />.
              </>
            }
            classes={{ primary: classes.listItemPrimaryText }}
          />
        </>
      );

    default:
      return null;
  }
};
