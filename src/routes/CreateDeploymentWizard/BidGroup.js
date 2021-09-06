import { makeStyles, ListSubheader, Radio, List, ListItemText, ListItemIcon, ListItem, Box, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper
  },
  secondaryText: {
    fontSize: ".8rem"
  },
  attributesContainer: {
    flexBasis: "45%",
    margin: "2px 0",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: ".5rem",
    padding: ".5rem"
  },
  attributeTitle: {
    marginBottom: "2px"
  },
  attributeRow: {
    display: "flex",
    alignItems: "center",
    lineHeight: "1rem"
  },
  attributeText: {
    lineHeight: "1rem",
    letterSpacing: 0
  }
}));

export function BidGroup({ bids, gseq, selectedBid, handleBidSelected, disabled, providers }) {
  const classes = useStyles();

  return (
    <List className={classes.root} subheader={<ListSubheader component="div">GSEQ: {gseq}</ListSubheader>}>
      {bids.map((bid) => {
        const provider = providers && providers.find((x) => x.owner === bid.provider);
        return (
          <ListItem disabled={bid.state !== "open"} key={bid.id} dense button onClick={() => handleBidSelected(bid)}>
            <ListItemIcon>
              <Radio
                checked={selectedBid?.id === bid.id}
                //onChange={handleChange}
                value={bid.id}
                name="radio-button-demo"
                disabled={disabled}
              />
            </ListItemIcon>
            <ListItemText
              id={`checkbox-list-label-${bid.id}`}
              classes={{ secondary: classes.secondaryText }}
              primary={
                <>
                  {bid.price.amount} uakt / block ({bid.state})
                </>
              }
              secondary={bid.provider}
            />

            {provider && (
              <Box className={classes.attributesContainer}>
                <Typography variant="body2" className={classes.attributeTitle}>
                  <strong>Attributes</strong>
                </Typography>
                {provider.attributes.map((a) => (
                  <Box className={classes.attributeRow} key={a.key}>
                    <Box>
                      <Typography variant="caption" className={classes.attributeText}>
                        {a.key}:
                      </Typography>
                    </Box>
                    <Box marginLeft="1rem">
                      <Typography variant="caption" className={classes.attributeText}>
                        {a.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </ListItem>
        );
      })}
    </List>
  );
}
