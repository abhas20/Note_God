import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'
import Form from '@/components/Form'

export default function page() {
  return (
    <div className='flex flex-col justify-center items-center h-screen'>
      <Card className='w-full m-auto max-w-md'>
        <CardHeader>
        <CardTitle className='font-semibold text-3xl text-center'>Login</CardTitle>
        </CardHeader>
        <Form type='login'/>
      </Card>
    </div>
  )
}
