// CommentModal.jsx
import { useEffect, useState } from "react"
import { addDoc, collection, onSnapshot, serverTimestamp } from "firebase/firestore"
import { Dialog } from "@headlessui/react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { db } from "../../utils/firebase"
import { useAuth } from "../../contexts/AuthContext"
import { getUserProfile } from "../../lib/api"
import { useOffline } from "../../contexts/OfflineContext"

export default function CommentModal({ reelId, open, setOpen }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState("")
  const { user } = useAuth()
  const { isOnline } = useOffline()

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

          {!isOnline && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-yellow-800 text-sm">
              You need an internet connection to post comments.
            </div>
          )}
          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-blue-800 text-sm">
              Please sign in to post comments.
            </div>
          )}

          <div className="flex mt-4 gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              disabled={!isOnline || !user}
            />
            <Button onClick={handlePost}>Post</Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
