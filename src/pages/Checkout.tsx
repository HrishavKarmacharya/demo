import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { MapPin, CreditCard, Package } from "lucide-react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import { useGetProductsQuery } from "@/services/productApi";
import { clearCart } from "@/app/cartSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ErrorMessage from "@/components/atoms/ErrorMessage";

function Checkout() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetProductsQuery({ limit: 194, skip: 0 });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [locality, setLocality] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [label, setLabel] = useState<"office" | "home">("home");
  const [payment, setPayment] = useState<"cod" | "card">("cod");

  if (isLoading) return <p>Loading checkout...</p>;
  if (error) return <ErrorMessage />;

  const cartWithDetails = cartItems
    .map((item) => {
      const product = data?.products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((item) => item !== null);

  const totalItems = cartWithDetails.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartWithDetails.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    dispatch(clearCart());
    toast.success("Order placed successfully!");
    navigate("/");
  };

  if (cartWithDetails.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">
          Your cart is empty. Add products before checking out.
        </p>
        <Link to="/">
          <Button className="mt-4 rounded-full">Back to products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 border rounded-xl p-6">
        <h1 className="text-lg font-semibold mb-4">Delivery Information</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Full name</label>
            <Input
              placeholder="Enter your first and last name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Region</label>
            <Input
              placeholder="Please choose your region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Phone number</label>
            <Input
              placeholder="Please enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">City</label>
            <Input
              placeholder="Please choose your city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">
              Building / House No / Floor / Street
            </label>
            <Input
              placeholder="Please enter"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Area</label>
            <Input
              placeholder="Please choose your area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">
              Colony / Suburb / Locality / Landmark
            </label>
            <Input
              placeholder="Please enter"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Address</label>
            <Input
              placeholder="e.g. House# 123, Street# 123, ABC Road"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm mb-2">Select a label for effective delivery:</p>
          <div className="flex gap-3">
            <button
              onClick={() => setLabel("office")}
              className={`flex-1 flex flex-col items-center gap-1 border rounded-lg py-3 ${
                label === "office" ? "border-primary bg-primary/5" : ""
              }`}
            >
              <Package size={18} />
              <span className="text-sm">Office</span>
            </button>
            <button
              onClick={() => setLabel("home")}
              className={`flex-1 flex flex-col items-center gap-1 border rounded-lg py-3 ${
                label === "home" ? "border-primary bg-primary/5" : ""
              }`}
            >
              <MapPin size={18} />
              <span className="text-sm">Home</span>
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <CreditCard size={16} /> Payment method
          </p>
          <div className="space-y-2">
            <label
              className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer ${
                payment === "cod" ? "border-primary bg-primary/5" : ""
              }`}
            >
              <input
                type="radio"
                checked={payment === "cod"}
                onChange={() => setPayment("cod")}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium">Cash on delivery</p>
                <p className="text-xs text-muted-foreground">
                  This is a dummy checkout, so no real payment is collected.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="border rounded-xl p-5 h-fit space-y-3">
        <h2 className="font-semibold">Order Detail</h2>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items Total ({totalItems} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>

        <div className="border-t pt-3 flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
        </div>

        <Button className="w-full rounded-full" size="lg" onClick={handlePlaceOrder}>
          Proceed to Pay
        </Button>
      </div>
    </div>
  );
}

export default Checkout;