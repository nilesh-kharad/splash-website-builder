import Unauthorized from '@/components/unauthorized'
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  searchParams: { state: string; code: string }
}

const SubAccountMainPage = async ({ searchParams }: Props) => {
  const params = await Promise.resolve(searchParams); // Await if necessary
  searchParams = params
  const agencyId = await verifyAndAcceptInvitation()
  console.log("agencyId", agencyId)
  if (!agencyId) {
    return <Unauthorized />
  }

  const user = await getAuthUserDetails()
  if (!user) return

  const getFirstSubaccountWithAccess = user.Permissions.find(
    (permission) => permission.access === true
  )
  console.log("getFirstSubaccountWithAccess", getFirstSubaccountWithAccess)
  console.log("stateSubaccountId", searchParams)
  if (searchParams.state) {
    const statePath = searchParams.state.split('___')[0]
    const stateSubaccountId = searchParams.state.split('___')[1]
    if (!stateSubaccountId) return <Unauthorized />
    return redirect(
      `/subaccount/${stateSubaccountId}/${statePath}?code=${searchParams.code}`
    )
  }

  if (getFirstSubaccountWithAccess) {
    return redirect(`/subaccount/${getFirstSubaccountWithAccess.subAccountId}`)
  }

  return <Unauthorized />
}

export default SubAccountMainPage
