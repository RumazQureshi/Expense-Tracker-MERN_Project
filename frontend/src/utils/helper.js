
import { BASE_URL } from "./apiPaths";

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^zs@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getInitials = (name) => {
  if (!name) return "";

  const words = name.split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }

  return initials.toUpperCase();
};

export const addThousandsSeparator = (num) => {
  if (num === null || isNaN(num)) return "";

  const [integerPart, fractionalPart] = num.toString().split(".");

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return fractionalPart
    ? `${formattedInteger}.${fractionalPart}`
    : formattedInteger;
};

export const getProfileImageUrl = (url) => {
  if (!url) return null;

  // If the image is stored in our /uploads/ directory, force it to use the current BASE_URL
  // This handles cases where the port might have changed (e.g. stored as localhost:5000 but running on 8000)
  if (url.includes("/uploads/")) {
    const filename = url.split("/uploads/").pop();
    return `${BASE_URL}/uploads/${filename}`;
  }

  if (url.startsWith("http") || url.startsWith("data:")) {
    return url;
  }
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};
