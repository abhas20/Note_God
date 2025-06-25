"use client"

import { User } from "@supabase/supabase-js"
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { useRef, useState, useTransition, Fragment } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpIcon } from "lucide-react"
import { Textarea } from "./ui/textarea"
import { askAINoteAction } from "@/action/note"
import '@/style/ai-response.css'

type Props={
  user:User | null
}

export default function AskAIButton({user}:Props) {
  console.log(user?.email);
  const [open,setOpen] =useState(false);
  const [ questions, setQuestions] = useState("");
  const [ questionText, setQuestionText] = useState<string[]>([]);
  const [ response, setResponse] = useState<string[]>([])

  const router=useRouter();
  const [isPending,startTransition]=useTransition();

  const textRef=useRef<HTMLTextAreaElement>(null);
  const contentRef=useRef<HTMLDivElement>(null);

  const handleInput=()=>{
    const textArea=textRef.current
    if(!textArea) return;
    textArea.style.height="auto";
    textArea.style.height=`${textArea.scrollHeight}px`
  }
  const handleClickInput=()=>{
    textRef.current?.focus();
  }

  const handleSubmit=()=>{
    if(questions.trim()==="") return;

    const newQuestion=[...questionText,questions]
    setQuestionText(newQuestion)
    setQuestions("")
    setTimeout(scrollToBottom, 200);
    startTransition(async ()=>{
      const responses = await askAINoteAction(newQuestion, response)
      // Ensure responses is a string before adding to state
      setResponse(prev => [...prev, typeof responses === "string" ? responses : JSON.stringify(responses)])
      setTimeout(scrollToBottom, 100);
    })
  }
  const scrollToBottom=()=>{
    contentRef.current?.scrollTo({
      top:contentRef.current.scrollHeight,
      behavior:"smooth"
    })
  }

  const handleKeyDown=(e:React.KeyboardEvent<HTMLTextAreaElement>)=>{
    if(e.key==="Enter" && !e.shiftKey){
      e.preventDefault();
      handleSubmit();
    }
  }

  const handleOpen=(isOpen:boolean)=>{
    if (!user){
      router.push("/login")
    }
    else{
      if(isOpen){
        setQuestions("");
        setQuestionText([]);
        setResponse([]);
      }
      setOpen(isOpen)
    }
  }


  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Ask AI Help</Button>
      </DialogTrigger>
      <DialogContent className="custom-scrollbar flex h-[85vh] max-w-4xl flex-col overflow-y-auto" ref={contentRef}>
        <DialogHeader>
          <DialogTitle>Ask Any Doubts</DialogTitle>
          <DialogDescription>
            Ask any doubt, get instant AI-powered answers to your questions.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-8">
          {questionText.map((question, idx) => (
            <Fragment key={idx}>
              <p className="bg-muted text-muted-foreground ml-auto max-w-[60%] rounded-md px-2 py-1 text-sm">
              {question}
              </p>
              {
                response[idx] && (
                  <p
                  className="bot-response text-muted-foreground text-sm"
                  dangerouslySetInnerHTML={{__html:response[idx]}}
                  />
                )
              }
            </Fragment>
          ))}
          {isPending && <p className="animate-pulse text-sm">Just Thinking...</p>}
        </div>
        <div onClick={handleClickInput} className="mt-auto flex cursor-text flex-col rounded-lg border p-4">
          <Textarea ref={textRef} 
          placeholder="Ask me anything..."
          className="placeholder:text-muted-foreground resize-none rounded-none border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{
              minHeight: "0",
              lineHeight: "normal",
            }} 
            rows={1}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            value={questions}
            onChange={(e)=>setQuestions(e.target.value)}
            />

            <Button className="ml-auto size-8 rounded-full" onClick={handleSubmit}>
            <ArrowUpIcon className="text-background" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
