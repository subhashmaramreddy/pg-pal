import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  IndianRupee,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Lock,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { downloadReceipt } from "@/components/PaymentReceipt";

// Mock tenant data - will be replaced with actual data
const mockTenantData = {
  name: "Rahul Kumar",
  roomNumber: "305",
  rentAmount: 8000,
  month: "February 2025",
  dueDate: "2025-02-15",
};

export default function Payment() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const handlePayment = () => {
    // Basic validation
    if (paymentMethod === "upi" && !upiId) {
      toast.error("Please enter your UPI ID");
      return;
    }
    if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) {
      toast.error("Please fill all card details");
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const txnId = `TXN${Date.now()}`;
      setTransactionId(txnId);
      setIsProcessing(false);
      setPaymentSuccess(true);
      toast.success("Payment successful!");
    }, 2000);
  };

  const handleDownloadReceipt = () => {
    downloadReceipt({
      tenantName: mockTenantData.name,
      roomNumber: mockTenantData.roomNumber,
      month: mockTenantData.month,
      amount: mockTenantData.rentAmount,
      paidDate: new Date().toISOString().split('T')[0],
      method: paymentMethod === "upi" ? "UPI" : "Card",
      transactionId: transactionId,
    });
    toast.success("Receipt downloaded");
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your rent payment of ₹{mockTenantData.rentAmount.toLocaleString()} for {mockTenantData.month} has been received.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-muted-foreground mb-1">Transaction ID (UTR)</p>
                <p className="font-mono font-medium">{transactionId}</p>
                <Separator className="my-3" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold">₹{mockTenantData.rentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-semibold capitalize">{paymentMethod === "upi" ? "UPI" : "Card"}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button className="flex-1" onClick={handleDownloadReceipt}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Pay Rent
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred payment method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method Selection */}
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                      <Label
                        htmlFor="upi"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <Smartphone className="mb-3 h-6 w-6" />
                        <span className="text-sm font-medium">UPI</span>
                        <span className="text-xs text-muted-foreground">PhonePe, GPay, Paytm</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="card" id="card" className="peer sr-only" />
                      <Label
                        htmlFor="card"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <CreditCard className="mb-3 h-6 w-6" />
                        <span className="text-sm font-medium">Card</span>
                        <span className="text-xs text-muted-foreground">Debit / Credit Card</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  <Separator />

                  {/* UPI Payment Form */}
                  {paymentMethod === "upi" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="upi-id">UPI ID</Label>
                        <Input
                          id="upi-id"
                          placeholder="yourname@upi"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Enter your UPI ID linked to PhonePe, GPay, Paytm, etc.
                        </p>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm font-medium mb-2">How it works:</p>
                        <ol className="text-sm text-muted-foreground space-y-1">
                          <li>1. Enter your UPI ID above</li>
                          <li>2. Click "Pay Now" to proceed</li>
                          <li>3. Approve payment request on your UPI app</li>
                          <li>4. Payment confirmed automatically</li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* Card Payment Form */}
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="card-name">Cardholder Name</Label>
                        <Input
                          id="card-name"
                          placeholder="Name on card"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="card-expiry">Expiry Date</Label>
                          <Input
                            id="card-expiry"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="card-cvv">CVV</Label>
                          <Input
                            id="card-cvv"
                            type="password"
                            placeholder="•••"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Note */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Your payment information is encrypted and secure</span>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <IndianRupee className="mr-2 h-4 w-4" />
                        Pay ₹{mockTenantData.rentAmount.toLocaleString()}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Room {mockTenantData.roomNumber}</p>
                      <p className="text-sm text-muted-foreground">{mockTenantData.name}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Month</span>
                      <span>{mockTenantData.month}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Due Date</span>
                      <span>{mockTenantData.dueDate}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rent Amount</span>
                      <span>₹{mockTenantData.rentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Convenience Fee</span>
                      <span className="text-success">Free</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{mockTenantData.rentAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg text-success text-sm">
                    <Shield className="h-4 w-4" />
                    <span>100% Secure Payment</span>
                  </div>
                </CardContent>
              </Card>

              {/* Demo Notice */}
              <Card className="mt-4 border-amber bg-amber/5">
                <CardContent className="pt-4">
                  <Badge variant="outline" className="border-amber text-amber mb-2">Demo Mode</Badge>
                  <p className="text-sm text-muted-foreground">
                    This is a demo payment page. Actual payment gateway (PhonePe/Razorpay) will be integrated later.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
