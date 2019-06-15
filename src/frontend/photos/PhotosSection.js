import React, { useState } from 'react'

import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Stepper,
  Step,
  StepButton,
} from '@material-ui/core'

import 'react-html5-camera-photo/build/css/index.css'
import Camera from 'react-html5-camera-photo'

const steps = [
  'Photo of the animal / Foto del animal',
  'Photo of the location / Foto de la ubicación',
  'Done / Listo',
]

export default ({
  classes,
  photos,
  setPhotos,
}) => {
  const [open, setOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [completed, setCompleted] = useState({})

  const title = (
    'Photo of the animal and/or location/ Foto del animal y/o ubicación'
  )

  const photoCount = Object.values(photos).filter(p => p != null).length

  return (
    <div>
      <Typography variant="h5" className={classes.fieldLabel} paragraph>
        {title}
      </Typography>
      <Button
        className={classes.photoButton}
        color="primary"
        variant="contained"
        size="large"
        onClick={() => setOpen(true)}
      >
        Take Photo / Tomar Foto
      </Button>
      { photoCount > 0 && (
        <Typography variant="body1" className={classes.photoCount}>
          {`(${photoCount} photos recorded / ${photoCount} fotos registradas)`}
        </Typography>
      )}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xl"
        fullWidth
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {title}
        </DialogTitle>
        <DialogContent className={classes.photosDialogContent}>
          <Stepper nonLinear activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepButton
                  onClick={() => setActiveStep(index)}
                  completed={completed[index]}
                >
                  {label}
                </StepButton>
              </Step>
            ))}
          </Stepper>
          {open && activeStep !== 2 && (
            <div className={classes.camera}>
              <Camera
                isFullscreen
                onTakePhoto={(dataUri) => {
                  setPhotos({
                    ...photos,
                    [activeStep]: dataUri
                  })
                  if (activeStep < 2) {
                    setActiveStep(activeStep + 1)
                  }
                }}
              />
            </div>
          )}
          { activeStep === 2 && (
            <div className={classes.photosDone}>
              <Typography variant="h5" paragraph>
                Thank you, the photos have been recorded.
              </Typography>
              <Typography variant="h5" paragraph>
                Gracias, las fotos han sido registradas.
              </Typography>
              <Button
                className={classes.photoButton}
                color="primary"
                variant="contained"
                size="large"
                onClick={() => setOpen(false)}
              >
                Continue
              </Button>
            </div>
          )}
          <div className={classes.photoPreviewRow}>
            { Object.entries(photos).map(([index, photo]) => (
              <div
                key={index}
                className={classes.photoPreview}
                style={{ backgroundImage: photo && `url(${photo}` }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
