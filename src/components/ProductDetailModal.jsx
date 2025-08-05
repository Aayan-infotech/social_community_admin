const ProductDetailModal = ({ product, onClose }) => {
  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">{product.name}</h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <img
              src={product.image[0]}
              alt={product.name}
              className="img-fluid mb-3"
            />
            <p><strong>Price:</strong> ${product.price}</p>
            <p><strong>Discount:</strong> {product.discount}%</p>
            {/* Add more product details here */}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
