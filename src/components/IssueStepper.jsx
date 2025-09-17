import { Step, StepLabel, Stepper } from "@mui/material";

const steps=["Acknowledged","Dept Assigned","In Progress","Completed"];

export default function IssueStepper({stage}){
  return(
    <Stepper activeStep={stage} alternativeLabel>
      {steps.map(label=>(
        <Step key={label}><StepLabel>{label}</StepLabel></Step>
      ))}
    </Stepper>
  );
}
