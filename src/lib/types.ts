import { Notification, Prisma, Role } from "@prisma/client";
import { getAuthUserDetails, getFunnels, getMedia, getUserPermissions } from "./queries";
import { db } from "./db";
import { z } from "zod";



export type NotificationWithUser =
  | ({
    User: {
      id: string
      name: string
      avatarUrl: string
      email: string
      createdAt: Date
      updatedAt: Date
      role: Role
      agencyId: string | null
    }
  } & Notification)[]
  | undefined
const __getUsersWithAgencySubAccountPermissionsSidebarOptions = async (
  agencyId: string
) => {
  return await db.user.findFirst({
    where: { Agency: { id: agencyId } },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  })
}
export type UsersWithAgencySubAccountPermissionsSidebarOptions =
  Prisma.PromiseReturnType<
    typeof __getUsersWithAgencySubAccountPermissionsSidebarOptions
  >

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<
  typeof getUserPermissions
>

export type AuthUserWithAgencySigebarOptionsSubAccounts =
  Prisma.PromiseReturnType<typeof getAuthUserDetails>


export type GetMediaFiles = Prisma.PromiseReturnType<typeof getMedia>
export type CreateMediaType = Prisma.MediaCreateWithoutSubaccountInput

export const CreateFunnelFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  subDomainName: z.string().optional(),
  favicon: z.string().optional(),
})

export type FunnelsForSubAccount = Prisma.PromiseReturnType<
  typeof getFunnels
>[0]


export type UpsertFunnelPage = Prisma.FunnelPageCreateWithoutFunnelInput



export const ContactUserFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email(),
})

export const FunnelPageSchema = z.object({
  name: z.string().min(1),
  pathName: z.string().optional(),
})