"use client"

import { getCurrentUser, updateUserProfile } from "@/action/user";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { handleError } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type User = {
  email: string;
  imgUrl: string | null;
};

export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setUpdating] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [newImgUrl, setNewImgUrl] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await getCurrentUser();
        if ("errorMessage" in response) throw new Error(response.errorMessage);

        const { currUser } = response;
        if (!currUser) {
          toast.error("Error", { description: "No user found.", duration: 2000 });
          setUser(null);
        } else {
          setUser({ email: currUser.email, imgUrl: currUser.imgUrl });
          setNewImgUrl(currUser.imgUrl ?? "");
        }
      } catch (error) {
        const newError = handleError(error);
        toast.error("Error", {
          description: newError.errorMessage,
          duration: 2000,
        });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleImgUpdate = async () => {
    if (!user) return;

    if (user.imgUrl === newImgUrl) {
      setEditMode(false);
      return; // No change
    }

    setUpdating(true);
    try {
      const response = await updateUserProfile(user.email, newImgUrl);
      if ("errorMessage" in response) throw new Error(response.errorMessage);

      const { updatedUser } = response;
      if (!updatedUser) {
        toast.error("Error", {
          description: "Failed to update user profile.",
          duration: 2000,
        });
        return;
      }

      setUser({ email: updatedUser.email, imgUrl: updatedUser.imgUrl });
      toast.success("Profile updated successfully", { duration: 2000 });
    } catch (error) {
      const newError = handleError(error);
      toast.error("Error", {
        description: newError.errorMessage,
        duration: 2000,
      });
      console.error(error);
    } finally {
      setUpdating(false);
      setEditMode(false);
    }
  };

  return isLoading ? (
    <Loader2 className="mx-auto mt-20 animate-spin" />
  ) : user ? (
    <Card className="mx-auto mt-10 max-w-md p-6 shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-semibold">
          My Profile
        </CardTitle>
      </CardHeader>

      <img
        src={
          user.imgUrl ??
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9pU5Uo_89gxknb72fs5xpyJYH6_cGdC7FnQ&s"
        }
        className="mx-auto mb-4 h-24 w-24 rounded-full object-cover shadow-md border-amber-400 border-2"
        alt="Profile"
      />

      {editMode ? (
        <div className="mb-4 space-y-2">
          <input
            type="text"
            value={newImgUrl}
            onChange={(e) => setNewImgUrl(e.target.value)}
            placeholder="Enter new image URL"
            className="w-full rounded border px-3 py-2"
          />
          <div className="flex justify-center gap-2">
            <Button
              variant="default"
              onClick={handleImgUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditMode(false);
                setNewImgUrl(user?.imgUrl ?? ""); // Reset to original
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => setEditMode(true)}
        >
          Edit Profile Image
        </Button>
      )}

      <p className="text-lg text-center font-semibold">{user.email}</p>

      <Button variant={"outline"} onClick={() => router.push("/")}>
        Go Back
      </Button>
    </Card>
  ) : (
    <div className="mx-auto mt-10 max-w-sm rounded border p-4 text-center shadow">
      <p className="text-lg font-semibold">No user found.</p>
      <Button variant={"outline"} onClick={() => router.push("/")}>
        Go Back
      </Button>
    </div>
  );
}
