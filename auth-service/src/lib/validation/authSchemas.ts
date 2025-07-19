
import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

const signupSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be less than 50 characters.")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes."),
  
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name must be less than 50 characters.")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes."),
  
  contactMethod: z.enum(['email', 'phone'], {
    required_error: "Please select a contact method"
  }),
  
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  
  phone: z.string().optional().or(z.literal('')),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters.")
    .max(100, "Password must be less than 100 characters.")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Password must contain an uppercase letter, a lowercase letter, and a number."),
  
  confirmPassword: z.string(),
  
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions."
  })
}).refine((data) => {
    if (data.contactMethod === 'email') {
        return !!data.email && z.string().email().safeParse(data.email).success;
    }
    return true;
}, {
    message: "A valid email is required.",
    path: ["email"],
}).refine((data) => {
    if (data.contactMethod === 'phone') {
        return !!data.phone && isValidPhoneNumber(data.phone || '');
    }
    return true;
}, {
    message: "A valid phone number is required.",
    path: ["phone"],
}).refine((data) => {
    // If a contact method is selected, ensure the other field is not also filled
    if (data.contactMethod === 'email' && data.phone) {
      data.phone = '';
    }
    if (data.contactMethod === 'phone' && data.email) {
      data.email = '';
    }
    return true;
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"]
});


export type SignupFormData = z.infer<typeof signupSchema>;

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginFormData = z.infer<typeof loginSchema>;


// Re-exporting the schemas
export { signupSchema, loginSchema };
