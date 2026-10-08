import { AccountLayout } from '@/components/account/AccountLayout'
import { WalletForm } from '@/components/account/WalletForm'
import { AppShell } from '@/components/layout/AppShell'

export function WalletsPage() { return <AppShell withFooter={false}><AccountLayout><WalletForm/></AccountLayout></AppShell> }
