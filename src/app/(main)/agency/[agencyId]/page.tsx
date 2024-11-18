import React from 'react'

type Props = {}

const Page = async (context: { params: { agencyId: string } }) => {
    const params = await Promise.resolve(context.params); // Await if necessary

    return (
        <div>{params.agencyId}</div>
    )
}

export default Page
