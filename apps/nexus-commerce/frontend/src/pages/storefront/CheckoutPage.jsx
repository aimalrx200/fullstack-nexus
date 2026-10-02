// apps/nexus-commerce/frontend/src/pages/storefront/CheckoutPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { CheckoutStepper } from "../../components/storefront/checkout/CheckoutStepper";
import { AddressAutocomplete } from "../../components/storefront/checkout/AddressAutocomplete";
import { DeliveryPinMap } from "../../components/storefront/checkout/DeliveryPinMap";
import { PhoneInputField } from "../../components/storefront/checkout/PhoneInputField";
import { PaymentSelector } from "../../components/storefront/checkout/PaymentSelector";
import { WalletAuthorizationModal } from "../../components/storefront/checkout/WalletAuthorizationModal";
import { CartSummary } from "../../components/storefront/cart/CartSummary";
import { Button } from "../../components/common/Button";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { orderApi } from "../../lib/api/orderApi";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight, Lock, MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/api/queryKeys";
import { CheckoutPageSkeleton } from "../../components/feedback/CheckoutPageSkeleton";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder_key",
);

function CheckoutFormContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const stripe = useStripe();
  const elements = useElements();

  const { cartId, items, totals, clearCart, isCartLoading } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address & Contact Information State
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

  // Gateway Selection State
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [mobileNumber, setMobileNumber] = useState("");

  // In-App Mobile Wallet MPIN Modal State
  const [pendingWalletOrder, setPendingWalletOrder] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isAuthorizingWallet, setIsAuthorizingWallet] = useState(false);

  const handleAddressChange = (key, val) => {
    if (key === "street") setStreet(val);
    if (key === "city") setCity(val);
    if (key === "state") setState(val);
    if (key === "postalCode") setPostalCode(val);
  };

  const handleSelectSavedAddress = (addr) => {
    if (!addr) return;
    setRecipientName(addr.recipientName || recipientName);
    setPhone(addr.phone || phone);
    setStreet(addr.street || "");
    setCity(addr.city || "Lahore");
    setState(addr.state || "Punjab");
    setPostalCode(addr.postalCode || "54000");
    if (addr.coordinates) setCoordinates(addr.coordinates);
    toast.info(`Applied address: ${addr.label || "Saved Address"}`);
  };

  const validateDeliveryDetails = () => {
    if (!recipientName || recipientName.trim().length < 2) {
      toast.error("Please enter a valid recipient name.");
      return false;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!phone || phone.trim().length < 8) {
      toast.error("Please enter a valid contact phone number.");
      return false;
    }
    if (!street || street.trim().length < 3) {
      toast.error("Please enter your street address.");
      return false;
    }
    if (!city || city.trim().length < 2) {
      toast.error("Please select or enter your city.");
      return false;
    }
    if (!state || state.trim().length < 2) {
      toast.error("Please select your province / state.");
      return false;
    }
    if (!postalCode || postalCode.trim().length < 2) {
      toast.error("Please enter a valid postal code (e.g. 54000).");
      return false;
    }
    return true;
  };

  const handleProceedToPayment = () => {
    if (validateDeliveryDetails()) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateDeliveryDetails()) {
      setStep(1);
      return;
    }

    if (isCartLoading) {
      toast.info("Updating shopping bag details, please wait...");
      return;
    }

    if (items.length === 0) {
      toast.error("Your shopping bag is empty.");
      navigate("/catalog");
      return;
    }

    if (
      (paymentMethod === "jazzcash" || paymentMethod === "easypaisa") &&
      !mobileNumber &&
      !phone
    ) {
      toast.error(
        `Please provide your ${paymentMethod.toUpperCase()} mobile account number.`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const activeCartId =
        cartId ||
        localStorage.getItem("nexus_guest_session_id") ||
        "active_cart";

      const orderPayload = {
        cartId: activeCartId,
        customerEmail: email.trim().toLowerCase(),
        customerPhone: phone.trim(),
        paymentMethod,
        mobileNumber: (mobileNumber || phone).trim(),
        shippingAddress: {
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: "Pakistan",
          countryCode: "PK",
          coordinates,
        },
      };

      // 1. Create order record on the backend
      const data = await orderApi.createOrder(orderPayload);
      const createdOrder = data.order;
      const paymentInfo = data.payment;

      // 2. Route by payment method
      if (paymentMethod === "stripe") {
        if (!stripe || !elements) {
          throw new Error("Stripe engine is initializing. Please try again.");
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Credit card input element not found.");
        }

        const { error: stripeError, paymentIntent } =
          await stripe.confirmCardPayment(paymentInfo.clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: recipientName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                address: {
                  postal_code: postalCode.trim(),
                  city: city.trim(),
                  state: state.trim(),
                  line1: street.trim(),
                  country: "PK",
                },
              },
            },
          });

        if (stripeError) {
          toast.error(stripeError.message || "Card verification failed.");
          setIsSubmitting(false);
          return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          // Confirm immediately on the backend so the order is marked 'paid' and 'confirmed'
          await orderApi.confirmStripePayment({
            orderId: createdOrder._id,
            paymentIntentId: paymentIntent.id,
          });
          toast.success("Payment authorized with Stripe 3D-Secure!");
        }

        clearCart();
        navigate(
          `/orders/track/${createdOrder?.orderNumber || createdOrder?._id}`,
        );
      } else if (
        paymentMethod === "jazzcash" ||
        paymentMethod === "easypaisa"
      ) {
        // Open the in-app mobile wallet MPIN authorization modal
        setPendingWalletOrder(createdOrder);
        setIsWalletModalOpen(true);
        setIsSubmitting(false);
      } else if (paymentMethod === "cod") {
        toast.success("Cash on Delivery booking confirmed!");
        clearCart();
        navigate(
          `/orders/track/${createdOrder?.orderNumber || createdOrder?._id}`,
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Order placement failed",
      );
      setIsSubmitting(false);
    }
  };

  const handleAuthorizeWallet = async (authPayload) => {
    setIsAuthorizingWallet(true);
    try {
      const res = await orderApi.authorizeWalletPayment(authPayload);

      // Update cache so TrackingPage sees 'paid' immediately
      if (res?.order) {
        // Update by _id
        queryClient.setQueryData(
          queryKeys.orders.detail(res.order._id),
          res.order,
        );
        // Update by orderNumber
        queryClient.setQueryData(
          queryKeys.orders.detail(res.order.orderNumber),
          res.order,
        );
      }

      toast.success(
        `${paymentMethod === "jazzcash" ? "JazzCash" : "Easypaisa"} payment authorized!`,
      );
      clearCart();
      setTimeout(() => {
        setIsWalletModalOpen(false);
        navigate(
          `/orders/track/${pendingWalletOrder.orderNumber || pendingWalletOrder._id}`,
        );
      }, 1200);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to authorize mobile wallet debit.",
      );
    } finally {
      setIsAuthorizingWallet(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <CheckoutStepper currentStep={step} onStepClick={setStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="p-6 rounded-3xl bg-surface-card border border-border-main space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-primary" />
                  <span>1. Delivery & Contact Details</span>
                </h3>

                {isAuthenticated && user?.addresses?.length > 0 && (
                  <select
                    onChange={(e) => {
                      const selected = user.addresses.find(
                        (a) => a._id === e.target.value,
                      );
                      if (selected) handleSelectSavedAddress(selected);
                    }}
                    className="min-h-8 px-2.5 rounded-lg bg-surface-elevated border border-border-subtle text-[11px] text-text-main focus:outline-hidden cursor-pointer"
                  >
                    <option value="">Choose Saved Address...</option>
                    {user.addresses.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.label} ({a.city})
                      </option>
                    ))}
                  </select>
                )}
              </div>

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
                  Email for Receipt & Live Tracking{" "}
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
                onClick={handleProceedToPayment}
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
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
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
                  Confirm & Place Order
                </Button>
              </div>
            </div>
          )}
        </div>

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

      {/* In-App Mobile Wallet MPIN Authorization Modal */}
      {isWalletModalOpen && (
        <WalletAuthorizationModal
          isOpen={isWalletModalOpen}
          onClose={() => {
            setIsWalletModalOpen(false);
            if (pendingWalletOrder) {
              navigate(
                `/orders/track/${pendingWalletOrder.orderNumber || pendingWalletOrder._id}`,
              );
            }
          }}
          order={pendingWalletOrder}
          paymentMethod={paymentMethod}
          mobileNumber={mobileNumber || phone}
          onAuthorize={handleAuthorizeWallet}
          isLoading={isAuthorizingWallet}
        />
      )}
    </div>
  );
}

export function CheckoutPage() {
  const { isCartLoading } = useCart();
  const { isLoading: isAuthLoading, isInitialized } = useAuth();

  // 1. One-way latch state: starts false, turns true ONCE initial load finishes
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // 2. Check if all data dependencies are completely ready
  const isDataReady = isInitialized && !isAuthLoading && !isCartLoading;

  // 3. Render-Phase State Update
  // Synchronously latch setHasInitiallyLoaded to true as soon as data arrives
  if (!hasInitiallyLoaded && isDataReady) {
    setHasInitiallyLoaded(true);
  }

  // 4. INSTANT SKELETON GATE (No delay timers)
  // If we haven't loaded initial data yet, return skeleton IMMEDIATELY on Frame 0
  if (!hasInitiallyLoaded) {
    return <CheckoutPageSkeleton />;
  }

  // 5. Render full checkout page once data is ready
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent />
    </Elements>
  );
}
