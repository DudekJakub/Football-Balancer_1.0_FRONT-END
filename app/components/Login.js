import React, { useContext, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Axios from "axios"
import DispatchContext from "../DispatchContext"

function Login() {
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const navigate = useNavigate()
  const appDispatch = useContext(DispatchContext)

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      const response = await Axios.post("/auth/login", { username, password })
      if (response.data) {
        appDispatch({ type: "login", data: response.data })
        appDispatch({
          type: "flashMessage",
          value: "Succesfully logged in !",
          messageType: "message-green"
        })
        navigate("/")
      }
    } catch (e) {
      if (e.response.status === 401 || e.response.status === 400) {
        appDispatch({
          type: "flashMessage",
          value: "Wrong credentials !",
          messageType: "message-red"
        })
        console.log("Incorrect user credentials!")
      } else {
        console.log("There was a problem!" + e)
      }
    }
  }

  return (
    <div className="main login container">
      <div className="content d-flex mt-4">
        <div className="d-flex flex-column align-items-center">
          <div className="mt-4">
            <h6 className="input-text ml-5">Log into Football Equalizer</h6>
          </div>
          <form onSubmit={handleSubmit} className="d-flex flex-column container">
            <div className="ml-5 form-label mt-4">
              <span>Username</span>
              <br />
              <input onChange={e => setUsername(e.target.value)} type="text" className="form-button" />
              <br />
              <span>Password</span>
              <br />
              <input onChange={e => setPassword(e.target.value)} type="password" className="form-button" data-testid="password-field" />
            </div>
            <div className="mt-4 centered">
              <button type="submit" className="nav-button ">
                LOGIN
              </button>
            </div>
          </form>
          <div className="mt-3 form-label">
            <span id="login-white">
              No Account? Sign Up{" "}
              <Link to="/user/create">
                <span id="login-blue">Here</span>
              </Link>
            </span>
          </div>
        </div>
        <div className="col-6 p-4 centered mobile-toggle">
          <img src="https://www.sportstourismnews.com/wp-content/uploads/2020/08/Football-calendar.jpg" style={{ border: "solid " }} />
        </div>
      </div>
    </div>
  )
}

export default Login
