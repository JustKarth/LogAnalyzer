

const Navbar = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <p className="text-xl font-bold text-primary-600">LogAnalyzer</p>
          </div>
          <div className="flex items-center space-x-4">
            <button type="button" aria-label="View notifications" className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-1">
              <span className="sr-only">Notifications</span>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button type="button" aria-label="Open user menu" className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full">
              <span className="sr-only">User menu</span>
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                A
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar