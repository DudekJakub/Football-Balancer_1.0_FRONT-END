import React, { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import DispatchContext from "../DispatchContext"
import { CSSTransition } from "react-transition-group"
import StateContext from "../StateContext"
import Notifications from "./notifications/Notifications"

function NavbarLoggedIn() {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  const navigate = useNavigate()
  const [profileOptions, setProfileOptions] = useState(false)

  function handleLoggedOut() {
    appDispatch({ type: "logout" })
    appDispatch({
      type: "flashMessage",
      value: "Succesfully logged out !",
      messageType: "message-green"
    })
    navigate("/")
  }

  function toggleProfileOptions() {
    setProfileOptions(prev => !prev)
  }

  return (
    <div className="mt-3">
      <nav className="nav container d-flex flex-row p-4">
        <div className="nav-left d-flex align-items-center">
          <div>
            <Link to="/" className="mr-auto p-3">
              <span className="material-symbols-outlined"> sports_soccer </span>
            </Link>
          </div>
          <div className="ml-3">
            <h1>Football Equalizer</h1>
          </div>
        </div>
        <div className="nav-right d-flex ml-auto align-items-center">
          <div className="mobile-toggle">
            <span
              onClick={() => {
                appDispatch({ type: "openSearch" })
              }}
              className="material-symbols-outlined mr-3"
            >
              {" "}
              search{" "}
            </span>
            <div className="mr-3">
              <Notifications />
            </div>
            <div className="relative">
              <span onClick={toggleProfileOptions} className="material-symbols-outlined mr-3">
                {" "}
                account_circle{" "}
              </span>
              <CSSTransition in={profileOptions} timeout={330} classNames="userOptions" unmountOnExit>
                <div className="option-box small userOptions ml-3">
                  <Link onClick={() => setProfileOptions(prev => !prev)} to={`/profile/${appState.user.username}`}>
                    <div>Profile</div>
                  </Link>
                  <div onClick={handleLoggedOut} className="mt-4" style={{ cursor: "pointer" }}>
                    Logout
                  </div>
                </div>
              </CSSTransition>
            </div>
          </div>
          <span
            onClick={() => {
              appDispatch({ type: "toggleMenu" })
            }}
            className="material-symbols-outlined mobile-toggle-inverse"
          >
            {" "}
            menu{" "}
          </span>
        </div>
      </nav>
    </div>
  )
}

export default NavbarLoggedIn
