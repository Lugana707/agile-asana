import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSkull } from "@fortawesome/free-solid-svg-icons";

export default ({ id, row: Row, columns, data, loading, noDataText }) => {
  if (loading && (!data || !data.length)) {
    return (
      <div className="col-12">
        <h2 className="text-center">
          <div className="loading-spinner" />
        </h2>
      </div>
    );
  }

  if (!data || !data.length) {
    return (
      <div className="col-12">
        <h2 className="text-center">
          <FontAwesomeIcon icon={faSkull} size="1x" />
          <span className="pl-2">{noDataText || "Nothing to show!"}</span>
        </h2>
      </div>
    );
  }

  return (
    <div className="col-12 text-left table-responsive">
      <table className="table table-striped table-dark">
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
            <tr key={`${id}-${index}`}>
              <Row data={datum} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
