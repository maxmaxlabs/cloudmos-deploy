import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import InputLabel from "@material-ui/core/InputLabel";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  },
  getContentAnchorEl: null,
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "center"
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "center"
  },
  variant: "menu"
};

const useStyles = makeStyles((theme) => ({
  formControl: {
    minWidth: "150px",
    width: "auto"
  },
  indeterminateColor: {
    color: "#f50057"
  },
  selectAllText: {
    fontWeight: 500
  },
  selectedAll: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.08)"
    }
  },
  menuRoot: {
    paddingTop: "17px",
    paddingBottom: "2px"
  },
  selectLabel: {
    top: "2px",
    left: "4px",
    transform: "translate(0, 1.5px) scale(0.75)",
    transformOrigin: "top left"
  },
  checkboxRoot: {
    padding: "4px"
  }
}));

export const SelectCheckbox = ({ defaultValue, options, onSelectedChange, label, disabled }) => {
  const classes = useStyles();
  const [selected, setSelected] = useState(defaultValue);
  const isAllSelected = options.length > 0 && selected.length === options.length;

  const handleChange = (event) => {
    const value = event.target.value;
    let newValue = value;
    if (value[value.length - 1] === "all") {
      newValue = selected.length === options.length ? [] : options;
    }

    setSelected(newValue);
    onSelectedChange(newValue);
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id="mutiple-select-label" className={classes.selectLabel}>
        {label}
      </InputLabel>
      <Select
        labelId="mutiple-select-label"
        multiple
        value={selected}
        onChange={handleChange}
        renderValue={(selected) => selected.join(", ")}
        MenuProps={MenuProps}
        disabled={disabled}
        variant="outlined"
        classes={{
          selectMenu: classes.menuRoot
        }}
      >
        <MenuItem
          value="all"
          classes={{
            root: isAllSelected ? classes.selectedAll : ""
          }}
        >
          <ListItemIcon>
            <Checkbox
              classes={{ root: classes.checkboxRoot, indeterminate: classes.indeterminateColor }}
              checked={isAllSelected}
              indeterminate={selected.length > 0 && selected.length < options.length}
              size="small"
            />
          </ListItemIcon>
          <ListItemText classes={{ primary: classes.selectAllText }} primary="Select All" />
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            <ListItemIcon>
              <Checkbox checked={selected.indexOf(option) > -1} size="small" classes={{ root: classes.checkboxRoot }} />
            </ListItemIcon>
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
