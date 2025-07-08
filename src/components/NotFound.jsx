import React from 'react'

function NotFound() {
  return (
    <div className='d-flex flex-column align-items-center justify-content-center text-center' style={{ height: '100vh', backgroundColor: '#f8f9fa' }}>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <button onClick={() => window.location.href = '/'}>Go to Home</button>
    </div>
  )
}

export default NotFound
