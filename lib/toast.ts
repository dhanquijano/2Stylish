import { toast as sonnerToast, ExternalToast } from "sonner";

const successStyle = {
  background: "#16a34a",
  color: "#ffffff",
  border: "1px solid #14532d",
};

const errorStyle = {
  background: "#dc2626",
  color: "#ffffff",
  border: "1px solid #991b1b",
};

const defaultStyle = {
  background: "#16a34a",
  color: "#ffffff",
  border: "1px solid #14532d",
};

function success(message: string, options?: ExternalToast) {
  return sonnerToast(message, { ...options, style: successStyle });
}

function error(message: string, options?: ExternalToast) {
  return sonnerToast(message, { ...options, style: errorStyle });
}

function base(message: string, options?: ExternalToast) {
  return sonnerToast(message, { ...options, style: defaultStyle });
}

export const toast = Object.assign(base, {
  success,
  error,
});
