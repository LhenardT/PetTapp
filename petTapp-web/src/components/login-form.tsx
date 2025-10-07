import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Link, useNavigate } from "react-router-dom"

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
import { useLogin } from "@/lib/query/useAuth"
import { useAuthStore } from "@/store/authStore"
import LoaderSpinner from "@/components/loader-spinner"

const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

export function LoginForm() {
  const { mutate: login, isPending } = useLogin()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof loginSchema>) {
    login(values, {
      onSuccess: (data) => {
        setAuth(data.user, data.token)
        toast.success("Login successful!", {
          description: `Welcome back, ${data.user.email}`,
        })

        // Redirect based on user role
        const redirectMap = {
          "pet-owner": "/pet-owner",
          "business-owner": "/business-owner",
          admin: "/admin",
        }
        navigate(redirectMap[data.user.role as keyof typeof redirectMap])
      },
      onError: (error: any) => {
        toast.error("Login failed!", {
          description: error.response?.data.message || `Please check your email and password`,
        })
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <LoaderSpinner width={4} height={4} /> : "Sign In"}
        </Button>

        <p className="text-sm text-center">Don't have an account? <Link to="/register" className="underline">Register here</Link></p>
      </form>
    </Form>
  )
}
