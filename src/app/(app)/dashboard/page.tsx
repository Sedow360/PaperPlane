"use client"

import { MessageCard } from "@/components/comp/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message, User } from "@/models/User"
import { acceptMessageSchema } from "@/schema/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Page () {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
    const [personality, setPersonality] = useState('');
    const router = useRouter();

    const {data: session} = useSession();

    const form = useForm({
        resolver: zodResolver(acceptMessageSchema)
    });

    const {register, watch, setValue} = form;
    const acceptMessages = watch('acceptMessage');

    useEffect(() => {
        if (!session || !session.user) {
            router.replace("/sign-in");
        }
    }, [session, router]);

    const handlePersonalitySave = async () => {
        try {
            await axios.post("/api/change-personality", { newPersonality: personality });
            toast.message("Personality updated!");
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.warning(axiosError.response?.data.message || "Failed to update");
        }
    }

    const fetchAcceptMessages = useCallback(async () => {
        setIsSwitchLoading(true);
        try {
            const res = await axios.get<ApiResponse>("/api/accept-messages");
            setValue('acceptMessage', res.data.isAcceptingMessages ?? true);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.warning(axiosError.response?.data.message || "Failed to fetch message");
        } finally {
            setIsSwitchLoading(false);
        }
    }, [setValue]);

    const fetchMessages = useCallback(async (refresh: boolean = false) => {
        setLoading(true);
        setIsSwitchLoading(true);
        try {
            const res = await axios.get<ApiResponse>("/api/get-messages");
            setMessages(res.data.messages || []);
            if (refresh) toast.info("Showing latest paperplanes");
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.warning(axiosError.response?.data.message || "Seems like you haven't received any paperplanes..");
        } finally {
            setIsSwitchLoading(false);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!session || !session.user) return;
        fetchAcceptMessages();
        fetchMessages();
    }, [session, fetchAcceptMessages, fetchMessages]);

    const handleDelete = (messageId: string) => {
        setMessages(prev => prev.filter((message) => message._id.toString() !== messageId));
    }

    const handleAcceptMessages = async () => {
        setIsSwitchLoading(true);
        try {
            await axios.post("/api/accept-messages", { acceptMessages: !acceptMessages });
            setValue('acceptMessage', !acceptMessages);
            toast.message(!acceptMessages ? "You can accept paper planes now!" : "You cannot accept paper planes now!")
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.warning(axiosError.response?.data.message || "Failed to switch mode");
        } finally {
            setIsSwitchLoading(false);
        }
    }

    if (!session || !session.user) return null;

    const { username } = session.user as User;

    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    const profileUrl = `${baseUrl}/u/${username || ""}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl);
        toast.message("Mow you can receive paper planes from others!");
    }

    return (
    /* Main Container: Swapped bg-white for a deep sapphire glass effect */
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl w-full max-w-6xl shadow-2xl">
        
        <h1 className="text-4xl font-bold mb-6 text-white drop-shadow-md">
            Your Leisure
        </h1>

        <div className="mb-8 p-6 rounded-xl bg-blue-900/10 border border-blue-400/20">
            <h2 className="text-sm uppercase tracking-widest font-semibold mb-3 text-blue-300">
                Copy the link to Your Unique Leisure
            </h2>
            <div className="flex items-center gap-2">
                <input type="text" value={profileUrl} disabled className="w-full p-3 bg-slate-950/40 border border-white/10 rounded-lg text-slate-400"/>
                <Button onClick={copyToClipboard} className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20">
                    Copy
                </Button>
            </div>
        </div>

        <div className="mb-6 flex items-center bg-slate-900/40 w-fit px-4 py-2 rounded-full border border-white/5">
            <Switch
                {...register('acceptMessage')}
                checked={acceptMessages}
                onCheckedChange={handleAcceptMessages}
                disabled={isSwitchLoading}
                className="data-[state=checked]:bg-blue-500"
            />
            <span className="ml-3 text-sm font-medium text-slate-300">
                Accept Paperplanes: <span className={acceptMessages ? "text-blue-400" : "text-slate-500"}>
                    {acceptMessages ? 'On' : 'Off'}
                </span>
            </span>
        </div>

        <Separator className="bg-white/10" />

        <div className="my-6 p-6 rounded-xl bg-blue-900/10 border border-blue-400/20">
            <h2 className="text-sm uppercase tracking-widest font-semibold mb-3 text-blue-300">
                Your Interests
            </h2>
            <p className="text-xs text-slate-400 mb-3">This helps suggest better paperplanes for your senders.</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="e.g. Curious, loves music, introverted, Building paperplanes, Night sky..."
                    className="flex-1 p-3 bg-slate-950/40 border border-white/10 rounded-lg text-slate-300 text-sm outline-none"
                />
            <Button onClick={handlePersonalitySave} className="bg-blue-600 hover:bg-blue-500">
                Save
            </Button>
        </div>
        </div>

        <Button 
            className="mt-6 border-white/10 hover:bg-white/5 text-slate-300" 
            variant="outline" 
            onClick={(e) => { e.preventDefault(); fetchMessages(true); }}
        >
            {loading ? (<Loader2 className="h-4 w-4 animate-spin" />) : (<RefreshCcw className="h-4 w-4" />)}
        </Button>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <span className="md:col-span-2 text-xl font-light tracking-wide text-blue-100/70 italic border-l-2 border-blue-500/40 pl-4">
                Paperplanes you have received so far!
            </span>

            {messages.length > 0 ? (
                messages.map((message, i) => (
                    <MessageCard key={i} message={message} onMessageDelete={handleDelete}/>
                ))
            ) : (
                <div className="md:col-span-2 py-20 flex flex-col items-center justify-center rounded-xl bg-slate-900/40 border border-white/5 backdrop-blur-sm">
                    <p className="text-slate-400 font-medium animate-pulse">No paperplanes to read...</p>
                    <span className="text-xs text-slate-500 mt-2 italic">If only people could access the link to your leisure....</span>
                </div>
            )}
        </div>
    </div>
);

}