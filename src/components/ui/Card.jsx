function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 ${className}`}>
      {children}
    </div>
  )
}

export default Card