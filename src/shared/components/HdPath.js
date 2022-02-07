import { makeStyles, Box, Button, FormLabel, TextField, Typography } from "@material-ui/core";
import { useState } from "react";

const useStyles = makeStyles((theme) => ({
  root: {},
  label: {
    display: "block",
    marginBottom: ".5rem"
  },
  inputRoot: {
    width: "100px",
    margin: "0 4px"
  },
  input: {
    textAlign: "right"
  }
}));

export const HdPath = ({ onChange }) => {
  const [isShowingAdvanced, setIsShowingAdvanced] = useState(false);
  const [account, setAccount] = useState(0);
  const [change, setChange] = useState(0);
  const [addressIndex, setAddressIndex] = useState(0);
  const classes = useStyles();

  const onAdvancedClick = () => {
    setIsShowingAdvanced((prev) => {
      const newVal = !prev;

      // Reset values on close
      if (!newVal) {
        setAccount(0);
        setChange(0);
        setAddressIndex(0);
        onChange(0, 0, 0);
      }

      return newVal;
    });
  };

  return (
    <div className={classes.root}>
      <Box textAlign="center" marginBottom="1rem">
        <Button onClick={onAdvancedClick} size="small" color="primary">
          Advanced
        </Button>
      </Box>

      {isShowingAdvanced && (
        <Box>
          <FormLabel>HD Derivation Path</FormLabel>
          <Box display="flex" alignItems="baseline">
            <div>
              <Typography variant="body2">m/44'/···'/</Typography>
            </div>
            <TextField
              value={account}
              onChange={(ev) => {
                const _value = ev.target.value;
                setAccount(_value);
                onChange(_value, change, addressIndex);
              }}
              type="number"
              variant="outlined"
              classes={{ root: classes.inputRoot }}
              InputProps={{
                classes: { input: classes.input }
              }}
              inputProps={{
                min: 0,
                step: 1
              }}
              size="medium"
            />
            <div>
              <Typography variant="body2">'/</Typography>
            </div>
            <TextField
              value={change}
              onChange={(ev) => {
                const _value = ev.target.value;
                setChange(_value);
                onChange(account, _value, addressIndex);
              }}
              type="number"
              variant="outlined"
              classes={{ root: classes.inputRoot }}
              InputProps={{
                classes: { input: classes.input }
              }}
              inputProps={{
                min: 0,
                max: 1,
                step: 1
              }}
              size="medium"
            />
            <div>
              <Typography variant="body2">/</Typography>
            </div>
            <TextField
              value={addressIndex}
              onChange={(ev) => {
                const _value = ev.target.value;
                setAddressIndex(_value);
                onChange(account, change, _value);
              }}
              type="number"
              variant="outlined"
              classes={{ root: classes.inputRoot }}
              InputProps={{
                classes: { input: classes.input }
              }}
              inputProps={{
                min: 0,
                step: 1
              }}
              size="medium"
            />
          </Box>
        </Box>
      )}
    </div>
  );
};
