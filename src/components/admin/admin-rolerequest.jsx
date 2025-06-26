import toast from "react-hot-toast"
import { usePendingRoleRequests } from "../../lib/utils"
import { Button } from "../ui/button"
import { deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "../../utils/firebase"

export function RoleRequest() {
    const { pendingRequests, loading, error } = usePendingRoleRequests()
    if (loading) return <p>Loading pending requests...</p>
    if (error) return <p>{error}</p>
    if (pendingRequests.length === 0) return <p>No pending requests.</p>
    const approveRequest = async (request) => {
        try {
            const userRef = doc(db, "users", request.userId)
            const requestRef = doc(db, "role_requests", request.id)
            // Update user role
            await updateDoc(userRef, { role: "subadmin" })
            // Optionally delete the request or update status
            await deleteDoc(requestRef)
            toast.success(`Approved role request for ${request.name}`)
        } catch (err) {
            console.error("Error approving role request:", err)
            toast.error("Failed to approve request")
        }
    }

    const rejectRequest = async (request) => {
        try {
          const requestRef = doc(db, "role_requests", request.id)
          await deleteDoc(requestRef)
          toast.success(`Rejected role request for ${request.name}`)
        } catch (err) {
          console.error("Error rejecting role request:", err)
          toast.error("Failed to reject request")
        }
      }
    return (
        <div className="space-y-4">
            {pendingRequests.map((req) => (
                <div
                    key={req.id}
                    className="p-4 border rounded-lg flex justify-between items-center"
                >

                    <div className="flex items-start gap-4">
                        <div>
                            <img src={req.profileImage || "/default-avatar.png"} className="w-12 h-12 rounded-[10px] mr-4" alt="User Avatar" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Name: {req.name}</p>
                            <p className="text-sm text-gray-600">Email: {req.email}</p>
                            <p className="text-xs mt-1">Current role: <b>{req.currentRole}</b></p>
                            <p className="text-xs text-muted-foreground">At: {new Date(req.requestedAt?.seconds * 1000).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">Department:{req.department}</p>
                            <p className="text-sm text-gray-600">Level:{req.level}</p>
                            <p className="text-xs mt-1">Requested role: <b>{req.requestedRole}</b></p>
                            <p className="text-l text-muted-foreground">Number : {req?.whatsappNo}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="default"
                            onClick={() => approveRequest(req)}
                        >
                            Approve
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectRequest(req)}
                        >
                            Reject
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
