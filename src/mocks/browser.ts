import { setupWorker } from 'msw/browser'
import { authHandlers }    from './handlers/auth.handlers'
import { coursesHandlers } from './handlers/courses.handlers'
import { dashboardHandlers }from './handlers/dashboard.handlers'
import { trainerHandlers } from './handlers/trainer.handlers'
import { adminHandlers }   from './handlers/admin.handlers'
import { notificationsHandlers } from './handlers/notifications.handlers'
import { contactHandlers } from './handlers/contact.handlers'

export const worker = setupWorker(
  ...authHandlers,
  ...coursesHandlers,
  ...dashboardHandlers,
  ...trainerHandlers,
  ...adminHandlers,
  ...notificationsHandlers,
  ...contactHandlers,
)
