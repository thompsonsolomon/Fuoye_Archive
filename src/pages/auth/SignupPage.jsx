import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { uploadToCloudinary } from "../../lib/utils"
import { signUpUser } from "../../lib/api"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../utils/firebase"


const departments = [
  "Computer Science", "Engineering", "Medicine", "Law", "Business Administration",
  "Agriculture", "Mathematics", "History", "Education", "Social Sciences", "Sciences Faculty",
]

const levels = ["100", "200", "300", "400"]

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    level: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
  
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
  
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
  
    setLoading(true)
  
    try {
      let profileImageUrl = ""
  
      if (imageFile) {
        toast.loading("Uploading image...")
        profileImageUrl = await uploadToCloudinary(imageFile)
        toast.dismiss()
      }
  
      const userData = {
        fullName: formData.fullName,
        department: formData.department,
        level: formData.level,
        profileImage: profileImageUrl,
        email: formData.email,
        role: "user",
        createdAt: new Date().toISOString(),
      }
  
      const { user, error } = await signUpUser(formData.email, formData.password, userData)
  
      if (error) {
        toast.error(error.message)
      } else {
        toast.success("Account created successfully!")
        navigate("/login")
      }
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }
  

  // const handleSubmit = async (e) => {
  //   e.preventDefault()

  //   if (formData.password !== formData.confirmPassword) {
  //     toast.error("Passwords do not match")
  //     return
  //   }

  //   if (formData.password.length < 6) {
  //     toast.error("Password must be at least 6 characters")
  //     return
  //   }

  //   // if (!formData.email.includes("fuoye")) {
  //   //   toast.error("Email must be a FUOYE email")
  //   //   return
  //   // }

  //   setLoading(true)

  //   try {
  //     let profileImageUrl = ""

  //     // if (imageFile) {
  //     //   toast.loading("Uploading image...")
  //     //   profileImageUrl = await uploadToCloudinary(imageFile)
  //     //   toast.dismiss()
  //     // }

  //     // const userData = {
  //     //   fullName: formData.fullName,
  //     //   department: formData.department,
  //     //   level: formData.level,
  //     //   profileImage: profileImageUrl,
  //     //   email: formData.email,
  //     //   role: "user",
  //     //   createdAt: new Date().toISOString(),
  //     // }

  //     const {error } = ""
  //     // const { user, error } = await signUpUser(formData.email, formData.password, userData)

  //     const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  //     const user = userCredential.user
  //     if (error) {
  //       toast.error(error.message)
  //     } else {
  //       await addToCollection("users", { uid: user.uid, ...userData })
  //       toast.success("Account created successfully!")
  //       navigate("/login")
  //     }

  //   } catch (err) {
  //     console.error(err)
  //     toast.error("Something went wrong")
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Create account</CardTitle>
          <p className="text-sm text-muted-foreground text-center">Join the FUOYE Archive community</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
              <Input id="fullName" value={formData.fullName} onChange={(e) => handleChange("fullName", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium">Profile Image</label>
              <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>{departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}</SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Level</label>
                <Select value={formData.level} onValueChange={(value) => handleChange("level", value)}>
                  <SelectTrigger><SelectValue placeholder="Select Level" /></SelectTrigger>
                  <SelectContent>{levels.map((lvl) => (
                    <SelectItem key={lvl} value={lvl}>{lvl} Level</SelectItem>
                  ))}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => handleChange("password", e.target.value)} required />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} required />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full fuoye-button" disabled={loading}>
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>) : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-emerald-800 hover:text-emerald-700 font-medium">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
