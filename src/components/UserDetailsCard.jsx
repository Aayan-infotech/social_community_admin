function UserDetailsCard({ profile_image, user_name, user_email, user_id }) {
  return (
    <div className="d-flex align-items-center">
      <img
        src={profile_image}
        alt="Seller"
        className="rounded-circle me-3"
        style={{
          width: "50px",
          height: "50px",
          objectFit: "cover",
        }}
      />
      <div>
        <strong>{user_name}</strong>
        <p className="mb-0">
          <i className="bi bi-envelope me-2"></i>
          {user_email}
        </p>
        <p className="mb-0">
          <i className="bi bi-person me-2"></i>ID: {user_id}
        </p>
      </div>
    </div>
  );
}

export default UserDetailsCard;
