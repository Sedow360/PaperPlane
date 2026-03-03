'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { use, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { Send, Sparkles, RefreshCw, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ApiResponse } from '@/types/ApiResponse';
import { messageSchema } from '@/schema/messageSchema';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function Page({ params }: PageProps) {
  const { username } = use(params);

  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  });

  const { watch, setValue } = form;
  const content = watch('content');

  useEffect(() => {
    setCharCount(content?.length ?? 0);
  }, [content]);

  // --- Receiver / existence check ---
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get<ApiResponse>(
          `/api/check-username-available?username=${username}`
        );
        if (res.data.message === "That's an unique name for sure!") setUserExists(false);
        // Username is available = user does NOT exist
      } catch {
        // Request failed = user exists
        setUserExists(true);
      }
    };
    checkUser();
  }, [username]);

  // --- Fetch suggested messages ---
  const fetchSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const res = await axios.get(
        `/api/suggest-messages?username=${username}`
      );
      const raw: string = (res.data).text ?? '';
      const parts = raw
        .split('||')
        .map((s: string) => s.trim())
        .filter(Boolean);
      setSuggestedMessages(parts.slice(0, 3));
    } catch {
      toast.warning('Could not fetch suggestions right now');
    } finally {
      setLoadingSuggestions(false);
    }
  }, [username]);

  useEffect(() => {
    if (userExists) fetchSuggestions();
  }, [userExists, fetchSuggestions]);

  // --- Submit ---
  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    try {
      await axios.post<ApiResponse>('/api/send-message', {
        username,
        content: data.content,
      });
      toast.success('Your paperplane is on its way ✈️');
      form.reset();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.warning(
        axiosError.response?.data.message ?? 'Failed to send message'
      );
    }
  };

  // --- User not found state ---
  if (userExists === false) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{
          background:
            'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 30%, #fef9c3 70%, #fef3c7 100%)',
        }}
      >
        <div
          className="p-10 rounded-3xl max-w-md w-full shadow-xl"
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.9)',
          }}
        >
          <Wind size={40} className="mx-auto mb-4" style={{ color: '#0ea5e9' }} />
          <h2
            className="text-2xl font-black mb-3"
            style={{ color: '#0c4a6e', fontFamily: "'Georgia', serif" }}
          >
            This leisure doesn&apos;t exist yet
          </h2>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            {username} hasn&apos;t built their leisure. Maybe invite them?
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)' }}
          >
            Back to PaperPlane
          </Link>
        </div>
      </div>
    );
  }

  // --- Loading state ---
  if (userExists === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 40%, #fef9c3 100%)',
        }}
      >
        <div
          className="w-8 h-8 rounded-full border-4 border-sky-400 border-t-transparent animate-spin"
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 25%, #fef9c3 60%, #fefce8 100%)',
      }}
    >
      {/* Subtle noise grain */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Sunlit glow orbs */}
      <div
        className="fixed top-10 right-1/4 w-80 h-80 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #fde68a, transparent)' }}
      />
      <div
        className="fixed bottom-20 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #bae6fd, transparent)' }}
      />

      {/* Page content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-sm font-medium"
            style={{
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(14,165,233,0.2)',
              color: '#0369a1',
            }}
          >
            <Sparkles size={13} className="text-amber-400" />
            Anonymous · Honest · Safe
          </div>

          <h1
            className="text-4xl md:text-5xl font-black mb-3 leading-tight"
            style={{
              fontFamily: "'Georgia', serif",
              background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #b45309 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Send a paperplane<br />to @{username}
          </h1>
          <p
            className="text-sm max-w-sm mx-auto leading-relaxed"
            style={{ color: '#64748b' }}
          >
            They&apos;ll never know it was you. Write honestly, send freely.
          </p>
        </div>

        {/* Message Form Card */}
        <div
          className="rounded-3xl shadow-xl p-8 mb-8"
          style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.9)',
          }}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                name="content"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <textarea
                        {...field}
                        rows={5}
                        placeholder="Write something honest, kind, or long overdue..."
                        className="w-full resize-none rounded-2xl p-4 text-sm leading-relaxed outline-none transition-all"
                        style={{
                          background: 'rgba(240,249,255,0.7)',
                          border: '1.5px solid rgba(14,165,233,0.2)',
                          color: '#0c4a6e',
                          caretColor: '#0ea5e9',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.border = '1.5px solid rgba(14,165,233,0.5)';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(14,165,233,0.08)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border = '1.5px solid rgba(14,165,233,0.2)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                      {/* Char count */}
                      <span
                        className="absolute bottom-3 right-4 text-xs font-medium tabular-nums"
                        style={{ color: charCount > 270 ? '#ef4444' : '#94a3b8' }}
                      >
                        {charCount}/300
                      </span>
                    </div>
                    <FormMessage className="text-xs" style={{ color: '#ef4444' }} />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full py-6 rounded-2xl text-base font-bold text-white shadow-lg transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
                  border: 'none',
                  boxShadow: '0 6px 20px rgba(14,165,233,0.3)',
                }}
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <Send size={16} />
                    Send Paperplane
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </div>

        {/* Suggested Messages */}
        <div
          className="rounded-3xl p-6"
          style={{
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.8)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className="text-xs font-bold tracking-[0.15em] uppercase"
                style={{ color: '#0369a1' }}
              >
                Not sure what to say?
              </p>
              <h3
                className="text-base font-bold mt-0.5"
                style={{ color: '#0c4a6e' }}
              >
                Suggested Paperplanes
              </h3>
            </div>
            <button
              onClick={fetchSuggestions}
              disabled={loadingSuggestions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-opacity hover:opacity-70 disabled:opacity-40"
              style={{
                background: 'rgba(14,165,233,0.1)',
                color: '#0369a1',
                border: '1px solid rgba(14,165,233,0.2)',
              }}
            >
              <RefreshCw
                size={12}
                className={loadingSuggestions ? 'animate-spin' : ''}
              />
              Refresh
            </button>
          </div>

          {loadingSuggestions ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-2xl animate-pulse"
                  style={{ background: 'rgba(14,165,233,0.08)' }}
                />
              ))}
            </div>
          ) : suggestedMessages.length > 0 ? (
            <div className="space-y-3">
              {suggestedMessages.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => setValue('content', msg)}
                  className="w-full text-left px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: 'rgba(240,249,255,0.8)',
                    border: '1px solid rgba(14,165,233,0.15)',
                    color: '#334155',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.border =
                      '1px solid rgba(14,165,233,0.4)';
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(224,242,254,0.9)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.border =
                      '1px solid rgba(14,165,233,0.15)';
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'rgba(240,249,255,0.8)';
                  }}
                >
                  {msg}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: '#94a3b8' }}>
              Hit refresh to get some ideas ✨
            </p>
          )}
        </div>

        {/* Footer nudge */}
        <p className="text-center text-xs mt-8" style={{ color: '#94a3b8' }}>
          Want your own leisure?{' '}
          <Link href="/" className="font-semibold hover:underline" style={{ color: '#0369a1' }}>
            Create one on PaperPlane
          </Link>
        </p>
      </div>
    </div>
  );
}