import * as React from "react";
import PropTypes from "prop-types";
import { Stepper, Step, StepLabel, withStyles, makeStyles } from "@material-ui/core";
import Check from "@material-ui/icons/Check";
import StepConnector from "@material-ui/core/StepConnector";
import clsx from "clsx";

const QontoConnector = withStyles((theme) => ({
  alternativeLabel: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)"
  },
  active: {
    "& $line": {
      borderColor: theme.palette.primary.main
    }
  },
  completed: {
    "& $line": {
      borderColor: theme.palette.primary.main
    }
  },
  line: {
    borderColor: "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1
  }
}))(StepConnector);

const useQontoStepIconStyles = makeStyles((theme) => ({
  root: {
    color: "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center"
  },
  active: {
    color: theme.palette.primary.main
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor"
  },
  completed: {
    color: theme.palette.primary.main,
    zIndex: 1,
    fontSize: 18
  }
}));

function QontoStepIcon(props) {
  const classes = useQontoStepIconStyles();
  const { active, completed } = props;

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active
      })}
    >
      {completed ? <Check className={classes.completed} /> : <div className={classes.circle} />}
    </div>
  );
}

QontoStepIcon.propTypes = {
  /**
   * Whether this step is active.
   */
  active: PropTypes.bool,
  /**
   * Mark the step as completed. Is passed to child components.
   */
  completed: PropTypes.bool
};

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem 0 1.5rem"
  },
  label: {
    "&&": {
      fontWeight: "normal",
      marginTop: ".5rem"
    }
  },
  labelCompleted: {
    "&&": {
      color: theme.palette.text.secondary
    }
  },
  labelActive: {
    "&&": {
      fontWeight: "bold"
    }
  }
}));

export function CustomizedSteppers({ steps, activeStep }) {
  const classes = useStyles();
  return (
    <Stepper alternativeLabel activeStep={activeStep} connector={<QontoConnector />} classes={{ root: classes.root }}>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel StepIconComponent={QontoStepIcon} classes={{ label: classes.label, completed: classes.labelCompleted, active: classes.labelActive }}>
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
