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
import Link from "next/link";

export default function Page() {
    const router = useRouter();
    const param = useParams<{username: string}>();
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [checkingName, setCheckingName] = useState<boolean>(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean>(false);
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

        const checkUsernameUniqueness = async () => {
            setCheckingName(true);
            try {
                const res = await axios.get(`/api/check-username-available?username=${param.username}`);
                if (res.data.message === "You have a twin? Too bad he is faster...") {
                    setUsernameAvailable(false);
                }

                setUsernameAvailable(true);
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>;
                toast.warning(axiosError.response?.data.message ?? "Error in checking username");
            } finally {
                setCheckingName(false);
            }
        }
        checkUsernameUniqueness();

        const verification = async () => {
            const res = await axios.get<ApiResponse>(`/api/verifyUser?username=${param.username}`);
            const message = res.data.message;
            if (message === "Verified") {
                toast.message("You have the most perfect six digits ever!");
                setIsVerified(true);
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

    if (checkingName) {
        return (
            <div className="min-h-screen bg-linear-to-br from-sky-400 via-white to-amber-100 flex items-center justify-center">
                <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl w-full max-w-md flex flex-col items-center gap-6">
                    <Loader2 className="animate-spin text-sky-600 w-10 h-10" />
                    <p className="text-sky-900 font-semibold text-lg tracking-tight">
                        Checking your leisure…
                    </p>
                </div>
            </div>
        );
    }

        if (isVerified) {
        return (
            <div className="min-h-screen bg-linear-to-br from-sky-400 via-white to-amber-100 flex items-center justify-center">
                <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl w-full max-w-md flex flex-col items-center gap-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center text-3xl select-none">
                        🏡
                    </div>
                    <div>
                        <h1 className="text-3xl text-sky-900 font-extrabold tracking-tight mb-2">
                            Looks like your leisure is ready!
                        </h1>
                        <p className="text-sky-700 text-sm leading-relaxed">
                            Your leaisure named <span className="font-bold text-sky-900">@{param.username}</span> is already built and is looking cozy.
                        </p>
                    </div>
                    <Link
                        href="/sign-in"
                        className="inline-flex items-center justify-center w-full rounded-2xl border border-sky-300 bg-white/70 hover:bg-sky-50 transition-colors px-6 py-3 text-sky-900 font-semibold text-sm shadow-sm"
                    >
                        Get in →
                    </Link>
                </div>
            </div>
        );
    }

// ── Username already taken ────────────────────────────────────────────────────
    if (!usernameAvailable) {
        return (
            <div className="min-h-screen bg-linear-to-br from-sky-400 via-white to-amber-100 flex items-center justify-center">
                <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl w-full max-w-md flex flex-col items-center gap-6 text-center">

                    {/* Sad icon */}
                    <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl select-none">
                        😔
                    </div>

                    <div>
                        <h1 className="text-3xl text-sky-900 font-extrabold tracking-tight mb-2">
                            Someone beat you to it!
                        </h1>
                        <p className="text-sky-700 text-sm leading-relaxed">
                            The leisure under the name{' '}
                            <span className="font-bold text-sky-900">
                                @{param.username}
                            </span>{' '}
                            was broken into by someone while you were gone...
                        </p>
                    </div>

                    <p className="text-sky-600 text-sm">
                        Head back out and build a new leisure with a fresh name.
                    </p>

                    <Link
                        href="/sign-up"
                        className="inline-flex items-center justify-center w-full rounded-2xl border border-sky-300 bg-white/70 hover:bg-sky-50 transition-colors px-6 py-3 text-sky-900 font-semibold text-sm shadow-sm"
                    >
                        ← Build a new one
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-linear-to-br from-sky-400 via-white to-amber-100 flex items-center justify-center">
            <div className="bg-white/60 backdrop-blur-md p-8 rounded-3xl w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-4xl text-sky-900 font-extrabold tracking-tight lg:text-5xl mb-6">Look at the email we sent you!</h1>
                    <p className="mb-4">Enter the magical six digits to complete your leisure</p>
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
