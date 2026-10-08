import { AccountLayout } from '@/components/account/AccountLayout'
import { ProfileForm } from '@/components/account/ProfileForm'
import { AppShell } from '@/components/layout/AppShell'

export function ProfilePage() { return <AppShell withFooter={false}><AccountLayout><ProfileForm/></AccountLayout></AppShell> }
