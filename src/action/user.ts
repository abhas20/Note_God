"use server"

import { createClient, getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";


export const loginAction=async(email:string,password:string)=>{
    try {
        const {auth}=await createClient();
        const {error}=await auth.signInWithPassword({
            email:email,
            password:password
        })
        if(error){
            throw error;
        }
        return {errorMessage:null};
    } catch (error) {
        return handleError(error);
    }
}

export const logOut=async()=>{
    try {
        const {auth}=await createClient();
        const {error}=await auth.signOut();
        if(error){
            throw error;
        }
        return {errorMessage:null};
    } catch (error) {
        return handleError(error);
    }
}

export const signupAction=async(email:string,password:string)=>{
    try {
        const {auth}=await createClient();
        const {error,data}=await auth.signUp({
            email:email,
            password:password
        })
        const userId=data.user?.id;
        if(!userId) throw new Error(("User not found"))
            // add user to database
        await prisma.user.create({
            data:{
                id:userId,
                email,
                imgUrl:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFU7U2h0umyF0P6E_yhTX45sGgPEQAbGaJ4g&s"
            }
        })
        if(error){
            throw error;
        }
        return {errorMessage:null};
    } catch (error) {
        return handleError(error);
    }
}

export const getCurrentUser = async () => {
  try {
    const user = await getUser();
    if (!user) throw new Error("User not found");

    const currUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true, imgUrl: true }
    });

    return { currUser };
  } catch (error) {
    return handleError(error);
  }
};

export const updateUserProfile = async (email: string, imgUrl: string | null) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("User not found");

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { email, imgUrl }
    });

    return { updatedUser };
  } catch (error) {
    return handleError(error);
  }
};