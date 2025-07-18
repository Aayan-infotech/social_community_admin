import React, { Children } from "react";
import Pagination from "./admin/Pagination";

function Table({
  PageTitle,
  pagination,
  setPagination,
  dataLength,
  searchTerm,
  handleSearch,
  clearSearch,
  children,
}) {
  return (
    <>
      <h3 className="mb-4 fw-bold text-dark">{PageTitle}</h3>
      <div className="row mb-4">
        <div className="col-md-6">
          <small className="text-muted">
            Showing{" "}
            {Number((pagination?.current_page || 0) - 1) *
              Number(pagination?.per_page || 0) +
              1}{" "}
            to{" "}
            {Number((pagination?.current_page || 0) - 1) *
              Number(pagination?.per_page || 0) +
              Number(dataLength || 0)}{" "}
            of {pagination?.total_records || 0} records
            {searchTerm && <span> (filtered)</span>}
          </small>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users by name, email, or mobile..."
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={clearSearch}
                title="Clear search"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="table-responsive">{children}</div>

      <Pagination
        onPageChange={(page) =>
          setPagination((prev) => ({ ...prev, current_page: page }))
        }
        currentPage={pagination.current_page}
        totalPageCount={pagination.total_page}
      />
    </>
  );
}

export default Table;
