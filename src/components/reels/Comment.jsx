// CommentModal.jsx
import { useEffect, useState } from "react"
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore"
import { Dialog } from "@headlessui/react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { db } from "../../utils/firebase"
import { useAuth } from "../../contexts/AuthContext"
import { getUserProfile } from "../../lib/api"

export default function CommentModal({ reelId, open, setOpen }) {
    const [comments, setComments] = useState([])
    const [text, setText] = useState("")
    const { user } = useAuth()

    useEffect(() => {
        if (!reelId) return
        const unsub = onSnapshot(
          collection(db, "reels", reelId, "comments"),
          async (snap) => {
            const commentDocs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            const enrichedComments = await Promise.all(
              commentDocs.map(async (comment) => {
                try {
                  const user = await getUserProfile(comment.userId)
                  return {
                    ...comment,
                    user,
                  }
                } catch (err) {
                  console.error("Failed to fetch user:", err)
                  return comment
                }
              })
            )
    
            setComments(enrichedComments)
          }
        )
    
        return () => unsub()
      }, [reelId])
    
    
    const handlePost = async () => {
        if (text.trim() === "") return
        await addDoc(collection(db, "reels", reelId, "comments"), {
            userId: user.uid,
            text,
            createdAt: serverTimestamp(),
        })
        setText("")
    }

    return (
        <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
            <div className="fixed inset-0 bg-black/50" />
            <div className="fixed inset-0 flex items-end justify-center">
                <Dialog.Panel className="w-full bg-white p-4 rounded-t-lg max-h-[80vh] overflow-y-scroll">
                    <h2 className="text-lg font-bold mb-3">Comments</h2>
                    <div className="space-y-2">
                        {comments.map((c) => (
                            <div key={c.id} className="flex items-start gap-2">
                                <img src={c.user.profileImage || "/placeholder.svg"} className="w-8 h-8 rounded-full" />
                                <div>
                                    <p className="font-semibold">{c.user.fullName}</p>
                                    <p className="text-sm">{c.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex mt-4 gap-2">
                        <Input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Add a comment..."
                        />
                        <Button onClick={handlePost}>Post</Button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}
