import React, { useState } from 'react'

import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core'

import PhotosDialogContent from './PhotosDialogContent'

export default ({
  classes,
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Typography variant="h6" className={classes.fieldLabel} paragraph>
        Photo of the animal and/or location/ Foto del animal y/o ubicación
      </Typography>
      <Button
        className={classes.photoButton}
        variant="contained"
        color="primary"
        size="large"
        onClick={() => setOpen(true)}
      >
        Take Photo
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Photo of the animal and/or location/ Foto del animal y/o ubicación
        </DialogTitle>
        <DialogContent>
          {open && (
            <PhotosDialogContent classes={classes} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary" autoFocus>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
