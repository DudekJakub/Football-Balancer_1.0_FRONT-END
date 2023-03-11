import React, { useEffect, useContext, useState } from "react"
import DispatchContext from "../DispatchContext"
import Axios from "axios"
import StateContext from "../StateContext"
import SingleSearchResult from "./SingleSearchResult"
import { useImmer } from "use-immer"
import Loading from "./Loading"

function Search() {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  const [state, setState] = useImmer({
    searchItem: "",
    resultsRooms: [],
    resultsTopics: [],
    requestCount: 0,
    loading: false
  })

  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          setState(draft => {
            draft.loading = false
          })
          const searchItem = state.searchItem
          const responseRoom = await Axios.get("/api/room/basic-management/search", { params: { searchItem } }, { cancelToken: ourRequest.token })
          console.log(responseRoom.data)
          setState(draft => {
            draft.resultsRooms = responseRoom.data
          })
        } catch (e) {
          console.log("There was a problem search")
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.requestCount])

  useEffect(() => {
    if (state.searchItem.trim()) {
      setState(draft => {
        draft.loading = true
      })
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++
        })
      }, 700)
      return () => clearTimeout(delay)
    }
  }, [state.searchItem])

  return (
    <div className="search-overlay container">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <div className="container ml-auto mr-auto search-bar">
            <input
              onChange={e => {
                setState(draft => {
                  draft.searchItem = e.target.value
                })
              }}
              autoFocus
              type="text"
              autoComplete="off"
              id="live-search-field"
              className="live-search-field"
              placeholder="What are you interested in?"
            />
          </div>
          <span
            id="close-search-bar"
            onClick={() => {
              appDispatch({ type: "closeSearch" })
            }}
            className="material-symbols-outlined"
          >
            cancel
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className="live-search-results live-search-results--visible">
            <div className="list-group shadow-sm mt-2">
              <span className="font-weight-bold">Rooms Found ({state.resultsRooms.length})</span>
              {state.loading ? (
                <Loading />
              ) : (
                state.resultsRooms.map(result => {
                  return <SingleSearchResult result={result} key={result.id} />
                })
              )}
            </div>
            <div className="list-group shadow-sm mt-2">
              <span className="font-weight-bold">Users Found ({state.resultsTopics.length})</span>
              {state.loading ? (
                <Loading />
              ) : (
                state.resultsTopics.map(result => {
                  return <SingleSearchResult result={result} key={result.id} />
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
