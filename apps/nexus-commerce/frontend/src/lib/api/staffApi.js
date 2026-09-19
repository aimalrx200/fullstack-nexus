// apps/nexus-commerce/frontend/src/lib/api/staffApi.js
import apiClient from "./client";

export const staffApi = {
  getStaffMembers: async (params = {}) => {
    const { data } = await apiClient.get("/admin/staff", { params });
    return data;
  },

  inviteStaffMember: async ({ name, email, role }) => {
    const { data } = await apiClient.post("/admin/staff/invite", {
      name,
      email,
      role,
    });
    return data;
  },

  updateStaffRole: async (userId, role) => {
    const { data } = await apiClient.patch(`/admin/staff/${userId}/role`, {
      role,
    });
    return data;
  },

  revokeStaffAccess: async (userId) => {
    const { data } = await apiClient.delete(`/admin/staff/${userId}`);
    return data;
  },
};
