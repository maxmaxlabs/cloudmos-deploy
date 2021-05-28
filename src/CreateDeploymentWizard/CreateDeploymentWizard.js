import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Box
} from "@material-ui/core";
import { TemplateList } from "./TemplateList";
import { ManifestEdit } from "./ManifestEdit";
import { useHistory } from "react-router";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    marginRight: theme.spacing(1),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  completed: {
    display: 'inline-block',
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export function CreateDeploymentWizard(props) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedManifest, setEditedManifest] = useState(null);

  const history = useHistory();
  const steps = getSteps();

  useEffect(() => {
    setEditedManifest(selectedTemplate?.content);
  }, [selectedTemplate])

  const totalSteps = () => {
    return getSteps().length;
  };

  const completedSteps = () => {
    return completed.size;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = new Set(completed);
    newCompleted.add(activeStep);
    setCompleted(newCompleted);

    if (completed.size !== totalSteps()) {
      handleNext();
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted(new Set());
  };

  function isStepComplete(step) {
    return completed.has(step);
  }

  function handleBackClick() {
    history.push("/");
  }

  return (
    <>
      <Card variant="outlined">
        <CardHeader title={<>
          <IconButton aria-label="back" onClick={handleBackClick}>
            <ChevronLeftIcon />
          </IconButton>
          Create a new deployment
         </>} />
        <CardContent>
          <div className={classes.root}>
            <Stepper alternativeLabel activeStep={activeStep}>
              {steps.map((label, index) => {
                const stepProps = {};
                const buttonProps = {};
                return (
                  <Step key={label} {...stepProps}>
                    <StepButton
                      onClick={handleStep(index)}
                      completed={isStepComplete(index)}
                      {...buttonProps}
                    >
                      {label}
                    </StepButton>
                  </Step>
                );
              })}
            </Stepper>
            <div>
              {activeStep === 0 && <TemplateList setIsNextDisabled={setIsNextDisabled} selectedTemplate={selectedTemplate} setSelectedTemplate={c => setSelectedTemplate(c)} />}
              {activeStep === 1 && <ManifestEdit setIsNextDisabled={setIsNextDisabled} editedManifest={editedManifest} setEditedManifest={setEditedManifest} />}
              {allStepsCompleted() ? (
                <div>
                  <Typography className={classes.instructions}>
                    All steps completed - you&apos;re finished
            </Typography>
                  <Button onClick={handleReset}>Reset</Button>
                </div>
              ) : (
                <div>
                  <Box pt={2}>
                    {activeStep > 0 && (
                      <Button onClick={handleBack} className={classes.button}>
                        Back
                      </Button>
                    )}
                    {activeStep !== steps.length && (
                      <Button variant="contained" color="primary" disabled={isNextDisabled} onClick={handleComplete}>
                        {completedSteps() === totalSteps() - 1 ? 'Finish' : 'Next'}
                      </Button>
                    )}
                  </Box>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function getSteps() {
  return ['Choose Template', 'Create Deployment', 'Create a Lease'];
}