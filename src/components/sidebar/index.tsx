import { getAuthUserDetails } from '@/lib/queries'
import React from 'react'
import MenuOptions from './menu-options'

type Props = {
    id?: string,
    type: "agency" | "subaccount"
}

const Sidebar = async ({ id, type }: Props) => {
    const user = await getAuthUserDetails()
    if (!user) return null
    if (!user.Agency) return

    const details = type === "agency" ? user?.Agency : user.Agency.SubAccount.find((subaccount) => subaccount.id === id)
    const isWhiteLabeledAgency = user.Agency.whiteLabel
    if (!details) return
    let sidebarLogo = user.Agency.agencyLogo || "/assets/plura-logo.svg"
    if (!isWhiteLabeledAgency) {
        if (type === 'subaccount') {
            sidebarLogo = user.Agency.SubAccount.find((subaccount) => subaccount.id === id)?.subAccountLogo || user.Agency.agencyLogo
        }
    }
    console.log("id", id)
    const sidebarOpt = type === "agency" ? user.Agency.SidebarOption || [] : user.Agency.SubAccount.find((subaccount) => subaccount.id === id)?.SidebarOption || []
    const subaccounts = user.Agency.SubAccount.filter((subaccount) => user.Permissions.find((permission) => permission.subAccountId === subaccount.id && permission.access))
    return (
        <>
            <MenuOptions defaultOpen={true} user={user} sidebarOpt={sidebarOpt} details={details} id={id} sidebarLogo={sidebarLogo} subAccounts={subaccounts} />
            <MenuOptions sidebarOpt={sidebarOpt} user={user} details={details} id={id} sidebarLogo={sidebarLogo} subAccounts={subaccounts} />
        </>
    )
}

export default Sidebar