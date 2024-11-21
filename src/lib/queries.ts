"use server"

import { clerkClient, currentUser } from "@clerk/nextjs/server"
import { db } from "./db"
import { redirect } from "next/navigation"
import { Agency, Plan, SubAccount, User } from "@prisma/client"
import { connect } from "http2"
import { v4 } from "uuid"
const cleark_client = await clerkClient();

export const getAuthUserDetails = async () => {
    const user = await currentUser()
    if (!user) return
    const userData = await db.user.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress
        },
        include: {
            Agency: {
                include: {
                    SidebarOption: true,
                    SubAccount: {
                        include: {
                            SidebarOption: true
                        }
                    }
                }
            },
            Permissions: true
        }
    })
    return userData
}

export const verifyAndAcceptInvitation = async () => {
    const user = await currentUser()
    if (!user) return redirect('sign-in')
    const invitationExists = await db.invitation.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress, status: 'PENDING'
        }
    })
    if (invitationExists) {
        const userDetails = await createTeamUser(invitationExists.agencyId, {
            email: invitationExists.email,
            agencyId: invitationExists.agencyId,
            avatarUrl: user.imageUrl,
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: invitationExists.role,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        await saveActivityLogsNotification({ agencyId: invitationExists?.agencyId, description: 'Joined', subaccountId: undefined })
        if (userDetails) {
            await cleark_client.users.updateUserMetadata(user.id, {
                privateMetadata: {
                    role: userDetails.role || 'SUBACCOUNT_USER',
                }
            });
            await db.invitation.delete({
                where: { email: userDetails.email }
            })
            return userDetails.agencyId
        } else {
            return null
        }
    } else {
        const agency = await db.user.findUnique({
            where: {
                email: user.emailAddresses[0].emailAddress
            }
        })
        return agency ? agency.agencyId : null
    }

}

export const saveActivityLogsNotification = async ({ agencyId, description, subaccountId }:
    { agencyId?: string, description: string, subaccountId?: string }) => {
    const authUser = await currentUser()
    let userData
    if (!authUser) {
        const response = await db.user.findFirst({
            where: {
                Agency: {
                    SubAccount: {
                        some: { id: subaccountId }
                    }
                }
            }
        })
        if (response) {
            userData = response
        }
    } else {
        userData = await db.user.findUnique({
            where: { email: authUser?.emailAddresses[0].emailAddress },
        })
    }
    if (!userData) {
        console.log('could not fine user');
        return
    }
    let foundAgencyId = agencyId
    if (!foundAgencyId) {
        if (!subaccountId) {
            throw new Error("you need to provide atleast an agency Id or subaccount id")
        }
        const response = await db.subAccount.findUnique({
            where: {
                id: subaccountId
            }
        })
        if (response) foundAgencyId = response.agencyId
    }
    if (subaccountId) {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id
                    }
                },
                Agency: {
                    connect: {
                        id: foundAgencyId
                    }
                },
                SubAccount: {
                    connect: {
                        id: subaccountId
                    }
                }
            }
        })
    } else {
        await db.notification.create({
            data: {
                notification: `${userData.name} ${description}`,
                User: {
                    connect: {
                        id: userData.id
                    }
                },
                Agency: {
                    connect: {
                        id: foundAgencyId
                    }
                }
            }
        })
    }

}
export const createTeamUser = async (agencyId: string, user: User) => {
    if (user.role === 'AGENCY_OWNER') return null
    const response = await db.user.create({ data: { ...user } })
    return response
}

export const updateAgencyDetails = async (agencyId: string, agencyDetails: Partial<Agency>) => {
    const response = await db.agency.update({
        where: {
            id: agencyId
        },
        data: {
            ...agencyDetails
        }
    })
    return response
}

