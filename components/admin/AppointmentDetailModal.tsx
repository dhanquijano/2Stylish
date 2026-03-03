"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateAppointment, deleteAppointment } from "@/lib/actions/appointments";
import { toast } from "sonner";
import { X, Edit, Trash2, Save, User, Phone, Calendar, Clock, MapPin, Scissors } from "lucide-react";

interface AppointmentDetailModalProps {
  appointment: {
    id: string;
    fullName: string;
    email: string;
    mobileNumber: string;
    appointmentDate: string;
    appointmentTime: string;
    branch: string;
    barber: string;
    services: string;
    status?: string;
    salesId?: string;
    createdAt: Date;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const AppointmentDetailModal = ({ appointment, isOpen, onClose, onUpdate }: AppointmentDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmData, setConfirmData] = useState({
    gross: "",
    discount: "0",
    paymentMethod: "cash",
    notes: "",
  });
  const [formData, setFormData] = useState({
    fullName: appointment.fullName,
    email: appointment.email,
    mobileNumber: appointment.mobileNumber,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    branch: appointment.branch,
    barber: appointment.barber,
    services: appointment.services,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const result = await updateAppointment(appointment.id, formData);
      if (result.success) {
        toast.success("Appointment updated successfully");
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error("Failed to update appointment");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    
    try {
      const result = await deleteAppointment(appointment.id);
      if (result.success) {
        toast.success("Appointment deleted successfully");
        onClose();
        onUpdate();
      } else {
        toast.error("Failed to delete appointment");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleConfirm = async () => {
    if (!confirmData.gross || parseFloat(confirmData.gross) <= 0) {
      toast.error("Please enter a valid gross amount");
      return;
    }

    try {
      const response = await fetch('/api/admin/appointments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          gross: parseFloat(confirmData.gross),
          discount: parseFloat(confirmData.discount),
          paymentMethod: confirmData.paymentMethod,
          notes: confirmData.notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Appointment confirmed and sales record created!");
        setIsConfirming(false);
        onClose();
        onUpdate();
      } else {
        toast.error(result.error || "Failed to confirm appointment");
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error("An error occurred");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch('/api/admin/appointments/confirm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Appointment marked as ${newStatus}`);
        onClose();
        onUpdate();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("An error occurred");
    }
  };

  if (!isOpen) return null;

  const appointmentStatus = appointment.status || "pending";
  const isPending = appointmentStatus === "pending";
  const isCompleted = appointmentStatus === "completed";
  const netAmount = confirmData.gross && confirmData.discount 
    ? (parseFloat(confirmData.gross) - parseFloat(confirmData.discount)).toFixed(2)
    : "0.00";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Appointment Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              Status: <span className="font-medium capitalize">{appointmentStatus}</span>
              {appointment.salesId && (
                <span className="ml-2 text-blue-600">• Sales ID: {appointment.salesId}</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && !isConfirming && (
              <>
                {isPending && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsConfirming(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Confirm & Create Sale
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={isCompleted}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700"
                  disabled={isCompleted}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                />
              ) : (
                <p className="text-gray-900 font-medium">{appointment.fullName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                Email
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              ) : (
                <p className="text-gray-900">{appointment.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mobileNumber" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Mobile Number
              </Label>
              {isEditing ? (
                <Input
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                />
              ) : (
                <p className="text-gray-900">{appointment.mobileNumber}</p>
              )}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="appointmentDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Appointment Date
              </Label>
              {isEditing ? (
                <Input
                  id="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => handleInputChange("appointmentDate", e.target.value)}
                />
              ) : (
                <p className="text-gray-900">{appointment.appointmentDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="appointmentTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Appointment Time
              </Label>
              {isEditing ? (
                <Input
                  id="appointmentTime"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => handleInputChange("appointmentTime", e.target.value)}
                />
              ) : (
                <p className="text-gray-900">{appointment.appointmentTime}</p>
              )}
            </div>

            <div>
              <Label htmlFor="branch" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Branch
              </Label>
              {isEditing ? (
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => handleInputChange("branch", e.target.value)}
                />
              ) : (
                <p className="text-gray-900">{appointment.branch}</p>
              )}
            </div>

            <div>
              <Label htmlFor="barber" className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                Barber
              </Label>
              {isEditing ? (
                <Input
                  id="barber"
                  value={formData.barber}
                  onChange={(e) => handleInputChange("barber", e.target.value)}
                />
              ) : (
                <p className="text-gray-900">{appointment.barber}</p>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <Label htmlFor="services">Services</Label>
            {isEditing ? (
              <Textarea
                id="services"
                value={formData.services}
                onChange={(e) => handleInputChange("services", e.target.value)}
                rows={3}
              />
            ) : (
              <p className="text-gray-900">{appointment.services}</p>
            )}
          </div>

          {/* Created Date (Read-only) */}
          <div>
            <Label>Created Date</Label>
            <p className="text-gray-500 text-sm">
              {new Date(appointment.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Confirmation Form */}
          {isConfirming && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Appointment & Create Sales Record</h3>
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gross">Gross Amount (₱) *</Label>
                    <Input
                      id="gross"
                      type="number"
                      step="0.01"
                      min="0"
                      value={confirmData.gross}
                      onChange={(e) => setConfirmData({ ...confirmData, gross: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="discount">Discount (₱)</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={confirmData.discount}
                      onChange={(e) => setConfirmData({ ...confirmData, discount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select 
                      value={confirmData.paymentMethod} 
                      onValueChange={(value) => setConfirmData({ ...confirmData, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="gcash">GCash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Net Amount</Label>
                    <div className="text-2xl font-bold text-green-600">₱{netAmount}</div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={confirmData.notes}
                    onChange={(e) => setConfirmData({ ...confirmData, notes: e.target.value })}
                    placeholder="Add any additional notes..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsConfirming(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                    Confirm & Create Sale
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Status Actions */}
          {!isEditing && !isConfirming && isPending && (
            <div className="border-t pt-4 mt-4">
              <Label>Quick Actions</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange("cancelled")}
                  className="text-red-600"
                >
                  Mark as Cancelled
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange("no-show")}
                  className="text-gray-600"
                >
                  Mark as No Show
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailModal; 