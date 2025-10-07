import { RegisterForm } from "@/components/register-form"

const Register = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Join PetTapp and start managing your pet services today.
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}

export default Register
