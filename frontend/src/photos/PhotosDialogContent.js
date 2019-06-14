import React, { useState } from 'react'

import {
  Grid,
  Button,
  Typography,
} from '@material-ui/core'

import 'react-html5-camera-photo/build/css/index.css'
import Camera from 'react-html5-camera-photo'


export default ({
  classes,
}) => {
  const [show, setShow] = useState(false)

  return (
    <div className={classes.camera}>
      <Camera
        onTakePhoto={dataUri => console.log(dataUri)}
      />
    </div>
  )
}
