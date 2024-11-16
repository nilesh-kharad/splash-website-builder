"use client"
import * as z from 'zod'
import { Agency } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { AlertDialog } from '../ui/alert-dialog'
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '../ui/form'
import { useForm } from 'react-hook-form'
import { useToast } from '@/hooks/use-toast'
import FileUpload from '../global/file-upload'
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
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
            name: data?.name,
            companyEmail: data?.companyEmail,
            companyPhone: data?.companyPhone,
            whiteLabel: data?.whiteLabel || false,
            address: data?.address,
            city: data?.city,
            zipCode: data?.zipCode,
            state: data?.state,
            country: data?.state,
            agencyLogo: data?.agencyLogo
        }
    })
    const isLoading = form.formState.isSubmitting
    const handleSubmit = async () => {

    }
    useEffect(() => {
        if (data) {
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
                                <FormField disabled={isLoading} control={form.control} name='whiteLabel' render={({ field }) => <FormItem className='flex flex-col'>
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
                        </form>
                    </Form>
                </CardContent>
            </CardHeader>
        </Card>
    </AlertDialog>
}

export default AgencyDetails