export const deleteAgency = async (agencyId: string) => {
    const response = await db.agency.delete({ where: { id: agencyId } })
    return response
}
export const initUser = async (newUser: Partial<User>) => {
    const user = await currentUser()
    if (!user) return
    const userData = await db.user.upsert(
        {
            where: {
                email: user.emailAddresses[0].emailAddress
            },
            update: newUser,
            create: {
                id: user.id,
                avatarUrl: user.imageUrl,
                email: user.emailAddresses[0].emailAddress,
                name: `${user.firstName} ${user.lastName}`,
                role: newUser.role || 'SUBACCOUNT_USER'
            }
        })
    await cleark_client.users.updateUserMetadata(user.id, {
        privateMetadata: {
            role: newUser.role || 'SUBACCOUNT_USER',
        }
    })
    return userData
}

export const upsertAgency = async (agency: Agency) => {
    if (!agency.companyEmail) return null
    try {
        const agencyDetails = await db.agency.upsert({
            where: {
                id: agency.id
            },
            update: agency,
            create: {
                users: {
                    connect: {
                        email: agency.companyEmail
                    }
                },
                ...agency,
                SidebarOption: {
                    create: [
                        {
                            name: 'Dashboard',
                            icon: 'category',
                            link: `/agency/${agency.id}`,
                        },
                        {
                            name: 'Launchpad',
                            icon: 'clipboardIcon',
                            link: `/agency/${agency.id}/launchpad`,
                        },
                        {
                            name: 'Billing',
                            icon: 'payment',
                            link: `/agency/${agency.id}/billing`,
                        },
                        {
                            name: 'Settings',
                            icon: 'settings',
                            link: `/agency/${agency.id}/settings`,
                        },
                        {
                            name: 'Sub Accounts',
                            icon: 'person',
                            link: `/agency/${agency.id}/all-subaccounts`,
                        },
                        {
                            name: 'Team',
                            icon: 'shield',
                            link: `/agency/${agency.id}/team`,
                        },
                    ],
                }
            }
        })
        console.log('agencyDetails', agencyDetails);
        return agencyDetails
    } catch (error) {
        console.log('error', error);
    }
}

export const getNotificationAndUser = async (agencyId: string) => {
    try {
        const response = await db.notification.findMany({
            where: { agencyId },
            include: { User: true },
            orderBy: {
                createdAt: 'desc',
            },
        })
        return response
    } catch (error) {
        console.log(error)
    }
}

export const upsertSubAccount = async (subaccount: SubAccount) => {
    if (!subaccount.companyEmail) return null
    const agencyOwner = await db.user.findFirst({
        where: {
            Agency: { id: subaccount.agencyId },
            role: 'AGENCY_OWNER'
        }
    })
    if (!agencyOwner) return console.log("Error")
    const permissionId = v4()
    const response = await db.subAccount.upsert({
        where: {
            id: subaccount.id
        },
        update: subaccount,
        create: {
            ...subaccount,
            Permissions: {
                create: {
                    access: true,
                    email: agencyOwner.email,
                    id: permissionId
                },
                connect: { subAccountId: subaccount.id, id: permissionId }
            },
            Pipeline: {
                create: {
                    name: 'Lead Cycle'
                }
            },
            SidebarOption: {
                create: [
                    {
                        name: 'Launchpad',
                        icon: 'clipboardIcon',
                        link: `/subaccount/${subaccount.id}/launchpad`,
                    },
                    {
                        name: 'Settings',
                        icon: 'settings',
                        link: `/subaccount/${subaccount.id}/settings`,
                    },
                    {
                        name: 'Funnels',
                        icon: 'pipelines',
                        link: `/subaccount/${subaccount.id}/funnels`,
                    },
                    {
                        name: 'Media',
                        icon: 'database',
                        link: `/subaccount/${subaccount.id}/media`,
                    },
                    {
                        name: 'Automations',
                        icon: 'chip',
                        link: `/subaccount/${subaccount.id}/automations`,
                    },
                    {
                        name: 'Pipelines',
                        icon: 'flag',
                        link: `/subaccount/${subaccount.id}/pipelines`,
                    },
                    {
                        name: 'Contacts',
                        icon: 'person',
                        link: `/subaccount/${subaccount.id}/contacts`,
                    },
                    {
                        name: 'Dashboard',
                        icon: 'category',
                        link: `/subaccount/${subaccount.id}`,
                    },
                ],
            },
        }
    })
    return response
}