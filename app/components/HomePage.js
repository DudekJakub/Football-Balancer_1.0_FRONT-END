import React, { useEffect, useContext } from "react";
import { useImmer } from "use-immer";
import { useNavigate } from "react-router-dom";
import Axios from "axios";
import Loading from "./Loading";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import ReactTooltip from "react-tooltip";
import { Pagination } from "@mui/material";
import Rooms from "./Rooms";

function HomePage(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const navigate = useNavigate();
  const [state, setState] = useImmer({
    feed: [],
    isLoading: false,
    paginationValue: 10,
    pagesNumber: 1,
    pageNumber: 1,
    numberOfRecords: 1,
    sortField: "",
    sortDirection: "ASC",
    isMounted: false,
  });

  if (state.isLoading) return <Loading />;
  return (
    <div className="main container d-flex flex-column align-items-center">
      <div>
        <h3
          className="font-weight-bold text-center"
          style={{ fontVariant: "all-petite-caps" }}
        >
          WELCOME!
        </h3>
      </div>
      <Rooms title="PUBLIC ROOMS" fetchPublic={() => true} />
      {appState.loggedIn && (
        <Rooms title="USER'S ROOMS" forUser={appState.user.id} />
      )}
    </div>
  );
  return (
    <div className="main container d-flex flex-column align-items-center">
      <div>
        <h3
          className="font-weight-bold text-center"
          style={{ fontVariant: "all-petite-caps" }}
        >
          WELCOME!
        </h3>
      </div>
    </div>
  );
}

export default HomePage;
