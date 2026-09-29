// apps/nexus-commerce/frontend/src/components/storefront/account/AddressFormModal.jsx

import React, { useState } from "react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import { AddressAutocomplete } from "../checkout/AddressAutocomplete";
import { DeliveryPinMap } from "../checkout/DeliveryPinMap";
import { PhoneInputField } from "../checkout/PhoneInputField";
import { CheckCircle2, Home, Building2, Briefcase } from "lucide-react";
import { toast } from "sonner";

const PRESET_LABELS = [
  { label: "Home", icon: Home },
  { label: "Office", icon: Briefcase },
  { label: "Apartment", icon: Building2 },
];

function AddressFormContent({ initialData, onSave, onClose, isLoading }) {
  const isEditing = Boolean(initialData?._id);

  const [label, setLabel] = useState(initialData?.label || "Home");
  const [recipientName, setRecipientName] = useState(
    initialData?.recipientName || "",
  );
  const [phone, setPhone] = useState(initialData?.phone || "+92 300 1234567");
  const [street, setStreet] = useState(initialData?.street || "");
  const [city, setCity] = useState(initialData?.city || "Lahore");
  const [state, setState] = useState(initialData?.state || "Punjab");
  const [postalCode, setPostalCode] = useState(
    initialData?.postalCode || "54000",
  );
  const [isDefault, setIsDefault] = useState(Boolean(initialData?.isDefault));
  const [coordinates, setCoordinates] = useState(
    initialData?.coordinates?.lat && initialData?.coordinates?.lng
      ? initialData.coordinates
      : { lat: 31.5204, lng: 74.3587 },
  );

  const [errors, setErrors] = useState({});

  const handleFieldChange = (field, val) => {
    if (field === "street") setStreet(val);
    if (field === "city") setCity(val);
    if (field === "state") setState(val);
    if (field === "postalCode") setPostalCode(val);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!recipientName || recipientName.trim().length < 2) {
      newErrors.recipientName = "Recipient name must be at least 2 characters.";
    }
    if (!phone || phone.trim().length < 8) {
      newErrors.phone = "Valid contact phone is required.";
    }
    if (!street || street.trim().length < 3) {
      newErrors.street = "Street address must be at least 3 characters.";
    }
    if (!city || city.trim().length < 2) {
      newErrors.city = "City is required.";
    }
    if (!state || state.trim().length < 2) {
      newErrors.state = "Province / State is required.";
    }
    if (!postalCode || postalCode.trim().length < 2) {
      newErrors.postalCode = "Valid postal code is required (e.g. 54000).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please complete the required address fields.");
      return;
    }

    const payload = {
      label,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: "Pakistan",
      countryCode: "PK",
      isDefault,
      coordinates,
    };

    onSave(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[75dvh] overflow-y-auto pr-1 custom-scrollbar"
    >
      {/* 1. Address Type Tag Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-text-main">
          Address Label
        </label>
        <div className="flex gap-2">
          {PRESET_LABELS.map((item) => {
            const Icon = item.icon;
            const isSelected = label === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setLabel(item.label)}
                className={`min-h-9 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                    : "bg-surface-elevated text-text-muted hover:text-text-main border-border-main"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Recipient Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-text-muted">
          Recipient Full Name <span className="text-brand-primary">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Farhan Ali"
          value={recipientName}
          onChange={(e) => {
            setRecipientName(e.target.value);
            if (errors.recipientName) {
              setErrors((prev) => ({ ...prev, recipientName: undefined }));
            }
          }}
          className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary"
        />
        {errors.recipientName && (
          <p className="text-[11px] text-rose-500 font-medium">
            {errors.recipientName}
          </p>
        )}
      </div>

      {/* 3. Phone Input */}
      <PhoneInputField
        value={phone}
        onChange={(val) => {
          setPhone(val);
          if (errors.phone) {
            setErrors((prev) => ({ ...prev, phone: undefined }));
          }
        }}
        error={errors.phone}
        label="Contact Mobile Number"
        required
      />

      {/* 4. Street, Province, City & Postal Code Dynamic Fields */}
      <AddressAutocomplete
        street={street}
        city={city}
        state={state}
        postalCode={postalCode}
        onChange={handleFieldChange}
        errors={errors}
      />

      {/* 5. Interactive GPS Drop Pin */}
      <DeliveryPinMap
        coordinates={coordinates}
        onPinChange={setCoordinates}
        city={city}
      />

      {/* 6. Default Address Checkbox */}
      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-elevated border border-border-subtle cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="w-4 h-4 rounded border-border-main text-brand-primary focus:ring-0 cursor-pointer"
        />
        <div className="text-xs">
          <span className="font-semibold text-text-main block">
            Set as primary default address
          </span>
          <span className="text-[11px] text-text-muted">
            Auto-selected when initiating fast checkout.
          </span>
        </div>
      </label>

      {/* 7. Modal Actions */}
      <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={CheckCircle2}
          isLoading={isLoading}
        >
          {isEditing ? "Save Address Changes" : "Save Address"}
        </Button>
      </div>
    </form>
  );
}

export function AddressFormModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  isLoading,
}) {
  const isEditing = Boolean(initialData?._id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Delivery Address" : "Add New Delivery Address"}
      description="Save delivery locations for 1-click biometric checkout and GPS route dispatch."
      maxWidth="max-w-xl"
    >
      {isOpen && (
        <AddressFormContent
          key={initialData?._id || "new-address"}
          initialData={initialData}
          onSave={onSave}
          onClose={onClose}
          isLoading={isLoading}
        />
      )}
    </Modal>
  );
}
