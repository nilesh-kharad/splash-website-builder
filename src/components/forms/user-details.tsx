'use client'
import { useToast } from '@/hooks/use-toast'
import { getAuthUserDetails } from '@/lib/queries'
import { AuthUserWithAgencySigebarOptionsSubAccounts, UserWithPermissionsAndSubAccounts } from '@/lib/types'
import { useModal } from '@/providers/modal-provider'
import { SubAccount, User } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

type Props = {
    id: string | null
    type: 'agency' | 'subaccount'
    userData?: Partial<User>
    subAccounts: SubAccount[]
}

const UserDetails = ({ id, type, subAccounts, userData }: Props) => {
    
    const [subAccountPermissions,setSubAccountPermissions] = useState<UserWithPermissionsAndSubAccounts | null>(null)
    const {data,setClose} = useModal()
    const [roleState, setRoleState] = useState('')
    const [loadingPermissions,setLoadingPermissions] = useState(false)
    const {toast} = useToast()
    const router = useRouter()
    const [authUserData, setAuthUserData] = useState<AuthUserWithAgencySigebarOptionsSubAccounts | null >(null)

    //get authuser details
    useEffect(()=>{
        if(data.user){
            const fetchDetails = async ()=>{
                const res = await getAuthUserDetails()
                if(res){
                    console.log("res", res)
                }
            }
            fetchDetails()
        }
    },[data])



    return (
        <div>UserDetails</div>
    )
}

export default UserDetails