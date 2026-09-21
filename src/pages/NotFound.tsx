import { Link } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import { Button, EmptyState } from '../components/ui'
import { useI18n } from '../i18n/useI18n'

export default function NotFound() {
  const { t } = useI18n()
  return (
    <div className="py-16">
      <EmptyState
        icon={Compass}
        title={t('nf.title')}
        description={t('nf.desc')}
        action={
          <Link to="/dashboard">
            <Button icon={Home}>{t('nf.back')}</Button>
          </Link>
        }
      />
    </div>
  )
}
