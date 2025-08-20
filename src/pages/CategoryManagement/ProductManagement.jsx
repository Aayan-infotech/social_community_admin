import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2";
import { useDebounce } from "../../hook/useDebounce";
import Table from "../../components/Table";
import Th from "../../components/Th";
import Modal from "../../components/modal/Modal";
import { CapitalizeFirstLetter } from "../../service/helper";
import ImageCarousle from "../../components/ImageCarousle";
import UserDetailsCard from "../../components/UserDetailsCard";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0,
  });
  const [modalType, setModalType] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for add/edit product
  const [productForm, setProductForm] = useState({
    product_name: "",
    product_description: "",
    product_price: "",
    product_quantity: "",
    product_discount: "",
    category_id: "",
    subcategory_id: "",
    product_image: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  // Fetch product list on paging/search/sort
  useEffect(() => {
    fetchProducts();
  }, [pagination.current_page, debouncedSearchTerm, sortConfig]);

  // Fetch categories once for add/edit forms
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current_page,
        limit: pagination.per_page,
      });
      if (debouncedSearchTerm.trim())
        params.append("search", debouncedSearchTerm);
      if (sortConfig.key) {
        params.append("sortBy", sortConfig.key);
        params.append("sortOrder", sortConfig.direction);
      }

      const response = await axios.get(
        `marketplace/get-all-products?${params}`
      );
      if (response.data.success) {
        setProducts(response.data.data.products);
        setPagination({
          current_page: response.data.data.current_page,
          total_page: response.data.data.total_page,
          per_page: response.data.data.per_page,
          total_records: response.data.data.total_records,
        });
      } else {
        toast.error(response.data.message || "Failed to fetch products");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Use the lightweight list endpoint as used elsewhere in the app
      const response = await axios.get("marketplace/get-category");
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    // Guard: no category selected
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    try {
      const safeId = encodeURIComponent(categoryId);
      const response = await axios.get(`marketplace/get-subcategory/${safeId}`);
      if (response?.data?.success) {
        const payload = response.data?.data;
        let list = [];
        if (Array.isArray(payload)) list = payload;
        else if (Array.isArray(payload?.subcategories))
          list = payload.subcategories;
        else if (Array.isArray(payload?.items)) list = payload.items;
        setSubcategories(list || []);
        return;
      }
    } catch (err) {
      console.error("Failed to fetch subcategories:", err);
      setSubcategories([]);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <div
          className="d-flex flex-column align-items-center"
          style={{ fontSize: "10px" }}
        >
          <i
            className="bi bi-caret-up-fill text-secondary"
            style={{ marginBottom: "-8px" }}
          ></i>
          <i className="bi bi-caret-down-fill text-secondary"></i>
        </div>
      );
    }
    if (sortConfig.direction === "asc") {
      return (
        <div
          className="d-flex flex-column align-items-center"
          style={{ fontSize: "10px" }}
        >
          <i
            className="bi bi-caret-up-fill text-white"
            style={{ marginBottom: "-8px" }}
          ></i>
          <i className="bi bi-caret-down-fill text-secondary"></i>
        </div>
      );
    }
    return (
      <div
        className="d-flex flex-column align-items-center"
        style={{ fontSize: "10px" }}
      >
        <i
          className="bi bi-caret-up-fill text-secondary"
          style={{ marginBottom: "-8px" }}
        ></i>
        <i className="bi bi-caret-down-fill text-white"></i>
      </div>
    );
  };

  const resetForm = () => {
    setProductForm({
      product_name: "",
      product_description: "",
      product_price: "",
      product_quantity: "",
      product_discount: "",
      category_id: "",
      subcategory_id: "",
      product_image: [],
    });
    setImageFiles([]);
    setImagePreview([]);
    setSubcategories([]);
  };

  const handleAdd = () => {
    resetForm();
    setModalType("add");
    setSelectedProduct(null);
    // Ensure categories are available when opening modal
    if (!categories || categories.length === 0) fetchCategories();
    setIsModalOpen(true);
  };

  const handleView = (product) => {
    setModalType("view");
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setModalType("edit");
    setSelectedProduct(product);
    setProductForm({
      product_name: product.product_name || "",
      product_description: product.product_description || "",
      product_price: product.product_price || "",
      product_quantity: product.product_quantity || "",
      product_discount: product.product_discount || "",
      category_id: product.category_id || "",
      subcategory_id: product.subcategory_id || "",
      product_image: product.product_image || [],
    });
    setImagePreview(product.product_image || []);
    setRemovedImages([]);

    // Fetch subcategories for the selected category
    if (product.category_id) {
      fetchSubcategories(product.category_id);
    }
    // Ensure categories are available
    if (!categories || categories.length === 0) fetchCategories();

    setIsModalOpen(true);
  };

  // const handleDelete = (product) => {
  //   Swal.fire({
  //     title: "Are you sure?",
  //     text: `You want to delete "${product.product_name}"! This action cannot be undone.`,
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     cancelButtonColor: "#3085d6",
  //     confirmButtonText: "Yes, delete it!",
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       try {
  //         const response = await axios.delete(
  //           `marketplace/delete-product/${product._id}`
  //         );
  //         if (response.data.success) {
  //           toast.success("Product deleted successfully");
  //           fetchProducts();
  //         } else {
  //           toast.error(response.data.message || "Failed to delete product");
  //         }
  //       } catch (error) {
  //         toast.error(
  //           error.response?.data?.message || "Failed to delete product"
  //         );
  //       }
  //     }
  //   });
  // };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setSelectedProduct(null);
    resetForm();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Fetch subcategories when category changes
    if (name === "category_id" && value) {
      fetchSubcategories(value);
      setProductForm((prev) => ({
        ...prev,
        subcategory_id: "", // Reset subcategory when category changes
      }));
    } else if (name === "category_id" && !value) {
      // Clear subcategories when no category is selected
      setSubcategories([]);
      setProductForm((prev) => ({
        ...prev,
        subcategory_id: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    // Create preview URLs
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    // In edit mode, append to existing previews
    setImagePreview((prev) => [...prev, ...previewUrls]);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    const removedImageUrls = imagePreview.filter((_, i) => i === index);
    setRemovedImages((prev) => [...prev, ...removedImageUrls]);
    setImageFiles(newFiles);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!productForm.product_name.trim()) {
        toast.error("Product name is required");
        return;
      }
      if (!productForm.product_description.trim()) {
        toast.error("Product description is required");
        return;
      }
      if (!productForm.product_price || productForm.product_price <= 0) {
        toast.error("Valid product price is required");
        return;
      }
      if (!productForm.product_quantity || Number(productForm.product_quantity) <= 1) {
        toast.error("Quantity is required and must be greater than 1");
        return;
      }
      if(!productForm.product_discount || productForm.product_discount < 0 || productForm.product_discount > 100) {
        toast.error("Discount must be between 0 and 100");
        return;
      }
      if (!productForm.category_id) {
        toast.error("Category is required");
        return;
      }
      if (!productForm.subcategory_id) {
        toast.error("Subcategory is required");
        return;
      }

      const formData = new FormData();
      formData.append("product_name", productForm.product_name);
      formData.append("product_description", productForm.product_description);
      formData.append("product_price", productForm.product_price);
      formData.append("product_quantity", productForm.product_quantity);
      formData.append("product_discount", productForm.product_discount || 0);
      formData.append("category_id", productForm.category_id);
      formData.append("subcategory_id", productForm.subcategory_id);

      // Add images
      imageFiles.forEach((file) => {
        formData.append("product_image", file);
      });

      let response;
      if (modalType === "add") {
        response = await axios.post("marketplace/add-product", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else if (modalType === "edit") {

        formData.append("id", selectedProduct._id);
        formData.append("remove_images", JSON.stringify(removedImages));


        response = await axios.put(
          `marketplace/update-product`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (response.data.success) {
        toast.success(
          modalType === "add"
            ? "Product added successfully"
            : "Product updated successfully"
        );
        handleCloseModal();
        fetchProducts();
      } else {
        toast.error(response.data.message || "Operation failed");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${modalType === "add" ? "add" : "update"} product`
      );
    }
  };

  const renderProductForm = () => (
    <form>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="product_name" className="form-label">
            Product Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="product_name"
            name="product_name"
            value={productForm.product_name}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="product_price" className="form-label">
            Price ($) <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            className="form-control"
            id="product_price"
            name="product_price"
            value={productForm.product_price}
            onChange={handleFormChange}
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="product_discount" className="form-label">
            Discount (%)
          </label>
          <input
            type="number"
            className="form-control"
            id="product_discount"
            name="product_discount"
            value={productForm.product_discount}
            onChange={handleFormChange}
            min="0"
            max="100"
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="product_quantity" className="form-label">
            Quantity
          </label>
          <input
            type="number"
            className="form-control"
            id="product_quantity"
            name="product_quantity"
            value={productForm.product_quantity}
            onChange={handleFormChange}
            min="1"
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="category_id" className="form-label">
            Category <span className="text-danger">*</span>
          </label>
          <select
            className="form-control"
            id="category_id"
            name="category_id"
            value={productForm.category_id}
            onChange={handleFormChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="subcategory_id" className="form-label">
            Subcategory <span className="text-danger">*</span>
          </label>
          <select
            className="form-control"
            id="subcategory_id"
            name="subcategory_id"
            value={productForm.subcategory_id}
            onChange={handleFormChange}
            disabled={!productForm.category_id}
            required
          >
            <option value="">
              {productForm.category_id
                ? "Select Subcategory"
                : "Select category first"}
            </option>
            {productForm.category_id && subcategories.length === 0 && (
              <option disabled value="">
                No subcategories found
              </option>
            )}
            {subcategories.map((subcategory) => (
              <option key={subcategory._id} value={subcategory._id}>
                {subcategory.subcategory_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="product_description" className="form-label">
          Description <span className="text-danger">*</span>
        </label>
        <textarea
          className="form-control"
          id="product_description"
          name="product_description"
          rows="4"
          value={productForm.product_description}
          onChange={handleFormChange}
          required
        ></textarea>
      </div>

      <div className="mb-3">
        <label htmlFor="product_image" className="form-label">
          Product Images
        </label>
        <input
          type="file"
          className="form-control"
          id="product_image"
          name="product_image"
          onChange={handleImageChange}
          multiple
          accept="image/*"
        />
        <small className="form-text text-muted">
          You can select multiple images for the product.
        </small>
      </div>

      {imagePreview.length > 0 && (
        <div className="mb-3">
          <label className="form-label">Image Preview:</label>
          <div className="row">
            {imagePreview.map((src, index) => (
              <div key={index} className="col-md-3 mb-2 position-relative">
                <img
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className="img-thumbnail"
                  style={{ width: "100%", height: "100px", objectFit: "cover" }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0"
                  style={{ transform: "translate(50%, -50%)" }}
                  onClick={() => removeImage(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );

  const renderViewModal = () => (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-md-6">
          <ImageCarousle images={selectedProduct?.product_image} />
        </div>
        <div className="col-md-6">
          <h4 className="text-primary">
            {CapitalizeFirstLetter(selectedProduct.product_name)}
          </h4>
          <p>
            <strong>Category:</strong>{" "}
            {CapitalizeFirstLetter(selectedProduct.category_name)}
          </p>
          <p>
            <strong>Subcategory:</strong>{" "}
            {CapitalizeFirstLetter(selectedProduct.subcategory_name)}
          </p>
          <p></p>
          <p>
            <strong>Quantity:</strong> {selectedProduct.product_quantity}
          </p>
          <p>
            <strong>Price:</strong> <span className="text-decoration-line-through">${selectedProduct.product_price}</span> <span className="text-success">${(selectedProduct.product_price - (selectedProduct.product_price * selectedProduct.product_discount / 100)).toFixed(2)}</span>
          </p>
          <p>
            <strong>Discount:</strong> {selectedProduct.product_discount}%
          </p>
          {selectedProduct?.status && (
            <p>
              <strong>Status:</strong>{" "}
              {selectedProduct.status === "approved" ? (
                <span className="badge bg-success">Approved</span>
              ) : selectedProduct.status === "rejected" ? (
                <span className="badge bg-danger">Rejected</span>
              ) : (
                <span className="badge bg-warning">Pending</span>
              )}
            </p>
          )}
          <hr />
          <h6 className="text-muted">👤 Seller Information</h6>
          <UserDetailsCard
            profile_image={selectedProduct.profile_image}
            user_name={selectedProduct.user_name}
            user_email={selectedProduct.user_email}
            user_id={selectedProduct.user_id}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-12 mb-2">
          <strong>Description:</strong> {selectedProduct.product_description}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Table
        PageTitle="🛍️ Product Management"
        pagination={pagination}
        setPagination={setPagination}
        dataLength={products.length || 0}
        searchTerm={searchTerm}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        handleAdd={handleAdd}
      >
        <table className="table table-bordered align-middle text-center table-striped text-nowrap">
          <thead className="table-dark">
            <tr>
              <Th
                children="Product Image & Name"
                sortIcon={getSortIcon("product_name")}
                onClick={() => handleSort("product_name")}
              />
              <Th
                children="Price"
                sortIcon={getSortIcon("product_price")}
                onClick={() => handleSort("product_price")}
              />
              <Th
                children="Discount"
                sortIcon={getSortIcon("product_discount")}
                onClick={() => handleSort("product_discount")}
              />
              <Th
                children="Category"
                sortIcon={getSortIcon("category_name")}
                onClick={() => handleSort("category_name")}
              />
              <Th
                children="Subcategory"
                sortIcon={getSortIcon("subcategory_name")}
                onClick={() => handleSort("subcategory_name")}
              />
              <Th
                children="Status"
                sortIcon={getSortIcon("status")}
                onClick={() => handleSort("status")}
              />
              <Th children="Actions" />
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id}>
                  <td className="d-flex align-items-center gap-2 justify-content-start">
                    <img
                      src={product.product_image[0]}
                      alt={product.product_name}
                      className="rounded"
                      width="40"
                      height="40"
                    />
                    <span>{product.product_name}</span>
                  </td>
                  <td>${product.product_price}</td>
                  <td>{product.product_discount}%</td>
                  <td>{product.category_name}</td>
                  <td>{product.subcategory_name}</td>
                  <td>
                    {product.status === "approved" ? (
                      <span className="badge bg-success">Approved</span>
                    ) : product.status === "rejected" ? (
                      <span className="badge bg-danger">Rejected</span>
                    ) : (
                      <span className="badge bg-warning">Pending</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <i
                        className="bi bi-eye text-primary fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleView(product)}
                        title="View Details"
                      ></i>

                      <i
                        className="bi bi-pencil text-warning fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEdit(product)}
                        title="Edit Product"
                      ></i>

                      {/* <i
                        className="bi bi-trash text-danger fs-5"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDelete(product)}
                        title="Delete Product"
                      ></i> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  {loading ? (
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>
                  ) : (
                    "No products found"
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Table>

      <Modal
        isOpen={isModalOpen}
        type={modalType}
        title="Product"
        onClose={handleCloseModal}
        onSubmit={modalType !== "view" ? handleSubmit : undefined}
      >
        {modalType === "view" ? renderViewModal() : renderProductForm()}
      </Modal>
    </>
  );
};

export default ProductManagement;
