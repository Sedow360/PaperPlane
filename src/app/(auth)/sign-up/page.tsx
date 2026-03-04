'use client'
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useDebounceCallback } from 'usehooks-ts';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/schema/signingSchema';
import axios, {AxiosError} from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Spinner } from "@/components/ui/spinner"
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function Page() {
  const [username, setUsername] = useState<string>('');
  const [usernameMessage, setUsernameMessage] = useState<string>('');
  const [checkingUsername, setCheckingUsername] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const debounced = useDebounceCallback(setUsername, 500);
  const router = useRouter();

  //zod validation
  const register = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  })

  useEffect(() => {
    if (username){
      const checkUsernameUniqueness = async () => {
        setCheckingUsername(true);
        setUsernameMessage('');

        try {
          const res = await axios.get(`/api/check-username-available?username=${username}`);
          setUsernameMessage(res.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message ?? "Error in checking username");
        } finally {
          setCheckingUsername(false);
        }
      }
      checkUsernameUniqueness();
    }
  }, [username])

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post<ApiResponse>("/api/sign-up", data);
      if (res.data.success) {
        toast.success("You have signed up successfully. Please verify your account!", { position: "top-center" });
      } else toast.warning("Invalid credentials");

      router.replace(`/verify/${username}`);
    } catch (error) {
      console.error("Error in sign up", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast.warning(axiosError.response?.data.message ?? "Something went wrong", { position: "bottom-right" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-500 via-sky-300 to-white flex items-center justify-center">
      <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-xl w-full max-w-md">
        <div className="text-center">
          <h1 className="text-4xl text-blue-900 font-bold mb-2">
            Let PaperPlane collect your paperplanes
          </h1>
          <p className="mb-4">While you complete your day chores before it gets dark</p>
        </div>
        <Form {...register}>
          <form onSubmit={register.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input placeholder='xyz'
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      debounced(e.target.value);
                    }}
                  />
                  {checkingUsername && <Loader2 className="animate-spin" />}
                  {!checkingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === "You have a twin? Too bad he is faster..."
                          ? 'text-red-500'
                          : 'text-green-500'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} name="email" placeholder='paperplane@example.com'/>
                  <p className='text-gray-400 text-sm'>We will send you a verification code</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password"/>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className='w-full' disabled={isSubmitting} variant="outline">
              {isSubmitting ? (
                <Spinner data-icon="inline-start" />
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Have a leisure already?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Let&apos;s go
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
