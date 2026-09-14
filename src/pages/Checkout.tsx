import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { MapPin, CreditCard, Package, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { Country, State, City } from "country-state-city";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { RootState } from "@/app/store";
import { useGetProductsQuery } from "@/services/productApi";
import { clearCart } from "@/app/cartSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorMessage from "@/components/atoms/ErrorMessage";

const countries = Country.getAllCountries();

interface TouchedFields {
  fullName: boolean;
  phone: boolean;
  country: boolean;
  state: boolean;
  city: boolean;
  addressLine: boolean;
  companyName: boolean;
}

function Checkout() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetProductsQuery({ limit: 194, skip: 0 });

  const [fullName, setFullName] = useState("");
  const [nameError, setNameError] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [cityName, setCityName] = useState("");
  const [area, setArea] = useState("");
  const [locality, setLocality] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [label, setLabel] = useState<"office" | "home">("home");

  const [companyName, setCompanyName] = useState("");
  const [floorSuite, setFloorSuite] = useState("");
  const [houseNumber, setHouseNumber] = useState("");

  const [payment, setPayment] = useState<"cod" | "card">("cod");

  const [touched, setTouched] = useState<TouchedFields>({
    fullName: false,
    phone: false,
    country: false,
    state: false,
    city: false,
    addressLine: false,
    companyName: false,
  });

  const markTouched = (field: keyof TouchedFields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const states = useMemo(
    () => (countryCode ? State.getStatesOfCountry(countryCode) : []),
    [countryCode]
  );

  const cities = useMemo(
    () => (countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : []),
    [countryCode, stateCode]
  );

  const handleCountryChange = (value: string) => {
    setCountryCode(value);
    setStateCode("");
    setCityName("");
    markTouched("country");
  };

  const handleStateChange = (value: string) => {
    setStateCode(value);
    setCityName("");
    markTouched("state");
  };

  const handleLabelChange = (value: "office" | "home") => {
    setLabel(value);
    setCompanyName("");
    setFloorSuite("");
    setHouseNumber("");
  };

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
  const total = subtotal;

  const isPhoneValid = phone ? isValidPhoneNumber(phone) : false;

  const handleNameChange = (rawValue: string) => {
    const lettersOnly = rawValue.replace(/[^A-Za-z\s]/g, "");
    setFullName(lettersOnly);
    setNameError(
      /[^A-Za-z\s]/.test(rawValue) ? "Full name can only contain letters." : ""
    );
  };

  const fieldClass = (field: keyof TouchedFields, isEmpty: boolean) =>
    touched[field] && isEmpty ? "border-destructive/40" : "";

  const canSubmit =
    !nameError &&
    fullName.trim() !== "" &&
    phone &&
    isPhoneValid &&
    countryCode !== "" &&
    stateCode !== "" &&
    cityName !== "" &&
    addressLine.trim() !== "" &&
    (label === "home" || companyName.trim() !== "");

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
            <label className="text-xs text-muted-foreground">
              Full name <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Enter your first and last name"
              value={fullName}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => markTouched("fullName")}
              className={
                nameError
                  ? "border-destructive"
                  : fieldClass("fullName", fullName.trim() === "")
              }
            />
            {nameError && (
              <p className="text-xs text-destructive mt-1">{nameError}</p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground">
              Phone number <span className="text-destructive">*</span>
            </label>
            <PhoneInput
              international
              defaultCountry="NP"
              placeholder="Enter phone number"
              value={phone}
              onChange={setPhone}
              onBlur={() => markTouched("phone")}
              className={`phone-input-custom rounded-md border px-3 py-1 text-sm ${
                touched.phone && phone && !isPhoneValid
                  ? "border-destructive"
                  : fieldClass("phone", !phone)
              }`}
            />
            {touched.phone && phone && !isPhoneValid && (
              <p className="text-xs text-destructive mt-1">
                Please enter a valid phone number.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground">
              Country <span className="text-destructive">*</span>
            </label>
            <Select value={countryCode} onValueChange={handleCountryChange}>
              <SelectTrigger
                className={`w-full ${fieldClass("country", countryCode === "")}`}
              >
                <SelectValue placeholder="Please choose your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">
              State / Province <span className="text-destructive">*</span>
            </label>
            <Select
              value={stateCode}
              onValueChange={handleStateChange}
              disabled={!countryCode}
            >
              <SelectTrigger
                className={`w-full ${fieldClass("state", stateCode === "")}`}
              >
                <SelectValue
                  placeholder={
                    countryCode ? "Please choose your state" : "Select a country first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {states.map((s) => (
                  <SelectItem key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">
              City <span className="text-destructive">*</span>
            </label>
            <Select
              value={cityName}
              onValueChange={(value) => {
                setCityName(value);
                markTouched("city");
              }}
              disabled={!stateCode}
            >
              <SelectTrigger
                className={`w-full ${fieldClass("city", cityName === "")}`}
              >
                <SelectValue
                  placeholder={stateCode ? "Please choose your city" : "Select a state first"}
                />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={`${c.name}-${c.latitude}`} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              Locality / Landmark
            </label>
            <Input
              placeholder="Please enter"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground">
              Address <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. House# 123, Street# 123, ABC Road"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              onBlur={() => markTouched("addressLine")}
              className={fieldClass("addressLine", addressLine.trim() === "")}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm mb-2">Select a label for effective delivery:</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleLabelChange("office")}
              className={`flex-1 flex flex-col items-center gap-1 border rounded-lg py-3 ${
                label === "office" ? "border-primary bg-primary/5" : ""
              }`}
            >
              <Package size={18} />
              <span className="text-sm">Office</span>
            </button>
            <button
              onClick={() => handleLabelChange("home")}
              className={`flex-1 flex flex-col items-center gap-1 border rounded-lg py-3 ${
                label === "home" ? "border-primary bg-primary/5" : ""
              }`}
            >
              <MapPin size={18} />
              <span className="text-sm">Home</span>
            </button>
          </div>

          {label === "office" ? (
            <div className="mt-4 border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-medium flex items-center gap-2 mb-3">
                <Building2 size={16} /> Office details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">
                    Company name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Acme Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onBlur={() => markTouched("companyName")}
                    className={fieldClass("companyName", companyName.trim() === "")}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Floor / Suite No.
                  </label>
                  <Input
                    placeholder="e.g. 4th Floor, Suite 402"
                    value={floorSuite}
                    onChange={(e) => setFloorSuite(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-medium flex items-center gap-2 mb-3">
                <MapPin size={16} /> Home details
              </p>
              <div>
                <label className="text-xs text-muted-foreground">
                  House name / number
                </label>
                <Input
                  placeholder="e.g. House No. 12, Green Villa"
                  value={houseNumber}
                  onChange={(e) => setHouseNumber(e.target.value)}
                />
              </div>
            </div>
          )}
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

        <Button
          className="w-full rounded-full mt-6"
          size="lg"
          disabled={!canSubmit}
          onClick={handlePlaceOrder}
        >
          <Package className="mr-2" size={18} /> Place dummy order
        </Button>
      </div>

      <div className="border rounded-xl p-5 h-fit space-y-3">
        <h2 className="font-semibold">Order Detail</h2>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items Total ({totalItems} items)</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span className="text-primary font-medium">Free</span>
        </div>

        <div className="border-t pt-3 flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default Checkout;