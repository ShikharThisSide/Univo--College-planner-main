import { useLocation } from 'react-router-dom'
import PageTransition from '../../components/ui/PageTransition'
import EmptyState from '../../components/ui/EmptyState'

const MODULE_COPY = {
  notes: { title: 'No notes yet', description: 'Upload your first note or browse the community Notes Hub. Be the brave one 👀', action: 'Browse Notes Hub' },
  forum: { title: 'No doubts posted yet', description: 'Be the brave one 👀 — ask the first question and start the conversation.', action: 'Post a doubt' },
  confessions: { title: 'The confession board is quiet', description: 'Anonymous. Safe. Judgment-free. Someone has to go first…', action: 'Confess anonymously' },
  marketplace: { title: 'Marketplace is empty', description: 'Buy and sell verified notes, PYQs, and study materials from students like you.', action: 'List an item' },
  messenger: { title: 'No messages yet', description: 'Connect with classmates, study groups, and teachers across Univo.', action: 'Start a conversation' },
  assignments: { title: 'All caught up!', description: 'No pending assignments right now. Enjoy the calm before the storm.', action: 'View completed' },
  attendance: { title: 'Track your attendance', description: 'Log your class attendance and keep an eye on that bunk budget.', action: 'Mark attendance' },
  default: { title: 'Coming soon', description: 'This module is scaffolded and ready for Firebase wiring.', action: 'Back to dashboard' },
}

export default function ModulePlaceholder() {
  const location = useLocation()
  const segment = location.pathname.split('/').pop()
  const copy = MODULE_COPY[segment] || MODULE_COPY.default

  return (
    <PageTransition>
      <EmptyState
        title={copy.title}
        description={copy.description}
        actionLabel={copy.action}
        onAction={() => {}}
      />
    </PageTransition>
  )
}
