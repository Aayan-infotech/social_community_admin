import Pagination from "./Pagination";

const DataTable = ({
  pageTitle,
  dataListName,
  searchKeywordOnSubmitHandler,
  searchInputPlaceHolder,
  searchKeywordOnChangeHandler,
  searchKeyword,
  tableHeaderTitleList,
  isLoading,
  isFetching,
  data,
  children,
  setCurrentPage,
  currentPage,
  totalPageCount
}) => {
  return (
    <div className="container mt-4">
      <h1 className="h4 fw-semibold mb-4">{pageTitle}</h1>

      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h2 className="h4">{dataListName}</h2>
        <form onSubmit={searchKeywordOnSubmitHandler} className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder={searchInputPlaceHolder}
            onChange={searchKeywordOnChangeHandler}
            value={searchKeyword}
          />
          <button type="submit" className="btn btn-primary">
            Filter
          </button>
        </form>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-bordered">
          <thead className="table-light">
            <tr>
              {tableHeaderTitleList.map((title, index) => (
                <th key={index} scope="col">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading || isFetching ? (
              <tr>
                <td
                  colSpan={tableHeaderTitleList.length}
                  className="text-center py-4"
                >
                  Loading...
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td
                  colSpan={tableHeaderTitleList.length}
                  className="text-center py-4"
                >
                  No records found
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && (
        <Pagination
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={currentPage}
          totalPageCount={totalPageCount}
        />
      )}
    </div>
  );
};

export default DataTable;
