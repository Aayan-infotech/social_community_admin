import "./KYCSuccessPage.css";
export default function KYCSuccessPage() {
  return (
    <div className="kycPageContainer">
      <div className="printer-top" />
      <div className="paper-container">
        <div className="printer-bottom" />
        <div className="paper">
          <div className="main-contents">
            <div className="success-icon">✔</div>
            <div className="success-title">KYC Complete</div>
            <div className="success-description">
              Your KYC verification has been successfully completed.
            </div>
            <div className="success-description">
              You can now access all the features of the platform.
            </div>
            <button
              className="success-button btn btn-primary text-center w-100 mb-3"
              onClick={() => (window.location.href = "/")}
            >
              Go Back
            </button>
            <div className="order-footer">You can close this page!</div>
          </div>
          <div className="jagged-edge" />
        </div>
      </div>
    </div>
  );
}
