import React from 'react'
import { Field } from 'formik'

import {
  Typography,
  Button,
} from '@material-ui/core'

import FormikGeoLocation from './FormikGeoLocation'

export default ({
  classes,
  geoLocation,
}) => (
  <div>
    <Typography variant="h6" className={classes.fieldLabel} paragraph>
      Where is the animal located? / ¿Por dónde se encuentra el animal?
    </Typography>
    { geoLocation.loading && (
      <div className={classes.mapPlaceholder}>
        <Typography variant="h5" component="div" paragraph>
          Please allow location access for us to locate where the animal is.
        </Typography>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          onClick={geoLocation.requestLocation}
        >
          Allow Location Access
        </Button>
      </div>
    )}
    { geoLocation.loading === false && (
      <div className={classes.map}>
        <Field
          name="coords"
          component={FormikGeoLocation}
        />
      </div>
    )}
  </div>
)
