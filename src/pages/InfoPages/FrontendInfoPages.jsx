import { useParams } from "react-router-dom";

function FrontendInfoPages() {
  const { pageURL } = useParams();

  return (
    <div className="d-flex">
      <div className="flex-grow-1 bg-light">
        <div className="p-4">
          <h3>Test Info Page: {pageURL}</h3>
        </div>
      </div>
    </div>
  );
}

export default FrontendInfoPages;
