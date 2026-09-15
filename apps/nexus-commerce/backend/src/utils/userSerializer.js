/**
 * Normalizes a user model/object into a consistent client response DTO.
 * Supports standard auth responses, verification flags, and profile lookups.
 */
export const formatUserResponse = (user, { includeAddresses = false } = {}) => {
  if (!user) return null;

  const id = (user._id || user.id).toString();

  return {
    id,
    _id: id,
    name: user.name || "",
    email: user.email,
    role: user.role || "customer",
    isEmailVerified: Boolean(user.isEmailVerified),
    avatarUrl: user.avatarUrl || null,
    ...(includeAddresses && { addresses: user.addresses || [] }),
  };
};
