import { makeStyles, ListSubheader, Radio, List, ListItemText, ListItemIcon, ListItem } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper
  }
}));

export function BidGroup(props) {
  const classes = useStyles();

  const { bids, gseq, selectedBid, handleBidSelected } = props;

  return (
    <List className={classes.root} subheader={<ListSubheader component="div">GSEQ: {gseq}</ListSubheader>}>
      {bids.map((bid) => (
        <ListItem disabled={bid.state !== "open"} key={bid.id} dense button onClick={() => handleBidSelected(bid)}>
          <ListItemIcon>
            <Radio
              checked={selectedBid?.id === bid.id}
              //onChange={handleChange}
              value={bid.id}
              name="radio-button-demo"
            />
          </ListItemIcon>
          <ListItemText
            id={`checkbox-list-label-${bid.id}`}
            primary={
              <>
                {bid.price.amount} uakt / block ({bid.state})
              </>
            }
            secondary={bid.provider}
          />
        </ListItem>
      ))}
    </List>
  );
}
