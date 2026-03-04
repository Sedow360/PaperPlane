'use client'
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { signInSchema } from '@/schema/signingSchema';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Spinner } from "@/components/ui/spinner"
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';

export default function Page() {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const router = useRouter();

    //zod validation
    const register = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: '',
            password: ''
        }
    })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);

    const res = await signIn('credentials', {
        redirect: false,
        identifier: data.identifier,
        password: data.password
    })
    if (res?.error) {
        toast.warning("Please enter valid creadentials");
    }
    setIsSubmitting(false);

    if (res?.url) router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-yellow-300 via-amber-500 to-indigo-950">
      <div className="w-full max-w-md p-10 mx-4 bg-white/40 backdrop-blur-2xl border border-black/30 rounded-3xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-5xl font-black text-slate-900 mb-2">
            We&apos;re so close!
          </h1>
          <p className="mb-4">Let&apos;s call it a day and head back to your leisure..</p>
        </div>
        <Form {...register}>
          <form onSubmit={register.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <Input {...field} name="identifier" placeholder='xyz/paperplane@example.com'/>
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
                'Sign In'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Don&apos;t have a leisure yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Built one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
