import React from "react";
import { Table } from "react-bootstrap";
import NoData from "./noData";

export default ({
  id,
  row: Row,
  tableHeader: TableHeader,
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
    return <NoData noDataText={noDataText} />;
  }

  return (
    <Table
      className={`text-left ${className}`}
      striped
      responsive
      variant={variant}
      borderless
    >
      {TableHeader && <TableHeader />}
      {columns && (
        <thead>
          <tr>
            {columns.map((key, index) => (
              <th key={index}>{key}</th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {data.map((datum, index) => (
          <Row key={index} data={datum} index={index} />
        ))}
      </tbody>
    </Table>
  );
};
