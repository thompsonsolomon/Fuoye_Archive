import { AdminStats } from "../../components/admin/admin-stats";
import { PostApproval } from "../../components/admin/post-approval";
import { UserManagement } from "../../components/admin/user-management";


export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, content, and platform analytics</p>
      </div>
      <AdminStats />
      <div className="grid lg:grid-cols-3 gap-8">
        <UserManagement />
        <PostApproval />
      </div>
    </div>
  )
}
