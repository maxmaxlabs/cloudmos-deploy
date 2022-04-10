import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: "150px",
    width: "auto"
  },
  menuRoot: {
    paddingTop: "17px",
    paddingBottom: "2px"
  },
  selectLabel: {
    top: "2px",
    left: "4px"
  }
}));

export const LeaseSelect = ({ defaultValue, leases, onSelectedChange }) => {
  const classes = useStyles();
  const [selected, setSelected] = useState(defaultValue);

  const handleChange = (event) => {
    const value = event.target.value;

    setSelected(value);
    onSelectedChange(value);
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="lease-select-label" className={classes.selectLabel}>
        Lease
      </InputLabel>
      <Select
        labelId="lease-select-label"
        value={selected}
        onChange={handleChange}
        variant="outlined"
        classes={{
          selectMenu: classes.menuRoot
        }}
      >
        {leases.map((l) => (
          <MenuItem key={l.id} value={l.id} size="small">
            <Typography variant="caption">GSEQ: {l.gseq}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
