import React from 'react'
import { Formik, Form, Field } from 'formik'
import { fetch } from 'whatwg-fetch'

import {
  Button,
  Typography,
} from '@material-ui/core'

import { TextField } from 'formik-material-ui'

import WildlifeReportSchema from '../../lib/WildlifeReportSchema'

import Step2Map from './map/Step2Map'
import useGeoLocation from './map/useGeoLocation'

import PhotosSection from './photos/PhotosSection'

import WildlifeReportFormStyles from './WildlifeReportFormStyles'

const SUBMISSION_URL = (
  (process.env.NODE_ENV === 'development' && 'http://localhost:34567/report')
  || 'https://tender-noether-e25cce.netlify.com/.netlify/functions/report'
)

export default () => {
  const classes = WildlifeReportFormStyles()

  const geoLocation = useGeoLocation()

  const onSubmit = (values, actions) => {
    fetch(SUBMISSION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    }).finally(() => {
      actions.setSubmitting(false)
    })
  }

  return (
    <Formik
      enableReinitialize
      initialValues={{
        coords: geoLocation.coords,
        // animalPhoto: '',
        // locationPhoto: '',
        elecricalPostNumber: '',
        nearestLandmark: '',
        species: '',
        description: '',
        phoneNumber: '',
        fullName: '',
        email: '',
      }}
      validationSchema={WildlifeReportSchema}
      onSubmit={onSubmit}
    >
      {({
        errors,
        // values,
        // isDirty,
        // isValid,
        isSubmitting,
        isValidating,
      }) => (
        <Form className={classes.root}>
          <div className={classes.content}>
            <Typography variant="h5" paragraph>
              Wildlife Electrocution Report
            </Typography>
            <div className={classes.introduction}>
              <Typography variant="body1">
                Español abajo
              </Typography>
              <Typography variant="body1">
                --
              </Typography>
              <Typography variant="body1">
                Thank you for reaching out to us. Here you may file a report for a previous electrocution or an electrocution in progress, in which case we will respond immediately. Please provide us with some information about the animal in need. If you don't hear from us promptly, call 8884-8444.
              </Typography>
              <Typography variant="body1" paragraph>
                --
              </Typography>
              <Typography variant="body1" paragraph>
                Gracias por contactarnos. Por este medio, puedes mandar un reporte de una electrocución previa o una actual, en dicho caso respondaremos inmediatamente. Por favor brindarnos información del animal en necesidad. Si no te contactamos inmediatamente, llama al 8884-8444.
              </Typography>
            </div>
            <Step2Map classes={classes} geoLocation={geoLocation} />
            <PhotosSection classes={classes} />
            <div className={classes.textFieldsSection}>
              <Typography variant="h6" className={classes.textFieldsHeader}>
                Electrocution Details
              </Typography>
              <Field
                name="eletricalPostNumber"
                label="Nearest Electrical Post Number / Número del Poste Eléctrico Mas Cercano"
                component={TextField}
                fullWidth
                margin="normal"
              />
              <Field
                name="nearestLandmark"
                label="Nearest Business or Landmark / Negocio o Algo Llamativo Mas Cercano"
                component={TextField}
                margin="normal"
                fullWidth
              />
              <Field
                name="species"
                label="Animal Species / La espcie Del Animal"
                component={TextField}
                margin="normal"
                fullWidth
              />
              <Field
                name="description"
                label="Description of the event / Descripción del acontacimiento"
                component={TextField}
                margin="normal"
                fullWidth
                multiline
                rows={4}
              />
              <Typography variant="h6" className={classes.textFieldsHeader}>
                Your Details
              </Typography>
              <Field
                name="fullName"
                label="Your Name / Tú Nombre"
                component={TextField}
                margin="normal"
                fullWidth
              />
              <Field
                name="phoneNumber"
                label="Phone Number / Número Telefónico"
                type="phone"
                component={TextField}
                margin="normal"
                fullWidth
              />
              <Field
                name="email"
                label="Email / Correo Electrónico"
                type="email"
                component={TextField}
                margin="normal"
                fullWidth
              />
            </div>
          </div>
          <div className={classes.buttons}>
            <Button
              className={classes.button}
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={
                Object.keys(errors).length > 0 || isSubmitting || isValidating
              }
            >
              Submit
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
