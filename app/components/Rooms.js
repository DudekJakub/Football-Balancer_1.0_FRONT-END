import React, { useEffect, useContext } from "react"
import { useImmer } from "use-immer"
import { useNavigate } from "react-router-dom"
import Axios from "axios"
import Loading from "./Loading"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import ReactTooltip from "react-tooltip"
import { Pagination } from "@mui/material"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import Room from "./Room"

function Rooms(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const navigate = useNavigate()
  const [state, setState] = useImmer({
    feed: [],
    isLoading: true,
    paginationValue: 10,
    pagesNumber: 1,
    pageNumber: 1,
    numberOfRecords: 1,
    sortField: "",
    sortDirection: "ASC",
    isReadyToMount: false,
    isMounted: false,
    isPublic: "",
    subpageTitle: props.title,
    fetchPublic: "",
    targetUserId: "",
    targetUserIdURL: "",
    hideOwnRooms: false
  })

  useEffect(() => {
    setState(draft => {
      ;(draft.targetUserIdURL = props.forUser !== undefined ? `/${props.forUser}` : ``), (draft.targetUserId = props.forUser !== undefined ? props.forUser : undefined)
      ;(draft.fetchPublic = props.fetchPublic !== undefined ? props.fetchPublic : true), (draft.isReadyToMount = true)
    })
  }, [])

  useEffect(() => {
    function fetchData() {
      try {
        if (state.isReadyToMount) {
          fetchingRoomsOnMount()
        }
      } catch (e) {
        console.log("there was a problem fetching the data" + e)
      }
    }
    fetchData()
  }, [state.isReadyToMount])

  useEffect(() => {
    appDispatch({ type: "closeMenu" })
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        if (state.isMounted) {
          getSortedAndPaginatedRooms()
        }
      } catch (e) {
        console.log("there was a problem fetching the data" + e)
      }
    }
    fetchData()
  }, [state.sortField])

  async function getSortedAndPaginatedRooms() {
    var url = `/api/room/paginated` + `${state.targetUserIdURL}` + `?pageSize=${state.paginationValue}&sortField=${state.sortField}&sortDirection=${state.sortDirection}&fetchPublic=${state.fetchPublic}`
    url = props.forUser !== undefined ? url.concat(`?userId=${appState.user.id}`) : url
    const response = await Axios.get(url)
    setState(draft => {
      draft.feed = response.data
      draft.isLoading = false
    })
  }

  async function fetchingRoomsOnMount() {
    const userId = appState.loggedIn ? appState.user.id : 0
    var url = `/api/room/paginated?userId=${userId}`

    if (props.forUser !== undefined) {
      url = `/api/room/paginated${state.targetUserIdURL}`
    }

    const resposne = await Axios.get(url)
    setState(draft => {
      draft.numberOfRecords = resposne.data.length
      draft.feed = resposne.data.slice(0, 10)
      draft.isLoading = false
      draft.pagesNumber = Math.ceil(resposne.data.length / 10)
      draft.isMounted = true
    })
  }

  function paginate(value) {
    setState(draft => {
      draft.pageNumber = 1
      draft.paginationValue = value
      draft.pagesNumber = Math.ceil(state.numberOfRecords / value)
    })
  }

  function sort(value) {
    setState(draft => {
      draft.pageNumber = 1
      draft.sortField = value.substring(0, value.lastIndexOf("."))
      draft.sortDirection = value.endsWith("asc") ? "ASC" : "DESC"
    })
  }

  function renderRooms() {
    const showAccessLevel = props.forUser !== undefined ? true : false
    const showPermission = props.forUser === undefined ? true : false
    return state.feed.map(room => {
      return <Room room={room} key={room.id} showAccessLevel={showAccessLevel} showPermission={showPermission} />
    })
  }

  if (state.isLoading) return <Loading />
  return (
    <div className="content container d-flex flex-column mt-4">
      <div className="rooms-upper">
        <div>
          <h4 className="mt-2">
            <span className="font-weight-bold" style={{ fontVariant: "all-small-caps", marginTop: "20px" }}>
              {state.subpageTitle}
            </span>
          </h4>
        </div>
        <div className="ml-auto d-flex flex-row align-items-center">
          {state.targetUserId > 0 ? (
            <div className="mobile-toggle">
              <button className="single-room-content p-1 mr-3" style={{ backgroundColor: "DarkBlue" }} onClick={() => navigate(`/room/create`)}>
                <text data-tip="Create new room!" data-for="add-new-room">
                  Create ROOM
                </text>
                <ReactTooltip id="add-new-room" className="custom-tooltip" />
              </button>
            </div>
          ) : null}
          {props.forUser === undefined && (
            <>
              <span className="material-symbols-outlined mr-3" style={{ cursor: "help" }} data-tip="In order to improve transparency, the public list of rooms does not contain rooms to which the user belongs." data-for="info">
                {" "}
                info{" "}
              </span>
              <ReactTooltip id="info" className="custom-tooltip" style={{ fontVariant: "small-caps", position: "static" }} delayShow={500} />
            </>
          )}
          <select
            className="mr-3"
            name="Pagination"
            id="pagination"
            onChange={e => {
              paginate(e.target.value)
            }}
          >
            <option value="10" disabled selected>
              Pagination
            </option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="40">40</option>
          </select>
          <select
            className="mr-3"
            name="Sorting"
            id="sorting"
            onChange={e => {
              sort(e.target.value)
            }}
          >
            <option value="id.asc" disabled selected>
              Sorting
            </option>
            <option value="name.asc">Alphabetically</option>
            <option value="usersInRoom.size.asc">Users ascending</option>
            <option value="usersInRoom.size.desc">Users descending</option>
          </select>
          <div className="mr-4">
            <span className="material-symbols-outlined"> tune </span>
          </div>
        </div>
      </div>
      {state.feed.length > 0 ? (
        renderRooms()
      ) : (
        <p
          className="p-5"
          style={{
            fontWeight: "bold",
            fontVariant: "all-small-caps",
            textAlign: "center"
          }}
        >
          THERE ARE NO ROOMS YET. FEEL FREE TO CREATE ONE!
        </p>
      )}
      {state.feed.length > 0 ? (
        <div className="mt-3 align-items-right">
          <Pagination count={state.pagesNumber} page={state.pageNumber} defaultPage={1} shape="rounded" />
        </div>
      ) : null}
    </div>
  )
}

export default Rooms
