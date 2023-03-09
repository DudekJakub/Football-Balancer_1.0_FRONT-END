import React, { useRef, useEffect } from "react"

function Map(props) {
  const mapRef = useRef(null)

  useEffect(() => {
    const map = new window.google.maps.Map(mapRef.current, {
      center: props.location,
      zoom: 15
    })

    const marker = new window.google.maps.Marker({
      position: props.location,
      map: map
    })
  }, [props.location])

  return (
    <div className="room-map" style={{ position: "relative", width: "100%", height: "300px" }}>
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}>
        <h5 style={{ width: "100%", height: "100%" }} ref={mapRef} />
      </div>
    </div>
  )
}

export default Map
