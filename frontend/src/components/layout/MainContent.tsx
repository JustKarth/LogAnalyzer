import React from 'react'

interface MainContentProps {
  children: React.ReactNode
  className?: string
}

const MainContent: React.FC<MainContentProps> = ({ children, className = '' }) => {
  return (
    <main id="main-content" tabIndex={-1} className={`flex-1 overflow-y-auto focus:outline-none ${className}`}>
      <div className="animate-fade-in p-4 sm:p-6">
        {children}
      </div>
    </main>
  )
}

export default MainContent