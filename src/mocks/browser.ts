import { setupWorker } from 'msw/browser'
import { authHandlers }    from './handlers/auth.handlers'
import { coursesHandlers } from './handlers/courses.handlers'
import { dashboardHandlers }from './handlers/dashboard.handlers'
import { resourcesHandlers } from './handlers/resources.handlers'
import { trainerHandlers } from './handlers/trainer.handlers'
import { adminHandlers }   from './handlers/admin.handlers'
import { notificationsHandlers } from './handlers/notifications.handlers'
import { contactHandlers } from './handlers/contact.handlers'
import { assignmentsHandlers } from './handlers/assignments.handlers'

export const worker = setupWorker(
  ...authHandlers,
  ...coursesHandlers,
  ...dashboardHandlers,
  ...resourcesHandlers,
  ...trainerHandlers,
  ...adminHandlers,
  ...notificationsHandlers,
  ...contactHandlers,
  ...assignmentsHandlers,
)
