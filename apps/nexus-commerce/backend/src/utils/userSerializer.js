/**
 * Normalizes a user model/object into a consistent client response DTO.
 * Supports both standard auth responses and profile lookups.
 */
export const formatUserResponse = (user, { includeAddresses = false } = {}) => {
  if (!user) return null;

  const id = (user._id || user.id).toString();

  return {
    id,
    _id: id, // Provides backward compatibility for both id and _id lookups
    name: user.name || "",
    email: user.email,
    role: user.role || "customer",
    avatarUrl: user.avatarUrl || null,
    ...(includeAddresses && { addresses: user.addresses || [] }),
  };
};
