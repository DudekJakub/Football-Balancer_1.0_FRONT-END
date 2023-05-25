import React, { useEffect } from "react"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import jwtDecode from "jwt-decode"
import ReactDOM from "react-dom/client"
import DispatchContext from "./DispatchContext"
import StateContext from "./StateContext"
import { CSSTransition } from "react-transition-group"
import Axios from "axios"
import { RoomProvider } from "./components/RoomContext"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Login from "./components/Login"
import Search from "./components/Search"
import RegisterForm from "./components/RegisterForm"
import CreateRoomForm from "./components/CreateRoomForm"
import UserProfile from "./components/UserProfile"
import ChangeBIO from "./components/ChangeBIO"
import ViewSingleRoom from "./components/ViewSingleRoom"
import FlashMessages from "./components/FlashMessages"
import NotFound from "./components/NotFound"
import Logout from "./components/Logout"
import Chat from "./components/chat/Chat"
import HomePage from "./components/HomePage"

Axios.defaults.baseURL = "http://localhost:8083"

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("footballEqualizerUserId")),
    searchIsOpen: false,
    menuIsOpen: false,
    isMobileDevice: window.innerWidth < 900,
    mobileInputRenderCounter: 0,
    user: {
      id: localStorage.getItem("footballEqualizerUserId"),
      username: localStorage.getItem("footballEqualizerUsername"),
      token: localStorage.getItem("footballEqualizerUserToken"),
      roles: [],
      isUser: false,
      isAdmin: false
    },
    flashMessages: []
  }

  function ourReducer(state, action) {
    switch (action.type) {
      case "login":
        state.loggedIn = true
        state.user = action.data
        state.user.roles = jwtDecode(state.user.token).roles
        state.user.isUser = state.user.roles.includes("USER")
        state.user.isAdmin = state.user.roles.includes("ADMIN")
        state.menuIsOpen = false
        break
      case "logout":
        state.loggedIn = false
        state.user.roles = []
        state.user.isUser = false
        state.user.isAdmin = false
        state.menuIsOpen = false
        break
      case "openSearch":
        state.searchIsOpen = true
        state.menuIsOpen = false
        return
      case "closeSearch":
        state.searchIsOpen = false
        return
      case "openMobileInput":
        state.mobileInputRenderCounter = 1
        return
      case "closeMobileInput":
        state.mobileInputRenderCounter = 0
        return
      case "toggleMenu":
        state.menuIsOpen = !state.menuIsOpen
        return
      case "closeMenu":
        state.menuIsOpen = false
        return
      case "flashMessage":
        state.flashMessages.push({
          value: action.value,
          messageType: action.messageType
        })
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("footballEqualizerUserId", state.user.id)
      localStorage.setItem("footballEqualizerUsername", state.user.username)
      localStorage.setItem("footballEqualizerUserToken", state.user.token)
      initialState.user.roles = jwtDecode(localStorage.getItem("footballEqualizerUserToken")).roles
      initialState.user.isUser = initialState.user.roles.includes("USER")
      initialState.user.isAdmin = initialState.user.roles.includes("ADMIN")
    } else {
      localStorage.removeItem("footballEqualizerUserId")
      localStorage.removeItem("footballEqualizerUsername")
      localStorage.removeItem("footballEqualizerUserToken")
    }
  }, [state.loggedIn])

  return (
    <RoomProvider>
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          <BrowserRouter>
            <FlashMessages messages={state.flashMessages} />
            <Navbar />
            <CSSTransition timeout={330} in={state.searchIsOpen} classNames="search-overlay" unmountOnExit>
              <div className="search-overlay">
                <Search />
              </div>
            </CSSTransition>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile/:username/*" element={<UserProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/user/create" element={<RegisterForm />} />
              <Route path="/room/create" element={<CreateRoomForm />} />
              <Route path="/profile/changebio/:username" element={<ChangeBIO />} />
              <Route path="/room/:id" element={<ViewSingleRoom />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
            {state.loggedIn ? <Logout /> : null}
            <Footer />
          </BrowserRouter>
        </DispatchContext.Provider>
      </StateContext.Provider>
    </RoomProvider>
  )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<Main />)

if (module.hot) {
  module.hot.accept()
}
