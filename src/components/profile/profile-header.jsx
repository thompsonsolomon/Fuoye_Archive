

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, UserPlus, X, Upload } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { db } from "../../utils/firebase"
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore"
import { Input } from "../ui/input"
import { Dialog } from "@headlessui/react"
import { uploadToCloudinary, usePendingRoleRequests } from "../../lib/utils"
import toast from "react-hot-toast"

export function ProfileHeader() {
  const { profile, user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const PendingRole = usePendingRoleRequests()
  const [IsRolePending, setIsRolePending] = useState(false)
  const [openRoleContact, setOpenRoleContact] = useState(false)
  useEffect(() => {
    if (PendingRole) {
      const pendingRequest = PendingRole.pendingRequests.find(request => request.userId === user.uid)
      setIsRolePending(pendingRequest)
    }
  }, [PendingRole, user.uid])
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || "",
    department: profile?.department || "",
    level: profile?.level || "",
    profileImage: profile?.profileImage || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      const result = await uploadToCloudinary(file)
      if (result) {
        setFormData({ ...formData, profileImage: result })
      } else {
        toast.error("Failed to upload image")
      }
    } catch (err) {
      console.error("Upload failed:", err)
      toast.error("Image upload failed.")
    } finally {
      setUploading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        department: formData.department,
        level: formData.level,
        profileImage: formData.profileImage,
      })
      toast.success("Profile updated successfully!")
      setIsEditing(false)
    } catch (err) {
      console.error("Failed to update profile:", err)
      toast.error("An error occurred while updating your profile.")
    }
  }

  const handleRequestRole = async () => {
    if (!formData.whatsapp && !profile.whatsappNo) {
      setOpenRoleContact(true)
      return
    }
    try {
      await addDoc(collection(db, "role_requests"), {
        userId: user.uid,
        name: profile.fullName,
        email: user.email,
        currentRole: profile.role || "user",
        requestedRole: "subadmin",
        status: "pending",
        department: profile.department || "Mathematics",
        level: profile.level || "100",
        profileImage: profile.profileImage || "",
        requestedAt: serverTimestamp(),
        whatsappNo: formData.whatsapp || "",
      })
      setIsRolePending(true)
      toast.success("Request submitted! Admin will review it soon.")
    } catch (error) {
      console.error("Error submitting role request:", error)
      toast.error("Failed to submit request. Try again.")
    }
  }


  return (
    <>
      <div className="fuoye-card p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <img
            src={profile?.profileImage || "/placeholder.svg?height=100&width=100"}
            alt={profile?.fullName || "User"}
            className="rounded-full w-[100px] h-[100px] object-cover border-2 border-gray-300 mb-4 md:mb-0 md:mr-6 md:w-[120px] md:h-[120px] md:border-gray-400"
            loading="lazy"
            decoding="async"
          />

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile?.fullName}</h1>
            <p className="text-gray-600 mb-1">{profile?.email}</p>
            <p className="text-gray-600 mb-1">{profile?.department}</p>
            <p className="text-gray-600 mb-4">{profile?.level}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              {profile?.role === "user" && (
                <Button variant="outline" size="sm" onClick={handleRequestRole} disabled={IsRolePending}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {
                    IsRolePending ? "Request Pending" : "Request Subadmin Role"
                  }
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔧 Modal */}
      <Dialog open={isEditing} onClose={() => setIsEditing(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Edit Profile</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <Input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
            />
            <Input
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Department"
            />
            <Input
              name="level"
              value={formData.level}
              onChange={handleChange}
              placeholder="Level"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {uploading && <p className="text-sm text-emerald-700 mt-2">Uploading...</p>}
              {formData.profileImage && (
                <img
                  src={formData.profileImage}
                  alt="Preview"
                  className="mt-3 w-24 h-24 rounded-full object-cover border"
                />
              )}
            </div>

            <Button className="w-full fuoye-button" onClick={handleUpdate} disabled={uploading}>
              {uploading ? "Uploading..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={openRoleContact} onClose={() => setOpenRoleContact(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Contact</h2>
            <Button variant="ghost" size="icon" onClick={() => setOpenRoleContact(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div>
            <h2 className="text-sm  text-gray-700 mb-3">Enter Whatsapp Number To place Request </h2>
            <Input
              type="text"
              placeholder="Enter Whatsapp Number"
              className="mb-4"
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            />
            <Button
              className="w-full fuoye-button"
              onClick={handleRequestRole}
              disabled={IsRolePending || !formData.whatsapp}
            >
              {IsRolePending ? "Request Pending" : "Request Subadmin Role"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
