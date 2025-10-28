import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";
import config from "../../config";

interface BookingForm {
  name: string;
  mobile: string;
  aadhar: string;
  numberOfPersons: string; // keep as string for text input
  ticketType: string;
  bookingDate?: string;
  amount: string; // keep as string for text input
}

const AddBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BookingForm>({
    name: "",
    mobile: "",
    aadhar: "",
    numberOfPersons: "1",
    ticketType: "",
    bookingDate: "",
    amount: "0",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertVariant, setAlertVariant] = useState<"success" | "error">("success");

  // 🔹 Auto update amount based on ticket type and number of persons
  useEffect(() => {
    const ticketPrice = Number(formData.ticketType) || 0;
    const numPersons = Number(formData.numberOfPersons) || 0;
    const totalAmount = ticketPrice * numPersons;

    setFormData((prev) => ({
      ...prev,
      amount: totalAmount.toString(),
    }));
  }, [formData.ticketType, formData.numberOfPersons]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Only allow digits for numeric fields
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "numberOfPersons" || name === "amount"
          ? value.replace(/\D/g, "")
          : value,
    }));
  };

  const handleSubmit = async () => {
    // Required fields check
    if (
      !formData.name ||
      !formData.mobile ||
      !formData.aadhar ||
      !formData.ticketType ||
      !formData.bookingDate ||
      !formData.amount
    ) {
      setAlertMessage("Please fill all required fields");
      setAlertVariant("error");
      return;
    }

    // Mobile number validation
    if (!/^\d{10}$/.test(formData.mobile)) {
      setAlertMessage("Mobile number must be exactly 10 digits");
      setAlertVariant("error");
      return;
    }

    // Aadhar validation
    if (!/^\d{12}$/.test(formData.aadhar)) {
      setAlertMessage("Aadhar number must be exactly 12 digits");
      setAlertVariant("error");
      return;
    }

    setIsSubmitting(true);
    setAlertMessage(null);

    const payload = {
      name: formData.name,
      contactNumber: formData.mobile,
      aadharCard: formData.aadhar,
      status: "Booked",
      bookingDate: formData.bookingDate,
      amount: Number(formData.amount),
      NoOfPeople: Number(formData.numberOfPersons),
      transactionStatus: "Success",
      paymentMethod: "Razorpay",
    };

    try {
      const response = await axios.post(`${config.baseURL}/booking`, payload, {
        withCredentials: true,
      });

      if (response.data.success) {
        setAlertMessage("Booking added successfully!");
        setAlertVariant("success");
        toast.success("Booking created successfully!");

        setFormData({
          name: "",
          mobile: "",
          aadhar: "",
          numberOfPersons: "1",
          ticketType: "",
          bookingDate: "",
          amount: "0",
        });

        setTimeout(() => navigate("/booking"), 1500);
      } else {
        setAlertMessage(response.data.message || "Error adding booking");
        setAlertVariant("error");
      }
    } catch (error: any) {
      console.error("❌ Booking error:", error);
      setAlertMessage(error.response?.data?.message || "Error submitting booking");
      setAlertVariant("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Add Booking</h1>
      </div>

      {alertMessage && (
        <Alert
          variant={alertVariant}
          title={alertVariant === "success" ? "Success" : "Error"}
          message={alertMessage}
          showLink={false}
        />
      )}

      <ComponentCard title="Booking Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              className="w-full px-3 py-2 border rounded-md focus:ring-2"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium mb-2">Mobile Number *</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
              className="w-full px-3 py-2 border rounded-md focus:ring-2"
            />
          </div>

          {/* Aadhar */}
          <div>
            <label className="block text-sm font-medium mb-2">Aadhar Number *</label>
            <input
              type="text"
              name="aadhar"
              value={formData.aadhar}
              onChange={handleChange}
              placeholder="Enter Aadhar number"
              className="w-full px-3 py-2 border rounded-md focus:ring-2"
            />
          </div>

          {/* Number of Persons */}
          <div>
            <label className="block text-sm font-medium mb-2">Number of Persons</label>
            <input
              type="text"
              name="numberOfPersons"
              value={formData.numberOfPersons}
              onChange={handleChange}
              placeholder="Enter number of persons"
              className="w-full px-3 py-2 border rounded-md focus:ring-2"
            />
          </div>

          {/* Ticket Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Ticket Type *</label>
            <select
              name="ticketType"
              value={formData.ticketType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2"
            >
              <option value="">Select Ticket Type</option>
              <option value="300">₹300 Ticket</option>
              <option value="1000">₹1000 Ticket</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">Amount *</label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              readOnly // 🔒 prevent manual editing
              className="w-full px-3 py-2 border rounded-md bg-gray-100 focus:ring-0 cursor-not-allowed"
            />
          </div>

          {/* Booking Date */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-2">Booking Date *</label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate || ""}
              min="2025-10-10"
              max="2025-10-23"
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:bg-gray-400 flex items-center space-x-2"
          >
            {isSubmitting ? "Submitting..." : "Submit Booking"}
          </button>
        </div>
      </ComponentCard>
    </div>
  );
};

export default AddBookingPage;
