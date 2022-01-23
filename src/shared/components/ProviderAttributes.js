import { Box, Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  attributesContainer: {
    flexBasis: "45%",
    margin: "2px 0",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: "1rem",
    padding: ".5rem 1rem"
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

export const ProviderAttributes = ({ provider }) => {
  const classes = useStyles();

  return (
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
  );
};
