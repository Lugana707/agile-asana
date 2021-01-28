import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  loadOrganisations,
  loadRepositories,
  loadPullRequests,
  loadReleases
} from "../../scripts/redux/actions/githubActions";

const Github = () => {
  const { github } = useSelector(state => state.settings);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!github || !github.pat || !github.defaultOrganisation) {
      return;
    }

    [
      loadOrganisations,
      loadRepositories,
      loadPullRequests,
      loadReleases
    ].map(action => dispatch(action()));
  }, [github, dispatch]);

  return <div />;
};

export default Github;
