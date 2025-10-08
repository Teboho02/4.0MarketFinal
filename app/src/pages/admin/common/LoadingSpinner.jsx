const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="text-center py-12">
      <div className="spinner mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  )
}

export default LoadingSpinner