import React, { useState, useCallback } from 'react'
import { Formik, Form, Field } from 'formik'
import { fetch } from 'whatwg-fetch'

import {
  Button,
  Typography,
} from '@material-ui/core'

import { TextField } from 'formik-material-ui'

import WildlifeReportSchema from '../common/WildlifeReportSchema'

import Step2Map from './map/Step2Map'
import useGeoLocation from './map/useGeoLocation'

import PhotosSection from './photos/PhotosSection'

import wildSunLogo from './wild-sun-logo.png'

import WildlifeReportFormStyles from './WildlifeReportFormStyles'

const SUBMISSION_URL = (
  (process.env.NODE_ENV === 'development' && 'http://localhost:34567/report')
  || '/.netlify/functions/report'
)

export default () => {
  const classes = WildlifeReportFormStyles()

  const geoLocation = useGeoLocation()
  const [ajaxError, setAjaxError] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [photos, setPhotos] = useState({
    0: null,
    1: null,
  })

  const onSubmit = (values, actions) => {
    setAjaxError(false)
    fetch(SUBMISSION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...values,
        photos: Object.values(photos),
      }),
    }).then(() => {
      setSubmitted(true)
      actions.setSubmitting(false)
    }).catch(() => {
      setAjaxError(true)
      actions.setSubmitting(false)
    })
  }

  if (submitted) {
    return (
      <div className={classes.root}>
        <img src={wildSunLogo} alt="" className={classes.logo} />
        <div className={classes.thankYouPage}>
          <Typography variant="h4" className={classes.thankYou}>
            Thank You! / ¡Gracias!
          </Typography>
          <Typography variant="h5">
            Your submission has been received. / Hemos recibido tu información.
          </Typography>
        </div>
      </div>
    )
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
            <img src={wildSunLogo} alt="" className={classes.logo} />
            <Typography variant="h4" paragraph>
              Wildlife Electrocution Report / Reporte de Electrocución de Vida Silvestre
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
            <PhotosSection
              classes={classes}
              photos={photos}
              setPhotos={setPhotos}
            />
            <div className={classes.textFieldsSection}>
              <Typography variant="h5" className={classes.textFieldsHeader}>
                Electrocution Details / Detalles de Electrocución
              </Typography>
              <Field
                name="electricalPostNumber"
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
                label="Animal Species / La especie Del Animal"
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
              <Typography variant="h5" className={classes.textFieldsHeader}>
                Your Details / Tus Detalles
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
          {ajaxError && (
            <>
              <Typography variant="body1" className={classes.ajaxError}>
                There was an error processing your report. Please try again or contact us at 8884-8444.
              </Typography>
              <Typography variant="body1" className={classes.ajaxError}>
                Hubo un error procesando su reporte. Por favor intente de nuevo o contactanos al 8884-8444.
              </Typography>
            </>
          )}
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
              Submit / Enviar
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
