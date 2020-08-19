import React, { useState, useMemo } from "react";
import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import collect from "collect.js";
import moment from "moment";
import Table from "../../_library/_table";
import BacklogTableRow from "../_backlogTableRow";

const TasksDueSoon = ({ className, hideIfNoData }) => {
  const [show, setShow] = useState(true);

  const { loading, unrefined, refined } = useSelector(
    state => state.backlogTasks
  );
  const { asanaProjectTasks } = useSelector(state => state.asanaProjectTasks);

  const sprints = useMemo(() => asanaProjectTasks || [], [asanaProjectTasks]);
  const currentSprint = useMemo(() => sprints[0], [sprints]);

  const tasksDueSoon = useMemo(
    () =>
      collect(unrefined || [])
        .concat(refined || [])
        .filter()
        .filter(task => !!task.dueOn)
        .filter(task => task.dueOn.isBefore(moment().add(14, "days")))
        .filter(
          ({ projects }) =>
            !projects.map(({ gid }) => gid).includes(currentSprint.gid)
        )
        .sortBy("dueOn")
        .all(),
    [unrefined, refined, currentSprint.gid]
  );

  if ((tasksDueSoon.length === 0 && hideIfNoData) || !show) {
    return <div />;
  }

  return (
    <Alert
      className="text-left"
      variant="danger"
      onClose={() => setShow(false)}
      dismissible
    >
      <Alert.Heading>
        <FontAwesomeIcon icon={faExclamation} />
        <span className="pl-2">Due Soon</span>
      </Alert.Heading>
      <p>The following tasks may not be prioritised high in the backlog!</p>
      <hr />
      <div className="mb-0">
        <Table
          id="backlog__tasks-due-soon"
          variant="dark"
          loading={loading}
          data={tasksDueSoon}
          row={BacklogTableRow}
        />
      </div>
    </Alert>
  );
};

export default TasksDueSoon;
