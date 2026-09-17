import React, { useState } from "react";
import { useNavigate } from "react-router";
import { CheckoutStepper } from "../../components/storefront/checkout/CheckoutStepper";
import { AddressAutocomplete } from "../../components/storefront/checkout/AddressAutocomplete";
import { DeliveryPinMap } from "../../components/storefront/checkout/DeliveryPinMap";
import { PhoneInputField } from "../../components/storefront/checkout/PhoneInputField";
import { PaymentSelector } from "../../components/storefront/checkout/PaymentSelector";
import { CartSummary } from "../../components/storefront/cart/CartSummary";
import { Button } from "../../components/common/Button";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { orderApi } from "../../lib/api/orderApi";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totals, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.addresses?.[0]?.phone || "");
  const [recipientName, setRecipientName] = useState(
    user?.addresses?.[0]?.recipientName || user?.name || "",
  );
  const [street, setStreet] = useState(user?.addresses?.[0]?.street || "");
  const [city, setCity] = useState(user?.addresses?.[0]?.city || "Lahore");
  const [state, setState] = useState(user?.addresses?.[0]?.state || "Punjab");
  const [postalCode, setPostalCode] = useState(
    user?.addresses?.[0]?.postalCode || "54000",
  );
  const [coordinates, setCoordinates] = useState(
    user?.addresses?.[0]?.coordinates || { lat: 31.5204, lng: 74.3587 },
  );

  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [mobileNumber, setMobileNumber] = useState("");

  const handleAddressChange = (key, val) => {
    if (key === "street") setStreet(val);
    if (key === "city") setCity(val);
    if (key === "state") setState(val);
    if (key === "postalCode") setPostalCode(val);
  };

  const handlePlaceOrder = async () => {
    if (!email || !street || !city || !phone) {
      toast.error("Please fill in all required delivery details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        cartId: localStorage.getItem("nexus_guest_session_id") || "active_cart",
        customerEmail: email,
        customerPhone: phone,
        paymentMethod,
        mobileNumber: mobileNumber || phone,
        shippingAddress: {
          recipientName: recipientName || "Customer",
          phone,
          street,
          city,
          state,
          postalCode,
          country: "Pakistan",
          countryCode: "PK",
          coordinates,
        },
      };

      const data = await orderApi.createOrder(orderPayload);
      clearCart();
      toast.success("Order Placed Successfully!");
      navigate(`/orders/track/${data.order?.orderNumber || data.order?._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Order placement failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      <CheckoutStepper currentStep={step} onStepClick={setStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Step Form */}
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="p-6 rounded-3xl bg-surface-card border border-border-main space-y-5">
              <h3 className="text-sm font-bold text-text-main">
                1. Delivery & Contact Details
              </h3>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-muted">
                  Recipient Name <span className="text-brand-primary">*</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-muted">
                  Email for Receipt & Tracking{" "}
                  <span className="text-brand-primary">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <PhoneInputField value={phone} onChange={setPhone} />

              <AddressAutocomplete
                street={street}
                city={city}
                state={state}
                postalCode={postalCode}
                onChange={handleAddressChange}
              />

              <DeliveryPinMap
                coordinates={coordinates}
                onPinChange={setCoordinates}
                city={city}
              />

              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                onClick={() => setStep(2)}
                className="w-full font-bold"
              >
                Proceed to Payment Method
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="p-6 rounded-3xl bg-surface-card border border-border-main space-y-6">
              <h3 className="text-sm font-bold text-text-main">
                2. Select Payment Method
              </h3>

              <PaymentSelector
                selectedMethod={paymentMethod}
                onSelectMethod={setPaymentMethod}
                mobileNumber={mobileNumber}
                onMobileNumberChange={setMobileNumber}
                totalUSD={totals.totalUSD}
                totalPKR={totals.totalPKR}
              />

              <div className="flex gap-3">
                <Button variant="ghost" size="lg" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="luxury"
                  size="lg"
                  icon={ShieldCheck}
                  isLoading={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="flex-1 font-bold shadow-lg shadow-indigo-500/25"
                >
                  Confirm & Authorize Payment
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="p-6 rounded-3xl bg-surface-card border border-border-main h-fit space-y-4">
          <h4 className="text-xs font-bold text-text-main uppercase font-mono">
            Order Review ({items.length} items)
          </h4>
          <CartSummary />
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-faint pt-2 border-t border-border-subtle">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Encrypted Multi-Gateway Transaction</span>
          </div>
        </div>
      </div>
    </div>
  );
}
