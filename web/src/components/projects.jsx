import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadProjects } from "../scripts/redux/actions/asana/projectActions";
import Table from "./_library/_table";

const Projects = () => {
  const { loading, asanaProjects } = useSelector(state => state.asanaProjects);

  const dispatch = useDispatch();
  useEffect(() => {
    if (asanaProjects) {
      return;
    }
    dispatch(loadProjects());
  }, [asanaProjects, dispatch]);

  const Row = ({ data }) => <td>{data.name}</td>;

  return <Table loading={loading} data={asanaProjects} row={Row} />;
};

export default Projects;
