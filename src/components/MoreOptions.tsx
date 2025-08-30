'use client'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { LoaderPinwheel } from 'lucide-react'
import Link from 'next/link'

function MoreOptions() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleToggle = () => {
    setIsOpen(prev => !prev)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls="more-options-menu"
      >
        <LoaderPinwheel className={`transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
      </Button>

      {isOpen && (
        <ul
          id="more-options-menu"
          className="absolute right-0 top-[calc(100%+8px)] text-center space-y-5 z-50 p-3 w-56 border rounded bg-secondary shadow-md  text-sm"
        >
          <Link href={"/visualise"} className='hover:text-amber-400 no-underline'><li className="hover:underline cursor-pointer" onClick={handleToggle}>Visualize</li></Link>
          <Link href={"/quiz"} className='hover:text-amber-400 hover:no-underline'><li className="hover:underline cursor-pointer" onClick={handleToggle}>Generate Quizes</li></Link>
          <Link href={"/chat"} className='hover:text-amber-400 hover:no-underline'><li className="hover:underline cursor-pointer" onClick={handleToggle}>Community Chat</li></Link>
        </ul>
      )}
    </div>
  )
}

export default MoreOptions
