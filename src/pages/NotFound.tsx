import { Link } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import { Button, EmptyState } from '../components/ui'

export default function NotFound() {
  return (
    <div className="py-16">
      <EmptyState
        icon={Compass}
        title="404 — Page not found"
        description="This route does not exist. Maybe the evidence was moved to another case."
        action={
          <Link to="/dashboard">
            <Button icon={Home}>Back to Dashboard</Button>
          </Link>
        }
      />
    </div>
  )
}
