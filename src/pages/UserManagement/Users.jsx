import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Topbar from '../../components/Topbar/Topbar';
import './Users.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    mobile: '', 
    gender: '',
    country: '',
    state: '',
    city: '',
    aboutMe: '',
    profile_image: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_page: 1,
    per_page: 10,
    total_records: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.current_page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token=localStorage.getItem('authToken')
      
      const response = await axios.get('http://18.209.91.97:3030/api/users/get-all-users', {
        params: {
          page: pagination.current_page,
          limit: pagination.per_page
        },
        headers: {
        'Authorization': `Bearer ${token}`
      }
      });
      
      setUsers(response.data.data.users);
      setPagination({
        current_page: response.data.data.current_page,
        total_page: response.data.data.total_page,
        per_page: response.data.data.per_page,
        total_records: response.data.data.total_records
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error('Failed to fetch users');
    }
  };

  const handleView = (index) => {
    setSelectedUserIndex(index);
    setFormData({
      name: users[index].name,
      email: users[index].email,
      mobile: users[index].mobile,
      gender: users[index].gender,
      country: users[index].country,
      state: users[index].state,
      city: users[index].city,
      aboutMe: users[index].aboutMe || 'Not provided',
      profile_image: users[index].profile_image || 'https://i.pravatar.cc/300'
    });
    setModalType('view');
  };

  const handleEdit = (index) => {
    setSelectedUserIndex(index);
    setFormData({
      name: users[index].name,
      email: users[index].email,
      mobile: users[index].mobile,
      gender: users[index].gender,
      country: users[index].country,
      state: users[index].state,
      city: users[index].city,
      aboutMe: users[index].aboutMe || '',
      profile_image: users[index].profile_image || ''
    });
    setModalType('edit');
  };

  const handleCloseModal = () => {
    setSelectedUserIndex(null);
    setModalType(null);
    setFormData({ 
      name: '', 
      email: '', 
      mobile: '', 
      gender: '',
      country: '',
      state: '',
      city: '',
      aboutMe: '',
      profile_image: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const userId = users[selectedUserIndex].userId;
      await axios.put(`http://18.209.91.97:3030/api/users/update-user/${userId}`, formData);
      
      const updatedUsers = [...users];
      updatedUsers[selectedUserIndex] = { ...updatedUsers[selectedUserIndex], ...formData };
      setUsers(updatedUsers);
      
      handleCloseModal();
      toast.success('User updated successfully!');
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.total_page) {
      setPagination(prev => ({ ...prev, current_page: newPage }));
    }
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 bg-light">
          <Topbar />
          <div className="p-4 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="flex-grow-1 bg-light">
          <Topbar />
          <div className="p-4 text-center text-danger">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 bg-light">
        <Topbar />
        <div className="p-4">
          <h3 className="mb-4 fw-bold text-dark">👥 User Management</h3>
          
          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Avatar & Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Gender</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user._id}>
                    <td className="d-flex align-items-center gap-2 justify-content-start">
                      <img 
                        src={user.profile_image || 'https://i.pravatar.cc/40'} 
                        alt="avatar" 
                        className="rounded-circle" 
                        width="40" 
                        height="40" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://i.pravatar.cc/40';
                        }}
                      />
                      <span>{user.name}</span>
                    </td>
                    <td>{user.email}</td>
                    <td className="text-success">{user.mobile}</td>
                    <td>{user.gender}</td>
                    <td>
                      <i
                        className="bi bi-eye text-primary fs-5 me-3"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleView(idx)}
                        title="View User"
                      ></i>
                      <i
                        className="bi bi-pencil text-warning fs-5"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleEdit(idx)}
                        title="Edit User"
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                >
                  Previous
                </button>
              </li>
              
              {Array.from({ length: pagination.total_page }, (_, i) => i + 1).map(page => (
                <li 
                  key={page} 
                  className={`page-item ${page === pagination.current_page ? 'active' : ''}`}
                >
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              
              <li className={`page-item ${pagination.current_page === pagination.total_page ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>

          {/* Modal */}
          {modalType && (
            <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {modalType === 'view' ? '👁️ View User' : '✏️ Edit User'}
                    </h5>
                    <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                  </div>
                  <div className="modal-body">
                    {modalType === 'view' ? (
                      <div className="row">
                        <div className="col-md-4 text-center">
                          <img 
                            src={formData.profile_image || 'https://i.pravatar.cc/300'} 
                            alt="profile" 
                            className="img-fluid rounded-circle mb-3"
                            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://i.pravatar.cc/300';
                            }}
                          />
                        </div>
                        <div className="col-md-8">
                          <p><strong>Name:</strong> {formData.name}</p>
                          <p><strong>Email:</strong> {formData.email}</p>
                          <p><strong>Mobile:</strong> {formData.mobile}</p>
                          <p><strong>Gender:</strong> {formData.gender}</p>
                          <p><strong>Country:</strong> {formData.country}</p>
                          <p><strong>State:</strong> {formData.state}</p>
                          <p><strong>City:</strong> {formData.city}</p>
                          <p><strong>About Me:</strong> {formData.aboutMe}</p>
                        </div>
                      </div>
                    ) : (
                      <form>
                        <div className="row">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Name</label>
                              <input 
                                type="text" 
                                name="name" 
                                className="form-control" 
                                value={formData.name} 
                                onChange={handleChange} 
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Email</label>
                              <input 
                                type="email" 
                                name="email" 
                                className="form-control" 
                                value={formData.email} 
                                onChange={handleChange} 
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Mobile</label>
                              <input 
                                type="text" 
                                name="mobile" 
                                className="form-control" 
                                value={formData.mobile} 
                                onChange={handleChange} 
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Gender</label>
                              <select 
                                name="gender" 
                                className="form-select" 
                                value={formData.gender} 
                                onChange={handleChange}
                              >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label">Country</label>
                              <input 
                                type="text" 
                                name="country" 
                                className="form-control" 
                                value={formData.country} 
                                onChange={handleChange} 
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">State</label>
                              <input 
                                type="text" 
                                name="state" 
                                className="form-control" 
                                value={formData.state} 
                                onChange={handleChange} 
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">City</label>
                              <input 
                                type="text" 
                                name="city" 
                                className="form-control" 
                                value={formData.city} 
                                onChange={handleChange} 
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Profile Image URL</label>
                              <input 
                                type="text" 
                                name="profile_image" 
                                className="form-control" 
                                value={formData.profile_image} 
                                onChange={handleChange} 
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">About Me</label>
                          <textarea 
                            name="aboutMe" 
                            className="form-control" 
                            rows="3" 
                            value={formData.aboutMe} 
                            onChange={handleChange}
                          ></textarea>
                        </div>
                      </form>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Close
                    </button>
                    {modalType === 'edit' && (
                      <button type="button" className="btn btn-primary" onClick={handleSave}>
                        Save Changes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default Users;