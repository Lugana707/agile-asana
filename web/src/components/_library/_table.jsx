import React from "react";
import { Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSkull } from "@fortawesome/free-solid-svg-icons";

export default ({
  id,
  row: Row,
  columns,
  data,
  loading,
  noDataText,
  variant = "dark",
  className
}) => {
  if (loading && (!data || !data.length)) {
    return (
      <h2 className="text-center">
        <div className="loading-spinner" />
      </h2>
    );
  }

  if (!data || !data.length) {
    return (
      <h2 className="text-center">
        <FontAwesomeIcon icon={faSkull} size="1x" />
        <span className="pl-2">{noDataText || "Nothing to show!"}</span>
      </h2>
    );
  }

  return (
    <Table
      className={`text-left ${className}`}
      striped
      responsive
      variant={variant}
      borderless
    >
      {columns && (
        <thead>
          <tr>
            {columns.map(key => (
              <td key={key}>{key}</td>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {data.map((datum, index) => (
          <tr key={`${id}-${index}`} className={datum.className}>
            <Row data={datum} index={index} />
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
