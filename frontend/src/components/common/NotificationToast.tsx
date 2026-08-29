import { useNotifications } from '../../contexts'

const typeStyles = {
  success: 'border-green-200 bg-green-50 text-green-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
}

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-2"
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`pointer-events-auto animate-slide-up rounded-lg border p-4 shadow-medium ${typeStyles[notification.type]}`}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{notification.title}</p>
              <p className="mt-1 text-sm">{notification.message}</p>
            </div>
            <button
              type="button"
              aria-label={`Dismiss ${notification.title}`}
              onClick={() => removeNotification(notification.id)}
              className="rounded-md text-current/70 hover:text-current focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationToast
