"use client"

import { Notes } from '@prisma/client'
import { SearchIcon } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { Input } from './ui/input'
import { SidebarGroupContent as SidebarGroupContentShadCN, SidebarMenu, SidebarMenuItem} from './ui/sidebar'
import Fuse from 'fuse.js'
import SelectNoteButton from './SelectNoteButton'
import DeleteNoteButton from './DeleteNoteButton'

type props={
    notes:Notes[]
}

export default function SidebarGroupContent({notes}:props) {
    // console.log(notes)
    const [searchText,setSearchText]=useState('');
    const [availableNotes,setAvailableNotes]=useState(notes);

    useEffect(()=>{
      setAvailableNotes(notes);
    },[notes])

    const fuse=useMemo(()=>{
      return new Fuse(availableNotes,{
        keys:["note"],
        threshold:0.4
      })
    },[availableNotes])

    const filteredNotes= searchText? fuse.search(searchText).map((result)=>result.item):availableNotes

    const deleteNoteLocally=(noteId:string)=>{
      setAvailableNotes((prevNote)=>{
        return prevNote.filter((note) => note.id !== noteId)
      })
    }

  return (
      <SidebarGroupContentShadCN className='flex flex-col gap-4'>
      Find your notes here:
      
          <div className='relative flex items-center '>
            <SearchIcon className='absolute left-2 size-4'/>
            <Input className="bg-muted pl-8" placeholder='Search your notes'
            value={searchText}
            onChange={(e)=>{setSearchText(e.target.value)}}/>
          </div>
          <SidebarMenu>
          {filteredNotes.map((note) => (
            <SidebarMenuItem key={note.id} className='group/item'>

              <SelectNoteButton note={note}/>
              <DeleteNoteButton noteId={note.id} deletenoteLocally={deleteNoteLocally}/>
            </SidebarMenuItem>
          ))}
          </SidebarMenu>
        </SidebarGroupContentShadCN>
    
  )
}
