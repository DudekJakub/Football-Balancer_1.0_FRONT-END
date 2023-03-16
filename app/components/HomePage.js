import React, { useEffect, useContext } from "react"
import { useImmer } from "use-immer"
import Loading from "./Loading"
import StateContext from "../StateContext"
import RoomsPublic from "./RoomsPublic"
import RoomsUser from "./RoomsUser"

function HomePage(props) {
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    feed: [],
    isLoading: false,
    paginationValue: 10,
    pagesNumber: 1,
    pageNumber: 1,
    numberOfRecords: 1,
    sortField: "",
    sortDirection: "ASC",
    isMounted: false
  })

  if (state.isLoading) return <Loading />
  return (
    <div className="main container d-flex flex-column align-items-center">
      <div>
        <h3 className="font-weight-bold text-center" style={{ fontVariant: "all-petite-caps" }}>
          WELCOME!
        </h3>
      </div>
      <RoomsPublic title="PUBLIC ROOMS" />
      {appState.loggedIn && <RoomsUser title="USER'S ROOMS" />}
    </div>
  )
}

export default HomePage
