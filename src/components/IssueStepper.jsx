import React from "react";
import { Stepper, Step, StepLabel } from "@mui/material";

const steps = ["Pending", "Dept Assigned", "In Progress", "Completed"];

export default function IssueStepper({ stage }) {
  return (
    <Stepper activeStep={stage} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
