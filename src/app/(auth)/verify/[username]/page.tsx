'use client'

import { verifySchema } from "@/schema/signingSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios, {AxiosError} from 'axios';
import { toast } from "sonner";
import { ApiResponse } from "@/types/ApiResponse";
import { useEffect, useState } from "react";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Loader2 } from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export default function Page() {
    const router = useRouter();
    const param = useParams<{username: string}>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string>('');

    //zod validation
    const register = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema)
    })

    useEffect(() => {
        if (!param?.username) {
            toast.warning("Invalid verification link");
            router.replace("/sign-up");
            return;
        }

        const verification = async () => {
            const res = await axios.get<ApiResponse>(`/api/verifyUser?username=${param.username}`);
            const message = res.data.message;
            if (message === "Verified") {
                toast.message("You are already verified!", {description: "Please sign-in to access the dashboard"});
                router.replace("/sign-in");
            } else if (message === "User not found" || message === "Username is required") {
                toast.warning("You have not signed up yet!");
                router.replace("/sign-up");
            }
        }
        verification();
    }, [param?.username, router]);

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        setIsSubmitting(true);
        try {
            const res = await axios.post<ApiResponse>("/api/verifyUser", {
                            username: param.username,
                            code: data.code
                        });
            if (res.data.success) {
                toast.success("You have been verified!");
                setMessage("Verified");
                router.replace(`/sign-in`);
            } else toast.warning("Invalid code");
        } catch (error) {
            console.error("Error in verifying", error);
            const axiosError = error as AxiosError<ApiResponse>;
            const err = axiosError.response?.data.message;
            if (err === "Verification Code has expired. Please signup again!") {
                router.replace('/sign-up');
            }
            toast.warning(err ?? "Something went wrong", { position: "bottom-right" });
        } finally {
            setTimeout(() => setIsSubmitting(false), 500);
        }
    }
    
    return (
        <div className="min-h-screen bg-linear-to-br from-sky-400 via-white to-amber-100 flex items-center justify-center">
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-4xl text-sky-900 font-extrabold tracking-tight lg:text-5xl mb-6">Look at the email we&epos;sent you!</h1>
                    <p className="mb-4">Promise you&apos;ll look at the planes we&apos;ve collected for you</p>
                </div>
                <Form {...register}>
                <form onSubmit={register.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField name="code" control={register.control} render={({ field }) => (
                        <FormItem className="flex flex-col items-center">
                            <InputOTP maxLength={6} value={field.value} onChange={field.onChange} pattern={REGEXP_ONLY_DIGITS} autoFocus containerClassName="group flex items-center justify-center">
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                </InputOTPGroup>
                            </InputOTP>

                            {isSubmitting && <Loader2 className="animate-spin" />}
                            {!isSubmitting && message && (
                                <p className={`text-sm ${message === 'Verified' ? 'text-green-500' : 'text-red-500'}`}>
                                    {message}
                                </p>
                            )}
                        </FormItem>
                    )}/>
                    <Button type="submit" className='w-full' disabled={isSubmitting} variant="outline">
                        {isSubmitting ? (<Spinner data-icon="inline-start" />) : ('Verify')}
                    </Button>
                </form>
            </Form>
          </div>
        </div>
      );
}
