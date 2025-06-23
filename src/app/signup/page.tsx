import Form from '@/components/Form'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

export default function page() {
    return (
        <div className='flex flex-col justify-center items-center h-screen'>
          <Card className='w-full m-auto max-w-md'>
            <CardHeader>
            <CardTitle className='font-semibold text-3xl text-center'>Signup</CardTitle>
            </CardHeader>
            <Form type='signup'/>
          </Card>
        </div>
      )
}
