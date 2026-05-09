// ─── System Messages ─────────────────────────────────────────────────────────
// Auto-generated branded messages posted to project chat when platform events
// occur (payment verified, status changed, file uploaded, etc.).
// Content is stored as JSON {icon, title, body} with type='system'.
// Frontend renders them with distinct styling — centered, no avatar, branded.

const prisma   = require('./prisma');
const realtime = require('./realtime');

async function createSystemMessage(projectId, payload) {
  try {
    const project = await prisma.project.findUnique({
      where:  { id: projectId },
      select: { clientId: true },
    });
    if (!project) return null;

    const message = await prisma.message.create({
      data: {
        projectId,
        senderId: null,
        content:  JSON.stringify(payload),
        type:     'system',
        isRead:   false,
      },
    });

    const push = {
      id:        message.id,
      _id:       message.id,
      projectId,
      type:      'system',
      content:   message.content,
      senderId:  null,
      sender:    null,
      isRead:    false,
      createdAt: message.createdAt,
    };

    realtime.publishToUser(project.clientId, 'message:new', push);
    realtime.publishToAdmins('message:new', push);

    return message;
  } catch (err) {
    console.error('[systemMessages] Failed to create:', err.message);
    return null;
  }
}

// ─── Event templates ─────────────────────────────────────────────────────────

const SM = {

  paymentVerified: (projectId) =>
    createSystemMessage(projectId, {
      icon:  '✅',
      title: 'Payment verified — project is now live',
      body:  'Your payment has been confirmed and work begins immediately. You\'ll receive updates here as each milestone is completed.',
    }),

  statusChanged: (projectId, { toStatus }) => {
    const map = {
      paid: {
        icon:  '💳',
        title: 'Payment received',
        body:  'Payment has been recorded. Your project will be activated once verified.',
      },
      'in-progress': {
        icon:  '⚙️',
        title: 'Work in progress',
        body:  'Development is underway. Expect regular progress updates as milestones are completed.',
      },
      review: {
        icon:  '👀',
        title: 'Ready for your review',
        body:  'A deliverable is ready. Please review it and share your feedback below — we\'ll act on it promptly.',
      },
      revision: {
        icon:  '✏️',
        title: 'Revision in progress',
        body:  'Revision request received and we\'re working on it. We\'ll notify you here as soon as it\'s ready.',
      },
      delivered: {
        icon:  '📦',
        title: 'Project delivered',
        body:  'Everything is packaged and ready. All source files and deliverables are now available in your project dashboard.',
      },
      completed: {
        icon:  '🎉',
        title: 'Project complete',
        body:  'Your project is officially complete. All files have been handed over. Thank you for working with us — it was a pleasure.',
      },
      cancelled: {
        icon:  '⚫',
        title: 'Project cancelled',
        body:  'This project has been cancelled. If you have questions or want to start fresh, feel free to reach out anytime.',
      },
    };
    const tmpl = map[toStatus] || {
      icon:  '🔄',
      title: 'Status update',
      body:  `Project status has been updated to "${toStatus}".`,
    };
    return createSystemMessage(projectId, tmpl);
  },

  fileUploaded: (projectId, { fileName, uploaderName }) =>
    createSystemMessage(projectId, {
      icon:  '📎',
      title: 'File uploaded',
      body:  `${uploaderName} added a new file: "${fileName}". Open your project dashboard to view and download it.`,
    }),

  milestoneUpdated: (projectId, { title, status }) =>
    createSystemMessage(projectId, {
      icon:  status === 'paid' ? '✓' : '📌',
      title: status === 'paid' ? 'Milestone complete' : 'Milestone updated',
      body:  `"${title}" has been marked as ${status === 'paid' ? 'complete' : status}.`,
    }),

  revisionRequested: (projectId) =>
    createSystemMessage(projectId, {
      icon:  '🔁',
      title: 'Revision requested',
      body:  'A revision has been logged on this project. We\'ll begin working on it and update you here.',
    }),

};

module.exports = { createSystemMessage, SM };
