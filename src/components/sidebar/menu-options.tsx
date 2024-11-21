'use client'
import { AgencySidebarOption, SubAccount, SubAccountSidebarOption } from '@prisma/client'
import React, { useEffect, useMemo, useState } from 'react'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui/sheet'
import { Button } from '../ui/button'
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon } from 'lucide-react'
import clsx from 'clsx'
import { AspectRatio } from '../ui/aspect-ratio'
import Image from 'next/image'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import Link from 'next/link'
import { useModal } from '@/providers/modal-provider'
import CustomModal from '../global/custom-modal'

type Props = {
    defaultOpen?: boolean
    subAccounts: SubAccount[]
    sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[]
    sidebarLogo: string
    details: any
    user: any
    id: string | undefined
}

const MenuOptions = ({ details, id, user, sidebarLogo, sidebarOpt, subAccounts, defaultOpen }: Props) => {
    const { setOpen } = useModal()
    const [isMounted, setIsMounted] = useState(false)
    const openState = useMemo(() => defaultOpen ? { open: true } : {}, [defaultOpen])
    useEffect(() => {
        setIsMounted(true)
    }, [])
    if (!isMounted) return
    console.log("user", user)
    return (
        <Sheet modal={false}
            open={true}
        //  {...openState}
        >
            <SheetTrigger asChild className='absolute left-4 top-4 z-[100] md:hidden flex'>
                <Button variant='outline' size={"icon"}>
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent showX={!defaultOpen} side='left' className={clsx("bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6",
                {
                    'hidden md:inline-block z-0 w-[300px] ': defaultOpen,
                    'inline-block md:hidden z-[100] w-full': defaultOpen
                })}>
                <div>
                    <AspectRatio className='' ratio={16 / 5}>
                        <Image src={sidebarLogo} className='rounded-md object-contain' fill alt='sidebar Logo' />
                    </AspectRatio>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant='ghost' className='w-full my-4 flex items-center justify-between py-8'>
                                <div className='flex items-center text-left gap-2'>
                                    <Compass />
                                    <div className='flex flex-col'>{details.name}<span className='text-muted-foreground'>{details.address}</span></div>
                                </div>
                                <div>
                                    <ChevronsUpDown size={16} className='text-muted-foreground' />
                                </div>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-80 h-80 mt-4 z-[200]'>
                            <Command className='rounded-lg'>
                                <CommandInput placeholder='Search Accounts...' />
                                <CommandList className='pb-16'>
                                    <CommandEmpty>No Results Found</CommandEmpty>
                                    {(user?.role === "AGENCY_OWNER" || user?.role === 'AGENCY_ADMIN') &&
                                        user?.Agency?.id && <CommandGroup heading='Agency'>
                                            <CommandItem className="!bg-transparent my-2 text-primary broder-[1px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                                                {defaultOpen ? (
                                                    <Link
                                                        href={`/agency/${user?.Agency?.id}`}
                                                        className="flex gap-4 w-full h-full"
                                                    >
                                                        <div className="relative w-16">
                                                            <Image
                                                                src={user?.Agency?.agencyLogo}
                                                                alt="Agency Logo"
                                                                fill
                                                                className="rounded-md object-contain"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col flex-1">
                                                            {user?.Agency?.name}
                                                            <span className="text-muted-foreground">
                                                                {user?.Agency?.address}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <SheetClose asChild>
                                                        <Link
                                                            href={`/agency/${user?.Agency?.id}`}
                                                            className="flex gap-4 w-full h-full"
                                                        >
                                                            <div className="relative w-16">
                                                                <Image
                                                                    src={user?.Agency?.agencyLogo}
                                                                    alt="Agency Logo"
                                                                    fill
                                                                    className="rounded-md object-contain"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col flex-1">
                                                                {user?.Agency?.name}
                                                                <span className="text-muted-foreground">
                                                                    {user?.Agency?.address}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </SheetClose>
                                                )}
                                            </CommandItem>
                                        </CommandGroup>}
                                    <CommandGroup heading='Accounts'>
                                        {!!subAccounts ? subAccounts.map((subAcc) => (
                                            <CommandItem key={subAcc?.id}>
                                                {defaultOpen ? <Link href={`/subaccount/${subAcc?.id}`} className='flex gap-4 w-full h-full' >
                                                    <div className='relative w-16'>
                                                        <Image src={subAcc?.subAccountLogo} alt='Subaccount Logo' fill className='rounded-md object-contain' />
                                                    </div>
                                                    <div className='flex flex-col flex-1'>
                                                        {subAcc?.name} <span className='text-muted-foreground'>{subAcc?.address}</span>
                                                    </div>
                                                </Link> :
                                                    <SheetClose asChild>
                                                        <Link href={`/subaccount/${subAcc?.id}`} className='flex gap-4 w-full h-full' >
                                                            <div className='relative w-16'>
                                                                <Image src={subAcc?.subAccountLogo} alt='Subaccount Logo' fill className='rounded-md object-contain' />
                                                            </div>
                                                            <div className='flex flex-col flex-1'>
                                                                {subAcc?.name} <span className='text-muted-foreground'>{subAcc?.address}</span>
                                                            </div>
                                                        </Link>
                                                    </SheetClose>}
                                            </CommandItem>
                                        )) : "No Accounts Found"}
                                    </CommandGroup>

                                </CommandList>
                                {(user?.role === "AGENCY_OWNER" || user?.role === 'AGENCY_ADMIN') && (
                                    <Button className='w-full flex gap-2' onClick={() => {
                                        setOpen(<CustomModal title='Create a subAccount' defaultOpen subheading='You can swithch between agency account and subaccount' >
                                            <>Hello</>
                                        </CustomModal>)
                                    }}>
                                        <PlusCircleIcon size={15} />
                                        Create Sub Account
                                    </Button>
                                )}
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default MenuOptions