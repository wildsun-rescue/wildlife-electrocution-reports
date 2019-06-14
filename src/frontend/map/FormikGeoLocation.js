import React, { useCallback } from 'react'

import Map from 'pigeon-maps'
import Marker from 'pigeon-marker'
import Draggable from 'pigeon-draggable'

import useGeoLocation from './useGeoLocation'

const FormikGeoLocation = ({
  form,
  field,
}) => {
  const { value } = field
  const onChange = useCallback(nextValue => (
    form.setFieldValue(field.name, nextValue)
  ), [field.name, form.setFieldValue])

  return (
    <Map
      center={value}
      zoom={12}
    >
      <Draggable
        anchor={value}
        offset={[15, 30]}
        onDragEnd={onChange}
      >
        <Marker anchor={[0, 0]} />
      </Draggable>
    </Map>
  )
}

export default FormikGeoLocation
