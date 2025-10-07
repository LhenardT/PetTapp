import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { useRegister } from "@/lib/query/useAuth"
import LoaderSpinner from "@/components/loader-spinner"
import { Link } from "react-router-dom"

const registerSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string(),
  role: z.enum(["pet-owner", "business-owner"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export function RegisterForm() {
  const { mutate: register, isPending } = useRegister()

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  function onSubmit(values: z.infer<typeof registerSchema>) {
    const { confirmPassword, ...registerData } = values
    register(registerData, {
      onSuccess: () => {
        toast.success("Account created successfully!", {
          description: "Please login to continue.",
        })
        form.reset()
      },
      onError: (error: any) => {
        console.log(error)
        toast.error("Registration failed!", {
          description: error.response?.data.details[0].message || "Please try again",
        })
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FieldGroup>
                  <FieldSet>
                    <FormLabel>Account Type</FormLabel>
                    <FieldDescription>
                      Select the type of account you want to create.
                    </FieldDescription>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FieldLabel htmlFor="pet-owner">
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Pet Owner</FieldTitle>
                            <FieldDescription>
                              Find and book services for your pets.
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value="pet-owner" id="pet-owner"  />
                        </Field>
                      </FieldLabel>
                      <FieldLabel htmlFor="business-owner">
                        <Field orientation="horizontal">
                          <FieldContent>
                            <FieldTitle>Business Owner</FieldTitle>
                            <FieldDescription>
                              Offer pet services and manage bookings.
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem
                            value="business-owner"
                            id="business-owner"
                          />
                        </Field>
                      </FieldLabel>
                    </RadioGroup>
                  </FieldSet>
                </FieldGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <LoaderSpinner width={4} height={4} /> : "Create Account"}
        </Button>

        <p className="text-sm text-center">Already have an account? <Link to="/login" className="underline">Login here</Link></p>
      </form>
    </Form>
  )
}

export default RegisterForm
