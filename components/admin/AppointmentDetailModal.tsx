"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { updateAppointment, deleteAppointment } from "@/lib/actions/appointments";
import { toast } from "@/lib/toast";
import { X, Edit, Trash2, Save, User, Phone, Calendar, Clock, MapPin, Scissors } from "lucide-react";

interface TimeSlot { time: string; available: boolean; }

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

// ── Inline calendar + time picker (same logic as booking page) ──────────────
function DateTimePicker({
  availableDates,
  selectedDate,
  onDateChange,
  timeSlots,
  checkingAvailability,
  selectedTime,
  onTimeSelect,
  currentAppointmentTime, // exclude current slot from "booked" check
}: {
  availableDates: string[];
  selectedDate: string;
  onDateChange: (d: string) => void;
  timeSlots: TimeSlot[];
  checkingAvailability: boolean;
  selectedTime: string;
  onTimeSelect: (t: string) => void;
  currentAppointmentTime?: string;
}) {
  const first = availableDates[0];
  const [initialYear, initialMonth] = first
    ? first.split("-").map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1];
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  const monthLabel = useMemo(() => {
    return new Date(viewYear, viewMonth - 1, 1).toLocaleDateString("en-US", {
      month: "long", year: "numeric",
    });
  }, [viewYear, viewMonth]);

  const weeks = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth - 1, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const rows: Array<Array<{ date: string | null; disabled: boolean }>> = [];
    let week: Array<{ date: string | null; disabled: boolean }> = [];

    for (let i = 0; i < firstDay; i++) week.push({ date: null, disabled: true });

    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      week.push({ date: iso, disabled: !availableSet.has(iso) });
      if (week.length === 7) { rows.push(week); week = []; }
    }
    if (week.length) {
      while (week.length < 7) week.push({ date: null, disabled: true });
      rows.push(week);
    }
    return rows;
  }, [viewYear, viewMonth, availableSet]);

  const canGoPrev = useMemo(() => {
    const min = availableDates[0];
    if (!min) return false;
    const minDate = new Date(min);
    return new Date(viewYear, viewMonth - 1, 1) > new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  }, [availableDates, viewYear, viewMonth]);

  const canGoNext = useMemo(() => {
    const max = availableDates[availableDates.length - 1];
    if (!max) return false;
    const maxDate = new Date(max);
    return new Date(viewYear, viewMonth - 1, 1) < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  }, [availableDates, viewYear, viewMonth]);

  const goPrev = () => {
    if (!canGoPrev) return;
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNext = () => {
    if (!canGoNext) return;
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <div>
        <Label className="flex items-center gap-2 mb-2"><Calendar className="h-4 w-4" /> Appointment Date</Label>
        <div className="border rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <button type="button" className="px-2 py-1 border rounded disabled:opacity-40 text-sm" onClick={goPrev} disabled={!canGoPrev}>Prev</button>
            <span className="font-medium text-sm">{monthLabel}</span>
            <button type="button" className="px-2 py-1 border rounded disabled:opacity-40 text-sm" onClick={goNext} disabled={!canGoNext}>Next</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(w => <div key={w}>{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weeks.map((row, i) =>
              row.map((cell, j) => {
                const isSelected = cell.date === selectedDate;
                return (
                  <button
                    key={`${i}-${j}`}
                    type="button"
                    disabled={!cell.date || cell.disabled}
                    onClick={() => { if (cell.date && !cell.disabled) onDateChange(cell.date); }}
                    className={
                      `h-9 rounded text-sm border ` +
                      `${!cell.date || cell.disabled ? "opacity-30 cursor-not-allowed " : "hover:bg-green-50 hover:border-green-300 "}` +
                      `${isSelected ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 " : ""}`
                    }
                  >
                    {cell.date ? Number(cell.date.split("-")[2]) : ""}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <Label className="flex items-center gap-2 mb-2"><Clock className="h-4 w-4" /> Appointment Time</Label>
          {checkingAvailability ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
              Checking availability...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {timeSlots.map(slot => {
                // The current appointment's own time slot should appear available for re-selection
                const isCurrentSlot = slot.time === currentAppointmentTime;
                const isAvailable = slot.available || isCurrentSlot;
                const isSelected = slot.time === selectedTime;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => { if (isAvailable) onTimeSelect(slot.time); }}
                    className={
                      `h-10 rounded border text-sm flex items-center justify-center gap-1 ` +
                      `${!isAvailable ? "opacity-40 cursor-not-allowed bg-gray-50 " : "hover:bg-green-50 hover:border-green-300 "}` +
                      `${isSelected ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 " : ""}`
                    }
                  >
                    <Clock className="h-3 w-3" />
                    {slot.time}
                  </button>
                );
              })}
            </div>
          )}
          {selectedTime && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              <strong>Selected:</strong> {selectedTime}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Modal ───────────────────────────────────────────────────────────────
const AppointmentDetailModal = ({ appointment, isOpen, onClose, onUpdate }: AppointmentDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmData, setConfirmData] = useState({ gross: "", discount: "0", paymentMethod: "cash", notes: "" });
  const [servicesData, setServicesData] = useState<Array<{ title: string; price: string }>>([]);
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

  // Date/time picker state for edit mode
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [branchId, setBranchId] = useState<string>("");
  const [barberId, setBarberId] = useState<string>("");

  // Parse a price string like "₱488", "FROM ₱3000", "₱278-₱328" → first numeric value
  const parsePrice = (priceStr: string): number => {
    const cleaned = priceStr.replace(/FROM\s*/i, "").replace(/₱/g, "").trim();
    const first = cleaned.split("-")[0].trim();
    const num = parseFloat(first.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // Auto-populate gross amount from appointment services when confirm panel opens
  useEffect(() => {
    if (!isConfirming) return;

    const computeGross = async () => {
      let catalog = servicesData;
      if (catalog.length === 0) {
        try {
          const res = await fetch("/api/appointments/data");
          const result = await res.json();
          if (result.success && result.data.services?.length > 0) {
            catalog = result.data.services;
            setServicesData(catalog);
          }
        } catch {
          // fall through to lib/services fallback below
        }
      }

      // Fallback: use static services from lib/services.ts (imported at top)
      if (catalog.length === 0) {
        const { services: staticServices } = await import("@/lib/services");
        catalog = staticServices.map((s) => ({ title: s.title, price: s.price }));
        setServicesData(catalog);
      }

      const selectedTitles = appointment.services
        .split(",")
        .map((s) => s.trim().toLowerCase());

      let total = 0;
      for (const title of selectedTitles) {
        const match = catalog.find((s) => s.title.toLowerCase() === title);
        if (match) total += parsePrice(match.price);
      }

      if (total > 0) {
        setConfirmData((prev) => ({ ...prev, gross: total.toFixed(2) }));
      }
    };

    computeGross();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirming]);

  // Fetch branch/barber IDs when edit mode opens
  useEffect(() => {
    if (!isEditing) return;

    const fetchIds = async () => {
      try {
        const res = await fetch("/api/appointments/data");
        const result = await res.json();
        if (!result.success) return;

        const branch = result.data.branches?.find((b: any) => b.name === appointment.branch);
        const barber = result.data.barbers?.find((b: any) => b.name === appointment.barber);
        const bId = branch?.id || "";
        const barbId = barber?.id || "";
        setBranchId(bId);
        setBarberId(barbId);

        // Fetch available dates for this barber/branch
        if (bId && barbId) {
          const datesRes = await fetch(`/api/appointments/available-dates?barberId=${barbId}&branchId=${bId}`);
          const datesResult = await datesRes.json();
          if (datesResult.success) {
            // Make sure the current appointment date is included
            const dates: string[] = datesResult.data.availableDates || [];
            if (!dates.includes(appointment.appointmentDate)) {
              dates.push(appointment.appointmentDate);
              dates.sort();
            }
            setAvailableDates(dates);
          }
        }
      } catch (e) {
        console.error("Failed to fetch branch/barber IDs", e);
      }
    };

    fetchIds();
  }, [isEditing, appointment.branch, appointment.barber, appointment.appointmentDate]);

  // Fetch time slots when date changes in edit mode
  useEffect(() => {
    if (!isEditing || !formData.appointmentDate || !branchId || !barberId) return;

    const fetchSlots = async () => {
      setCheckingAvailability(true);
      try {
        const res = await fetch(
          `/api/appointments/availability?date=${formData.appointmentDate}&barberId=${barberId}&branchId=${branchId}&adminMode=true`
        );
        const result = await res.json();
        if (result.success) setTimeSlots(result.data.timeSlots);
      } catch (e) {
        console.error("Failed to fetch time slots", e);
      } finally {
        setCheckingAvailability(false);
      }
    };

    fetchSlots();
  }, [isEditing, formData.appointmentDate, branchId, barberId]);

  const handleSave = async () => {
    try {
      const result = await updateAppointment(appointment.id, formData);
      if (result.success) {
        toast.success("Appointment updated successfully");
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error(result.error || "Failed to update appointment");
      }
    } catch {
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
    } catch {
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
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch('/api/admin/appointments/confirm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: appointment.id, status: newStatus }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Appointment marked as ${newStatus}`);
        onClose();
        onUpdate();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch {
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
        {/* Header */}
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
                  <Button variant="default" size="sm" onClick={() => setIsConfirming(true)} className="bg-green-600 hover:bg-green-700">
                    Confirm & Create Sale
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={isCompleted}>
                  <Edit className="h-4 w-4 mr-2" />Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700" disabled={isCompleted}>
                  <Trash2 className="h-4 w-4 mr-2" />Delete
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Customer info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2"><User className="h-4 w-4" />Full Name</Label>
              {isEditing
                ? <Input value={formData.fullName} onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))} />
                : <p className="text-gray-900 font-medium">{appointment.fullName}</p>}
            </div>
            <div>
              <Label>Email</Label>
              {isEditing
                ? <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                : <p className="text-gray-900">{appointment.email}</p>}
            </div>
            <div>
              <Label className="flex items-center gap-2"><Phone className="h-4 w-4" />Mobile Number</Label>
              {isEditing
                ? <Input value={formData.mobileNumber} onChange={e => setFormData(p => ({ ...p, mobileNumber: e.target.value }))} />
                : <p className="text-gray-900">{appointment.mobileNumber}</p>}
            </div>
          </div>

          {/* Date / Time / Branch / Barber */}
          {isEditing ? (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Reschedule Appointment
              </h3>

              {/* Branch & Barber (read-only in edit — same as original) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" />Branch</Label>
                  <p className="text-gray-700 text-sm mt-1">{appointment.branch}</p>
                </div>
                <div>
                  <Label className="flex items-center gap-2"><Scissors className="h-4 w-4" />Barber</Label>
                  <p className="text-gray-700 text-sm mt-1">{appointment.barber || "No Preference"}</p>
                </div>
              </div>

              {availableDates.length === 0 ? (
                <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3">
                  Loading available dates...
                </p>
              ) : (
                <DateTimePicker
                  availableDates={availableDates}
                  selectedDate={formData.appointmentDate}
                  onDateChange={date => setFormData(p => ({ ...p, appointmentDate: date, appointmentTime: "" }))}
                  timeSlots={timeSlots}
                  checkingAvailability={checkingAvailability}
                  selectedTime={formData.appointmentTime}
                  onTimeSelect={time => setFormData(p => ({ ...p, appointmentTime: time }))}
                  currentAppointmentTime={appointment.appointmentTime}
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" />Appointment Date</Label>
                <p className="text-gray-900">{appointment.appointmentDate}</p>
              </div>
              <div>
                <Label className="flex items-center gap-2"><Clock className="h-4 w-4" />Appointment Time</Label>
                <p className="text-gray-900">{appointment.appointmentTime}</p>
              </div>
              <div>
                <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" />Branch</Label>
                <p className="text-gray-900">{appointment.branch}</p>
              </div>
              <div>
                <Label className="flex items-center gap-2"><Scissors className="h-4 w-4" />Barber</Label>
                <p className="text-gray-900">{appointment.barber || "No Preference"}</p>
              </div>
            </div>
          )}

          {/* Services */}
          <div>
            <Label>Services</Label>
            {isEditing
              ? <Textarea value={formData.services} onChange={e => setFormData(p => ({ ...p, services: e.target.value }))} rows={3} />
              : <p className="text-gray-900">{appointment.services}</p>}
          </div>

          <div>
            <Label>Created Date</Label>
            <p className="text-gray-500 text-sm">{new Date(appointment.createdAt).toLocaleString()}</p>
          </div>

          {/* Confirmation form */}
          {isConfirming && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Appointment & Create Sales Record</h3>
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Gross Amount (₱) *</Label>
                    <Input type="number" step="0.01" min="0" value={confirmData.gross} onChange={e => setConfirmData(p => ({ ...p, gross: e.target.value }))} placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Discount (₱)</Label>
                    <Input type="number" step="0.01" min="0" value={confirmData.discount} onChange={e => setConfirmData(p => ({ ...p, discount: e.target.value }))} placeholder="0.00" />
                  </div>
                  <div>
                    <Label>Payment Method *</Label>
                    <Select value={confirmData.paymentMethod} onValueChange={v => setConfirmData(p => ({ ...p, paymentMethod: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Label>Notes (Optional)</Label>
                  <Textarea value={confirmData.notes} onChange={e => setConfirmData(p => ({ ...p, notes: e.target.value }))} placeholder="Add any additional notes..." rows={2} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsConfirming(false)}>Cancel</Button>
                  <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">Confirm & Create Sale</Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick actions */}
          {!isEditing && !isConfirming && isPending && (
            <div className="border-t pt-4 mt-4">
              <Label>Quick Actions</Label>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => handleStatusChange("cancelled")} className="text-red-600">
                  Mark as Cancelled
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleStatusChange("no-show")} className="text-gray-600">
                  Mark as No Show
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Save / Cancel edit */}
        {isEditing && (
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.appointmentDate || !formData.appointmentTime}>
              <Save className="h-4 w-4 mr-2" />Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
