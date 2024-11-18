"use client"
import * as z from 'zod'
import { Agency } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '../ui/form'
import { useForm } from 'react-hook-form'
import { NumberInput } from '@tremor/react'
import { useToast } from '@/hooks/use-toast'
import FileUpload from '../global/file-upload'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { deleteAgency, initUser, saveActivityLogsNotification, updateAgencyDetails, upsertAgency } from '@/lib/queries'
import { Button } from '../ui/button'
import { Loader, Loader2, LoaderCircleIcon } from 'lucide-react'
import Loading from '../global/loading'
import { v4 } from 'uuid'
type Props = {
    data?: Partial<Agency>
}
const FormSchema = z.object({
    name: z.string().min(2, { message: 'Agency name must be atleast 2 charactors' }),
    companyEmail: z.string().min(1),
    companyPhone: z.string().min(1),
    whiteLabel: z.boolean(),
    address: z.string().min(1),
    city: z.string().min(1),
    zipCode: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    agencyLogo: z.string().min(1)
})
const AgencyDetails = ({ data }: Props) => {
    const { toast } = useToast()
    const router = useRouter()
    const [deletingAgency, setDeletingAgency] = useState(false)
    const form = useForm<z.infer<typeof FormSchema>>({
        mode: 'onChange', resolver: zodResolver(FormSchema), defaultValues: {
            name: data?.name || "",
            companyEmail: data?.companyEmail || "",
            companyPhone: data?.companyPhone || "",
            whiteLabel: data?.whiteLabel || false,
            address: data?.address || "",
            city: data?.city || "",
            zipCode: data?.zipCode || "",
            state: data?.state || "",
            country: data?.country || "",
            agencyLogo: data?.agencyLogo || ""
        }
    })
    const isLoading = form.formState.isSubmitting
    const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
        try {
            let newUserData
            let customerId
            if (!data?.id) {
                const bodyData = {
                    email: values.companyEmail,
                    name: values.name,
                    shipping: {
                        address: {
                            city: values.city,
                            line1: values.address,
                            postal_code: values.zipCode,
                            state: values.state,
                        },
                        name: values.name
                    },
                    address: {
                        city: values.city,
                        line1: values.address,
                        postal_code: values.zipCode,
                        state: values.state,
                    },
                }
            }
            //WIP:custId
            newUserData = await initUser({ role: 'AGENCY_OWNER' })
            if (!data?.id) {
                const response = await upsertAgency({
                    id: data?.id ? data.id : v4(),
                    customerId: data?.customerId || null,
                    address: values.address,
                    agencyLogo: values.agencyLogo,
                    city: values.city,
                    companyPhone: values.companyPhone,
                    country: values.country,
                    name: values.name,
                    state: values.state,
                    whiteLabel: values.whiteLabel,
                    zipCode: values.zipCode,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    companyEmail: values.companyEmail,
                    connectAccountId: '',
                    goal: 5,
                })
                toast({ title: "Agency Created", description: "Created your agency" })
                return router.refresh()
            }
        } catch (error) {
            toast({ variant: 'destructive', title: "Oops!", description: "Could not create your Agency" })
            console.log(error)
        }
    }
    const handleDeleteAgency = async () => {
        if (!data?.id) return
        setDeletingAgency(true)
        //WIP: discontinue the subscription for user
        try {
            const response = await deleteAgency(data?.id)
            toast({ title: "Agency deleted", description: "Deleted your agency and all sub-accounts" })
            return router.refresh()
        } catch (error) {
            toast({ variant: 'destructive', title: "Oops!", description: "Could not delete Agency" })
            console.log(error)
        }
        setDeletingAgency(false)
    }
    useEffect(() => {
        console.log("data", data)
        if (!data) {
            form.reset(data)
        }
    }, [data])

    return <AlertDialog>
        <Card className='w-full'>
            <CardHeader>
                <CardTitle>
                    Agency Information
                </CardTitle>
                <CardDescription>
                    Let's create Agency for your business
                </CardDescription>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
                            <FormField disabled={isLoading} control={form.control} name='agencyLogo' render={({ field }) => <FormItem>
                                <FormLabel>Agency Logo</FormLabel>
                                <FormControl>
                                    <FileUpload apiEndPoint={'agencyLogo'} onChange={field.onChange} value={field.value} />
                                </FormControl>
                            </FormItem>} />
                            <div className='flex md:flex-row gap-4'>
                                <FormField disabled={isLoading} control={form.control} name='name' render={({ field }) => <FormItem className='flex-1'>
                                    <FormLabel>Agency Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Agency Name' {...field} />
                                    </FormControl>
                                </FormItem>} />
                                <FormField disabled={isLoading} control={form.control} name='companyEmail' render={({ field }) => <FormItem className='flex-1'>
                                    <FormLabel>companyEmail</FormLabel>
                                    <FormControl>
                                        <Input placeholder='companyEmail' {...field} />
                                    </FormControl>
                                </FormItem>} />
                            </div>
                            <div className='flex md:flex-row gap-7'>
                                <FormField disabled={isLoading} control={form.control} name='companyPhone' render={({ field }) => <FormItem className='flex-1'>
                                    <FormLabel>companyPhone</FormLabel>
                                    <FormControl>
                                        <Input placeholder='companyPhone' {...field} />
                                    </FormControl>
                                </FormItem>} />
                                <FormField disabled={isLoading} control={form.control} name='whiteLabel' render={({ field }) => <FormItem className='flex flex-col rounded-lg border gap-4 mt-1 p-4'>
                                    <FormLabel>whiteLabel</FormLabel>
                                    <FormControl>
                                        <Switch id="airplane-mode" checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>} />
                            </div>
                            <div className='flex md:flex-row gap-4'>
                                <FormField disabled={isLoading} control={form.control} name='address' render={({ field }) => <FormItem className='flex-1'>
                                    <FormLabel>address</FormLabel>
                                    <FormControl>
                                        <Input placeholder='address' {...field} />
                                    </FormControl>
                                </FormItem>} />
                            </div>
                            <div className='flex md:flex-row gap-4'>
                                <FormField disabled={isLoading} control={form.control} name='city' render={({ field }) => <FormItem className='flex-1'>
                                    <FormLabel>city</FormLabel>
                                    <FormControl>
                                        <Input placeholder='city' {...field} />
                                    </FormControl>
                                </FormItem>} />
                                <FormField disabled={isLoading} control={form.control} name='zipCode' render={({ field }) => <FormItem className='flex-1'>
                                    <FormLabel>zipCode</FormLabel>
                                    <FormControl>
                                        <Input placeholder='zipCode' {...field} />
                                    </FormControl>
                                </FormItem>} />
                                <FormField disabled={isLoading} control={form.control} name='state' render={({ field }) => <FormItem className='flex-1'>
                                    <FormLabel>state</FormLabel>
                                    <FormControl>
                                        <Input placeholder='state' {...field} />
                                    </FormControl>
                                </FormItem>} />
                                <FormField disabled={isLoading} control={form.control} name='country' render={({ field }) => <FormItem className='flex-1'>
                                    <FormLabel>country</FormLabel>
                                    <FormControl>
                                        <Input placeholder='country' {...field} />
                                    </FormControl>
                                </FormItem>} />
                            </div>
                            {data?.id && <div className='flex flex-col gap-2'>
                                <FormLabel>Create A goal</FormLabel>
                                <FormDescription>
                                    create goal for your agency projects/clients
                                </FormDescription>
                                <NumberInput defaultValue={data?.goal} onValueChange={async (val) => {
                                    if (!data?.id) return
                                    await updateAgencyDetails(data.id, { goal: val })
                                    await saveActivityLogsNotification({ agencyId: data?.id, description: `updated the agency goal to ${val} SubAccount`, subaccountId: undefined })
                                    return router.refresh()
                                }} min={1} className='bg-background !border !border-input' placeholder='Sub-Account goal' />
                            </div>}
                            <Button className='' type='submit' disabled={isLoading}>
                                {isLoading ? <Loading /> : "Save Agency Information"}
                            </Button>
                        </form>
                    </Form>
                    {data?.id && <div className='flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4'>
                        <div>
                            <div>Danger zone</div>
                        </div>
                        <div className='text-muted-foreground'>
                            Deleting your agency will delete all data related to your agency, and this cannot be undone.
                        </div>
                        <AlertDialogTrigger disabled={isLoading || deletingAgency} className='text-red-600 p-2 text-center mt-2 rounded-md hover:bg-red-600 hover:text-white whitespace-nowrap' >
                            {deletingAgency ? "Deleting..." : "Delete agency"}
                        </AlertDialogTrigger>
                    </div>}
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-left">
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-left">
                                This action cannot be undone. This will permanently delete the
                                Agency account and all related sub accounts.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex items-center">
                            <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                disabled={deletingAgency}
                                className="bg-destructive hover:bg-destructive"
                                onClick={handleDeleteAgency}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </CardContent>
            </CardHeader>
        </Card>
    </AlertDialog>
}

export default AgencyDetails