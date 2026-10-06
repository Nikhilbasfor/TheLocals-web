/**
 * Handles web-based Razorpay payment popups.
 * Mirrors Flutter's Razorpay configuration in payment_screen.dart.
 */
export const razorpayService = {
  openCheckout: ({
    amount,
    bookingId,
    experienceTitle,
    travellerName = '',
    travellerEmail = '',
    travellerPhone = '',
    onSuccess,
    onError
  }) => {
    const key = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';

    if (!window.Razorpay) {
      if (onError) onError(new Error("Razorpay SDK not loaded. Please check your internet connection."));
      return;
    }

    const options = {
      key: key,
      amount: Math.round(amount * 100), // In Indian Paise
      currency: "INR",
      name: "THE LOCALS",
      description: `Expedition Booking - ${experienceTitle}`,
      image: "/app_logo.png",
      prefill: {
        name: travellerName,
        email: travellerEmail || 'traveller@thelocals.com',
        contact: travellerPhone || '9876543210'
      },
      notes: {
        bookingId: bookingId
      },
      theme: {
        color: "#13352B" // Exact matching theme color from Flutter app
      },
      handler: function (response) {
        if (onSuccess) {
          onSuccess({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature
          });
        }
      },
      modal: {
        ondismiss: function () {
          if (onError) {
            onError(new Error("Payment window closed by user"));
          }
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        if (onError) {
          onError(new Error(response.error?.description || "Payment failed"));
        }
      });
      rzp.open();
    } catch (err) {
      if (onError) onError(err);
    }
  }
};
