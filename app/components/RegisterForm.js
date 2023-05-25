import React, { useEffect, useContext } from "react"
import DispatchContext from "../DispatchContext"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import Axios from "axios"
import { useNavigate } from "react-router-dom"
function RegisterForm() {
  const appDispatch = useContext(DispatchContext)
  const navigate = useNavigate()
  const sexOptionLabel = [
    { label: "MALE", value: "MALE" },
    { label: "FEMALE", value: "FEMALE" }
  ]
  const initialState = {
    submitCount: 0,
    username: {
      value: "",
      hasErrors: false,
      message: ""
    },
    password: {
      value: "",
      hasErrors: false,
      message: ""
    },
    email: {
      value: "",
      hasErrors: false,
      message: ""
    },
    firstName: {
      value: "",
      hasErrors: false,
      message: ""
    },
    lastName: {
      value: "",
      hasErrors: false,
      message: ""
    },
    sex: {
      value: "MALE"
    }
  }

  useEffect(() => {
    appDispatch({ type: "closeMenu" })
  }, [])

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameReceived":
        draft.username.hasErrors = false
        draft.username.value = action.value
        return
      case "usernameValidation":
        if (draft.username.value.length < 4) {
          draft.username.hasErrors = true
          draft.username.message = "Username must be over 4 characters long"
        } else if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true
          draft.username.message = "Username can only contain letters and numbers"
        }
        return
      case "passwordReceived":
        draft.password.hasErrors = false
        draft.password.value = action.value
        return
      case "passwordValidation":
        if (draft.password.value.length < 8) {
          draft.password.hasErrors = true
          draft.password.message = "Password must be over 8 characters long"
        } else if (!/(?=.*\d.*\d)(?=.*\W).*/.test(draft.password.value)) {
          draft.password.hasErrors = true
          draft.password.message = "Password must contains min. 2 digits + 1 symbol"
        }
        return
      case "emailReceived":
        draft.email.hasErrors = false
        draft.email.value = action.value
        return
      case "emailValidation":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true
          draft.email.message = "You must provide a valid email adress"
        }
        return
      case "firstNameReceived":
        draft.firstName.hasErrors = false
        draft.firstName.value = action.value
        if (draft.firstName.value && !/^([a-zA-Z0-9]+)$/.test(draft.firstName.value)) {
          draft.firstName.hasErrors = true
          draft.firstName.message = "First name can only contain letters and numbers"
        }
        if (draft.firstName.value.length < 1) {
          draft.firstName.hasErrors = true
          draft.firstName.message = "First name must be not empty"
        }
        return
      case "lastNameReceived":
        draft.lastName.hasErrors = false
        draft.lastName.value = action.value
        if (draft.lastName.value && !/^([a-zA-Z0-9]+)$/.test(draft.lastName.value)) {
          draft.lastName.hasErrors = true
          draft.lastName.message = "Last name can only contain letters and numbers"
        }
        if (draft.lastName.value.length < 1) {
          draft.lastName.hasErrors = true
          draft.lastName.message = "Last name must be not empty"
        }
        return
      case "sexReceived":
        draft.sex.value = action.value
        return
      case "submitForm": {
        if (!draft.username.hasErrors && !draft.password.hasErrors && !draft.email.hasErrors && !draft.firstName.hasErrors && !draft.lastName.hasErrors) {
          draft.submitCount++
        }
      }
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameValidation" }), 700)
      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: "passwordValidation" }), 700)
      return () => clearTimeout(delay)
    }
  }, [state.password.value])

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: "emailValidation" }), 700)
      return () => clearTimeout(delay)
    }
  }, [state.email.value])

  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source()
      async function register() {
        try {
          const response = await Axios.post("http://localhost:8084/auth/register", { username: state.username.value, password: state.password.value, email: state.email.value, firstName: state.firstName.value, lastName: state.lastName.value, sex: state.sex.value }, { cancelToken: ourRequest.token })
          appDispatch({ type: "flashMessage", value: "Account succesfully created !", messageType: "message-green" })
          navigate("/login")
        } catch (e) {
          if (e.response.status === 409) {
            console.log("Account with given username already exists" + e.message)
            appDispatch({ type: "flashMessage", value: "Account with given username already exists !", messageType: "message-orange" })
          } else {
            console.log("There was a problem creating an account" + e.message)
          }
        }
      }
      register()
      return () => ourRequest.cancel()
    }
  }, [state.submitCount])

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "usernameReceived", value: state.username.value })
    dispatch({ type: "usernameValidation", value: state.username.value })
    dispatch({ type: "emailReceived", value: state.email.value })
    dispatch({ type: "emailValidation", value: state.email.value })
    dispatch({ type: "passwordReceived", value: state.password.value })
    dispatch({ type: "passwordValidation", value: state.password.value })
    dispatch({ type: "firstNameReceived", value: state.firstName.value })
    dispatch({ type: "lastNameReceived", value: state.lastName.value })
    dispatch({ type: "sexReceived", value: state.sex.value })
    dispatch({ type: "submitForm" })
  }

  return (
    <div className="main d-flex flex-column container">
      <div className="content d-flex mt-4">
        <div className="d-flex flex-column container align-items-center">
          <form onSubmit={handleSubmit}>
            <div className="mt-4">
              <h6 className="input-text text-center">Sign into Football Equalizer</h6>
            </div>
            <div></div>
            <div className="form-label mt-4 d-flex flex-column justify-content-center">
              <div className="p-2 form-group">
                <span className="ml-3">Username</span>
                <br />
                <input onChange={e => dispatch({ type: "usernameReceived", value: e.target.value })} type="text" className="ml-3" placeholder="username (4-20 chars)" />
                <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                  <div className="alert alert-danger small liveValidateMessage ml-3">{state.username.message}</div>
                </CSSTransition>
              </div>
              <div className="p-2 form-group">
                <span className="ml-3">Password</span>
                <br />
                <input onChange={e => dispatch({ type: "passwordReceived", value: e.target.value })} type="password" className="ml-3" placeholder="**** (2/1 digits/symbol)" />
                <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                  <div className="alert alert-danger small liveValidateMessage ml-3">{state.password.message}</div>
                </CSSTransition>
              </div>
              <div className="p-2 form-group">
                <span className="ml-3">Email</span>
                <br />
                <input onChange={e => dispatch({ type: "emailReceived", value: e.target.value })} type="text" className="ml-3" placeholder="john@test.com" />
                <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                  <div className="alert alert-danger small liveValidateMessage ml-3">{state.email.message}</div>
                </CSSTransition>
              </div>
              <div className="p-2 form-group">
                <span className="ml-3">First name</span>
                <br />
                <input onChange={e => dispatch({ type: "firstNameReceived", value: e.target.value })} type="text" className="ml-3" placeholder="John" />
                <CSSTransition in={state.firstName.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                  <div className="alert alert-danger small liveValidateMessage ml-3">{state.firstName.message}</div>
                </CSSTransition>
              </div>
              <div className="p-2 form-group">
                <span className="ml-3">Last name</span>
                <br />
                <input onChange={e => dispatch({ type: "lastNameReceived", value: e.target.value })} type="text" className="ml-3" placeholder="Doe" />
                <CSSTransition in={state.lastName.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                  <div className="alert alert-danger small liveValidateMessage ml-3">{state.lastName.message}</div>
                </CSSTransition>
              </div>
              <div className="p-3 form-group align-self-center">
                <select value={state.sex.value} onChange={e => dispatch({ type: "sexReceived", value: e.target.value })}>
                  {sexOptionLabel.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="align-self-center">
                <button className="nav-button">REGISTER</button>
              </div>
            </div>
          </form>
        </div>
        <div className="col-6 align-self-center mobile-toggle">
          <img src="https://images.unsplash.com/photo-1560272564-c83b66b1ad12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=749&q=80" style={{ border: "solid " }} />
        </div>
      </div>
    </div>
  )
}

export default RegisterForm
