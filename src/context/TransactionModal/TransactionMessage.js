import { ListItem, ListItemAvatar, Avatar, ListItemText, makeStyles } from "@material-ui/core";
import { TransactionMessageData } from "../../shared/utils/TransactionMessageData";
import PowerOffIcon from "@material-ui/icons/PowerOff";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import PublishIcon from "@material-ui/icons/Publish";
import StorageIcon from "@material-ui/icons/Storage";
import CancelIcon from "@material-ui/icons/Cancel";
import { uaktToAKT } from "../../shared/utils/priceUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: ".5rem",
    paddingBottom: ".5rem",
    borderBottom: "1px solid rgba(0,0,0,0.2)"
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
                New deployment with id <strong>{message.value.id.owner}</strong> and a deposit of <strong>{uaktToAKT(message.value.deposit.amount)}AKT</strong>
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
              <StorageIcon classes={{ root: classes.avatarIcon }} />
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
          <ListItemText primary="Revoke Certificate" classes={{ primary: classes.listItemPrimaryText }} />
        </>
      );

    default:
      return null;
  }
};
