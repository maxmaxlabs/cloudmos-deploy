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

export const ServiceSelect = ({ defaultValue, services, onSelectedChange }) => {
  const classes = useStyles();
  const [selected, setSelected] = useState(defaultValue);

  const handleChange = (event) => {
    const value = event.target.value;

    setSelected(value);
    onSelectedChange(value);
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="service-select-label" className={classes.selectLabel}>
        Services
      </InputLabel>
      <Select
        labelId="service-select-label"
        value={selected}
        onChange={handleChange}
        variant="outlined"
        classes={{
          selectMenu: classes.menuRoot
        }}
      >
        {services.map((service) => (
          <MenuItem key={service} value={service} size="small">
            <Typography variant="caption">{service}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
