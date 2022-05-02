import { useState } from "react";
import { makeStyles, Box, Grid } from "@material-ui/core";
import { useHistory } from "react-router";
import { Address } from "../../shared/components/Address";
import { ProviderDetail } from "../../components/ProviderDetail/ProviderDetail";
import { LinkTo } from "../../shared/components/LinkTo";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import StarIcon from "@material-ui/icons/Star";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    padding: ".5rem",
    cursor: "pointer",
    backgroundColor: theme.palette.grey[200],
    borderRadius: ".5rem",
    transition: "background-color .2s ease",
    "&:hover": {
      backgroundColor: theme.palette.grey[300]
    }
  }
}));

export function ProviderCard({ provider }) {
  const classes = useStyles();
  const history = useHistory();
  const [isViewingDetail, setIsViewingDetail] = useState(false);

  return (
    <Grid item xs={6} sm={6} md={4}>
      <div className={classes.root}>
        <Box display="flex">
          <Box flexBasis="25%" fontWeight="bold">
            <Box>Owner</Box>
            <Box>Uri</Box>
          </Box>
          <Box flexBasis="75%" className="text-truncate">
            <Box>
              <Address address={provider.owner} isCopyable />
            </Box>
            <Box className="text-truncate">{provider.host_uri}</Box>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box></Box>

          <Box>
            <LinkTo onClick={() => setIsViewingDetail(true)}>View details</LinkTo>
          </Box>
        </Box>
      </div>

      {/* {isViewingDetail && providerStatus && <ProviderDetail provider={providerStatus} address={bid.provider} onClose={() => setIsViewingDetail(false)} />} */}
    </Grid>
  );
}
