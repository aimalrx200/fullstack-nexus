// apps/nexus-commerce/frontend/src/pages/storefront/AccountPage.jsx

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { useDelayedLoading } from "../../hooks/useDelayedLoading";
import { authApi } from "../../lib/api/authApi";
import { orderApi } from "../../lib/api/orderApi";
import { queryKeys } from "../../lib/api/queryKeys";
import { setCredentials } from "../../redux/slices/authSlice";
import { OrderSummaryCard } from "../../components/storefront/orders/OrderSummaryCard";
import { OrderCardSkeleton } from "../../components/feedback/OrderCardSkeleton";
import { AddressFormModal } from "../../components/storefront/account/AddressFormModal";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import {
  Package,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Building2,
  Briefcase,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";

export function AccountPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, isEmailVerified } = useAuth();

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // 1. Fetch Past Orders
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: queryKeys.orders.customerList(),
    queryFn: () => orderApi.getCustomerOrders(),
  });

  // 2. Fetch Customer Addresses
  const { data: addresses = [] } = useQuery({
    queryKey: queryKeys.auth.addresses(),
    queryFn: () => authApi.getAddresses(),
    initialData: user?.addresses || [],
  });

  const showSkeleton = useDelayedLoading(isLoadingOrders, {
    delay: 120,
    minDuration: 3000,
  });

  // 3. Add / Edit Address Mutation
  const saveAddressMutation = useMutation({
    mutationFn: async (payload) => {
      if (editingAddress?._id) {
        return await authApi.updateAddress(editingAddress._id, payload);
      }
      return await authApi.addAddress(payload);
    },
    onSuccess: (updatedAddresses) => {
      queryClient.setQueryData(queryKeys.auth.addresses(), updatedAddresses);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });

      if (user) {
        dispatch(setCredentials({ ...user, addresses: updatedAddresses }));
      }

      setIsAddressModalOpen(false);
      setEditingAddress(null);
      toast.success(
        editingAddress ? "Address updated!" : "New address saved to book!",
      );
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to save address.");
    },
  });

  // 4. Delete Address Mutation
  const deleteAddressMutation = useMutation({
    mutationFn: (addressId) => authApi.deleteAddress(addressId),
    onSuccess: (updatedAddresses) => {
      queryClient.setQueryData(queryKeys.auth.addresses(), updatedAddresses);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });

      if (user) {
        dispatch(setCredentials({ ...user, addresses: updatedAddresses }));
      }

      toast.info("Address removed from book.");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete address.");
    },
  });

  const getLabelIcon = (lbl) => {
    const clean = lbl?.toLowerCase();
    if (clean === "office" || clean === "work") return Briefcase;
    if (clean === "apartment") return Building2;
    return Home;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="p-6 rounded-3xl bg-surface-card border border-border-main flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-xl font-mono">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold text-text-main">{user?.name}</h1>
            <p className="text-xs text-text-muted font-mono">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isEmailVerified ? "success" : "warning"} size="sm">
            {isEmailVerified ? "EMAIL VERIFIED" : "UNVERIFIED"}
          </Badge>
          <Badge variant="glow" size="sm">
            VIP SHOPPER
          </Badge>
          {user?.passkeys?.length > 0 && (
            <Badge variant="brand" size="sm">
              <Fingerprint className="w-3.5 h-3.5 mr-1 inline" />
              {user.passkeys.length} PASSKEY(S)
            </Badge>
          )}
        </div>
      </div>

      {/* Saved Address Book Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-text-main flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-primary" />
              <span>Saved Delivery Addresses</span>
            </h2>
            <p className="text-xs text-text-muted">
              Used for 1-click checkout and automated GPS dispatch calculations.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingAddress(null);
              setIsAddressModalOpen(true);
            }}
          >
            Add Address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-card border border-border-main text-center text-xs text-text-muted space-y-3">
            <p className="font-mono">
              No saved addresses found. Add an address to speed up checkout.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingAddress(null);
                setIsAddressModalOpen(true);
              }}
            >
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addresses.map((addr) => {
              const LabelIcon = getLabelIcon(addr.label);
              return (
                <div
                  key={addr._id}
                  className={`p-4 rounded-2xl bg-surface-card border transition-all flex flex-col justify-between space-y-3 ${
                    addr.isDefault
                      ? "border-brand-primary/50 shadow-md shadow-brand-primary/5"
                      : "border-border-main"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-main flex items-center gap-1.5">
                        <LabelIcon className="w-3.5 h-3.5 text-brand-primary" />
                        <span>{addr.label || "Home"}</span>
                      </span>

                      {addr.isDefault && (
                        <Badge variant="brand" size="sm">
                          DEFAULT
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-text-muted space-y-0.5">
                      <p className="font-semibold text-text-main">
                        {addr.recipientName}
                      </p>
                      <p>{addr.street}</p>
                      <p>
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="font-mono text-[11px] pt-1 text-text-faint">
                        {addr.phone}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border-subtle flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(addr);
                        setIsAddressModalOpen(true);
                      }}
                      className="min-h-8 px-2.5 rounded-lg bg-surface-elevated hover:bg-surface-hover text-text-muted hover:text-text-main text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAddressMutation.mutate(addr._id)}
                      disabled={deleteAddressMutation.isPending}
                      className="min-h-8 px-2.5 rounded-lg text-text-faint hover:text-rose-400 hover:bg-rose-500/10 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order History & Live Radar Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-text-main flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-primary" />
          <span>Past Orders & Live Tracking</span>
        </h2>

        {showSkeleton ? (
          <OrderCardSkeleton count={4} />
        ) : ordersData?.orders?.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-card border border-border-main text-center text-xs text-text-muted font-mono">
            You have not placed any orders yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
            {ordersData?.orders?.map((ord) => (
              <OrderSummaryCard key={ord._id} order={ord} showTrackingLink />
            ))}
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        initialData={editingAddress}
        onSave={saveAddressMutation.mutate}
        isLoading={saveAddressMutation.isPending}
      />
    </div>
  );
}
