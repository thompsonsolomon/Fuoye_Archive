import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore"
import { db } from "@/utils/firebase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, UserCheck, UserX } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "react-hot-toast" // Optional but improves UX

export function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const snap = await getDocs(collection(db, "users"))
        const fetchedUsers = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setUsers(fetchedUsers)
      } catch (err) {
        console.error("Error fetching users:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const updateUser = async (id, changes) => {
    try {
      const userRef = doc(db, "users", id)
      await updateDoc(userRef, changes)
      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, ...changes } : u))
      )
      toast.success("User updated successfully")
    } catch (err) {
      console.error("Error updating user:", err)
      toast.error("Failed to update user")
    }
  }

  return (
    <div className="fuoye-card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>

      {loading ? (
        <p className="text-gray-600">Loading users...</p>
      ) : (
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-sm text-gray-600">No users found.</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{user.fullName || "Unnamed User"}</p>
                  <p className="text-sm text-gray-600">{user.email || "No email"}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge
                      variant={
                        user.role === "admin"
                          ? "default"
                          : user.role === "subadmin"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {user.role || "user"}
                    </Badge>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                    >
                      {user.status || "pending"}
                    </Badge>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user.accountType === "user" ? (
                      <DropdownMenuItem
                        onClick={() =>
                          updateUser(user.id, { accountType: "subadmin" })
                        }
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Promote to Subadmin
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() =>
                          updateUser(user.id, { accountType: "user" })
                        }
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Return to User
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() =>
                        updateUser(user.id, {
                          status:
                            user.status === "suspended" ? "active" : "suspended",
                        })
                      }
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      {user.status === "suspended"
                        ? "Restore User"
                        : "Suspend User"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
